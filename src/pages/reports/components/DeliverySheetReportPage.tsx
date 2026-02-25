import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useDeliverySheetReport,
  useCustomerAsyncSearch,
  useVehicleAsyncSearch,
  useWarehouseAsyncSearch,
} from "../lib/reports.hook";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  DeliverySheetReportParams,
  DeliverySheetDatum,
  DeliverySheetDetail,
} from "../lib/reports.interface";
import { Badge } from "@/components/ui/badge";
import type { BadgeColor } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { GeneralModal } from "@/components/GeneralModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormSelect } from "@/components/FormSelect";
import {
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  Package,
  Truck,
} from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";
import { exportDeliverySheetReport } from "../lib/reports.actions";
import { toast } from "sonner";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { DateRangePickerFormField } from "@/components/DateRangePickerFormField";
import { useSidebar } from "@/components/ui/sidebar";

interface FilterFormValues {
  customer_id: string;
  vehicle_id: string;
  warehouse_id: string;
  start_date: string;
  end_date: string;
  modality: string;
  status: string;
}

const STATUS_OPTIONS = [
  { value: "REGISTRADA", label: "Registrada" },
  { value: "ENVIADA", label: "Enviada" },
  { value: "ACEPTADA", label: "Aceptada" },
  { value: "RECHAZADA", label: "Rechazada" },
  { value: "EN_TRANSITO", label: "En Tránsito" },
  { value: "ENTREGADA", label: "Entregada" },
  { value: "ANULADA", label: "Anulada" },
];

const MODALITY_OPTIONS = [
  { value: "PUBLICO", label: "Público" },
  { value: "PRIVADO", label: "Privado" },
];

const statusColor = (status: string): BadgeColor => {
  const s = status?.toUpperCase();
  if (s === "ENTREGADA" || s === "ACEPTADA") return "green";
  if (s === "EN_TRANSITO" || s === "ENVIADA") return "yellow";
  if (s === "RECHAZADA" || s === "ANULADA") return "destructive";
  return "muted";
};

function DetailsModal({
  details,
  open,
  onClose,
}: {
  details: DeliverySheetDetail[];
  open: boolean;
  onClose: () => void;
}) {
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={`Detalle de Productos (${details.length})`}
      icon="Package"
      size="4xl"
    >
      <div className="w-full min-w-0 overflow-x-auto">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Producto</TableHead>
              <TableHead className="w-[10%] text-right">Sacos</TableHead>
              <TableHead className="w-[10%] text-right">Kg</TableHead>
              <TableHead className="w-[10%]">Unidad</TableHead>
              <TableHead className="w-[30%]">Descripción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.map((d, i) => (
              <TableRow key={i}>
                <TableCell
                  className="font-medium truncate max-w-0"
                  title={d.product.name}
                >
                  {d.product.name}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {d.quantity_sacks}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {d.quantity_kg}
                </TableCell>
                <TableCell>{d.unit_code}</TableCell>
                <TableCell
                  className="text-muted-foreground text-sm truncate max-w-0"
                  title={d.description || ""}
                >
                  {d.description || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </GeneralModal>
  );
}

function DetailsCell({ details }: { details: DeliverySheetDetail[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Package className="mr-1 h-3 w-3" />
        {details.length} {details.length === 1 ? "producto" : "productos"}
      </Button>
      <DetailsModal
        details={details}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const columns: ColumnDef<DeliverySheetDatum>[] = [
  {
    accessorKey: "guide_number",
    header: "Nro. Guía",
    size: 130,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">
        {row.original.guide_number}
      </span>
    ),
  },
  {
    accessorKey: "issue_date",
    header: "F. Emisión",
    size: 110,
    cell: ({ row }) => (
      <span className="text-sm font-mono">{row.original.issue_date}</span>
    ),
  },
  {
    accessorKey: "transfer_date",
    header: "F. Traslado",
    size: 110,
    cell: ({ row }) => (
      <span className="text-sm font-mono">{row.original.transfer_date}</span>
    ),
  },
  {
    accessorKey: "modality",
    header: "Modalidad",
    size: 100,
    cell: ({ row }) => <Badge variant="outline">{row.original.modality}</Badge>,
  },
  {
    accessorKey: "status",
    header: "Estado",
    size: 120,
    cell: ({ row }) => (
      <Badge color={statusColor(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "customer",
    header: "Cliente",
    size: 160,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.customer.name}</span>
    ),
  },
  {
    accessorKey: "vehicle",
    header: "Vehículo",
    size: 110,
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.original.vehicle.plate ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "driver",
    header: "Conductor",
    size: 150,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.driver?.name ?? "—"}</span>
    ),
  },
  {
    accessorKey: "origin",
    header: "Origen",
    size: 140,
    cell: ({ row }) => (
      <span className="text-sm">{row.original.origin.warehouse}</span>
    ),
  },
  {
    accessorKey: "destination",
    header: "Destino",
    size: 150,
    cell: ({ row }) => (
      <span className="text-sm line-clamp-1">
        {row.original.destination.address}
      </span>
    ),
  },
  {
    accessorKey: "total_weight",
    header: "Peso Total",
    size: 100,
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.original.total_weight} {row.original.unit_measurement}
      </span>
    ),
  },
  {
    accessorKey: "total_packages",
    header: "Bultos",
    size: 80,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.total_packages}</span>
    ),
  },
  {
    accessorKey: "details",
    header: "Productos",
    size: 200,
    cell: ({ row }) => <DetailsCell details={row.original.details} />,
  },
];

