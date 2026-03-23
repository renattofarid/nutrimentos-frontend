import { useMemo, useState } from "react";
import TitleComponent from "@/components/TitleComponent";
import PageWrapper from "@/components/PageWrapper";
import { GroupFormSection } from "@/components/GroupFormSection";
import ExportButtons from "@/components/ExportButtons";
import { SearchableSelect } from "@/components/SearchableSelect";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import { Input } from "@/components/ui/input";
import { Filter, Info } from "lucide-react";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAuthStore } from "@/pages/auth/lib/auth.store";

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

export default function PurchaseRegisterReportPage() {
  const { user } = useAuthStore();

  const [document_number, setDocumentNumber] = useState("");
  const [reference_number, setReferenceNumber] = useState("");
  const [warehouse_id, setWarehouseId] = useState("");
  const [document_type, setDocumentType] = useState("");
  const [payment_type, setPaymentType] = useState("");
  const [status, setStatus] = useState("");
  const [start_date, setStartDate] = useState<Date | undefined>();
  const [end_date, setEndDate] = useState<Date | undefined>();

  const { data: warehouses } = useAllWarehouses();
  const warehouseOptions = warehouses?.map((w) => ({ value: String(w.id), label: w.name })) ?? [];

  const exportEndpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (user?.company_id) params.append("company_id", user.company_id.toString());
    if (document_type) params.append("document_type", document_type);
    if (document_number) params.append("document_number", document_number);
    if (reference_number) params.append("reference_number", reference_number);
    if (payment_type) params.append("payment_type", payment_type);
    if (status) params.append("status", status);
    if (warehouse_id) params.append("warehouse_id", warehouse_id);
    if (start_date) params.append("start_date", start_date.toISOString().split("T")[0]);
    if (end_date) params.append("end_date", end_date.toISOString().split("T")[0]);
    const qs = params.toString();
    return qs ? `/purchase/export?${qs}` : "/purchase/export";
  }, [user?.company_id, document_type, document_number, reference_number, payment_type, status, warehouse_id, start_date, end_date]);

  return (
    <PageWrapper>
      <TitleComponent
        title="Registro de Compras"
        subtitle="Descarga el registro de compras en formato Excel con los filtros aplicados"
        icon="ShoppingCart"
      />

      <GroupFormSection title="Descripción" icon={Info} cols={{ sm: 1 }}>
        <p className="text-sm text-muted-foreground">
          Este reporte genera un archivo Excel con el listado completo de compras registradas en el
          sistema. Puedes aplicar los filtros a continuación para acotar el período, almacén, tipo
          de documento, tipo de pago o estado antes de descargar.
        </p>
      </GroupFormSection>

      <GroupFormSection
        title="Filtros"
        icon={Filter}
        cols={{ sm: 1, md: 2, lg: 4 }}
        headerExtra={
          <ExportButtons
            excelEndpoint={exportEndpoint}
            excelFileName="registro-compras.xlsx"
          />
        }
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">N° Documento</label>
          <Input
            value={document_number}
            onChange={(e) => setDocumentNumber(e.target.value)}
            placeholder="N° Documento"
            className="h-8"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">N° Referencia</label>
          <Input
            value={reference_number}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="N° Referencia"
            className="h-8"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Almacén</label>
          <SearchableSelect
            options={warehouseOptions}
            value={warehouse_id}
            onChange={setWarehouseId}
            placeholder="Todos los almacenes"
            className="w-full md:w-full"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Tipo de documento</label>
          <SearchableSelect
            options={DOCUMENT_TYPE_OPTIONS}
            value={document_type}
            onChange={setDocumentType}
            placeholder="Todos los tipos"
            className="w-full md:w-full"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Tipo de pago</label>
          <SearchableSelect
            options={PAYMENT_TYPE_OPTIONS}
            value={payment_type}
            onChange={setPaymentType}
            placeholder="Todos los tipos"
            className="w-full md:w-full"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Estado</label>
          <SearchableSelect
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
            placeholder="Todos los estados"
            className="w-full md:w-full"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Rango de fechas</label>
          <DateRangePickerFilter
            dateFrom={start_date}
            dateTo={end_date}
            onDateChange={(from, to) => {
              setStartDate(from);
              setEndDate(to);
            }}
            placeholder="Seleccionar rango"
            className="w-full"
          />
        </div>
      </GroupFormSection>
    </PageWrapper>
  );
}
