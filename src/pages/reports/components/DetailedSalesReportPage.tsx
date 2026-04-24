import { useState } from "react";
import { useForm } from "react-hook-form";
import { useBranchAsyncSearch } from "../lib/reports.hook";
import type { DetailedSalesReportParams } from "../lib/reports.interface";
import { Form } from "@/components/ui/form";
import { Filter } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";
import { exportDetailedSalesReport } from "../lib/reports.actions";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormSelect } from "@/components/FormSelect";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { useClients } from "@/pages/client/lib/client.hook";
import ExportButtons from "@/components/ExportButtons";
import { useBrandSearch } from "@/pages/brand/lib/brand.hook";
import { useProduct } from "@/pages/product/lib/product.hook";
import { useZoneSearch } from "@/pages/zone/lib/zone.hook";
import { useWorkers } from "@/pages/worker/lib/worker.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";

interface FilterFormValues {
  branch_id: string;
  customer_id: string;
  document_type: string;
  payment_type: string;
  user_id: string;
  warehouse_id: string;
  start_date: string;
  end_date: string;
  zone_id: string;
  brand_id: string;
  product_id: string;
  line: string;
}

export default function DetailedSalesReportPage() {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const form = useForm<FilterFormValues>({
    defaultValues: {
      branch_id: "",
      customer_id: "",
      document_type: "",
      payment_type: "",
      user_id: "",
      warehouse_id: "",
      start_date: today,
      end_date: today,
      zone_id: "",
      brand_id: "",
      product_id: "",
      line: "",
    },
  });

  const buildParams = (
    values: FilterFormValues,
  ): DetailedSalesReportParams => ({
    branch_id: values.branch_id ? Number(values.branch_id) : null,
    customer_id: values.customer_id ? Number(values.customer_id) : null,
    document_type:
      (values.document_type as DetailedSalesReportParams["document_type"]) ||
      null,
    payment_type:
      (values.payment_type as DetailedSalesReportParams["payment_type"]) ||
      null,
    user_id: values.user_id ? Number(values.user_id) : null,
    warehouse_id: values.warehouse_id ? Number(values.warehouse_id) : null,
    start_date: values.start_date || null,
    end_date: values.end_date || null,
    zone_id: values.zone_id ? Number(values.zone_id) : null,
    brand_id: values.brand_id ? Number(values.brand_id) : null,
    product_id: values.product_id ? Number(values.product_id) : null,
    line: values.line || null,
  });

  const handleExcelExport = async () => {
    const values = form.getValues();
    setIsExportingExcel(true);
    try {
      const blob = await exportDetailedSalesReport(
        buildParams(values),
        "excel",
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "reporte-ventas-detallado.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handlePdfExport = async () => {
    const values = form.getValues();
    setIsExportingPdf(true);
    try {
      const blob = await exportDetailedSalesReport(buildParams(values), "pdf");
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "reporte-ventas-detallado.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <PageWrapper>
      <Form {...form}>
        <div className="flex gap-4 items-start">
          {/* LEFT: Filter card — single column */}
          <div className="shrink-0">
            <GroupFormSection
              title="Filtros"
              icon={Filter}
              gap="gap-2"
              cols={{ sm: 1 }}
              horizontal
            >
              <FormSelectAsync
                control={form.control}
                name="branch_id"
                label="Tienda"
                placeholder="Buscar tienda..."
                useQueryHook={useBranchAsyncSearch}
                mapOptionFn={(item) => ({
                  label: item.name,
                  value: String(item.id),
                })}
              />
              <FormSelect
                control={form.control}
                name="line"
                label="Línea"
                placeholder="Todas"
                options={[
                  {
                    label: "ALIMENTOS BALANCEADOS",
                    value: "ALIMENTOS BALANCEADOS",
                  },
                  { label: "ANIMALES VIVOS", value: "ANIMALES VIVOS" },
                  { label: "CONCENTRADOS", value: "CONCENTRADOS" },
                  { label: "INSUMOS", value: "INSUMOS" },
                  { label: "MEDICAMENTOS", value: "MEDICAMENTOS" },
                  { label: "OTROS", value: "OTROS" },
                  { label: "PURINA", value: "PURINA" },
                ]}
              />

              <FormSelectAsync
                control={form.control}
                name="brand_id"
                label="Marca"
                placeholder="Todas"
                useQueryHook={useBrandSearch}
                mapOptionFn={(item) => ({
                  label: item.name,
                  value: String(item.id),
                })}
              />

              <FormSelectAsync
                control={form.control}
                name="zone_id"
                label="Zona"
                placeholder="Buscar zona..."
                useQueryHook={useZoneSearch}
                mapOptionFn={(item) => ({
                  label: item.name,
                  value: String(item.id),
                })}
              />

              <FormSelectAsync
                control={form.control}
                name="customer_id"
                label="Cliente"
                placeholder="Buscar cliente..."
                useQueryHook={useClients}
                mapOptionFn={(item) => ({
                  label:
                    item.business_name ??
                    `${item.names} ${item.father_surname} ${item.mother_surname}`.trim(),
                  value: String(item.id),
                  description: item.number_document ?? undefined,
                })}
              />

              <FormSelectAsync
                control={form.control}
                name="product_id"
                label="Producto"
                placeholder="Buscar producto..."
                useQueryHook={useProduct}
                mapOptionFn={(item) => ({
                  label: item.name,
                  value: String(item.id),
                  description: item.codigo ?? undefined,
                })}
              />

              <FormSelectAsync
                control={form.control}
                name="user_id"
                label="Vendedor"
                placeholder="Buscar vendedor..."
                useQueryHook={useWorkers}
                mapOptionFn={(item: PersonResource) => ({
                  label:
                    `${item.names} ${item.father_surname} ${item.mother_surname}`.trim(),
                  description: item.number_document ?? undefined,
                  value: String(item.id),
                })}
                withValue={false}
              />

              <div className="flex justify-start gap-2">
                <DatePickerFormField
                  control={form.control}
                  name="start_date"
                  label="Del"
                  placeholder="Seleccionar fecha"
                />
                <DatePickerFormField
                  control={form.control}
                  name="end_date"
                  label="Al"
                  placeholder="Seleccionar fecha"
                  autoLabelWidth
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <ExportButtons
                  onExcelDownload={handleExcelExport}
                  onPdfDownload={handlePdfExport}
                  excelFileName="reporte-ventas-detallado.xlsx"
                  pdfFileName="reporte-ventas-detallado.pdf"
                  disableExcel={isExportingExcel}
                  disablePdf={isExportingPdf}
                />
              </div>
            </GroupFormSection>
          </div>
        </div>
      </Form>
    </PageWrapper>
  );
}
