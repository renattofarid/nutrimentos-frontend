"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Pencil,
  Trash2,
  Ban,
  X,
  FileMinus,
  Eye,
  PanelRightOpen,
  Wallet,
} from "lucide-react";
import { usePermission } from "@/lib/permission-guard";
import { ACTIONS } from "@/lib/permission-catalog";

const ROUTE = "ventas";

interface SaleActionsProps {
  hasSelection: boolean;
  onNew: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAnular: () => void;
  onCerrar: () => void;
  onGenerar: () => void;
  onViewDetails: () => void;
  onManage: () => void;
  onQuickPay: () => void;
  canQuickPay: boolean;
}

export default function SaleActions({
  hasSelection,
  onNew,
  onEdit,
  onDelete,
  onAnular,
  onCerrar,
  onGenerar,
  onViewDetails,
  onManage,
  onQuickPay,
  canQuickPay,
}: SaleActionsProps) {
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
      {can(ROUTE, ACTIONS.ELIMINAR) && (
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
      )}
      {can(ROUTE, ACTIONS.ANULAR) && (
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
      )}
      {can(ROUTE, ACTIONS.VER) && (
        <Button
          colorIcon="blue"
          size="sm"
          variant="outline"
          onClick={onViewDetails}
          disabled={!hasSelection}
        >
          <PanelRightOpen />
          Ver detalle
        </Button>
      )}
      {can(ROUTE, ACTIONS.GESTIONAR) && (
        <Button
          colorIcon="violet"
          size="sm"
          variant="outline"
          onClick={onManage}
          disabled={!hasSelection}
        >
          <Eye />
          Gestionar
        </Button>
      )}
      {can(ROUTE, ACTIONS.PAGO_RAPIDO) && (
        <Button
          colorIcon="teal"
          size="sm"
          variant="outline"
          onClick={onQuickPay}
          disabled={!canQuickPay}
        >
          <Wallet />
          Pago rapido
        </Button>
      )}
      <div className="h-6 mx-2">
        <Separator orientation="vertical" />
      </div>
      {can(ROUTE, ACTIONS.GENERAR_NOTA_CREDITO) && (
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
      )}
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
