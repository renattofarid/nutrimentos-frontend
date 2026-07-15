"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Ban,
  Eye,
  FileSpreadsheet,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
  X,
} from "lucide-react";
import { usePermission } from "@/lib/permission-guard";
import { ACTIONS } from "@/lib/permission-catalog";

const ROUTE = "planillas";

interface DeliverySheetActionsProps {
  hasSelection: boolean;
  canDelete: boolean;
  canCancel: boolean;
  onNew: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onViewDetails: () => void;
  onUpdateStatus: () => void;
  onExportPdf: () => void;
  onClose: () => void;
}

export default function DeliverySheetActions({
  hasSelection,
  canDelete,
  canCancel,
  onNew,
  onEdit,
  onDelete,
  onCancel,
  onViewDetails,
  onUpdateStatus,
  onExportPdf,
  onClose,
}: DeliverySheetActionsProps) {
  const { can } = usePermission();

  return (
    <div className="flex items-center gap-1">
      {can(ROUTE, ACTIONS.AGREGAR) && (
        <Button colorIcon="green" size="sm" variant="outline" onClick={onNew}>
          <Plus />
          Nuevo
        </Button>
      )}
      {can(ROUTE, ACTIONS.EDITAR) && (
        <Button
          colorIcon="amber"
          size="sm"
          variant="outline"
          onClick={onEdit}
          disabled={!hasSelection}
        >
          <Pencil />
          Editar
        </Button>
      )}
      {canDelete && can(ROUTE, ACTIONS.ELIMINAR) && (
        <Button
          colorIcon="red"
          size="sm"
          variant="outline"
          onClick={onDelete}
          disabled={!hasSelection || !canDelete}
        >
          <Trash2 />
          Eliminar
        </Button>
      )}
      {canCancel && can(ROUTE, ACTIONS.ANULAR) && (
        <Button
          colorIcon="orange"
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={!hasSelection || !canCancel}
        >
          <Ban />
          Anular
        </Button>
      )}
      {can(ROUTE, ACTIONS.VER) && (
        <Button
          colorIcon="blue"
          size="sm"
          variant="outline"
          onClick={onViewDetails}
          disabled={!hasSelection}
        >
          <Eye />
          Ver detalle
        </Button>
      )}
      {can(ROUTE, ACTIONS.CAMBIAR_ESTADO) && (
        <Button
          colorIcon="violet"
          size="sm"
          variant="outline"
          onClick={onUpdateStatus}
          disabled={!hasSelection}
        >
          <RefreshCcw />
          Estado
        </Button>
      )}
      {can(ROUTE, ACTIONS.IMPRIMIR) && (
        <Button
          colorIcon="teal"
          size="sm"
          variant="outline"
          onClick={onExportPdf}
          disabled={!hasSelection}
        >
          <FileSpreadsheet />
          PDF
        </Button>
      )}
      <div className="h-6 mx-2">
        <Separator orientation="vertical" />
      </div>
      <Button colorIcon="gray" size="sm" variant="outline" onClick={onClose}>
        <X />
        Cerrar
      </Button>
    </div>
  );
}
