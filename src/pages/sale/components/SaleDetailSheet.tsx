import GeneralSheet from "@/components/GeneralSheet";
import { GroupFormSection } from "@/components/GroupFormSection";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Package,
  Receipt,
  Users,
  Wallet,
} from "lucide-react";
import type { SaleResource } from "../lib/sale.interface";

interface SaleDetailSheetProps {
  sale: SaleResource | null;
  open: boolean;
  onClose: () => void;
}

export default function SaleDetailSheet({
  sale,
  open,
  onClose,
}: SaleDetailSheetProps) {
  if (!sale) return null;

  const currency =
    sale.currency === "PEN" ? "S/." : sale.currency === "USD" ? "$" : "€";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCustomerName = () => {
    if (sale.customer.business_name) {
      return sale.customer.business_name;
    }

    const parts = [
      sale.customer.names,
      sale.customer.father_surname,
      sale.customer.mother_surname,
    ].filter(Boolean);

    return parts.join(" ") || "Sin nombre";
  };

  const isContado = sale.payment_type === "CONTADO";

  const total = sale.total_amount;
  const paid = sale.total_paid > 0 ? sale.total_paid : total - sale.current_amount;
  const pending = sale.current_amount;
  const paidPct = total > 0 ? Math.round((paid / total) * 100) : 0;

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Venta #${sale.id}`}
      subtitle={`Detalle ${sale.document_type} ${sale.full_document_number}`}
      icon="ShoppingBag"
      size="4xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Badge
            color={
              sale.status === "PAGADA"
                ? "default"
                : sale.status === "REGISTRADO"
                  ? "secondary"
                  : sale.status === "PARCIAL"
                    ? "muted"
                    : "destructive"
            }
            className="text-sm px-3"
          >
            {sale.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Venta
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {currency} {total.toFixed(2)}
                </p>
              </div>
              <div className="rounded-full bg-slate-200/50 dark:bg-slate-700/50 p-3">
                <Receipt className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progreso de pago</span>
                <span className="font-semibold">{paidPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${paidPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-950 dark:to-sky-900 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Pagado
                </p>
                <p className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                  {currency} {paid.toFixed(2)}
                </p>
              </div>
              <div className="rounded-full bg-sky-200/50 dark:bg-sky-800/50 p-3">
                <Wallet className="h-6 w-6 text-sky-600 dark:text-sky-400" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Pendiente
                </p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {currency} {pending.toFixed(2)}
                </p>
              </div>
              <div className="rounded-full bg-amber-200/50 dark:bg-amber-800/50 p-3">
                <CreditCard className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-4">
            <GroupFormSection
              title="Documento e Información General"
              icon={FileText}
              cols={{ sm: 2, md: 3, lg: 4 }}
            >
              {sale.company?.social_reason && (
                <div className="space-y-1 md:col-span-2">
                  <p className="text-xs text-muted-foreground">Empresa</p>
                  <p className="text-lg font-bold text-primary">
                    {sale.company.social_reason}
                  </p>
                </div>
              )}

              {sale.company?.trade_name && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Nombre Comercial</p>
                  <p className="font-medium">{sale.company.trade_name}</p>
                </div>
              )}

              {sale.branch?.name && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Sucursal</p>
                  <p className="font-semibold">{sale.branch.name}</p>
                </div>
              )}

              {sale.branch?.address && (
                <div className="space-y-1 md:col-span-2">
                  <p className="text-xs text-muted-foreground">Dirección Sucursal</p>
                  <p className="text-sm">{sale.branch.address}</p>
                </div>
              )}

              {sale.warehouse?.name && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Almacén</p>
                  <p className="font-semibold">{sale.warehouse.name}</p>
                </div>
              )}

              <div className="space-y-1 md:col-span-2 lg:col-span-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">Tipo de Documento</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-sm font-semibold">{sale.document_type}</p>
                  <p className="text-2xl font-bold font-mono text-primary">
                    {sale.full_document_number}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Fecha de Emisión</p>
                <p className="font-semibold">{formatDate(sale.issue_date)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Moneda</p>
                <p className="font-semibold">{sale.currency}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tipo de Pago</p>
                <Badge
                  color={sale.payment_type === "CONTADO" ? "default" : "secondary"}
                >
                  {sale.payment_type}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tipo</p>
                <Badge variant={sale.is_electronic ? "default" : "outline"}>
                  {sale.is_electronic ? "Electrónica" : "Física"}
                </Badge>
              </div>

              {sale.total_weight !== undefined && sale.total_weight > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Peso Total</p>
                  <p className="font-semibold">{sale.total_weight.toFixed(2)} kg</p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Registrado por</p>
                <p className="font-medium">{sale.user.name}</p>
              </div>

              {sale.user.email && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Email Usuario</p>
                  <p className="text-sm">{sale.user.email}</p>
                </div>
              )}

              {sale.observations && (
                <div className="space-y-1 md:col-span-2 lg:col-span-4">
                  <p className="text-xs text-muted-foreground">Observaciones</p>
                  <p className="text-sm whitespace-pre-wrap bg-muted/40 p-3 rounded-lg">
                    {sale.observations}
                  </p>
                </div>
              )}
            </GroupFormSection>

            <GroupFormSection
              title="Cliente y Vendedor"
              icon={Users}
              cols={{ sm: 2, md: 3, lg: 4 }}
            >
              <div className="space-y-1 md:col-span-2">
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p className="font-bold text-lg">{getCustomerName()}</p>
              </div>

              {sale.customer.commercial_name && (
                <div className="space-y-1 md:col-span-2">
                  <p className="text-xs text-muted-foreground">Nombre Comercial</p>
                  <p className="text-sm">{sale.customer.commercial_name}</p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {sale.customer.document_type_name}
                </p>
                <p className="font-mono font-semibold">
                  {sale.customer.number_document || "-"}
                </p>
              </div>

              {sale.customer.phone && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{sale.customer.phone}</p>
                </div>
              )}

              {sale.customer.email && (
                <div className="space-y-1 md:col-span-2">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm">{sale.customer.email}</p>
                </div>
              )}

              {sale.customer.address && (
                <div className="space-y-1 md:col-span-2 lg:col-span-4">
                  <p className="text-xs text-muted-foreground">Dirección</p>
                  <p className="text-sm">{sale.customer.address}</p>
                </div>
              )}

              {sale.customer.business_type_name && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Tipo de Negocio</p>
                  <Badge variant="outline" className="text-xs">
                    {sale.customer.business_type_name}
                  </Badge>
                </div>
              )}

              {sale.customer.client_category && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Categoría</p>
                  <Badge variant="outline" className="text-xs">
                    {sale.customer.client_category.name}
                  </Badge>
                </div>
              )}

              {sale.vendedor && (
                <>
                  <div className="space-y-1 md:col-span-2 lg:col-span-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">Vendedor</p>
                    <p className="font-semibold">
                      {sale.vendedor.business_name ||
                        `${sale.vendedor.names} ${sale.vendedor.father_surname || ""} ${sale.vendedor.mother_surname || ""}`.trim()}
                    </p>
                  </div>
                  {sale.vendedor.number_document && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Documento</p>
                      <p className="font-mono font-medium">
                        {sale.vendedor.number_document}
                      </p>
                    </div>
                  )}
                  {sale.vendedor.phone && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Teléfono</p>
                      <p className="font-medium">{sale.vendedor.phone}</p>
                    </div>
                  )}
                </>
              )}
            </GroupFormSection>

            {sale.details && sale.details.length > 0 && (
              <GroupFormSection
                title="Productos Vendidos"
                icon={Package}
                cols={{ sm: 1 }}
                headerExtra={
                  <Badge variant="outline">
                    {sale.details.length} {sale.details.length === 1 ? "producto" : "productos"}
                  </Badge>
                }
              >
                <div className="space-y-3 w-full">
                  {sale.details.map((detail, index) => (
                    <div
                      key={detail.id}
                      className="p-4 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors border border-muted"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-muted-foreground bg-background px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                          <p className="font-bold text-base">{detail.product.name}</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-2 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Código</p>
                            <p className="font-mono font-semibold">{detail.product.codigo}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Marca</p>
                            <p className="font-medium">{detail.product.brand}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Categoría</p>
                            <p className="font-medium">{detail.product.category}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Cantidad</p>
                            <p className="font-semibold">
                              {detail.quantity_sacks} sacos ({detail.quantity_kg.toFixed(2)} kg)
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">P. Unitario</p>
                            <p className="font-semibold">
                              {currency} {detail.unit_price.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="font-bold text-primary">
                              {currency} {detail.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        {(detail.discount > 0 || detail.profit > 0) && (
                          <div className="flex gap-6 pt-1 text-xs flex-wrap">
                            {detail.discount > 0 && (
                              <p className="text-destructive font-medium">
                                Descuento: -{currency} {detail.discount.toFixed(2)} (
                                {detail.discount_percentage}%)
                              </p>
                            )}
                            {detail.profit > 0 && (
                              <p className="text-green-600 font-semibold">
                                Ganancia: {currency} {detail.profit.toFixed(2)} (
                                {detail.profit_percentage.toFixed(1)}%)
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </GroupFormSection>
            )}

            {isContado ? (
              <div className="rounded-xl bg-card shadow-sm p-10">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Wallet className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-xl font-bold mb-2">Venta al Contado</p>
                  <p className="text-muted-foreground">
                    Esta venta fue registrada al contado y no tiene cuotas.
                  </p>
                </div>
              </div>
            ) : (
              <GroupFormSection
                title="Cuotas de Pago"
                icon={CreditCard}
                cols={{ sm: 1 }}
                headerExtra={
                  <Badge variant="outline">
                    {sale.installments?.length || 0} cuota(s)
                  </Badge>
                }
              >
                {!sale.installments || sale.installments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No hay cuotas registradas.</p>
                  </div>
                ) : (
                  <div className="space-y-4 w-full">
                    {sale.installments.map((installment) => {
                      const isPending = installment.pending_amount > 0;
                      const isOverdue =
                        isPending &&
                        new Date(installment.due_date) < new Date() &&
                        installment.status === "VENCIDO";

                      return (
                        <div
                          key={installment.id}
                          className={`p-5 rounded-lg border transition-all ${
                            isOverdue
                              ? "border-destructive/40 bg-destructive/5 shadow-sm"
                              : "border-muted bg-muted/30 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-4">
                                <Badge variant="outline" className="font-bold">
                                  Cuota {installment.installment_number}
                                </Badge>
                                <Badge
                                  color={
                                    installment.status === "PAGADA"
                                      ? "default"
                                      : installment.status === "REGISTRADO"
                                        ? "secondary"
                                        : installment.status === "PARCIAL"
                                          ? "muted"
                                          : "destructive"
                                  }
                                >
                                  {installment.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Vencimiento
                                  </p>
                                  <p className="font-semibold">
                                    {formatDate(installment.due_date)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1.5">
                                    Monto
                                  </p>
                                  <p className="font-bold">
                                    {currency} {installment.amount.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1.5">
                                    Pendiente
                                  </p>
                                  <p
                                    className={`font-bold text-lg ${
                                      isPending ? "text-destructive" : "text-primary"
                                    }`}
                                  >
                                    {currency} {installment.pending_amount.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </GroupFormSection>
            )}
          </div>

          <div className="space-y-3">
            <GroupFormSection title="Detalle" icon={DollarSign} cols={{ sm: 1 }}>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">
                    {currency} {sale.subtotal.toFixed(2)}
                  </span>
                </div>
                {sale.discount_global > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Descuento</span>
                    <span className="font-semibold text-destructive">
                      -{currency} {sale.discount_global.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IGV</span>
                  <span className="font-semibold">
                    {currency} {sale.tax_amount.toFixed(2)}
                  </span>
                </div>

                {(sale.amount_cash > 0 ||
                  sale.amount_card > 0 ||
                  sale.amount_yape > 0 ||
                  sale.amount_plin > 0 ||
                  sale.amount_deposit > 0 ||
                  sale.amount_transfer > 0 ||
                  sale.amount_other > 0) && (
                  <div className="pt-2 mt-2 border-t space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Métodos de pago
                    </p>
                    {sale.amount_cash > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Efectivo</span>
                        <span className="font-semibold">
                          {currency} {sale.amount_cash.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {sale.amount_card > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tarjeta</span>
                        <span className="font-semibold">
                          {currency} {sale.amount_card.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {sale.amount_yape > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Yape</span>
                        <span className="font-semibold">
                          {currency} {sale.amount_yape.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {sale.amount_plin > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plin</span>
                        <span className="font-semibold">
                          {currency} {sale.amount_plin.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {sale.amount_deposit > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Depósito</span>
                        <span className="font-semibold">
                          {currency} {sale.amount_deposit.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {sale.amount_transfer > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transferencia</span>
                        <span className="font-semibold">
                          {currency} {sale.amount_transfer.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {sale.amount_other > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Otro</span>
                        <span className="font-semibold">
                          {currency} {sale.amount_other.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {sale.has_credit_notes &&
                  sale.credit_note_ids &&
                  sale.credit_note_ids.length > 0 && (
                    <div className="pt-2 mt-2 border-t space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Notas de Crédito</span>
                        <span className="font-semibold">
                          {sale.credit_note_ids.length}
                        </span>
                      </div>
                      {sale.total_credit_notes_amount !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monto NC</span>
                          <span className="font-bold text-destructive">
                            -{currency} {sale.total_credit_notes_amount.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </GroupFormSection>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 shadow-sm flex flex-col items-center gap-1">
                <div className="rounded-full bg-slate-200/50 dark:bg-slate-700/50 p-2">
                  <Package className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <p className="text-2xl font-bold">{sale.details?.length || 0}</p>
                <span className="text-xs text-muted-foreground">Productos</span>
              </div>
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 shadow-sm flex flex-col items-center gap-1">
                <div className="rounded-full bg-slate-200/50 dark:bg-slate-700/50 p-2">
                  <CreditCard className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <p className="text-2xl font-bold">{sale.installments?.length || 0}</p>
                <span className="text-xs text-muted-foreground">Cuotas</span>
              </div>
            </div>

            <GroupFormSection title="Metadata" icon={Clock} cols={{ sm: 1 }}>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Creado: {formatDateTime(sale.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Actualizado: {formatDateTime(sale.updated_at)}</span>
                </div>
              </div>
            </GroupFormSection>
          </div>
        </div>
      </div>
    </GeneralSheet>
  );
}