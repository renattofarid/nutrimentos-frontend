import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductStore } from "../lib/product.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Eye, Image as ImageIcon, Package } from "lucide-react";
import { ProductImageGallery } from "./ProductImageGallery";
import { useProductComponents } from "../lib/product-component.hook";
import { useAllProducts } from "../lib/product.hook";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatCurrency";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, isFinding, fetchProduct } = useProductStore();

  // Fetch product components
  const { data: productComponents } = useProductComponents({
    productId: parseInt(id!),
    params: {},
  });

  // Fetch all products to get component details
  const { data: allProducts } = useAllProducts();

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id));
    }
  }, [id, fetchProduct]);

  // Calculate component details with prices and totals
  const componentDetails = useMemo(() => {
    if (!productComponents?.data || !allProducts) return [];

    return productComponents.data.map((component) => {
      const componentProduct = allProducts.find(
        (p) => p.id === component.component_id
      );

      const price = parseFloat(componentProduct?.purchase_price || "0");
      const quantity = component.quantity;
      const total = price * quantity;

      return {
        id: component.id,
        codigo: componentProduct?.codigo || "N/A",
        name: component.component_name || componentProduct?.name || "N/A",
        quantity,
        price,
        total,
      };
    });
  }, [productComponents, allProducts]);

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return componentDetails.reduce((acc, item) => acc + item.total, 0);
  }, [componentDetails]);

  const handleBackToList = () => {
    navigate("/productos");
  };

  if (isFinding) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando producto...</p>
        </div>
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
    <div className="space-y-6 mx-auto max-w-(--breakpoint-lg) w-full pb-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Detalles del Producto
            </CardTitle>
            <Button variant="outline" onClick={handleBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Unidad
                </label>
                <p className="font-medium">{product.unit_name}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Fecha de Creación
                </label>
                <p className="font-medium">
                  {new Date(product.created_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Components */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5" />
              <h3 className="text-lg font-semibold">
                Componentes del Producto
              </h3>
            </div>

            {componentDetails.length > 0 ? (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Precio</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {componentDetails.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.codigo}
                          </TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.price)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.total)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={4} className="text-right font-semibold">
                          Subtotal:
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(subtotal)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-muted rounded-xl">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No hay componentes configurados
                </h3>
                <p className="text-muted-foreground">
                  Este producto no tiene componentes asociados
                </p>
              </div>
            )}
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
    </div>
  );
}
