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

interface DetailFieldProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
  mono?: boolean;
}

function DetailField({
  label,
  value,
  className = "",
  mono = false,
}: DetailFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <p className={`font-medium ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

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
        <DetailField label="Código" value={product.codigo} />

        <DetailField label="Nombre" value={product.name} />

        <DetailField label="Tipo" value={product.product_type_name} />

        <DetailField label="Categoría" value={product.category_name} />

        <DetailField label="Marca" value={product.brand_name} />

        <DetailField label="Peso (Kg)" value={product.weight} />

        <DetailField label="Precio por Kg" value={product.price_per_kg} />

        <DetailField
          label="Stock por Almacén"
          className="md:col-span-2 lg:col-span-3"
          value={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {product.stock_warehouse.length > 0
                ? product.stock_warehouse?.map((warehouse) => (
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
                  ))
                : "Sin stock asignado"}
            </div>
          }
        />
      </GroupFormSection>
      {/* Images */} <ProductImageGallery productId={parseInt(id!)} />
    </FormWrapper>
  );
}
