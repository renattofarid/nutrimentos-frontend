import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductStore } from "../lib/product.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Info } from "lucide-react";
import { ProductImageGallery } from "./ProductImageGallery";
import FormSkeleton from "@/components/FormSkeleton";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import { PRODUCT } from "../lib/product.interface";
import { GroupFormSection } from "@/components/GroupFormSection";

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
      <GroupFormSection
        title="Información General"
        icon={Info}
        gap="gap-3"
        cols={{ sm: 1, md: 2, lg: 3 }}
      >
        {/* Basic Information */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Código
          </label>
          <p className="text-lg font-semibold font-mono">{product.codigo}</p>
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
                <Badge variant="secondary" className="text-sm font-semibold">
                  {warehouse.stock}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </GroupFormSection>
      {/* Images */} <ProductImageGallery productId={parseInt(id!)} />
    </FormWrapper>
  );
}
