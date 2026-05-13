"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ban, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DataTable } from "@/components/DataTable";
import PageWrapper from "@/components/PageWrapper";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { findDeliverySheetById, getDeliverySheets } from "../lib/deliverysheet.actions";
import { useDeliverySheetStore } from "../lib/deliverysheet.store";
import type { DeliverySheetById, SheetSale } from "../lib/deliverysheet.interface";
import { useWindowManager } from "@/stores/window-manager.store";
import type { ColumnDef } from "@tanstack/react-table";
import { parse } from "date-fns";

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  const date = parse(dateString, "yyyy-MM-dd", new Date());
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDIENTE: "Pendiente",
    EN_REPARTO: "En Reparto",
    COMPLETADO: "Completado",
    CANCELADO: "Cancelado",
    RENDIDA: "Rendida",
  };
  return labels[status] ?? status;
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "green" | "muted" => {
  if (status === "PENDIENTE") return "secondary";
  if (status === "EN_REPARTO") return "default";
  if (status === "COMPLETADO") return "green";
  if (status === "CANCELADO") return "destructive";
  return "muted";
};

const salesColumns: ColumnDef<SheetSale>[] = [
  {
    header: "#",
    cell: ({ row }) => <span className="text-muted-foreground">{row.index + 1}</span>,
    size: 40,
  },
  {
    accessorKey: "sale.full_document_number",
    header: "Documento",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.sale.full_document_number}</span>
    ),
  },
  {
    accessorKey: "sale.customer.full_name",
    header: "Cliente",
    cell: ({ row }) => row.original.sale.customer?.full_name ?? "-",
  },
  {
    accessorKey: "current_amount",
    header: "Monto",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">S/ {row.original.current_amount}</span>
    ),
  },
  {
    accessorKey: "delivery_status",
    header: "Estado entrega",
    cell: ({ row }) => {
      const s = row.original.delivery_status;
      const variants: Record<string, "default" | "secondary" | "destructive" | "orange" | "muted"> = {
        ENTREGADO: "default",
        PENDIENTE: "secondary",
        NO_ENTREGADO: "destructive",
        DEVUELTO: "orange",
      };
      const labels: Record<string, string> = {
        ENTREGADO: "Entregado",
        PENDIENTE: "Pendiente",
        NO_ENTREGADO: "No Entregado",
        DEVUELTO: "Devuelto",
      };
      return <Badge variant={variants[s] ?? "muted"}>{labels[s] ?? s}</Badge>;
    },
  },
];

export default function DeliverySheetCancelPage() {
  const navigate = useNavigate();
  const { activeTabId, closeTab } = useWindowManager();
  const { cancelDeliverySheet } = useDeliverySheetStore();

  const [sheetNumber, setSheetNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [sheet, setSheet] = useState<DeliverySheetById | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleSearch = async () => {
    if (!sheetNumber.trim()) return;
    setSearching(true);
    setNotFound(false);
    setSheet(null);
    try {
      const list = await getDeliverySheets({ search: sheetNumber.trim(), per_page: 5 });
      const match = list.data.find(
        (s) => s.sheet_number.toLowerCase() === sheetNumber.trim().toLowerCase(),
      );
      if (!match) {
        setNotFound(true);
        return;
      }
      const detail = await findDeliverySheetById(match.id);
      setSheet(detail.data);
    } catch {
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!sheet) return;
    await cancelDeliverySheet(sheet.id);
    setSheet((prev) => prev ? { ...prev, status: "CANCELADO" } : null);
  };

  const handleClose = () => {
    if (activeTabId) closeTab(activeTabId);
    else navigate(-1);
  };

  const alreadyCancelled = sheet?.status === "CANCELADO";

  return (
    <PageWrapper size="xl">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b">
        <Ban className="h-5 w-5 text-orange-500 shrink-0" />
        <h1 className="text-base font-semibold mr-2 shrink-0">Anulación de Planillas</h1>

        <Input
          placeholder="Ej: PL-001-00001"
          value={sheetNumber}
          onChange={(e) => {
            setSheetNumber(e.target.value);
            setNotFound(false);
            setSheet(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="h-8 max-w-[200px]"
        />
        <Button size="sm" onClick={handleSearch} disabled={searching || !sheetNumber.trim()}>
          {searching ? (
            <span className="animate-spin">⟳</span>
          ) : (
            <Search className="h-4 w-4" />
          )}
          Buscar
        </Button>

        {sheet && !alreadyCancelled && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setOpenConfirm(true)}
          >
            <Ban className="h-4 w-4" />
            Anular
          </Button>
        )}

        {sheet && alreadyCancelled && (
          <Badge variant="destructive" className="text-xs">Ya anulada</Badge>
        )}

        <div className="ml-auto">
          <Button colorIcon="gray" size="sm" variant="outline" onClick={handleClose}>
            <X />
            Cerrar
          </Button>
        </div>
      </div>

      {notFound && (
        <Alert variant="destructive" className="mb-3 max-w-sm">
          <AlertDescription>
            No se encontró ninguna planilla con el número <strong>{sheetNumber}</strong>.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary card */}
      {sheet && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-lg leading-tight">{sheet.sheet_number}</p>
                <p className="text-xs text-muted-foreground">Planilla encontrada</p>
              </div>
              <Badge variant={getStatusVariant(sheet.status)}>{getStatusLabel(sheet.status)}</Badge>
            </div>

            <Separator />

            {/* Info grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="font-medium">{sheet.type === "CONTADO" ? "Contado" : "Crédito"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fecha emisión</p>
                <p className="font-medium">{formatDate(sheet.issue_date)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Zona</p>
                <p className="font-medium">{sheet.zone?.name ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Conductor</p>
                <p className="font-medium">{sheet.driver?.full_name ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-semibold">S/ {sheet.total_amount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cobrado</p>
                <p className="font-medium">S/ {sheet.collected_amount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pendiente</p>
                <p className="font-medium">S/ {sheet.pending_amount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">N° ventas</p>
                <p className="font-medium">{sheet.sales_count}</p>
              </div>
            </div>

            <Separator />

            {/* Sales table */}
            <div>
              <p className="text-sm font-medium mb-2">
                Ventas ({sheet.sheet_sales?.length ?? 0})
              </p>
              {sheet.sheet_sales && sheet.sheet_sales.length > 0 ? (
                <DataTable columns={salesColumns} data={sheet.sheet_sales} />
              ) : (
                <p className="text-sm text-muted-foreground">Sin ventas registradas.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <SimpleDeleteDialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        onConfirm={handleConfirmCancel}
        title="Anular planilla"
        description={`¿Estás seguro de que deseas anular la planilla ${sheet?.sheet_number}? Esta acción no se puede deshacer.`}
        confirmLabel="Anular"
      />
    </PageWrapper>
  );
}
