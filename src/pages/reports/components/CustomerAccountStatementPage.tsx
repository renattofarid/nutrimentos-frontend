import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCustomerAccountStatement } from "../lib/reports.hook";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  CustomerAccountStatementItem,
  CustomerAccountStatementParams,
} from "../lib/reports.interface";
import { Badge } from "@/components/ui/badge";
import { useAllZones } from "@/pages/zone/lib/zone.hook";
import { useAllClients } from "@/pages/client/lib/client.hook";
import { useAllWorkers } from "@/pages/worker/lib/worker.hook";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  DollarSign,
} from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { DateRangePickerFormField } from "@/components/DateRangePickerFormField";
import { FormSwitch } from "@/components/FormSwitch";
import { exportCustomerAccountStatement } from "../lib/reports.actions";
import { toast } from "sonner";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";
import type { Option } from "@/lib/core.interface";

interface FilterFormValues {
  zone_id: string;
  customer_id: string;
  vendedor_id: string;
  payment_type: string;
  start_date: string;
  end_date: string;
  query_type: string;
  show_old: boolean;
}

const columns: ColumnDef<CustomerAccountStatementItem>[] = [
  {
    accessorKey: "customer_name",
    header: "Cliente",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "document_number",
    header: "Documento",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "zone_name",
    header: "Zona",
    cell: ({ getValue }) => {
      const zone = getValue() as string;
      return zone ? (
        <Badge variant="outline">{zone}</Badge>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
  },
  {
    accessorKey: "total_debt",
    header: "Deuda Total",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <span className="font-bold text-lg">S/ {Number(value).toFixed(2)}</span>
      );
    },
  },
  {
    accessorKey: "pending_amount",
    header: "Pendiente",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      const variant = value > 0 ? "destructive" : "default";
      return (
        <Badge variant={variant} className="font-bold">
          S/ {Number(value).toFixed(2)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paid_amount",
    header: "Pagado",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <span className="font-medium text-green-600">
          S/ {Number(value).toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "last_payment_date",
    header: "Último Pago",
    cell: ({ getValue }) => {
      const date = getValue() as string | undefined;
      return date ? (
        <span className="text-sm">
          {new Date(date).toLocaleDateString("es-ES")}
        </span>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
  },
  {
    accessorKey: "oldest_debt_date",
    header: "Deuda Más Antigua",
    cell: ({ getValue }) => {
      const date = getValue() as string | undefined;
      return date ? (
        <span className="text-sm text-orange-600">
          {new Date(date).toLocaleDateString("es-ES")}
        </span>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
  },
];

export default function CustomerAccountStatementPage() {
  const [isExporting, setIsExporting] = useState(false);

  const { data: zones } = useAllZones();
  const { data: clients } = useAllClients();
  const { data: workers } = useAllWorkers();

  const { data, isLoading, meta, fetch } = useCustomerAccountStatement();

  const form = useForm<FilterFormValues>({
    defaultValues: {
      zone_id: "",
      customer_id: "",
      vendedor_id: "",
      payment_type: "ALL",
      start_date: "",
      end_date: "",
      query_type: "todo",
      show_old: false,
    },
  });

  const zoneOptions: Option[] =
    zones?.map((zone) => ({
      value: zone.id.toString(),
      label: zone.name,
    })) || [];

  const clientOptions: Option[] =
    clients?.map((client) => ({
      value: client.id.toString(),
      label:
        client.business_name ??
        `${client.names} ${client.father_surname} ${client.mother_surname}`,
      description: client.number_document ?? client.phone,
    })) || [];

  const workerOptions: Option[] =
    workers?.map((worker) => ({
      value: worker.id.toString(),
      label: `${worker.names} ${worker.father_surname} ${worker.mother_surname}`,
    })) || [];

  const paymentTypeOptions: Option[] = [
    { value: "ALL", label: "Todos" },
    { value: "CONTADO", label: "Contado" },
    { value: "CREDITO", label: "Crédito" },
  ];

  const queryTypeOptions: Option[] = [
    { value: "todo", label: "Todo" },
    { value: "solo_deuda", label: "Solo Deudas" },
  ];

  const handleSearch = (values: FilterFormValues) => {
    const params: CustomerAccountStatementParams = {
      zone_id: values.zone_id ? Number(values.zone_id) : null,
      customer_id: values.customer_id ? Number(values.customer_id) : null,
      vendedor_id: values.vendedor_id ? Number(values.vendedor_id) : null,
      payment_type:
        values.payment_type === "ALL"
          ? null
          : (values.payment_type as "CONTADO" | "CREDITO"),
      start_date: values.start_date || null,
      end_date: values.end_date || null,
      query_type: values.query_type as "solo_deuda" | "todo",
      show_old: values.show_old,
    };

    fetch(params);
  };

  const handleExport = async (exportType: "excel" | "pdf") => {
    const values = form.getValues();
    setIsExporting(true);
    try {
      const params: CustomerAccountStatementParams = {
        zone_id: values.zone_id ? Number(values.zone_id) : null,
        customer_id: values.customer_id ? Number(values.customer_id) : null,
        vendedor_id: values.vendedor_id ? Number(values.vendedor_id) : null,
        payment_type:
          values.payment_type === "ALL"
            ? null
            : (values.payment_type as "CONTADO" | "CREDITO"),
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        query_type: values.query_type as "solo_deuda" | "todo",
        show_old: values.show_old,
      };

      const blob = await exportCustomerAccountStatement(params, exportType);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `estado-cuenta-clientes.${
        exportType === "excel" ? "xlsx" : "pdf"
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(
        `Reporte exportado exitosamente en formato ${exportType.toUpperCase()}`
      );
    } catch (error) {
      toast.error("Error al exportar el reporte");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageWrapper size="3xl">
      <TitleComponent
        title="Estado de Cuenta de Clientes"
        subtitle="Consulta el estado de cuenta y deudas de los clientes"
        icon="FileBarChart2"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-6">
          <GroupFormSection
            title="Filtros de Búsqueda"
            icon={Filter}
            gap="gap-2"
            cols={{ sm: 1, md: 2, lg: 3, xl: 4 }}
            headerExtra={
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} size="sm">
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("excel")}
                  disabled={isExporting || !data || data.length === 0}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("pdf")}
                  disabled={isExporting || !data || data.length === 0}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            }
          >
            <FormSelect
              control={form.control}
              name="zone_id"
              label="Zona"
              placeholder="Seleccionar zona"
              options={zoneOptions}
            />

            <FormSelect
              control={form.control}
              name="customer_id"
              label="Cliente"
              placeholder="Seleccionar cliente"
              options={clientOptions}
              withValue
            />

            <FormSelect
              control={form.control}
              name="vendedor_id"
              label="Vendedor"
              placeholder="Seleccionar vendedor"
              options={workerOptions}
            />

            <DateRangePickerFormField
              control={form.control}
              nameFrom="start_date"
              nameTo="end_date"
              label="Rango de Fechas"
              placeholder="Seleccionar rango"
            />

            <FormSelect
              control={form.control}
              name="payment_type"
              label="Tipo de Pago"
              placeholder="Seleccionar tipo"
              options={paymentTypeOptions}
            />

            <FormSelect
              control={form.control}
              name="query_type"
              label="Tipo de Consulta"
              placeholder="Seleccionar tipo"
              options={queryTypeOptions}
            />

            <FormSwitch
              control={form.control}
              name="show_old"
              label="Mostrar antiguos"
              text="Incluir registros antiguos en la consulta"
            />
          </GroupFormSection>

          {meta && (
            <GroupFormSection
              title="Resumen de Cuentas"
              icon={DollarSign}
              cols={{ sm: 1, md: 2, lg: 4 }}
            >
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Clientes</p>
                <p className="text-2xl font-bold">{meta.total}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Deuda Total</p>
                <p className="text-2xl font-bold text-red-600">
                  S/ {meta.total_debt?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Pendiente</p>
                <p className="text-2xl font-bold text-orange-600">
                  S/ {meta.total_pending?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Pagado</p>
                <p className="text-2xl font-bold text-green-600">
                  S/ {meta.total_paid?.toFixed(2) || "0.00"}
                </p>
              </div>
            </GroupFormSection>
          )}

          <Card>
            <CardContent className="pt-6">
              <DataTable
                columns={columns}
                data={data || []}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </form>
      </Form>
    </PageWrapper>
  );
}
