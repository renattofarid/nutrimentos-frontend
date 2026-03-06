import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useCarLoadReport,
  useZoneAsyncSearch,
  useBranchAsyncSearch,
} from "../lib/reports.hook";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  CarLoadReportParams,
  DeliverySheetDatum,
  DeliverySheetDetail,
} from "../lib/reports.interface";
import { Badge } from "@/components/ui/badge";
import type { BadgeColor } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Search,
  Filter,
  Package,
  Truck,
  Receipt,
} from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";
import { exportCarLoadReport } from "../lib/reports.actions";
import { toast } from "sonner";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { DateRangePickerFormField } from "@/components/DateRangePickerFormField";
import { useSidebar } from "@/components/ui/sidebar";
import { GeneralModal } from "@/components/GeneralModal";

interface FilterFormValues {
  zone_id: string;
  branch_id: string;
  date_from: string;
  date_to: string;
}

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

function SaleDocumentsCell({ value }: { value: string }) {
  if (!value || value === "-") {
    return <span className="text-muted-foreground text-sm">—</span>;
  }
  const documents = value
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Receipt className="mr-1 h-3 w-3" />
          {documents.length} {documents.length === 1 ? "doc." : "docs."}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2 space-y-1">
        {documents.map((doc, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/50"
          >
            <Receipt className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="font-mono text-sm">{doc}</span>
          </div>
        ))}
      </PopoverContent>
    </Popover>
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
    accessorKey: "sale_document_number",
    header: "Doc. Venta",
    size: 120,
    cell: ({ row }) => (
      <SaleDocumentsCell value={row.original.sale_document_number} />
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

export default function CarLoadReportPage() {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const { setOpen, setOpenMobile } = useSidebar();
  const { data: rawData, isLoading, fetch } = useCarLoadReport();

  useEffect(() => {
    setOpen(false);
    setOpenMobile(false);
  }, []);

  const form = useForm<FilterFormValues>({
    defaultValues: {
      zone_id: "",
      branch_id: "",
      date_from: "",
      date_to: "",
    },
  });

  const buildParams = (values: FilterFormValues): CarLoadReportParams => ({
    zone_ids: values.zone_id ? [Number(values.zone_id)] : [],
    branch_id: values.branch_id ? Number(values.branch_id) : null,
    date_from: values.date_from || null,
    date_to: values.date_to || null,
  });

  const handleSearch = (values: FilterFormValues) => {
    fetch(buildParams(values));
  };

  const handleExportPdf = async () => {
    const values = form.getValues();
    setIsExportingPdf(true);
    try {
      const blob = await exportCarLoadReport(buildParams(values), "pdf");
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "reporte-llenado-carros.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Reporte de Llenado de Carros exportado exitosamente");
    } catch {
      toast.error("Error al exportar el reporte de Llenado de Carros");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const tableData = rawData?.data ?? [];
  const summary = rawData?.summary;

  return (
    <PageWrapper size="3xl">
      <TitleComponent
        title="Reporte de Llenado de Carros"
        subtitle="Consulta las guías de remisión agrupadas por vehículo, zona y período"
        icon="BookOpen"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-6">
          <GroupFormSection
            title="Filtros de Búsqueda"
            icon={Filter}
            gap="gap-2"
            cols={{ sm: 1, md: 2, lg: 4 }}
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
                  onClick={handleExportPdf}
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
              name="zone_id"
              label="Zona"
              placeholder="Buscar zona..."
              useQueryHook={useZoneAsyncSearch}
              mapOptionFn={(item) => ({
                label: item.name,
                value: String(item.id),
              })}
            />

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

            <DateRangePickerFormField
              control={form.control}
              nameFrom="date_from"
              nameTo="date_to"
              label="Rango de Fechas"
              placeholder="Seleccionar rango"
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
                      {summary.by_vehicle.map((v, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono font-medium">
                            {v.plate || "—"}
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

          <DataTable
            columns={columns}
            data={tableData}
            isLoading={isLoading}
            initialColumnVisibility={{
              driver: false,
            }}
          />
        </form>
      </Form>
    </PageWrapper>
  );
}
