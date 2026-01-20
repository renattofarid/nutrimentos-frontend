"use client";

import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader,
  ArrowLeft,
  FileText,
  User,
  MapPin,
  Calendar,
  Save,
  AlertCircle,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import TitleComponent from "@/components/TitleComponent";
import PageWrapper from "@/components/PageWrapper";
import { GroupFormSection } from "@/components/GroupFormSection";
import { DataTable } from "@/components/DataTable";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { findDeliverySheetById } from "../lib/deliverysheet.actions";
import { useDeliverySheetStore } from "../lib/deliverysheet.store";
import type { DeliverySheetResource } from "../lib/deliverysheet.interface";
import { DELIVERY_SHEET } from "../lib/deliverysheet.interface";
import { cn } from "@/lib/utils";

const DELIVERY_STATUS_OPTIONS = [
  {
    value: "PENDIENTE",
    label: "Pendiente",
    icon: Clock,
    color: "bg-yellow-500",
  },
  {
    value: "ENTREGADO",
    label: "Entregado",
    icon: CheckCircle2,
    color: "bg-green-500",
  },
  {
    value: "NO_ENTREGADO",
    label: "No Entregado",
    icon: XCircle,
    color: "bg-red-500",
  },
  {
    value: "DEVUELTO",
    label: "Devuelto",
    icon: ArrowLeft,
    color: "bg-orange-500",
  },
];

// Schema para cada boleta
const saleSettlementSchema = z.object({
  sale_id: z.number(),
  delivery_status: z
    .string()
    .min(1, { message: "Debe seleccionar un estado de entrega" }),
  delivery_notes: z
    .string()
    .max(500, { message: "Las notas no pueden exceder 500 caracteres" })
    .optional(),
  payment_amount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El monto debe ser un número válido mayor o igual a 0",
    })
    .refine(
      (val) => {
        const num = Number(val);
        return (
          num.toString().split(".")[1]?.length <= 2 ||
          !num.toString().includes(".")
        );
      },
      {
        message: "El monto debe tener máximo 2 decimales",
      },
    )
    .default("0"),
});

const settlementFormSchema = z.object({
  sales: z
    .array(saleSettlementSchema)
    .min(1, { message: "Debe haber al menos una venta" }),
  payment_date: z
    .string()
    .min(1, { message: "La fecha de pago es requerida" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "La fecha de pago no es válida",
    }),
  observations: z
    .string()
    .max(500, { message: "Las observaciones no pueden exceder 500 caracteres" })
    .optional(),
});

type SettlementFormSchema = z.infer<typeof settlementFormSchema>;

interface SaleWithIndex {
  index: number;
  id: number;
  document_type: string;
  full_document_number: string;
  issue_date: string;
  customer: {
    full_name: string;
  };
  total_amount: string;
  original_amount: string;
  current_amount: string;
  collected_amount: string;
  delivery_status: "PENDIENTE" | "ENTREGADO" | "NO_ENTREGADO" | "DEVUELTO";
  delivery_notes: string | null;
}

