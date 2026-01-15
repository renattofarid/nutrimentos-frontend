import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductStore } from "../lib/product.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Info, Warehouse } from "lucide-react";
import { ProductImageGallery } from "./ProductImageGallery";
import FormSkeleton from "@/components/FormSkeleton";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PRODUCT } from "../lib/product.interface";

export default function ProductDetail() {
  const { ICON } = PRODUCT;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, isFinding, fetchProduct } = useProductStore();

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id));
    }
  }, [id, fetchProduct]);

  // Calculate subtotal

  const handleBackToList = () => {
    navigate("/productos");
  };

  if (isFinding) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FormSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Producto no encontrado</p>
          <Button onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a productos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <FormWrapper>
      <TitleFormComponent title="Detalle del Producto" icon={ICON} />

      <div className="space-y-4">
        {/* Información General */}
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Código</p>
                <p className="text-lg font-semibold font-mono">{product.codigo}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Nombre</p>
                <p className="text-lg font-semibold">{product.name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tipo</p>
                <Badge variant="outline" className="text-sm">
                  {product.product_type_name}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Categoría</p>
                <p className="font-semibold">{product.category_name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Marca</p>
                <p className="font-semibold">{product.brand_name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock por Almacén */}
        <Card className="!gap-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              Stock por Almacén
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {product.stock_warehouse.map((warehouse) => (
                <div
                  key={warehouse.warehouse_id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold text-sm">
                    {warehouse.warehouse_name}
                  </span>
                  <Badge variant="secondary" className="text-sm font-bold">
                    {warehouse.stock}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <ProductImageGallery productId={parseInt(id!)} />
      </div>
    </FormWrapper>
  );
}
