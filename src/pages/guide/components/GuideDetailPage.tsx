import { useParams, useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import {
  FileText,
  Calendar,
  Truck,
  MapPin,
  User,
  Package,
  Clock,
  Building,
  Weight,
  CircleDot,
  Flag,
  FileCheck,
  Receipt,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGuideById } from "../lib/guide.hook";
import { GUIDE } from "../lib/guide.interface";
import FormSkeleton from "@/components/FormSkeleton";
import PageWrapper from "@/components/PageWrapper";
import { GroupFormSection } from "@/components/GroupFormSection";

export default function GuideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: guide, isFinding } = useGuideById(Number(id));

  const { MODEL, ROUTE } = GUIDE;

  if (isFinding || !guide) {
    return (
      <PageWrapper>
        <FormSkeleton />
      </PageWrapper>
    );
  }

  const statusVariants: Record<
    string,
    "default" | "secondary" | "destructive"
  > = {
    REGISTRADA: "secondary",
    ENVIADA: "default",
    ACEPTADA: "default",
    RECHAZADA: "destructive",
    ANULADA: "destructive",
  };

  const paymentTypeVariants: Record<string, "default" | "secondary"> = {
    CONTADO: "default",
    CREDITO: "secondary",
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number, currency: string = "PEN") => {
    const symbol = currency === "PEN" ? "S/." : currency === "USD" ? "$" : "€";
    return `${symbol} ${amount.toFixed(2)}`;
  };

  const getCustomerName = () => {
    if (!guide.customer) return "-";
    return guide.customer.business_name || guide.customer.full_name || "-";
  };

  const getCustomerDocument = () => {
    if (!guide.customer) return "-";
    return guide.customer.number_document || "-";
  };

  const totalSalesAmount = guide.sales?.reduce(
    (acc, sale) => acc + sale.total_amount,
    0
  ) || 0;

  return (
    <PageWrapper>
      <div className="mb-6">
        <TitleFormComponent
          handleBack={() => navigate(ROUTE)}
          title={`${MODEL.name} - ${guide.full_document_number}`}
          mode="view"
          icon="Truck"
        />
      </div>

      <div className="space-y-4">
        {/* Cards de resumen */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-muted/50 rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Estado</p>
                <Badge color={statusVariants[guide.status] || "default"}>
                  {guide.status}
                </Badge>
              </div>
              <FileCheck className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </div>

          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Peso Total</p>
                <p className="text-xl font-bold text-primary">
                  {guide.total_weight} {guide.unit_measurement}
                </p>
              </div>
              <Weight className="h-8 w-8 text-primary/50" />
            </div>
          </div>

          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Bultos</p>
                <p className="text-xl font-bold text-primary">
                  {guide.total_packages}
                </p>
              </div>
              <Package className="h-8 w-8 text-primary/50" />
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Modalidad</p>
                <Badge color={guide.modality === "PUBLICO" ? "default" : "secondary"}>
                  {guide.modality === "PUBLICO" ? "Público" : "Privado"}
                </Badge>
              </div>
              <Truck className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </div>
        </div>

        {/* Información del Documento */}
        <GroupFormSection
          title="Información del Documento"
          icon={FileText}
          cols={{ sm: 2, md: 3, lg: 4 }}
        >
          <div>
            <span className="text-sm text-muted-foreground">Número de Documento</span>
            <p className="font-mono font-bold text-lg">{guide.full_document_number}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Serie</span>
            <p className="font-semibold">{guide.serie}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Número</span>
            <p className="font-semibold">{guide.numero}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Motivo</span>
            <p className="font-semibold">{guide.motive?.name || "-"}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Electrónico</span>
            <div className="mt-1">
              <Badge color={guide.is_electronic ? "default" : "secondary"}>
                {guide.is_electronic ? "Sí" : "No"}
              </Badge>
            </div>
          </div>
          {guide.sale_document_number && (
            <div className="col-span-full">
              <span className="text-sm text-muted-foreground">Documentos de Venta Asociados</span>
              <p className="font-mono text-sm mt-1 p-2 bg-muted/50 rounded">
                {guide.sale_document_number}
              </p>
            </div>
          )}
        </GroupFormSection>

        {/* Fechas */}
        <GroupFormSection
          title="Fechas"
          icon={Calendar}
          cols={{ sm: 2, md: 4 }}
        >
          <div>
            <span className="text-sm text-muted-foreground">Fecha de Emisión</span>
            <p className="font-semibold">{formatDate(guide.issue_date)}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Fecha de Traslado</span>
            <p className="font-semibold">{formatDate(guide.transfer_date)}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Creación</span>
            <p className="font-semibold">{formatDateTime(guide.created_at)}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Actualización</span>
            <p className="font-semibold">{formatDateTime(guide.updated_at)}</p>
          </div>
        </GroupFormSection>

        {/* Cliente y Almacén */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GroupFormSection
            title="Cliente"
            icon={User}
            cols={{ sm: 1, md: 2 }}
          >
            <div>
              <span className="text-sm text-muted-foreground">Razón Social / Nombre</span>
              <p className="font-semibold">{getCustomerName()}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Documento</span>
              <p className="font-mono font-semibold">{getCustomerDocument()}</p>
            </div>
            {guide.customer?.address && (
              <div className="col-span-full">
                <span className="text-sm text-muted-foreground">Dirección</span>
                <p className="font-semibold">{guide.customer.address}</p>
              </div>
            )}
          </GroupFormSection>

          <GroupFormSection
            title="Almacén"
            icon={Building}
            cols={{ sm: 1, md: 2 }}
          >
            <div>
              <span className="text-sm text-muted-foreground">Nombre</span>
              <p className="font-semibold">{guide.warehouse?.name || "-"}</p>
            </div>
            {guide.warehouse?.address && (
              <div>
                <span className="text-sm text-muted-foreground">Dirección</span>
                <p className="font-semibold">{guide.warehouse.address}</p>
              </div>
            )}
          </GroupFormSection>
        </div>

        {/* Información del Transportista */}
        <GroupFormSection
          title="Información del Transportista"
          icon={Truck}
          cols={{ sm: 2, md: 3 }}
        >
          <div>
            <span className="text-sm text-muted-foreground">Razón Social</span>
            <p className="font-semibold">{guide.carrier_name || "-"}</p>
          </div>
          {guide.carrier_ruc && (
            <div>
              <span className="text-sm text-muted-foreground">RUC</span>
              <p className="font-mono font-semibold">{guide.carrier_ruc}</p>
            </div>
          )}
          {guide.carrier_mtc_number && (
            <div>
              <span className="text-sm text-muted-foreground">Número MTC</span>
              <p className="font-mono font-semibold">{guide.carrier_mtc_number}</p>
            </div>
          )}
          {guide.carrier_document_type && (
            <div>
              <span className="text-sm text-muted-foreground">Tipo Documento</span>
              <div className="mt-1">
                <Badge variant="outline">{guide.carrier_document_type}</Badge>
              </div>
            </div>
          )}
          {guide.carrier_document_number && (
            <div>
              <span className="text-sm text-muted-foreground">Nº Documento</span>
              <p className="font-mono font-semibold">{guide.carrier_document_number}</p>
            </div>
          )}
          {guide.vehicle && (
            <div>
              <span className="text-sm text-muted-foreground">Vehículo</span>
              <p className="font-mono font-bold text-lg text-primary">{guide.vehicle.plate}</p>
              <p className="text-sm text-muted-foreground">{guide.vehicle.brand} {guide.vehicle.model}</p>
            </div>
          )}
        </GroupFormSection>

        {/* Información del Conductor - Solo si existe */}
        {guide.driver_name && (
          <GroupFormSection
            title="Información del Conductor"
            icon={User}
            cols={{ sm: 2, md: 4 }}
          >
            <div>
              <span className="text-sm text-muted-foreground">Nombre</span>
              <p className="font-semibold">{guide.driver_name}</p>
            </div>
            {guide.driver_document_type && (
              <div>
                <span className="text-sm text-muted-foreground">Tipo Documento</span>
                <div className="mt-1">
                  <Badge variant="outline">{guide.driver_document_type}</Badge>
                </div>
              </div>
            )}
            {guide.driver_document_number && (
              <div>
                <span className="text-sm text-muted-foreground">Nº Documento</span>
                <p className="font-mono font-semibold">{guide.driver_document_number}</p>
              </div>
            )}
            {guide.driver_license && (
              <div>
                <span className="text-sm text-muted-foreground">Licencia</span>
                <p className="font-mono font-semibold">{guide.driver_license}</p>
              </div>
            )}
          </GroupFormSection>
        )}

        {/* Origen y Destino */}
        <GroupFormSection
          title="Origen y Destino"
          icon={MapPin}
          cols={{ sm: 1, md: 2 }}
        >
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <CircleDot className="h-5 w-5 text-primary" />
              <p className="font-semibold text-primary">Origen</p>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-muted-foreground">Dirección</span>
                <p className="font-medium">{guide.origin_address || "-"}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Ubigeo</span>
                <div className="mt-1">
                  <Badge variant="outline" className="font-mono">
                    {guide.origin_ubigeo}
                  </Badge>
                </div>
              </div>
              {guide.ubigeo_origin && (
                <div>
                  <span className="text-xs text-muted-foreground">Ubicación</span>
                  <p className="text-sm">
                    {guide.ubigeo_origin.province?.department?.name} / {guide.ubigeo_origin.province?.name} / {guide.ubigeo_origin.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-2 mb-3">
              <Flag className="h-5 w-5 text-destructive" />
              <p className="font-semibold text-destructive">Destino</p>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-muted-foreground">Dirección</span>
                <p className="font-medium">{guide.destination_address || "-"}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Ubigeo</span>
                <div className="mt-1">
                  <Badge variant="outline" className="font-mono">
                    {guide.destination_ubigeo}
                  </Badge>
                </div>
              </div>
              {guide.ubigeo_destination && (
                <div>
                  <span className="text-xs text-muted-foreground">Ubicación</span>
                  <p className="text-sm">
                    {guide.ubigeo_destination.province?.department?.name} / {guide.ubigeo_destination.province?.name} / {guide.ubigeo_destination.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </GroupFormSection>

        {/* Ventas Asociadas */}
        {guide.sales && guide.sales.length > 0 && (
          <GroupFormSection
            title={`Ventas Asociadas (${guide.sales.length})`}
            icon={Receipt}
            cols={{ sm: 1 }}
            headerExtra={
              <Badge variant="default" className="text-sm">
                Total: {formatCurrency(totalSalesAmount)}
              </Badge>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 px-2 font-medium">Documento</th>
                    <th className="text-left py-2 px-2 font-medium">Tipo</th>
                    <th className="text-left py-2 px-2 font-medium">Fecha</th>
                    <th className="text-left py-2 px-2 font-medium">Pago</th>
                    <th className="text-left py-2 px-2 font-medium">Estado</th>
                    <th className="text-right py-2 px-2 font-medium">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {guide.sales.map((sale) => (
                    <tr key={sale.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-1.5 px-2 font-mono text-xs">{sale.full_document_number}</td>
                      <td className="py-1.5 px-2">
                        <Badge color="secondary" className="text-xs">{sale.document_type}</Badge>
                      </td>
                      <td className="py-1.5 px-2 text-muted-foreground">{formatDate(sale.issue_date)}</td>
                      <td className="py-1.5 px-2">
                        <Badge color={paymentTypeVariants[sale.payment_type] || "secondary"} className="text-xs">
                          {sale.payment_type}
                        </Badge>
                      </td>
                      <td className="py-1.5 px-2">
                        <Badge
                          color={
                            sale.status === "PAGADA"
                              ? "default"
                              : sale.status === "ANULADA"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {sale.status}
                        </Badge>
                      </td>
                      <td className="py-1.5 px-2 text-right font-semibold text-primary">
                        {formatCurrency(sale.total_amount, sale.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GroupFormSection>
        )}

        {/* Detalles de Productos */}
        {guide.details && guide.details.length > 0 && (
          <GroupFormSection
            title={`Productos Transportados (${guide.details.length})`}
            icon={Package}
            cols={{ sm: 1 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 px-2 font-medium w-10">#</th>
                    <th className="text-left py-2 px-2 font-medium">Código</th>
                    <th className="text-left py-2 px-2 font-medium">Producto</th>
                    <th className="text-right py-2 px-2 font-medium">Sacos</th>
                    <th className="text-right py-2 px-2 font-medium">Kg</th>
                    <th className="text-center py-2 px-2 font-medium">Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {guide.details.map((detail, index) => (
                    <tr key={detail.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-1.5 px-2 text-muted-foreground">{index + 1}</td>
                      <td className="py-1.5 px-2 font-mono text-xs">{detail.product?.codigo || "-"}</td>
                      <td className="py-1.5 px-2 font-medium">{detail.product?.name || detail.description}</td>
                      <td className="py-1.5 px-2 text-right font-semibold text-primary">
                        {parseFloat(detail.quantity_sacks) > 0 ? parseFloat(detail.quantity_sacks) : "-"}
                      </td>
                      <td className="py-1.5 px-2 text-right font-semibold text-primary">
                        {parseFloat(detail.quantity_kg) > 0 ? parseFloat(detail.quantity_kg) : "-"}
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <Badge color="secondary" className="text-xs">{detail.unit_code}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GroupFormSection>
        )}

        {/* Observaciones */}
        {guide.observations && (
          <GroupFormSection
            title="Observaciones"
            icon={FileText}
            cols={{ sm: 1 }}
          >
            <p className="text-sm text-muted-foreground whitespace-pre-wrap p-3 bg-muted/30 rounded-lg">
              {guide.observations}
            </p>
          </GroupFormSection>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Creado: {formatDateTime(guide.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Actualizado: {formatDateTime(guide.updated_at)}</span>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
