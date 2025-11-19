import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, Package, DollarSign, AlertCircle } from "lucide-react";
import { getClientPriceList } from "../lib/client.actions";
import type { ClientPriceListData } from "../lib/client.interface";
import { errorToast } from "@/lib/core.function";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import AssignPriceListModal from "./AssignPriceListModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-3xl p-4">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <DollarSign className="size-5" />
            Lista de Precios - {personName}
          </SheetTitle>
          <SheetDescription>
            {priceListData
              ? `${priceListData.price_list.name} - ${priceListData.total_products} productos`
              : "Cargando información..."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
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

              {/* Productos y precios */}
              <div className="border rounded-lg">
                <div className="bg-sidebar px-4 py-3 border-b">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Package className="size-4" />
                    Productos ({priceListData.total_products})
                  </h4>
                </div>
                <ScrollArea className="h-[calc(100vh-28rem)]">
                  {priceListData.products.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay productos en esta lista de precios</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Producto</TableHead>
                          <TableHead className="text-right">Precio</TableHead>
                          <TableHead className="text-center">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {priceListData.products.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono text-xs">
                              {item.product.codigo}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {item.product.name}
                                </div>
                                {item.product.comment && (
                                  <div className="text-xs text-muted-foreground">
                                    {item.product.comment}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatPrice(item.price, item.currency)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  item.is_active ? "default" : "secondary"
                                }
                                className="text-xs"
                              >
                                {item.is_active ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
      </SheetContent>

      {showAssignModal && (
        <AssignPriceListModal
          open={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          personId={personId}
          personName={personName}
          onSuccess={handleAssignSuccess}
        />
      )}
    </Sheet>
  );
}
