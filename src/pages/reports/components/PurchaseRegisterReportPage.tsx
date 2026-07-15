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
import { useWarehouseAsyncSearch } from "@/pages/reports/lib/reports.hook";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { usePermission } from "@/lib/permission-guard";
import { ACTIONS } from "@/lib/permission-catalog";

const ROUTE = "registro-compras";

const DOCUMENT_TYPE_OPTIONS = [
  { value: "FACTURA", label: "Factura" },
  { value: "BOLETA", label: "Boleta" },
  { value: "OTRO", label: "Otro" },
];

const PAYMENT_TYPE_OPTIONS = [
  { value: "CONTADO", label: "Contado" },
  { value: "CREDITO", label: "Crédito" },
];

const STATUS_OPTIONS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "COMPLETADO", label: "Completado" },
  { value: "CANCELADO", label: "Cancelado" },
];

interface FilterFormValues {
  document_number: string;
  reference_number: string;
  warehouse_id: string;
  document_type: string;
  payment_type: string;
  status: string;
  start_date: string;
  end_date: string;
}

export default function PurchaseRegisterReportPage() {
  const { can } = usePermission();
  const { user } = useAuthStore();

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const threeMonthsAgoStr = new Date(today.getFullYear(), today.getMonth() - 3, 1)
    .toISOString()
    .split("T")[0];

  const form = useForm<FilterFormValues>({
    defaultValues: {
      document_number: "",
      reference_number: "",
      warehouse_id: "",
      document_type: "",
      payment_type: "",
      status: "",
      start_date: threeMonthsAgoStr,
      end_date: todayStr,
    },
  });

  const {
    document_number,
    reference_number,
    warehouse_id,
    document_type,
    payment_type,
    status,
    start_date,
    end_date,
  } = form.watch();

  const exportEndpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (user?.company_id)
      params.append("company_id", user.company_id.toString());
    if (document_type) params.append("document_type", document_type);
    if (document_number) params.append("document_number", document_number);
    if (reference_number) params.append("reference_number", reference_number);
    if (payment_type) params.append("payment_type", payment_type);
    if (status) params.append("status", status);
    if (warehouse_id) params.append("warehouse_id", warehouse_id);
    if (start_date) params.append("start_date", start_date);
    if (end_date) params.append("end_date", end_date);
    const qs = params.toString();
    return qs ? `/purchase/export?${qs}` : "/purchase/export";
  }, [
    user?.company_id,
    document_type,
    document_number,
    reference_number,
    payment_type,
    status,
    warehouse_id,
    start_date,
    end_date,
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
                name="document_number"
                label="N° Documento"
                placeholder="N° Documento"
              />

              <FormInput
                control={form.control}
                name="reference_number"
                label="N° Referencia"
                placeholder="N° Referencia"
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

              <FormSelect
                control={form.control}
                name="document_type"
                label="Tipo de documento"
                placeholder="Todos los tipos"
                options={DOCUMENT_TYPE_OPTIONS}
              />

              <FormSelect
                control={form.control}
                name="payment_type"
                label="Tipo de pago"
                placeholder="Todos los tipos"
                options={PAYMENT_TYPE_OPTIONS}
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
                {can(ROUTE, ACTIONS.EXPORTAR) && (
                  <ExportButtons
                    excelEndpoint={exportEndpoint}
                    excelFileName="registro-compras.xlsx"
                  />
                )}
              </div>
            </GroupFormSection>
          </div>
        </div>
      </Form>
    </PageWrapper>
  );
}
