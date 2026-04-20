import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductStore } from "../lib/product.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Info } from "lucide-react";
import { ProductImageGallery } from "./ProductImageGallery";
import FormSkeleton from "@/components/FormSkeleton";
import { GroupFormSection } from "@/components/GroupFormSection";
import PageWrapper from "@/components/PageWrapper";

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
    <div className={`flex gap-4 items-baseline ${className}`}>
      <label className="text-sm font-medium text-end uppercase text-muted-foreground w-48 shrink-0">
        {label}
      </label>
      <p className={`font-medium ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function formatSoles(value?: string, suffix = "") {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return `S/ 0.00${suffix}`;
  }

  return `S/ ${numericValue.toFixed(2)}${suffix}`;
}

export default function ProductDetail() {
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
    <PageWrapper>
      <Button onClick={handleBackToList} variant="outline" className="mb-4">
        <ArrowLeft />
        Volver a productos
      </Button>
      <div className="grid grid-cols-2 gap-4">
        <GroupFormSection
          title="Información General"
          icon={Info}
          gap="gap-3"
          cols={{ sm: 1 }}
        >
          <DetailField label="Código" value={product.codigo} />

          <DetailField label="Nombre" value={product.name} />

          <DetailField label="Tipo" value={product.product_type_name} />

          <DetailField label="Categoría" value={product.category_name} />

          <DetailField label="Marca" value={product.brand_name} />

          <DetailField label="Peso (Kg)" value={product.weight} />

          <DetailField
            label="Precio"
            value={formatSoles(product.price)}
          />

          <DetailField
            label="Precio por kilo"
            value={formatSoles(product.price_per_kg, "/kg")}
          />

          <div>
            <DetailField
              label="Stock por Almacén"
              className="md:col-span-2 lg:col-span-3"
              value={
                <div className="grid grid-cols-1 gap-2">
                  {product.stock_warehouse.length > 0
                    ? product.stock_warehouse?.map((warehouse) => (
                        <div
                          key={warehouse.warehouse_id}
                          className="flex items-center justify-between py-1 px-2 gap-6 border rounded-lg"
                        >
                          <span className="font-medium text-sm">
                            {warehouse.warehouse_name}
                          </span>
                          <Badge
                            color="secondary"
                            size="xs"
                          >
                            {warehouse.stock} Kg
                          </Badge>
                        </div>
                      ))
                    : "Sin stock asignado"}
                </div>
              }
            />
          </div>
        </GroupFormSection>
        {/* Images */}
        <ProductImageGallery productId={parseInt(id!)} />
      </div>
    </PageWrapper>
  );
}
