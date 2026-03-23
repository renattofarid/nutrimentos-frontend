import { useMemo, useState } from "react";
import TitleComponent from "@/components/TitleComponent";
import PageWrapper from "@/components/PageWrapper";
import { GroupFormSection } from "@/components/GroupFormSection";
import ExportButtons from "@/components/ExportButtons";
import { SearchableSelect } from "@/components/SearchableSelect";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import { Input } from "@/components/ui/input";
import { Filter, Info } from "lucide-react";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllWorkers } from "@/pages/worker/lib/worker.hook";
import { useAuthStore } from "@/pages/auth/lib/auth.store";

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

export default function SalesRegisterReportPage() {
  const { user } = useAuthStore();
  const company_id = user?.company_id;

  const [serie, setSerie] = useState("");
  const [numero, setNumero] = useState("");
  const [branch_id, setBranchId] = useState("");
  const [warehouse_id, setWarehouseId] = useState("");
  const [vendedor_id, setVendedorId] = useState("");
  const [document_type, setDocumentType] = useState("");
  const [status, setStatus] = useState("");
  const [start_date, setStartDate] = useState<Date | undefined>();
  const [end_date, setEndDate] = useState<Date | undefined>();

  const { data: branches } = useAllBranches({ company_id });
  const { data: warehouses } = useAllWarehouses();
  const { data: workers } = useAllWorkers();

  const branchOptions = branches?.map((b) => ({ value: String(b.id), label: b.name })) ?? [];
  const warehouseOptions = warehouses?.map((w) => ({ value: String(w.id), label: w.name })) ?? [];
  const workerOptions = (workers ?? []).map((w) => ({
    value: String(w.id),
    label: `${w.names} ${w.father_surname}`,
  }));

  const exportEndpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (company_id) params.append("company_id", company_id.toString());
    if (branch_id) params.append("branch_id", branch_id);
    if (document_type) params.append("document_type", document_type);
    if (status) params.append("status", status);
    if (warehouse_id) params.append("warehouse_id", warehouse_id);
    if (vendedor_id) params.append("vendedor_id", vendedor_id);
    if (start_date) params.append("start_date", start_date.toISOString().split("T")[0]);
    if (end_date) params.append("end_date", end_date.toISOString().split("T")[0]);
    if (numero) params.append("numero", numero);
    if (serie) params.append("serie", serie);
    const qs = params.toString();
    return qs ? `/sales/export?${qs}` : "/sales/export";
  }, [company_id, branch_id, document_type, status, warehouse_id, vendedor_id, start_date, end_date, numero, serie]);

  return (
    <PageWrapper>
      <TitleComponent
        title="Registro de Ventas"
        subtitle="Descarga el registro de ventas en formato Excel con los filtros aplicados"
        icon="ShoppingBag"
      />

      <GroupFormSection title="Descripción" icon={Info} cols={{ sm: 1 }}>
        <p className="text-sm text-muted-foreground">
          Este reporte genera un archivo Excel con el listado completo de ventas registradas en el
          sistema. Puedes aplicar los filtros a continuación para acotar el período, tienda, almacén,
          vendedor, tipo de documento o estado antes de descargar.
        </p>
      </GroupFormSection>

      <GroupFormSection
        title="Filtros"
        icon={Filter}
        cols={{ sm: 1, md: 2, lg: 4 }}
        headerExtra={
          <ExportButtons
            excelEndpoint={exportEndpoint}
            excelFileName="registro-ventas.xlsx"
          />
        }
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Serie</label>
          <Input
            value={serie}
            onChange={(e) => setSerie(e.target.value)}
            placeholder="Serie"
            className="h-8"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Número</label>
          <Input
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="Número"
            className="h-8"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Tienda</label>
          <SearchableSelect
            options={branchOptions}
            value={branch_id}
            onChange={setBranchId}
            placeholder="Todas las tiendas"
            className="w-full md:w-full"
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
          <label className="text-xs font-medium text-muted-foreground">Vendedor</label>
          <SearchableSelect
            options={workerOptions}
            value={vendedor_id}
            onChange={setVendedorId}
            placeholder="Todos los vendedores"
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
