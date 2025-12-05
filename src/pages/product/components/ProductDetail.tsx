import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductStore } from "../lib/product.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
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
      <Card>
        <CardContent className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Código
                </label>
                <p className="text-lg font-semibold font-mono">
                  {product.codigo}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Nombre
                </label>
                <p className="text-lg font-semibold">{product.name}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Tipo
                </label>
                <div>
                  <Badge variant="outline" className="text-sm">
                    {product.product_type_name}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Categoría
                </label>
                <p className="font-medium">{product.category_name}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Marca
                </label>
                <p className="font-medium">{product.brand_name}</p>
              </div>

              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium text-muted-foreground">
                  Stock por Almacén
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {product.stock_warehouse.map((warehouse) => (
                    <div
                      key={warehouse.warehouse_id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <span className="font-medium text-sm">
                        {warehouse.warehouse_name}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-sm font-semibold"
                      >
                        {warehouse.stock}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Images */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Galería de Imágenes</h3>
            </div>
            <ProductImageGallery productId={parseInt(id!)} />
          </div>
        </CardContent>
      </Card>
    </FormWrapper>
  );
}
