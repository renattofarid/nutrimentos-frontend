import { useForm } from "react-hook-form";
import {
  useWarehouseAsyncSearch,
  useBranchAsyncSearch,
} from "../lib/reports.hook";
import type { AccountingSalesReportParams } from "../lib/reports.interface";
import { Form } from "@/components/ui/form";
import { Filter } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";
import { exportAccountingSalesReport } from "../lib/reports.actions";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormSelect } from "@/components/FormSelect";
import { DateRangePickerFormField } from "@/components/DateRangePickerFormField";
import ExportButtons from "@/components/ExportButtons";

interface FilterFormValues {
  branch_id: string;
  document_type: string;
  payment_type: string;
  warehouse_id: string;
  start_date: string;
  end_date: string;
}

const buildParams = (
  values: FilterFormValues,
  format: "excel" | "pdf",
): AccountingSalesReportParams => ({
  branch_id: values.branch_id ? Number(values.branch_id) : null,
  document_type:
    (values.document_type as AccountingSalesReportParams["document_type"]) ||
    null,
  payment_type:
    (values.payment_type as AccountingSalesReportParams["payment_type"]) ||
    null,
  warehouse_id: values.warehouse_id ? Number(values.warehouse_id) : null,
  start_date: values.start_date || null,
  end_date: values.end_date || null,
  format,
});

const downloadBlob = async (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default function AccountingSalesReportPage() {
  const form = useForm<FilterFormValues>({
    defaultValues: {
      branch_id: "",
      document_type: "",
      payment_type: "",
      warehouse_id: "",
      start_date: "",
      end_date: "",
    },
  });

  const handleExcelDownload = async () => {
    const blob = await exportAccountingSalesReport(
      buildParams(form.getValues(), "excel"),
    );
    await downloadBlob(blob, "ventas-contabilidad.xlsx");
  };

  const handlePdfDownload = async () => {
    const blob = await exportAccountingSalesReport(
      buildParams(form.getValues(), "pdf"),
    );
    await downloadBlob(blob, "ventas-contabilidad.pdf");
  };

  return (
    <PageWrapper size="3xl">
      <Form {...form}>
        <form className="flex flex-col gap-4 w-full max-w-md">
          <GroupFormSection
            title="Filtros"
            icon={Filter}
            gap="gap-2"
            cols={{ sm: 1 }}
          >
            <p className="text-sm text-muted-foreground text-justify">
              Este reporte genera un archivo Excel o PDF con el listado de
              ventas para contabilidad. Puedes aplicar los filtros a
              continuación para acotar la sucursal, almacén, tipo de documento,
              tipo de pago y rango de fechas antes de descargar.
            </p>
            <FormSelectAsync
              control={form.control}
              name="branch_id"
              label="Sucursal"
              placeholder="Buscar sucursal..."
              useQueryHook={useBranchAsyncSearch}
              mapOptionFn={(item) => ({
                label: item.name,
                value: String(item.id),
              })}
            />

            <FormSelectAsync
              control={form.control}
              name="warehouse_id"
              label="Almacén"
              placeholder="Buscar almacén..."
              useQueryHook={useWarehouseAsyncSearch}
              mapOptionFn={(item) => ({
                label: item.name,
                value: String(item.id),
              })}
            />

            <FormSelect
              control={form.control}
              name="document_type"
              label="Tipo Documento"
              placeholder="Todos"
              options={[
                { label: "Factura", value: "FACTURA" },
                { label: "Boleta", value: "BOLETA" },
                { label: "Ticket", value: "TICKET" },
              ]}
            />

            <FormSelect
              control={form.control}
              name="payment_type"
              label="Tipo Pago"
              placeholder="Todos"
              options={[
                { label: "Contado", value: "CONTADO" },
                { label: "Crédito", value: "CREDITO" },
              ]}
            />

            <DateRangePickerFormField
              control={form.control}
              nameFrom="start_date"
              nameTo="end_date"
              label="Rango de Fechas"
              placeholder="Seleccionar rango"
            />

            <div className="flex justify-end">
              <div className="w-fit">
                <ExportButtons
                  onExcelDownload={handleExcelDownload}
                  onPdfDownload={handlePdfDownload}
                  excelFileName="ventas-contabilidad.xlsx"
                  pdfFileName="ventas-contabilidad.pdf"
                />
              </div>
            </div>
          </GroupFormSection>
        </form>
      </Form>
    </PageWrapper>
  );
}
