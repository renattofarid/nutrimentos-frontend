"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import {
  settlementSchema,
  type SettlementSchema,
} from "../lib/deliverysheet.schema";
import type { DeliverySheetSale } from "../lib/deliverysheet.interface";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SettlementDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SettlementSchema) => void;
  isSubmitting?: boolean;
  sales: DeliverySheetSale[];
}

const DELIVERY_STATUS_OPTIONS = [
  { value: "ENTREGADO", label: "Entregado" },
  { value: "NO_ENTREGADO", label: "No Entregado" },
  { value: "DEVUELTO", label: "Devuelto" },
];

interface SaleSettlement {
  sale_id: number;
  delivery_status: string;
  delivery_notes: string;
}

export function SettlementDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  sales,
}: SettlementDialogProps) {
  const [settlements, setSettlements] = useState<SaleSettlement[]>(
    sales.map((sale) => ({
      sale_id: sale.id,
      delivery_status: sale.delivery_status,
      delivery_notes: sale.delivery_notes || "",
    }))
  );

  const form = useForm<SettlementSchema>({
    resolver: zodResolver(settlementSchema),
    defaultValues: {
      sales: settlements.map((s) => ({
        sale_id: s.sale_id,
        delivery_status: s.delivery_status,
        delivery_notes: s.delivery_notes,
      })),
    },
  });

  const handleStatusChange = (saleId: number, status: string) => {
    setSettlements((prev) =>
      prev.map((s) =>
        s.sale_id === saleId ? { ...s, delivery_status: status } : s
      )
    );
  };

  const handleNotesChange = (saleId: number, notes: string) => {
    setSettlements((prev) =>
      prev.map((s) =>
        s.sale_id === saleId ? { ...s, delivery_notes: notes } : s
      )
    );
  };

  const handleFormSubmit = () => {
    const data: SettlementSchema = {
      sales: settlements.map((s) => ({
        sale_id: s.sale_id,
        delivery_status: s.delivery_status,
        delivery_notes: s.delivery_notes || undefined,
      })),
    };
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rendición de Planilla</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Documento</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado Entrega</TableHead>
                    <TableHead>Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale, index) => {
                    const settlement = settlements.find(
                      (s) => s.sale_id === sale.id
                    );
                    return (
                      <TableRow key={sale.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">
                              {sale.document_type}
                            </span>
                            <span className="font-mono font-semibold">
                              {sale.full_document_number}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[150px] truncate">
                            {sale.customer.full_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            S/. {sale.total_amount}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <FormSelect
                            placeholder="Estado"
                            items={DELIVERY_STATUS_OPTIONS}
                            value={settlement?.delivery_status || "PENDIENTE"}
                            onChange={(value) =>
                              handleStatusChange(sale.id, value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            placeholder="Notas de entrega..."
                            className="resize-none min-w-[200px]"
                            value={settlement?.delivery_notes || ""}
                            onChange={(e) =>
                              handleNotesChange(sale.id, e.target.value)
                            }
                            rows={2}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Rendición
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
