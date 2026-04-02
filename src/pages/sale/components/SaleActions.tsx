"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2, Ban, X, FileMinus } from "lucide-react";

interface SaleActionsProps {
  hasSelection: boolean;
  onNew: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAnular: () => void;
  onCerrar: () => void;
  onGenerar: () => void;
}

export default function SaleActions({
  hasSelection,
  onNew,
  onEdit,
  onDelete,
  onAnular,
  onCerrar,
  onGenerar,
}: SaleActionsProps) {
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
        disabled={!hasSelection}
      >
        <Trash2 />
        Eliminar
      </Button>
      <Button
        colorIcon="rose"
        size="sm"
        variant="outline"
        onClick={onAnular}
        disabled={!hasSelection}
      >
        <Ban />
        Anular
      </Button>
      <div className="h-6 mx-2">
        <Separator orientation="vertical" />
      </div>
      <Button
        colorIcon="indigo"
        size="sm"
        variant="outline"
        onClick={onGenerar}
        disabled={!hasSelection}
      >
        <FileMinus />
        Generar NC
      </Button>
      <div className="h-6 mx-2">
        <Separator orientation="vertical" />
      </div>
      <Button colorIcon="gray" size="sm" variant="outline" onClick={onCerrar}>
        <X />
        Cerrar
      </Button>
    </div>
  );
}
