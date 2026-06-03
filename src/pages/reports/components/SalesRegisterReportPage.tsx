import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Filter } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { GroupFormSection } from "@/components/GroupFormSection";
import ExportButtons from "@/components/ExportButtons";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import {
  useBranchAsyncSearch,
  useWarehouseAsyncSearch,
} from "@/pages/reports/lib/reports.hook";
import { useWorkers } from "@/pages/worker/lib/worker.hook";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import type { PersonResource } from "@/pages/person/lib/person.interface";

const DOCUMENT_TYPE_OPTIONS = [
  { value: "FACTURA", label: "Factura" },
  { value: "BOLETA", label: "Boleta" },
  { value: "TICKET", label: "Ticket" },
];

const STATUS_OPTIONS = [
  { value: "REGISTRADA", label: "Registrada" },
  { value: "PARCIAL", label: "Parcial" },
  { value: "PAGADA", label: "Pagada" },
  { value: "ANULADA", label: "Anulada" },
];

interface FilterFormValues {
  serie: string;
  numero: string;
  branch_id: string;
  warehouse_id: string;
  vendedor_id: string;
  document_type: string;
  status: string;
  start_date: string;
  end_date: string;
}

export default function SalesRegisterReportPage() {
  const { user } = useAuthStore();
  const company_id = user?.company_id;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const threeMonthsAgoStr = new Date(today.getFullYear(), today.getMonth() - 3, 1)
    .toISOString()
    .split("T")[0];

  const form = useForm<FilterFormValues>({
    defaultValues: {
      serie: "",
      numero: "",
      branch_id: "",
      warehouse_id: "",
      vendedor_id: "",
      document_type: "",
      status: "",
      start_date: threeMonthsAgoStr,
      end_date: todayStr,
    },
  });

  const {
    serie,
    numero,
    branch_id,
    warehouse_id,
    vendedor_id,
    document_type,
    status,
    start_date,
    end_date,
  } = form.watch();

  const exportEndpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (company_id) params.append("company_id", company_id.toString());
    if (branch_id) params.append("branch_id", branch_id);
    if (document_type) params.append("document_type", document_type);
    if (status) params.append("status", status);
    if (warehouse_id) params.append("warehouse_id", warehouse_id);
    if (vendedor_id) params.append("vendedor_id", vendedor_id);
    if (start_date) params.append("start_date", start_date);
    if (end_date) params.append("end_date", end_date);
    if (numero) params.append("numero", numero);
    if (serie) params.append("serie", serie);
    const qs = params.toString();
    return qs ? `/sales/export?${qs}` : "/sales/export";
  }, [
    company_id,
    branch_id,
    document_type,
    status,
    warehouse_id,
    vendedor_id,
    start_date,
    end_date,
    numero,
    serie,
  ]);

  return (
    <PageWrapper>
      <Form {...form}>
        <div className="flex gap-4 items-start">
          <div className="shrink-0">
            <GroupFormSection
              title="Filtros"
              icon={Filter}
              gap="gap-2"
              cols={{ sm: 1 }}
              horizontal
            >
              <FormInput
                control={form.control}
                name="serie"
                label="Serie"
                placeholder="Serie"
              />

              <FormInput
                control={form.control}
                name="numero"
                label="Número"
                placeholder="Número"
              />

              <FormSelectAsync
                control={form.control}
                name="branch_id"
                label="Tienda"
                placeholder="Todas las tiendas"
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
                placeholder="Todos los almacenes"
                useQueryHook={useWarehouseAsyncSearch}
                mapOptionFn={(item) => ({
                  label: item.name,
                  value: String(item.id),
                })}
              />

              <FormSelectAsync
                control={form.control}
                name="vendedor_id"
                label="Vendedor"
                placeholder="Buscar vendedor..."
                useQueryHook={useWorkers}
                mapOptionFn={(item: PersonResource) => ({
                  label: `${item.names} ${item.father_surname} ${item.mother_surname}`.trim(),
                  description: item.number_document ?? undefined,
                  value: String(item.id),
                })}
                withValue={false}
              />

              <FormSelect
                control={form.control}
                name="document_type"
                label="Tipo de documento"
                placeholder="Todos los tipos"
                options={DOCUMENT_TYPE_OPTIONS}
              />

              <FormSelect
                control={form.control}
                name="status"
                label="Estado"
                placeholder="Todos los estados"
                options={STATUS_OPTIONS}
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
                  excelEndpoint={exportEndpoint}
                  excelFileName="registro-ventas.xlsx"
                />
              </div>
            </GroupFormSection>
          </div>
        </div>
      </Form>
    </PageWrapper>
  );
}
