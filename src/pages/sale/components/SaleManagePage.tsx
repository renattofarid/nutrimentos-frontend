"use client";

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSaleById } from "../lib/sale.hook";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Eye,
  Receipt,
  Wallet,
  CreditCard,
  FileText,
  User,
  Calendar,
  Package,
  DollarSign,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Building2,
} from "lucide-react";
import type { SaleInstallmentResource } from "../lib/sale.interface";
import InstallmentPaymentDialog from "./InstallmentPaymentDialog";
import InstallmentPaymentsSheet from "./InstallmentPaymentsSheet";
import FormWrapper from "@/components/FormWrapper";
import TitleComponent from "@/components/TitleComponent";
import { BackButton } from "@/components/BackButton";
import FormSkeleton from "@/components/FormSkeleton";
import { GroupFormSection } from "@/components/GroupFormSection";

export default function SaleManagePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: sale, isFinding, refetch } = useSaleById(Number(id));

  const [selectedInstallment, setSelectedInstallment] =
    useState<SaleInstallmentResource | null>(null);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openPaymentsSheet, setOpenPaymentsSheet] = useState(false);

  const currency =
    sale?.currency === "PEN" ? "S/." : sale?.currency === "USD" ? "$" : "€";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handlePaymentSuccess = () => {
    refetch();
    setOpenPaymentDialog(false);
    setSelectedInstallment(null);
  };

  const handleOpenPayment = (installment: SaleInstallmentResource) => {
    setSelectedInstallment(installment);
    setOpenPaymentDialog(true);
  };

  const handleViewPayments = (installment: SaleInstallmentResource) => {
    setSelectedInstallment(installment);
    setOpenPaymentsSheet(true);
  };

  if (isFinding) {
    return <FormSkeleton />;
  }

  if (!sale) {
    return (
      <FormWrapper>
        <div className="flex items-center justify-center h-64">
          <p>No se encontró la venta</p>
        </div>
      </FormWrapper>
    );
  }

  const isContado = sale.payment_type === "CONTADO";

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

  return (
    <FormWrapper>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <BackButton onClick={() => navigate("/ventas")} />
          <TitleComponent
            title={`Gestionar Venta #${sale.id}`}
            subtitle={`${sale.full_document_number} - ${getCustomerName()}`}
            icon={"CreditCard"}
          />
        </div>
        <Badge
          variant={
            sale.status === "PAGADA"
              ? "default"
              : sale.status === "REGISTRADO"
                ? "secondary"
                : sale.status === "PARCIAL"
                  ? "outline"
                  : "destructive"
          }
          className="text-sm px-3"
        >
          {sale.status}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="border-none bg-muted-foreground/5 hover:bg-muted-foreground/10 transition-colors !p-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Total
                </p>
                <p className="text-2xl font-bold text-muted-foreground truncate">
                  {currency} {sale.total_amount.toFixed(2)}
                </p>
              </div>
              <div className="bg-muted-foreground/10 p-2.5 rounded-lg shrink-0">
                <Receipt className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-primary/5 hover:bg-primary/10 transition-colors !p-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Pagado
                </p>
                <p className="text-2xl font-bold text-primary truncate">
                  {currency}{" "}
                  {sale.total_paid > 0
                    ? sale.total_paid.toFixed(2)
                    : (sale.total_amount - sale.current_amount).toFixed(2)}
                </p>
              </div>
              <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border-none transition-colors !p-0 ${
            sale.current_amount === 0
              ? "bg-primary/5 hover:bg-primary/10"
              : "bg-destructive/5 hover:bg-destructive/10"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Pendiente
                </p>
                <p
                  className={`text-2xl font-bold truncate ${
                    sale.current_amount === 0
                      ? "text-primary"
                      : "text-destructive"
                  }`}
                >
                  {currency} {sale.current_amount.toFixed(2)}
                </p>
              </div>
              <div
                className={`p-2.5 rounded-lg shrink-0 ${
                  sale.current_amount === 0
                    ? "bg-primary/10"
                    : "bg-destructive/10"
                }`}
              >
                <CreditCard
                  className={`h-5 w-5 ${
                    sale.current_amount === 0
                      ? "text-primary"
                      : "text-destructive"
                  }`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información General */}
      <GroupFormSection
        title="Información General de la Venta"
        icon={FileText}
        cols={{ sm: 2, md: 3, lg: 4 }}
      >
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Tipo de Documento</p>
          <p className="font-semibold">{sale.document_type}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Número</p>
          <p className="font-mono font-bold">{sale.full_document_number}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Fecha de Emisión
          </p>
          <p className="font-medium">{formatDate(sale.issue_date)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Tipo de Pago</p>
          <Badge
            variant={sale.payment_type === "CONTADO" ? "default" : "secondary"}
          >
            {sale.payment_type === "CONTADO" ? "CONTADO" : "CRÉDITO"}
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Moneda</p>
          <p className="font-semibold">{currency} {sale.currency}</p>
        </div>
        {sale.is_electronic !== undefined && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Factura Electrónica</p>
            <Badge variant={sale.is_electronic ? "default" : "outline"}>
              {sale.is_electronic ? "Sí" : "No"}
            </Badge>
          </div>
        )}
        {sale.total_weight !== undefined && sale.total_weight > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3" />
              Peso Total
            </p>
            <p className="font-semibold">{sale.total_weight.toFixed(2)} kg</p>
          </div>
        )}
        {sale.observations && (
          <div className="space-y-1 md:col-span-2 lg:col-span-4">
            <p className="text-xs text-muted-foreground">Observaciones</p>
            <p className="text-sm whitespace-pre-wrap">{sale.observations}</p>
          </div>
        )}
      </GroupFormSection>

      {/* Información Comercial */}
      <GroupFormSection
        title="Información Comercial"
        icon={Building2}
        cols={{ sm: 2, md: 3, lg: 4 }}
      >
        {sale.company && (
          <>
            {sale.company.social_reason && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Empresa - Razón Social</p>
                <p className="font-semibold">{sale.company.social_reason}</p>
              </div>
            )}
            {sale.company.trade_name && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Nombre Comercial</p>
                <p className="font-medium">{sale.company.trade_name}</p>
              </div>
            )}
          </>
        )}
        {sale.branch && (
          <>
            {sale.branch.name && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Sucursal</p>
                <p className="font-semibold">{sale.branch.name}</p>
              </div>
            )}
            {sale.branch.address && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Dirección Sucursal
                </p>
                <p className="font-medium">{sale.branch.address}</p>
              </div>
            )}
          </>
        )}
        {sale.warehouse && sale.warehouse.name && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Almacén</p>
            <p className="font-semibold">{sale.warehouse.name}</p>
          </div>
        )}
        {sale.user && (
          <>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Usuario Registrador</p>
              <p className="font-semibold">{sale.user.name}</p>
            </div>
            {sale.user.email && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Email Usuario</p>
                <p className="font-medium">{sale.user.email}</p>
              </div>
            )}
          </>
        )}
      </GroupFormSection>

      {/* Cliente */}
      <GroupFormSection
        title="Información del Cliente"
        icon={User}
        cols={{ sm: 2, md: 3, lg: 4 }}
      >
        <div className="space-y-1 md:col-span-2">
          <p className="text-xs text-muted-foreground">Nombre / Razón Social</p>
          <p className="font-semibold">{getCustomerName()}</p>
        </div>
        {sale.customer.commercial_name && (
          <div className="space-y-1 md:col-span-2">
            <p className="text-xs text-muted-foreground">Nombre Comercial</p>
            <p className="font-medium">{sale.customer.commercial_name}</p>
          </div>
        )}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Tipo de Documento</p>
          <p className="font-medium">{sale.customer.document_type_name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Número de Documento</p>
          <p className="font-mono font-semibold">{sale.customer.number_document}</p>
        </div>
        {sale.customer.phone && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" />
              Teléfono
            </p>
            <p className="font-medium">{sale.customer.phone}</p>
          </div>
        )}
        {sale.customer.email && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              Email
            </p>
            <p className="font-medium">{sale.customer.email}</p>
          </div>
        )}
        {sale.customer.address && (
          <div className="space-y-1 md:col-span-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Dirección
            </p>
            <p className="font-medium">{sale.customer.address}</p>
          </div>
        )}
        {sale.customer.business_type_name && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              Tipo de Negocio
            </p>
            <p className="font-medium">{sale.customer.business_type_name}</p>
          </div>
        )}
        {sale.customer.client_category && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Categoría</p>
            <Badge variant="outline">{sale.customer.client_category.name}</Badge>
          </div>
        )}
        {sale.vendedor && (
          <>
            <div className="space-y-1 md:col-span-2">
              <p className="text-xs text-muted-foreground">Vendedor Asignado</p>
              <p className="font-semibold">
                {sale.vendedor.business_name ||
                  `${sale.vendedor.names} ${sale.vendedor.father_surname || ""} ${sale.vendedor.mother_surname || ""}`.trim()}
              </p>
            </div>
            {sale.vendedor.number_document && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Doc. Vendedor</p>
                <p className="font-mono font-medium">{sale.vendedor.number_document}</p>
              </div>
            )}
            {sale.vendedor.phone && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tel. Vendedor</p>
                <p className="font-medium">{sale.vendedor.phone}</p>
              </div>
            )}
          </>
        )}
      </GroupFormSection>

      {/* Resumen Financiero */}
      <GroupFormSection
        title="Resumen Financiero y Métodos de Pago"
        icon={DollarSign}
        cols={{ sm: 2, md: 3, lg: 4 }}
      >
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Subtotal</p>
          <p className="font-semibold">{currency} {sale.subtotal.toFixed(2)}</p>
        </div>
        {sale.discount_global > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Descuento Global</p>
            <p className="font-semibold text-destructive">-{currency} {sale.discount_global.toFixed(2)}</p>
          </div>
        )}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">IGV</p>
          <p className="font-semibold">{currency} {sale.tax_amount.toFixed(2)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-bold text-lg">{currency} {sale.total_amount.toFixed(2)}</p>
        </div>

        {/* Métodos de Pago */}
        {sale.amount_cash > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Efectivo</p>
            <p className="font-semibold">{currency} {sale.amount_cash.toFixed(2)}</p>
          </div>
        )}
        {sale.amount_card > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Tarjeta</p>
            <p className="font-semibold">{currency} {sale.amount_card.toFixed(2)}</p>
          </div>
        )}
        {sale.amount_yape > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Yape</p>
            <p className="font-semibold">{currency} {sale.amount_yape.toFixed(2)}</p>
          </div>
        )}
        {sale.amount_plin > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Plin</p>
            <p className="font-semibold">{currency} {sale.amount_plin.toFixed(2)}</p>
          </div>
        )}
        {sale.amount_deposit > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Depósito</p>
            <p className="font-semibold">{currency} {sale.amount_deposit.toFixed(2)}</p>
          </div>
        )}
        {sale.amount_transfer > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Transferencia</p>
            <p className="font-semibold">{currency} {sale.amount_transfer.toFixed(2)}</p>
          </div>
        )}
        {sale.amount_other > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Otro</p>
            <p className="font-semibold">{currency} {sale.amount_other.toFixed(2)}</p>
          </div>
        )}

        {/* Notas de Crédito */}
        {sale.has_credit_notes && sale.credit_note_ids && sale.credit_note_ids.length > 0 && (
          <>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Notas de Crédito</p>
              <p className="font-semibold">{sale.credit_note_ids.length}</p>
            </div>
            {sale.total_credit_notes_amount !== undefined && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Monto NC</p>
                <p className="font-semibold text-destructive">
                  {currency} {sale.total_credit_notes_amount.toFixed(2)}
                </p>
              </div>
            )}
            <div className="space-y-1 md:col-span-2">
              <p className="text-xs text-muted-foreground">IDs Notas de Crédito</p>
              <p className="font-mono text-sm">{sale.credit_note_ids.join(", ")}</p>
            </div>
          </>
        )}
      </GroupFormSection>

      {/* Detalles de Productos */}
      {sale.details && sale.details.length > 0 && (
        <GroupFormSection
          title="Productos Vendidos"
          icon={Package}
          cols={{ sm: 1 }}
          headerExtra={
            <Badge variant="outline">
              {sale.details.length} producto(s)
            </Badge>
          }
        >
          <div className="space-y-3 w-full">
            {sale.details.map((detail, index) => (
              <div
                key={detail.id}
                className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-semibold">
                        #{index + 1}
                      </Badge>
                      <p className="font-semibold text-base">{detail.product.name}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Código</p>
                        <p className="font-mono font-medium">{detail.product.codigo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Marca</p>
                        <p className="font-medium">{detail.product.brand}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Categoría</p>
                        <p className="font-medium">{detail.product.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Cant. Sacos</p>
                        <p className="font-semibold">{detail.quantity_sacks}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Cant. Kg</p>
                        <p className="font-semibold">{detail.quantity_kg.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Precio Unit.</p>
                        <p className="font-semibold">{currency} {detail.unit_price.toFixed(2)}</p>
                      </div>
                      {detail.discount > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Descuento</p>
                          <p className="font-semibold text-destructive">
                            -{currency} {detail.discount.toFixed(2)} ({detail.discount_percentage}%)
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Subtotal</p>
                        <p className="font-semibold">{currency} {detail.subtotal.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">IGV</p>
                        <p className="font-semibold">{currency} {detail.tax.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total</p>
                        <p className="font-bold text-primary">{currency} {detail.total.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Ganancia
                        </p>
                        <p className="font-semibold text-green-600">
                          {currency} {detail.profit.toFixed(2)} ({detail.profit_percentage.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GroupFormSection>
      )}

      {/* Cuotas Section */}
      {isContado ? (
        <Card className="!gap-0">
          <CardContent className="py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <p className="text-lg font-semibold mb-1">Venta al Contado</p>
              <p className="text-sm text-muted-foreground">
                Esta venta fue realizada al contado y no tiene cuotas pendientes
              </p>
            </div>
          </CardContent>
        </Card>
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
              <p className="text-muted-foreground">
                No hay cuotas registradas para esta venta
              </p>
            </div>
          ) : (
            <div className="space-y-3 w-full">
              {sale.installments.map((installment) => {
                const isPending = installment.pending_amount > 0;
                const isOverdue =
                  isPending &&
                  new Date(installment.due_date) < new Date() &&
                  installment.status === "VENCIDO";

                return (
                  <div
                    key={installment.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      isOverdue
                        ? "border-destructive/30 bg-destructive/5"
                        : "bg-muted/30 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="font-semibold">
                            Cuota {installment.installment_number}
                          </Badge>
                          <Badge
                            variant={
                              installment.status === "PAGADA"
                                ? "default"
                                : installment.status === "REGISTRADO"
                                  ? "secondary"
                                  : installment.status === "PARCIAL"
                                    ? "outline"
                                    : "destructive"
                            }
                          >
                            {installment.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Vencimiento
                            </p>
                            <p className="font-medium">
                              {formatDate(installment.due_date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Monto
                            </p>
                            <p className="font-semibold">
                              {currency} {installment.amount.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Pendiente
                            </p>
                            <p
                              className={`font-semibold ${
                                isPending
                                  ? "text-destructive"
                                  : "text-primary"
                              }`}
                            >
                              {currency}{" "}
                              {installment.pending_amount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPayments(installment)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Pagos
                        </Button>
                        {isPending && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleOpenPayment(installment)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Pagar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GroupFormSection>
      )}

      {/* Payment Dialog */}
      <InstallmentPaymentDialog
        open={openPaymentDialog}
        onClose={() => {
          setOpenPaymentDialog(false);
          setSelectedInstallment(null);
        }}
        installment={selectedInstallment}
        currency={currency}
        onSuccess={handlePaymentSuccess}
      />

      {/* Payments Sheet */}
      <InstallmentPaymentsSheet
        open={openPaymentsSheet}
        onClose={() => {
          setOpenPaymentsSheet(false);
          setSelectedInstallment(null);
        }}
        installment={selectedInstallment}
        currency={currency}
      />
    </FormWrapper>
  );
}
