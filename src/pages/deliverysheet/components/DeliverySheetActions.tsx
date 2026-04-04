"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  FileSpreadsheet,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
  X,
} from "lucide-react";

interface DeliverySheetActionsProps {
  hasSelection: boolean;
  canDelete: boolean;
  onNew: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
  onUpdateStatus: () => void;
  onExportPdf: () => void;
  onClose: () => void;
}

export default function DeliverySheetActions({
  hasSelection,
  canDelete,
  onNew,
  onEdit,
  onDelete,
  onViewDetails,
  onUpdateStatus,
  onExportPdf,
  onClose,
}: DeliverySheetActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button colorIcon="green" size="sm" variant="outline" onClick={onNew}>
        <Plus />
        Nuevo
      </Button>
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
