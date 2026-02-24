"use client";

import { useEffect, useState } from "react";
import GeneralSheet from "@/components/GeneralSheet";
import { DataTable } from "@/components/DataTable";
import { findPriceListById } from "../lib/pricelist.actions";
import type { PriceList } from "../lib/pricelist.interface";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPriceListDetailsColumns } from "./price-list-details-columns";

interface PriceListDetailsSheetProps {
  open: boolean;
  onClose: () => void;
  priceListId: number;
}

export const PriceListDetailsSheet = ({
  open,
  onClose,
  priceListId,
}: PriceListDetailsSheetProps) => {
  const [priceList, setPriceList] = useState<PriceList | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPriceList = async () => {
      if (!priceListId) return;

      setIsLoading(true);
      try {
        const response = await findPriceListById(priceListId);
        setPriceList(response.data);
      } catch (error) {
        console.error("Error al cargar lista de precios:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchPriceList();
    }
  }, [priceListId, open]);

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Detalles de Lista de Precios"
      subtitle="Consulte los productos y precios configurados"
      icon="ListIcon"
      size="4xl"
    >
      {isLoading && (
        <div className="flex items-center justify-center gap-2 p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm text-muted-foreground">
            Cargando detalles...
          </span>
        </div>
      )}

      {!isLoading && priceList && (
        <div className="space-y-6">
          {/* Header con información general */}
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Código:</span>
              <span className="font-mono text-sm">{priceList.code}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Nombre:</span>
              <span className="text-sm font-semibold">{priceList.name}</span>
            </div>
            {priceList.description && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Descripción:</span>
                <span className="text-sm text-muted-foreground">
                  {priceList.description}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Estado:</span>
              <Badge color={priceList.is_active ? "default" : "destructive"}>
                {priceList.is_active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>

          {/* Rangos de peso */}
          {priceList.weight_ranges && priceList.weight_ranges.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Rangos de Peso</h3>
              <div className="flex flex-wrap gap-2">
                {priceList.weight_ranges.map((range) => (
                  <Badge
                    key={range.id}
                    color="secondary"
                    className="font-mono"
                  >
                    {range.name}:{" "}
                    {range.formatted_range ||
                      `${range.min_weight}kg - ${range.max_weight}kg`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tabla de productos y precios */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">
              Productos y Precios ({priceList.product_prices?.length || 0})
            </h3>
            {priceList.product_prices && priceList.product_prices.length > 0 ? (
              <DataTable
                columns={getPriceListDetailsColumns(priceList.weight_ranges || [])}
                data={priceList.product_prices}
              />
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground bg-muted/50 rounded-lg">
                No hay productos configurados en esta lista de precios
              </div>
            )}
          </div>
        </div>
      )}

      {!isLoading && !priceList && (
        <div className="p-8 text-center text-sm text-muted-foreground">
          No se pudo cargar la información de la lista de precios
        </div>
      )}
    </GeneralSheet>
  );
};