export default function DeliverySheetReportPage() {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const { setOpen, setOpenMobile } = useSidebar();
  const { data: rawData, isLoading, fetch } = useDeliverySheetReport();

  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, []);

  const form = useForm<FilterFormValues>({
    defaultValues: {
      customer_id: "",
      vehicle_id: "",
      warehouse_id: "",
      start_date: "",
      end_date: "",
      modality: "",
      status: "",
    },
  });

  const buildParams = (
    values: FilterFormValues,
  ): DeliverySheetReportParams => ({
    customer_id: values.customer_id ? Number(values.customer_id) : null,
    vehicle_id: values.vehicle_id ? Number(values.vehicle_id) : null,
    warehouse_id: values.warehouse_id ? Number(values.warehouse_id) : null,
    start_date: values.start_date || null,
    end_date: values.end_date || null,
    modality:
      (values.modality as DeliverySheetReportParams["modality"]) || null,
    status: (values.status as DeliverySheetReportParams["status"]) || null,
  });

  const handleSearch = (values: FilterFormValues) => {
    fetch(buildParams(values));
  };

  const handleExport = async (format: "excel" | "pdf") => {
    const values = form.getValues();
    if (format === "excel") setIsExportingExcel(true);
    else setIsExportingPdf(true);
    try {
      const blob = await exportDeliverySheetReport(buildParams(values), format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte-planilla-reparto.${format === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Reporte de Planilla de Reparto exportado exitosamente");
    } catch {
      toast.error("Error al exportar el reporte de Planilla de Reparto");
    } finally {
      setIsExportingExcel(false);
      setIsExportingPdf(false);
    }
  };

  const tableData = rawData?.data ?? [];
  const summary = rawData?.summary;

  return (
    <PageWrapper size="3xl">
      <TitleComponent
        title="Reporte de Planilla de Reparto"
        subtitle="Consulta las guías de remisión por vehículo, cliente y estado"
        icon="BookOpen"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-6">
          <GroupFormSection
            title="Filtros de Búsqueda"
            icon={Filter}
            gap="gap-2"
            cols={{ sm: 1, md: 2, lg: 4, xl: 6 }}
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
                  disabled={isExportingExcel || tableData.length === 0}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("pdf")}
                  disabled={isExportingPdf || tableData.length === 0}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            }
          >
            <FormSelectAsync
              control={form.control}
              name="customer_id"
              label="Cliente"
              placeholder="Buscar cliente..."
              useQueryHook={useCustomerAsyncSearch}
              mapOptionFn={(item) => ({
                label: item.name,
                value: String(item.id),
              })}
            />

            <FormSelectAsync
              control={form.control}
              name="vehicle_id"
              label="Vehículo"
              placeholder="Buscar vehículo..."
              useQueryHook={useVehicleAsyncSearch}
              mapOptionFn={(item) => ({
                label: item.plate ?? item.name ?? String(item.id),
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

            <DateRangePickerFormField
              control={form.control}
              nameFrom="start_date"
              nameTo="end_date"
              label="Rango de Fechas"
              placeholder="Seleccionar rango"
            />

            <FormSelect
              control={form.control}
              name="modality"
              label="Modalidad"
              placeholder="Todas"
              options={MODALITY_OPTIONS}
            />

            <FormSelect
              control={form.control}
              name="status"
              label="Estado"
              placeholder="Todos"
              options={STATUS_OPTIONS}
            />
          </GroupFormSection>

          {summary && (
            <GroupFormSection
              title="Resumen"
              icon={Truck}
              cols={{ sm: 1, md: 3 }}
            >
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Guías</p>
                <p className="text-2xl font-bold">{summary.total_guides}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Peso Total (kg)</p>
                <p className="text-2xl font-bold">{summary.total_weight}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Bultos</p>
                <p className="text-2xl font-bold">{summary.total_packages}</p>
              </div>

              {summary.by_vehicle.length > 0 && (
                <div className="md:col-span-3">
                  <p className="text-sm font-medium mb-2">Por Vehículo</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Placa</TableHead>
                        <TableHead className="text-right">Guías</TableHead>
                        <TableHead className="text-right">Peso (kg)</TableHead>
                        <TableHead className="text-right">Bultos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.by_vehicle.map((v) => (
                        <TableRow key={v.plate}>
                          <TableCell className="font-mono font-medium">
                            {v.plate}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {v.total_guides}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {v.total_weight}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {v.total_packages}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </GroupFormSection>
          )}

          <DataTable columns={columns} data={tableData} isLoading={isLoading} />
        </form>
      </Form>
    </PageWrapper>
  );
}
