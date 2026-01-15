import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import type { PurchaseDetailResource } from "../lib/purchase.interface";

interface PurchaseDetailTableProps {
  details: PurchaseDetailResource[];
  onEdit: (detailId: number) => void;
  onRefresh: () => void;
  isPurchasePaid?: boolean;
}

export function PurchaseDetailTable({
  details,
  onRefresh,
}: PurchaseDetailTableProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      onRefresh();
    } catch (error: any) {
      // El error ya se maneja en el store
    } finally {
      setDeleteId(null);
    }
  };

  const calculateTotal = () => {
    return details.reduce((sum, detail) => sum + detail.total, 0);
  };

  if (!details || details.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Badge variant="outline" className="text-lg p-3">
          No hay detalles en esta compra
        </Badge>
        <p className="text-sm mt-2">Agregue productos a la compra</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Código</TableHead>
              <TableHead className="text-right">Sacos</TableHead>
              <TableHead className="text-right">Kg</TableHead>
              <TableHead className="text-right">P. Unit.</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">Impuesto</TableHead>
              <TableHead className="text-right">Total</TableHead>
              {/* <TableHead className="text-center">Acciones</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.map((detail) => (
              <TableRow key={detail.id}>
                <TableCell>{detail.product.name}</TableCell>
                <TableCell>
                  <span className="text-sm font-semibold text-blue-600">
                    {detail.product.codigo}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {detail.quantity_sacks.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {detail.quantity_kg.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {detail.unit_price.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {detail.subtotal.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {detail.tax.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {detail.total.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-sidebar">
              <TableCell colSpan={7} className="text-right font-bold">
                TOTAL:
              </TableCell>
              <TableCell className="text-right font-bold text-lg text-primary">
                {calculateTotal().toFixed(6)}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
