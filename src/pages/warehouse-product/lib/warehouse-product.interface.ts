import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { PackageSearch } from "lucide-react";

const ROUTE = "/almacen-productos";
const NAME = "Producto en Almacén";

export const WAREHOUSE_PRODUCT: ModelComplete<WarehouseProductResource> = {
  MODEL: {
    name: NAME,
    description: "Listado de productos disponibles en almacén.",
    plural: "Productos en Almacén",
    gender: false,
  },
  ICON: "PackageSearch",
  ICON_REACT: PackageSearch,
  ENDPOINT: "/warehouseproduct",
  QUERY_KEY: "warehouse-products",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  TITLES: {
    create: {
      title: `Crear ${NAME}`,
      subtitle: `Complete los campos para crear un nuevo ${NAME.toLowerCase()}`,
    },
    update: {
      title: `Actualizar ${NAME}`,
      subtitle: `Actualice los campos para modificar el ${NAME.toLowerCase()}`,
    },
    delete: {
      title: `Eliminar ${NAME}`,
      subtitle: `Confirme para eliminar el ${NAME.toLowerCase()}`,
    },
  },
  EMPTY: {
    id: 0,
    warehouse_id: 0,
    warehouse_name: "",
    product_id: 0,
    product_name: "",
    product_code: "",
    stock: "0.00",
    min_stock: "0.00",
    max_stock: "0.00",
    created_at: "",
  },
};

export interface WarehouseProductResponse {
  data: WarehouseProductResource[];
  links: Links;
  meta: Meta;
}

export interface WarehouseProductResource {
  id: number;
  warehouse_id: number;
  warehouse_name: string;
  product_id: number;
  product_name: string;
  product_code: string;
  stock: string;
  min_stock: string;
  max_stock: string;
  created_at: string;
}

export interface getWarehouseProductProps {
  params?: Record<string, any>;
}
