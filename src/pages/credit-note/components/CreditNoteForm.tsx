import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader, Save, X, ListChecks, FileText, Settings2 } from "lucide-react";
import {
  creditNoteSchemaCreate,
  type CreditNoteSchema,
} from "../lib/credit-note.schema";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { FormSwitch } from "@/components/FormSwitch";
import type { SaleResource } from "@/pages/sale/lib/sale.interface";
import { format } from "date-fns";
import { ExcelGrid, type ExcelGridColumn } from "@/components/ExcelGrid";
import { formatNumber } from "@/lib/formatCurrency";
import { formatDecimalTrunc } from "@/lib/utils";
import { warningToast } from "@/lib/core.function";
import { GroupFormSection } from "@/components/GroupFormSection";
import { FormInput } from "@/components/FormInput";

interface CreditNoteFormProps {
  defaultValues: Partial<CreditNoteSchema>;
  onSubmit: (data: CreditNoteSchema) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  sales?: Array<{ value: string; label: string }>;
  motives?: Array<{ value: string; label: string }>;
  selectedSale?: SaleResource | null;
  onSaleChange?: (saleId: number | null) => void;
  readOnlySale?: boolean;
}

interface CreditNoteDetailRow {
  index: number;
  sale_detail_id: number;
  product_id: number;
  product_code: string;
  product_name: string;
  product_weight: number;
  quantity_sacks: string;
  quantity_kg: string;
  unit_price: string;
  subtotal: number;
  total_kg: number;
}

const round2 = (v: number) => Math.round(v * 100) / 100;
const round6 = (v: number) => Math.round(v * 1_000_000) / 1_000_000;

function calcRow(row: CreditNoteDetailRow): CreditNoteDetailRow {
  const sacks = parseFloat(row.quantity_sacks) || 0;
  const kg = parseFloat(row.quantity_kg) || 0;
  const price = parseFloat(row.unit_price) || 0;

  let subtotal = 0;
  let total_kg = 0;

  if (sacks > 0) {
    subtotal = round6(sacks * price);
    total_kg = round6(sacks * row.product_weight);
  } else if (kg > 0) {
    subtotal = round6(kg * price);
    total_kg = kg;
  }

  return { ...row, subtotal, total_kg };
}