export default function SettlementPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deliverySheet, setDeliverySheet] =
    useState<DeliverySheetResource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const { submitSettlement } = useDeliverySheetStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SettlementFormSchema>({
    resolver: zodResolver(settlementFormSchema) as any,
    defaultValues: {
      sales: [],
      payment_date: new Date().toISOString().split("T")[0],
      observations: "",
    },
  });

  useEffect(() => {
    const loadDeliverySheet = async () => {
      if (!id) {
        setErrors(["No se proporcionó un ID de planilla válido"]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrors([]);
        const response = await findDeliverySheetById(Number(id));

        if (!response.data) {
          setErrors(["No se encontró la planilla de reparto"]);
          return;
        }

        setDeliverySheet(response.data);

        // Inicializar el formulario con las boletas
        if (response.data.sales && response.data.sales.length > 0) {
          form.reset({
            sales: response.data.sales.map((sale) => ({
              sale_id: sale.id,
              delivery_status: sale.delivery_status || "PENDIENTE",
              delivery_notes: sale.delivery_notes || "",
              payment_amount: "0",
            })),
            payment_date: new Date().toISOString().split("T")[0],
            observations: "",
          });
        } else {
          setErrors(["La planilla no tiene ventas asociadas"]);
        }
      } catch (error) {
        console.error("Error al cargar la planilla:", error);
        setErrors([
          error instanceof Error
            ? error.message
            : "Error al cargar la planilla de reparto",
        ]);
        toast.error("Error al cargar la planilla");
      } finally {
        setIsLoading(false);
      }
    };

    loadDeliverySheet();
  }, [id, form]);

  const handleSubmit = async (data: SettlementFormSchema) => {
    if (!deliverySheet) {
      toast.error("No se encontró la planilla de reparto");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors([]);

      // Validar que todos los estados estén seleccionados
      const invalidSales = data.sales.filter(
        (sale) => !sale.delivery_status || sale.delivery_status === "",
      );

      if (invalidSales.length > 0) {
        setErrors([
          `Debe seleccionar el estado de entrega para todas las boletas (${invalidSales.length} pendientes)`,
        ]);
        toast.error("Completar todos los estados de entrega");
        return;
      }

      // Transformar los datos al formato que espera el backend
      const settlementData = {
        sales: data.sales.map((sale) => ({
          sale_id: sale.sale_id,
          delivery_status: sale.delivery_status,
          delivery_notes: sale.delivery_notes || "",
          payment_amount: sale.payment_amount,
        })),
        payment_date: data.payment_date,
        observations: data.observations || "",
      };

      await submitSettlement(deliverySheet.id, settlementData);
      toast.success("Rendición registrada exitosamente");
      navigate(DELIVERY_SHEET.ROUTE);
    } catch (error) {
      console.error("Error al registrar la rendición:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al registrar la rendición";
      setErrors([errorMessage]);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preparar datos para la tabla con índices
  const salesWithIndex: SaleWithIndex[] = useMemo(() => {
    if (!deliverySheet?.sales) return [];
    return deliverySheet.sales.map((sale, index) => ({
      ...sale,
      index,
    }));
  }, [deliverySheet]);

  // Definir columnas de la tabla
  const columns: ColumnDef<SaleWithIndex>[] = useMemo(
    () => [
      {
        accessorKey: "full_document_number",
        header: "Documento",
        cell: ({ row }) => (
          <div className="space-y-1">
            <Badge variant="outline" className="text-xs">
              {row.original.document_type}
            </Badge>
            <div className="font-mono font-semibold text-sm">
              {row.original.full_document_number}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "customer.full_name",
        header: "Cliente",
        cell: ({ row }) => (
          <div className="min-w-[150px]">{row.original.customer.full_name}</div>
        ),
      },
      {
        accessorKey: "total_amount",
        header: "Monto Total",
        cell: ({ row }) => (
          <div className="text-right">
            <Badge variant="outline">
              S/. {parseFloat(row.original.total_amount).toFixed(2)}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "current_amount",
        header: "Monto Pendiente",
        cell: ({ row }) => (
          <div className="text-right">
            <Badge variant="secondary">
              S/. {parseFloat(row.original.current_amount).toFixed(2)}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "delivery_status",
        header: "Estado",
        cell: ({ row }) => {
          const index = row.original.index;
          const formValues = form.watch(`sales.${index}`);
          const formErrors = form.formState.errors.sales?.[index];

          return (
            <div className="space-y-1">
              <Select
                value={formValues?.delivery_status || "PENDIENTE"}
                onValueChange={(value) =>
                  form.setValue(`sales.${index}.delivery_status`, value, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger
                  className={`w-full md:w-[160px] ${
                    formErrors?.delivery_status ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERY_STATUS_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {formErrors?.delivery_status && (
                <p className="text-xs text-red-500">
                  {formErrors.delivery_status.message}
                </p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "payment_amount",
        header: "Monto Cobrado",
        cell: ({ row }) => {
          const index = row.original.index;
          const formValues = form.watch(`sales.${index}`);
          const formErrors = form.formState.errors.sales?.[index];

          return (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">S/.</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max={parseFloat(row.original.current_amount)}
                  placeholder="0.00"
                  className={`w-full md:w-[120px] text-right ${
                    formErrors?.payment_amount ? "border-red-500" : ""
                  }`}
                  value={formValues?.payment_amount || "0"}
                  onChange={(e) =>
                    form.setValue(
                      `sales.${index}.payment_amount`,
                      e.target.value,
                      {
                        shouldValidate: true,
                      },
                    )
                  }
                />
              </div>
              {formErrors?.payment_amount && (
                <p className="text-xs text-red-500">
                  {formErrors.payment_amount.message}
                </p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "delivery_notes",
        header: "Notas",
        cell: ({ row }) => {
          const index = row.original.index;
          const formValues = form.watch(`sales.${index}`);
          const formErrors = form.formState.errors.sales?.[index];

          return (
            <div className="space-y-1">
              <Textarea
                placeholder="Observaciones de entrega..."
                className={`min-w-[200px] resize-none ${
                  formErrors?.delivery_notes ? "border-red-500" : ""
                }`}
                rows={2}
                maxLength={500}
                value={formValues?.delivery_notes || ""}
                onChange={(e) =>
                  form.setValue(
                    `sales.${index}.delivery_notes`,
                    e.target.value,
                    {
                      shouldValidate: true,
                    },
                  )
                }
              />
              <p className="text-xs text-muted-foreground">
                {(formValues?.delivery_notes || "").length}/500
              </p>
              {formErrors?.delivery_notes && (
                <p className="text-xs text-red-500">
                  {formErrors.delivery_notes.message}
                </p>
              )}
            </div>
          );
        },
      },
    ],
    [form],
  );

  // Renderizado móvil personalizado
  const mobileCardRender = (sale: SaleWithIndex) => {
    const index = sale.index;
    const formValues = form.watch(`sales.${index}`);
    const formErrors = form.formState.errors.sales?.[index];
    const statusOption = DELIVERY_STATUS_OPTIONS.find(
      (opt) => opt.value === formValues?.delivery_status,
    );
    const StatusIcon = statusOption?.icon || Clock;

    return (
      <Card className="overflow-hidden py-0">
        <CardHeader className="bg-muted/50 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">
                {sale.document_type}
              </Badge>
              <CardTitle className="text-base font-mono">
                {sale.full_document_number}
              </CardTitle>
            </div>
            <Badge
              variant="blue"
              className="text-right flex flex-col items-end"
            >
              <p className="text-xs text-blue-900">TOTAL</p>
              <p className="font-semibold text-sm">
                S/. {parseFloat(sale.total_amount).toFixed(2)}
              </p>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="py-4 space-y-4">
          {/* Cliente */}
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{sale.customer.full_name}</span>
          </div>

          {/* Monto Pendiente */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">
              Monto Pendiente
            </span>
            <Badge variant="secondary">
              S/. {parseFloat(sale.current_amount).toFixed(2)}
            </Badge>
          </div>

          {/* Estado de Entrega */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <StatusIcon className="h-4 w-4" />
              Estado de Entrega
            </label>
            <Select
              value={formValues?.delivery_status || "PENDIENTE"}
              onValueChange={(value) =>
                form.setValue(`sales.${index}.delivery_status`, value, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger
                className={formErrors?.delivery_status ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Seleccionar estado..." />
              </SelectTrigger>
              <SelectContent>
                {DELIVERY_STATUS_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {formErrors?.delivery_status && (
              <p className="text-xs text-red-500">
                {formErrors.delivery_status.message}
              </p>
            )}
          </div>

          {/* Monto Cobrado */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Monto Cobrado
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">S/.</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={parseFloat(sale.current_amount)}
                placeholder="0.00"
                className={`text-right ${
                  formErrors?.payment_amount ? "border-red-500" : ""
                }`}
                value={formValues?.payment_amount || "0"}
                onChange={(e) =>
                  form.setValue(
                    `sales.${index}.payment_amount`,
                    e.target.value,
                    {
                      shouldValidate: true,
                    },
                  )
                }
              />
            </div>
            {formErrors?.payment_amount && (
              <p className="text-xs text-red-500">
                {formErrors.payment_amount.message}
              </p>
            )}
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notas de Entrega</label>
            <Textarea
              placeholder="Observaciones sobre la entrega..."
              className={`resize-none ${
                formErrors?.delivery_notes ? "border-red-500" : ""
              }`}
              rows={3}
              maxLength={500}
              value={formValues?.delivery_notes || ""}
              onChange={(e) =>
                form.setValue(`sales.${index}.delivery_notes`, e.target.value, {
                  shouldValidate: true,
                })
              }
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {(formValues?.delivery_notes || "").length}/500 caracteres
              </p>
              {formErrors?.delivery_notes && (
                <p className="text-xs text-red-500">
                  {formErrors.delivery_notes.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }

  if (!deliverySheet || errors.length > 0) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center space-y-2">
            <p className="font-semibold">Error al cargar la planilla</p>
            {errors.map((error, index) => (
              <p key={index} className="text-sm text-muted-foreground">
                {error}
              </p>
            ))}
          </div>
          <Button onClick={() => navigate(DELIVERY_SHEET.ROUTE)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Planillas
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(DELIVERY_SHEET.ROUTE)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <TitleComponent
            title="Rendición de Planilla"
            subtitle={`Planilla ${deliverySheet.sheet_number} - Registre el estado y cobro de cada boleta`}
            icon="Receipt"
          />
        </div>

        {/* Errores de validación */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Información de la planilla usando GroupFormSection */}
        <GroupFormSection
          title="Información de la Planilla"
          icon={FileText}
          cols={{ sm: 1, md: 3, lg: 3 }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <User className="h-4 w-4" />
              <span>Conductor</span>
            </div>
            <p className="font-medium text-base">
              {deliverySheet.driver?.full_name || "Sin conductor"}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <MapPin className="h-4 w-4" />
              <span>Zona de Entrega</span>
            </div>
            <p className="font-medium text-base">
              {deliverySheet.zone?.name || "Sin zona"}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Calendar className="h-4 w-4" />
              <span>Fecha de Entrega</span>
            </div>
            <p className="font-medium text-base">
              {deliverySheet.delivery_date}
            </p>
          </div>
        </GroupFormSection>

        {/* Formulario con DataTable */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* DataTable de boletas */}
            <DataTable
              columns={columns}
              data={salesWithIndex}
              isLoading={isLoading}
              mobileCardRender={mobileCardRender}
              variant="outline"
              isVisibleColumnFilter={false}
            />

            {/* Datos de Rendición */}
            <GroupFormSection
              title="Datos de Rendición"
              icon={FileCheck}
              cols={{ sm: 1, md: 2, lg: 2 }}
            >
              <DatePickerFormField
                control={form.control}
                name="payment_date"
                label="Fecha de Pago"
                placeholder="Selecciona la fecha de pago"
                dateFormat="dd/MM/yyyy"
                captionLayout="dropdown"
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Observaciones Generales
                </label>
                <Textarea
                  placeholder="Observaciones generales de la rendición..."
                  rows={3}
                  maxLength={500}
                  {...form.register("observations")}
                  className={cn(
                    "text-xs",
                    form.formState.errors.observations ? "border-red-500" : "",
                  )}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {(form.watch("observations") || "").length}/500 caracteres
                  </p>
                  {form.formState.errors.observations && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.observations.message}
                    </p>
                  )}
                </div>
              </div>
            </GroupFormSection>

            {/* Resumen */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total de Boletas
                    </p>
                    <p className="text-2xl font-bold">
                      {deliverySheet.sales.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monto Total</p>
                    <p className="text-2xl font-bold">
                      S/.{" "}
                      {deliverySheet.sales
                        .reduce(
                          (sum, sale) => sum + parseFloat(sale.total_amount),
                          0,
                        )
                        .toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Pendiente
                    </p>
                    <p className="text-2xl font-bold">
                      S/.{" "}
                      {deliverySheet.sales
                        .reduce(
                          (sum, sale) => sum + parseFloat(sale.current_amount),
                          0,
                        )
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sticky bottom-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg border shadow-lg">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(DELIVERY_SHEET.ROUTE)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Rendición
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PageWrapper>
  );
}
