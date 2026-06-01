import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCreditNoteStore } from "../lib/credit-note.store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Users, Package, X, Printer } from "lucide-react";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { useWindowManager } from "@/stores/window-manager.store";
import { getCreditNoteTicket } from "../lib/credit-note.actions";
import { promiseToast } from "@/lib/core.function";

export default function CreditNoteManagePage() {
  const { id } = useParams<{ id: string }>();
  const { fetchCreditNote, creditNote, isFinding } = useCreditNoteStore();
  const { activeTabId, closeTab, openTab } = useWindowManager();

  useEffect(() => {
    if (id) fetchCreditNote(Number(id));
  }, [id]);

  const currency =
    creditNote?.currency === "PEN"
      ? "S/."
      : creditNote?.currency === "USD"
        ? "$"
        : "€";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    if (!creditNote) return;
    const download = getCreditNoteTicket(creditNote.id).then((blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    });
    promiseToast(download, {
      loading: "Generando PDF...",
      success: "PDF generado exitosamente",
      error: (err: any) =>
        err?.response?.data?.message ??
        err?.message ??
        "Error al generar el PDF",
    });
  };

  const handleClose = () => {
    if (activeTabId) closeTab(activeTabId);
  };

  if (isFinding) return <FormSkeleton />;

  if (!creditNote) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            No se encontró la nota de crédito.
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Barra de acciones */}
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={handleClose}>
          <X /> Cerrar
        </Button>
        <Button
          size="sm"
          variant="outline"
          colorIcon="blue"
          onClick={handlePrint}
        >
          <Printer /> PDF
        </Button>
      </div>

      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Nota de Crédito</p>
            <p className="text-2xl font-bold font-mono">
              {creditNote.full_document_number}
            </p>
          </div>
        </div>
        <Badge
          color={creditNote.status === "REGISTRADO" ? "default" : "destructive"}
          className="text-sm px-3"
        >
          {creditNote.status}
        </Badge>
      </div>

      {/* Layout principal: izquierda (2/3) + sidebar sticky (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Columna izquierda */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información general */}
          <GroupFormSection
            title="Documento e Información General"
            icon={FileText}
            cols={{ sm: 2, md: 3, lg: 4 }}
          >
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Fecha de Emisión</p>
              <p className="font-semibold">
                {formatDate(creditNote.issue_date)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Moneda</p>
              <p className="font-semibold">{creditNote.currency}</p>
            </div>
            {creditNote.credit_note_type && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="font-semibold">{creditNote.credit_note_type}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Afecta Stock</p>
              <Badge color={creditNote.affects_stock ? "default" : "secondary"}>
                {creditNote.affects_stock ? "Sí" : "No"}
              </Badge>
            </div>
            {creditNote.motive && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Motivo</p>
                <p className="font-semibold">{creditNote.motive.name}</p>
              </div>
            )}
            {creditNote.reason && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Razón</p>
                <p className="text-sm">{creditNote.reason}</p>
              </div>
            )}
            {creditNote.warehouse && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Almacén</p>
                <p className="font-semibold">{creditNote.warehouse.name}</p>
              </div>
            )}
            {creditNote.user && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Registrado por</p>
                <p className="font-medium">{creditNote.user.name}</p>
              </div>
            )}
            {creditNote.observations && (
              <div className="space-y-1 md:col-span-2 lg:col-span-4">
                <p className="text-xs text-muted-foreground">Observaciones</p>
                <p className="text-sm whitespace-pre-wrap bg-muted/40 p-3 rounded-lg">
                  {creditNote.observations}
                </p>
              </div>
            )}
          </GroupFormSection>

          {/* Venta relacionada */}
          {creditNote.sale && (
            <GroupFormSection
              title="Venta Relacionada"
              icon={FileText}
              cols={{ sm: 2, md: 3, lg: 4 }}
            >
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">N° Documento</p>
                <button
                  type="button"
                  onClick={() =>
                    openTab(
                      `/ventas/gestionar/${creditNote.sale.id}`,
                      `${creditNote.sale.serie}-${creditNote.sale.numero}`,
                    )
                  }
                  className="text-lg font-bold font-mono underline underline-offset-2 hover:text-foreground/70 cursor-pointer"
                >
                  {creditNote.sale.serie}-{creditNote.sale.numero}
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Tipo de Documento
                </p>
                <p className="font-semibold">{creditNote.sale.document_type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Fecha de Venta</p>
                <p className="font-semibold">
                  {formatDate(creditNote.sale.issue_date)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Venta</p>
                <p className="font-semibold font-mono">
                  {currency}{" "}
                  {parseFloat(creditNote.sale.total_amount).toFixed(2)}
                </p>
              </div>
            </GroupFormSection>
          )}

          {/* Cliente */}
          {creditNote.customer && (
            <GroupFormSection
              title="Cliente"
              icon={Users}
              iconColor="text-green-600 dark:text-green-400"
              cols={{ sm: 2, md: 3 }}
            >
              {(creditNote.customer.business_name ||
                creditNote.customer.full_name) && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Nombre</p>
                  <p className="font-bold text-lg">
                    {creditNote.customer.business_name ||
                      creditNote.customer.full_name}
                  </p>
                </div>
              )}

              {creditNote.customer.document_number && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">N° Documento</p>
                  <p className="font-mono font-semibold">
                    {creditNote.customer.document_number}
                  </p>
                </div>
              )}
            </GroupFormSection>
          )}

          {/* Detalle de productos */}
          {creditNote.details && creditNote.details.length > 0 && (
            <GroupFormSection
              title="Productos"
              icon={Package}
              iconColor="text-purple-600 dark:text-purple-400"
              cols={{ sm: 1 }}
            >
              <div className="col-span-full overflow-x-auto rounded-md border border-muted">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/60 border-b">
                      <th className="text-left px-3 py-2 font-semibold">
                        Código
                      </th>
                      <th className="text-left px-3 py-2 font-semibold">
                        Producto
                      </th>
                      <th className="text-right px-3 py-2 font-semibold">
                        Cantidad
                      </th>
                      <th className="text-right px-3 py-2 font-semibold">
                        P. Unit.
                      </th>
                      <th className="text-right px-3 py-2 font-semibold">
                        Subtotal
                      </th>
                      <th className="text-right px-3 py-2 font-semibold">
                        IGV
                      </th>
                      <th className="text-right px-3 py-2 font-semibold">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditNote.details.map((detail, i) => (
                      <tr
                        key={detail.id}
                        className={
                          i % 2 === 0 ? "bg-background" : "bg-muted/20"
                        }
                      >
                        <td className="px-3 py-2 font-mono text-muted-foreground">
                          {detail.product_code}
                        </td>
                        <td className="px-3 py-2">{detail.product_name}</td>
                        <td className="px-3 py-2 text-right font-mono">
                          {parseFloat(detail.quantity).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {currency} {parseFloat(detail.unit_price).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {currency} {parseFloat(detail.subtotal).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {currency} {parseFloat(detail.tax).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-semibold">
                          {currency} {parseFloat(detail.total).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GroupFormSection>
          )}
        </div>

        {/* Sidebar derecho */}
        <div className="space-y-4 lg:sticky lg:top-4">
          {/* Totales */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 text-white">
              <p className="text-xs font-medium opacity-80">
                Total Nota de Crédito
              </p>
              <p className="text-3xl font-bold mt-1 font-mono">
                {currency} {parseFloat(creditNote.total_amount).toFixed(2)}
              </p>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">
                  {currency} {parseFloat(creditNote.subtotal).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IGV</span>
                <span className="font-mono">
                  {currency} {parseFloat(creditNote.tax).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total</span>
                <span className="font-mono">
                  {currency} {parseFloat(creditNote.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3 text-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Resumen
            </p>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Estado</span>
              <Badge
                color={
                  creditNote.status === "REGISTRADO" ? "default" : "destructive"
                }
                className="text-xs"
              >
                {creditNote.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Afecta Stock</span>
              <Badge
                color={creditNote.affects_stock ? "default" : "secondary"}
                className="text-xs"
              >
                {creditNote.affects_stock ? "Sí" : "No"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Productos</span>
              <span className="font-semibold">
                {creditNote.details?.length ?? 0}
              </span>
            </div>
            {creditNote.created_at && (
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-muted-foreground">Creado</span>
                <span className="text-xs">
                  {formatDate(creditNote.created_at)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