export const CreditNoteForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  sales = [],
  motives = [],
  selectedSale,
  onSaleChange,
  readOnlySale = false,
}: CreditNoteFormProps) => {
  const [details, setDetails] = useState<CreditNoteDetailRow[]>([]);

  const form = useForm<CreditNoteSchema>({
    resolver: zodResolver(creditNoteSchemaCreate),
    defaultValues: {
      sale_id: "0",
      issue_date: format(new Date(), "yyyy-MM-dd"),
      credit_note_motive_id: "0",
      affects_stock: true,
      observations: "",
      details: [],
      ...defaultValues,
    },
    mode: "onChange",
  });

  const watchSaleId = form.watch("sale_id");

  useEffect(() => {
    if (watchSaleId) {
      onSaleChange?.(Number(watchSaleId));
    } else {
      onSaleChange?.(null);
    }
  }, [watchSaleId, onSaleChange]);

  // Cargar detalles de la venta seleccionada
  useEffect(() => {
    if (selectedSale?.details) {
      const rows: CreditNoteDetailRow[] = selectedSale.details.map(
        (detail, i) => {
          const base: CreditNoteDetailRow = {
            index: i + 1,
            sale_detail_id: detail.id,
            product_id: detail.product_id,
            product_code: detail.product?.codigo ?? "",
            product_name: detail.product?.name ?? "",
            product_weight: detail.product?.weight ?? 0,
            quantity_sacks: (detail.quantity_sacks ?? 0).toString(),
            quantity_kg: (detail.quantity_kg ?? 0).toString(),
            unit_price: parseFloat(
              detail.unit_price?.toString() ?? "0",
            ).toString(),
            subtotal: 0,
            total_kg: 0,
          };
          return calcRow(base);
        },
      );
      setDetails(rows);
      syncFormDetails(rows);
    } else {
      setDetails([]);
      form.setValue("details", []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSale]);

  const syncFormDetails = (rows: CreditNoteDetailRow[]) => {
    form.setValue(
      "details",
      rows.map((r) => ({
        sale_detail_id: r.sale_detail_id,
        product_id: r.product_id,
        quantity_sacks: parseFloat(r.quantity_sacks) || 0,
        quantity_kg: parseFloat(r.quantity_kg) || 0,
        unit_price: parseFloat(r.unit_price) || 0,
      })) as any,
    );
  };

  const handleCellChange = (index: number, field: string, value: string) => {
    setDetails((prev) => {
      const updated = [...prev];
      const row = calcRow({ ...updated[index], [field]: value });
      updated[index] = row;
      syncFormDetails(updated);
      return updated;
    });
  };

  const handleRemoveRow = (index: number) => {
    setDetails((prev) => {
      const updated = prev
        .filter((_, i) => i !== index)
        .map((r, i) => ({ ...r, index: i + 1 }));
      syncFormDetails(updated);
      return updated;
    });
  };

  const handleAddRow = () => {
    warningToast("No se pueden agregar nuevos productos a una nota de crédito");
  };

  // Totales
  const grossTotal = round2(details.reduce((s, r) => s + r.subtotal, 0));
  const igv = round2((grossTotal / 1.18) * 0.18);
  const netSubtotal = round2(grossTotal - igv);
  const totalKg = round6(details.reduce((s, r) => s + r.total_kg, 0));

  const currencySymbol = selectedSale?.currency === "USD" ? "$" : "S/.";

  const gridColumns: ExcelGridColumn<CreditNoteDetailRow>[] = [
    {
      id: "index",
      header: "#",
      type: "readonly",
      width: "40px",
      render: (row) => (
        <div className="h-full flex items-center justify-center px-2 py-1 text-sm text-muted-foreground">
          {row.index}
        </div>
      ),
    },
    {
      id: "product_code",
      header: "Código",
      type: "readonly",
      width: "100px",
      render: (row) => (
        <div className="h-full flex items-center px-2 py-1 text-sm font-mono bg-muted/30">
          {row.product_code || "-"}
        </div>
      ),
    },
    {
      id: "product_name",
      header: "Descripción",
      type: "readonly",
      width: "320px",
      render: (row) => (
        <div className="h-full flex items-center px-2 py-1 text-sm bg-muted/30">
          {row.product_name || "-"}
        </div>
      ),
    },
    {
      id: "quantity_sacks",
      header: "Cant. Sacos",
      type: "number",
      width: "110px",
      accessor: "quantity_sacks",
    },
    {
      id: "quantity_kg",
      header: "Cant. Kg",
      type: "number",
      width: "100px",
      accessor: "quantity_kg",
    },
    {
      id: "unit_price",
      header: "Precio",
      type: "number",
      width: "110px",
      accessor: "unit_price",
    },
    {
      id: "subtotal",
      header: "Subtotal",
      type: "readonly",
      width: "120px",
      render: (row) => (
        <div className="h-full flex items-center justify-end px-2 py-1 text-sm font-semibold">
          {row.subtotal > 0
            ? `${currencySymbol} ${formatNumber(row.subtotal)}`
            : "-"}
        </div>
      ),
    },
  ];

  const handleSubmit = (data: CreditNoteSchema) => {
    onSubmit({
      ...data,
      details: details.map((r) => ({
        sale_detail_id: r.sale_detail_id,
        product_id: r.product_id,
        quantity_sacks: parseFloat(r.quantity_sacks) || 0,
        quantity_kg: parseFloat(r.quantity_kg) || 0,
        unit_price: parseFloat(r.unit_price) || 0,
      })) as any,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-2 w-full"
      >
        {/* Acciones */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? <Loader className="animate-spin" /> : <Save />}
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            <X /> Cancelar
          </Button>
        </div>

        {/* Campos del encabezado */}
        <GroupFormSection
          title="Información General"
          icon={Settings2}
          cols={{ sm: 1, md: 2, lg: 4 }}
          bordered
          gap="gap-2"
        >
          {readOnlySale ? (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Venta
              </span>
              <div className="flex items-center gap-2 h-9 px-3 rounded-md border bg-muted text-sm text-muted-foreground">
                {selectedSale
                  ? `${selectedSale.document_type} ${selectedSale.serie}-${selectedSale.numero}`
                  : "—"}
              </div>
            </div>
          ) : (
            <FormSelect
              control={form.control}
              name="sale_id"
              label="VENTA"
              placeholder="Seleccione una venta"
              options={sales}
              uppercase
            />
          )}

          <DatePickerFormField
            control={form.control}
            name="issue_date"
            label="FECHA DE EMISIÓN"
            placeholder="Seleccione la fecha"
          />

          <FormSelect
            control={form.control}
            name="credit_note_motive_id"
            label="MOTIVO"
            placeholder="Seleccione un motivo"
            options={motives}
            uppercase
          />

          <FormSwitch
            control={form.control}
            name="affects_stock"
            label="AFECTA STOCK"
            textDescription="Indica si la nota de crédito afecta el inventario"
          />

          {selectedSale && (
            <FormInput
              label="Cliente"
              value={
                selectedSale.customer.business_name ||
                selectedSale.customer.names ||
                ""
              }
              readOnly
              name="cliente"
            />
          )}

          <div className="md:col-span-2 lg:col-span-3">
            <FormInput
              control={form.control}
              name="observations"
              label="Observaciones"
              placeholder="Ingrese observaciones adicionales"
            />
          </div>
        </GroupFormSection>

        {/* Grid de detalles */}
        <GroupFormSection
          title="Detalles de la Nota de Crédito"
          icon={ListChecks}
          cols={{ sm: 1 }}
          bordered
        >
          <ExcelGrid<CreditNoteDetailRow>
            columns={gridColumns}
            data={details}
            onAddRow={handleAddRow}
            onRemoveRow={handleRemoveRow}
            onCellChange={handleCellChange}
            emptyMessage={
              selectedSale
                ? "Esta venta no tiene productos"
                : "Seleccione una venta para cargar los productos"
            }
            minHeight="180px"
          />

          {(form.formState.errors.details as any)?.message && (
            <p className="text-sm text-destructive">
              {(form.formState.errors.details as any).message}
            </p>
          )}
        </GroupFormSection>

        {/* Resumen */}
        <GroupFormSection
          title="Resumen"
          icon={FileText}
          cols={{ sm: 1, md: 2, lg: 6 }}
          bordered
        >
          {/* Peso Total */}
          <div className="flex gap-2 items-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Peso Total
            </div>
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {formatDecimalTrunc(totalKg, 2)} kg
            </div>
          </div>

          {/* Subtotal */}
          <div className="flex gap-2 items-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Subtotal
            </div>
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {currencySymbol} {formatNumber(netSubtotal)}
            </div>
          </div>

          {/* IGV */}
          <div className="flex gap-2 items-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              IGV (18%)
            </div>
            <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
              {currencySymbol} {formatNumber(igv)}
            </div>
          </div>

          {/* Total */}
          <div className="flex gap-2 items-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Total
            </div>
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {currencySymbol} {formatNumber(grossTotal)}
            </div>
          </div>
        </GroupFormSection>
      </form>
    </Form>
  );
};
