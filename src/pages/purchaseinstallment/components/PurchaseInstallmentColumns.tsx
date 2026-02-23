import type { PurchaseInstallmentResource } from "../lib/purchaseinstallment.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { ButtonAction } from "@/components/ButtonAction";
import { DeleteButton } from "@/components/SimpleDeleteDialog";

export const PurchaseInstallmentColumns = ({
  onViewPurchase,
}: {
  onViewPurchase: (purchaseId: number) => void;
}): ColumnDef<PurchaseInstallmentResource>[] => [
  {
    accessorKey: "correlativo",
    header: "Correlativo",
    cell: ({ getValue }) => (
      <span className="font-semibold font-mono">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "purchase_correlativo",
    header: "Compra",
    cell: ({ getValue }) => (
      <span className="font-mono">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "installment_number",
    header: "Nro. Cuota",
    cell: ({ getValue }) => getValue() as number,
  },
  {
    accessorKey: "due_days",
    header: "Días Venc.",
    cell: ({ getValue }) => getValue() as number,
  },
  {
    accessorKey: "due_date",
    header: "Fecha Venc.",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return new Date(date).toLocaleDateString("es-PE");
    },
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ getValue }) => {
      const amount = getValue() as string;
      return (
        <span className="font-semibold">S/. {parseFloat(amount).toFixed(2)}</span>
      );
    },
  },
  {
    accessorKey: "pending_amount",
    header: "Pendiente",
    cell: ({ getValue }) => {
      const amount = getValue() as string;
      return (
        <span className="font-semibold">S/. {parseFloat(amount).toFixed(2)}</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const variants: Record<string, "default" | "secondary" | "destructive"> = {
        PENDIENTE: "secondary",
        PAGADA: "default",
        VENCIDA: "destructive",
      };
      return <Badge color={variants[status] || "default"}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const purchaseId = row.original.purchase_id;

      return (
        <div className="flex gap-2">
          <ButtonAction
            onClick={() => onViewPurchase(purchaseId)}
            icon={Eye}
            tooltip="Ver Compra"
          />
          <DeleteButton onClick={() => {/* handle delete action */}} />
        </div>
      );
    },
  },
];
