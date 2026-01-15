import { useEffect, useState } from "react";
import { Loader2, Package, AlertCircle } from "lucide-react";
import { getClientPriceList } from "../lib/client.actions";
import type {
  ClientPriceListData,
  ClientPriceProduct,
  ClientProductPrice,
} from "../lib/client.interface";
import { errorToast } from "@/lib/core.function";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AssignPriceListModal from "./AssignPriceListModal";
import GeneralSheet from "@/components/GeneralSheet";

interface ClientPriceListSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personId: number;
  personName: string;
}

export default function ClientPriceListSheet({
  open,
  onOpenChange,
  personId,
  personName,
}: ClientPriceListSheetProps) {
  const [priceListData, setPriceListData] =
    useState<ClientPriceListData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const fetchPriceList = async () => {
    setIsLoading(true);
    setHasError(false);
    setErrorStatus(null);
    try {
      const response = await getClientPriceList(personId);
      setPriceListData(response.data);
    } catch (error: any) {
      console.error("Error loading price list:", error);
      const status = error.response?.status;
      setHasError(true);
      setErrorStatus(status);

      // Solo mostrar toast si no es un error 404 o 500 (que manejaremos en la UI)
      if (status !== 404 && status !== 500) {
        errorToast(
          error.response?.data?.message || "Error al cargar la lista de precios"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && personId) {
      fetchPriceList();
    }
  }, [open, personId]);

  const handleAssignSuccess = () => {
    setShowAssignModal(false);
    fetchPriceList(); // Recargar la lista después de asignar
  };

  const formatPrice = (price: string, currency: string) => {
    return `${currency} ${parseFloat(price).toFixed(2)}`;
  };

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title={`Lista de Precios - ${personName}`}
      subtitle={
        priceListData
          ? `${priceListData.price_list.name} - ${priceListData.total_products} productos`
          : "Cargando información..."
      }
      icon="DollarSign"
      size="4xl"
    >
      <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : hasError || !priceListData ? (
            <div className="text-center py-12 space-y-4">
              <AlertCircle className="size-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  {errorStatus === 404 || errorStatus === 500
                    ? "Este cliente no tiene una lista de precios asignada"
                    : "No se pudo cargar la lista de precios"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {errorStatus === 404 || errorStatus === 500
                    ? "Puedes asignar una lista de precios para este cliente haciendo clic en el botón de abajo"
                    : "Ocurrió un error al intentar cargar la información"}
                </p>
              </div>
              {(errorStatus === 404 || errorStatus === 500) && (
                <Button onClick={() => setShowAssignModal(true)} className="mt-4">
                  Asignar Lista de Precios
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Información de la lista de precios */}
              <div className="bg-sidebar p-4 rounded-lg border space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">
                    {priceListData.price_list.name}
                  </h3>
                  <Badge
                    variant={
                      priceListData.price_list.is_active ? "default" : "secondary"
                    }
                  >
                    {priceListData.price_list.is_active ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {priceListData.price_list.description}
                </p>
                <div className="text-xs text-muted-foreground">
                  Código: {priceListData.price_list.code}
                </div>
              </div>

              {/* Rangos de peso */}
              {priceListData.price_list.weight_ranges.length > 0 && (
                <div className="bg-sidebar p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3 text-sm">
                    Rangos de Peso
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {priceListData.price_list.weight_ranges.map((range) => (
                      <Badge key={range.id} variant="outline">
                        {range.name}: {range.min_weight} -{" "}
                        {range.max_weight || "∞"} kg
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Matriz de Precios */}
              <div className="border rounded-lg">
                <div className="bg-sidebar px-4 py-3 border-b">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Package className="size-4" />
                    Matriz de Precios ({priceListData.total_products} productos)
                  </h4>
                </div>
                <div className="max-h-[calc(100vh-28rem)] overflow-auto">
                  {priceListData.products.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay productos en esta lista de precios</p>
                    </div>
                  ) : (
                    <div className="p-4">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="border p-3 text-left font-semibold sticky left-0 bg-muted/50 z-10 min-w-[200px]">
                              Producto
                            </th>
                            {priceListData.price_list.weight_ranges.length === 0 ? (
                              <th className="border p-3 text-center text-muted-foreground italic">
                                Sin rangos de peso
                              </th>
                            ) : (
                              priceListData.price_list.weight_ranges.map((range) => (
                                <th
                                  key={range.id}
                                  className="border p-3 text-center font-semibold min-w-[140px]"
                                >
                                  <div className="space-y-1">
                                    <Badge variant="secondary" className="font-mono text-xs">
                                      {range.name}
                                    </Badge>
                                    <div className="text-xs text-muted-foreground font-normal">
                                      {range.min_weight}kg -{" "}
                                      {range.max_weight && range.max_weight !== "null"
                                        ? `${range.max_weight}kg`
                                        : "Sin límite"}
                                    </div>
                                  </div>
                                </th>
                              ))
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            // Agrupar productos por product_id
                            const productMap = new Map<
                              number,
                              {
                                product: ClientPriceProduct;
                                prices: Map<number, ClientProductPrice>;
                              }
                            >();

                            priceListData.products.forEach((item) => {
                              if (!productMap.has(item.product_id)) {
                                productMap.set(item.product_id, {
                                  product: item.product,
                                  prices: new Map(),
                                });
                              }
                              productMap
                                .get(item.product_id)!
                                .prices.set(item.weight_range_id, item);
                            });

                            return Array.from(productMap.values()).map(
                              ({ product, prices }) => (
                                <tr key={product.id} className="hover:bg-muted/20">
                                  <td className="border p-3 sticky left-0 bg-background z-10">
                                    <div>
                                      <div className="font-semibold text-sm">
                                        {product.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground font-mono">
                                        {product.codigo}
                                      </div>
                                      {product.comment && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                          {product.comment}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  {priceListData.price_list.weight_ranges.length === 0 ? (
                                    <td className="border p-3 text-center text-muted-foreground italic">
                                      Sin rangos de peso
                                    </td>
                                  ) : (
                                    priceListData.price_list.weight_ranges.map((range) => {
                                      const priceItem = prices.get(range.id);
                                      return (
                                        <td key={range.id} className="border p-2">
                                          {priceItem ? (
                                            <div className="text-center space-y-1">
                                              <div className="font-semibold text-sm">
                                                {formatPrice(
                                                  priceItem.price,
                                                  priceItem.currency
                                                )}
                                              </div>
                                              <Badge
                                                variant={
                                                  priceItem.is_active
                                                    ? "default"
                                                    : "secondary"
                                                }
                                                className="text-xs"
                                              >
                                                {priceItem.is_active
                                                  ? "Activo"
                                                  : "Inactivo"}
                                              </Badge>
                                            </div>
                                          ) : (
                                            <div className="text-center text-muted-foreground text-xs">
                                              -
                                            </div>
                                          )}
                                        </td>
                                      );
                                    })
                                  )}
                                </tr>
                              )
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
      </div>

      {showAssignModal && (
        <AssignPriceListModal
          open={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          personId={personId}
          personName={personName}
          onSuccess={handleAssignSuccess}
        />
      )}
    </GeneralSheet>
  );
}
