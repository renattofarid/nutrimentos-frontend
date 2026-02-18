import type { ReportConfig } from "../components/ReportCard";
import { useProductAsyncSearch, useWarehouseAsyncSearch } from "./reports.hook";

export const REPORTS: ReportConfig[] = [
  {
    id: "inventory",
    title: "Reporte de Inventario",
    type: "Inventario",
    description:
      "Exporta un reporte detallado del inventario actual, incluyendo cantidades, ubicaciones y estados de los productos. Ideal para auditorías y gestión de stock.",
    icon: "Box",
    endpoint: "/inventory/export",
    method: "get",
    formats: ["excel"],
    fields: [
      {
        name: "product_id",
        label: "Producto",
        type: "selectasync",
        required: false,
        placeholder: "Buscar producto...",
        useQueryHook: useProductAsyncSearch,
        asyncOptionsMapper: (item: any) => ({
          label: item.name,
          value: String(item.id),
        }),
      },
      {
        name: "warehouse_id",
        label: "Almacén",
        type: "selectasync",
        required: true,
        placeholder: "Buscar almacén...",
        useQueryHook: useWarehouseAsyncSearch,
        asyncOptionsMapper: (item: any) => ({
          label: item.name,
          value: String(item.id),
        }),
      },
    ],
    defaultParams: {},
  },
  {
    id: "kardex",
    title: "Reporte de Kardex",
    type: "Kardex",
    description:
      "Genera un reporte de Kardex para un producto específico en un almacén determinado, mostrando los movimientos de entrada y salida durante un período seleccionado.",
    icon: "BookOpen",
    endpoint: "/kardex/export",
    method: "get",
    formats: ["excel"],
    fields: [
      {
        name: "product_id",
        label: "Producto",
        type: "selectasync",
        required: false,
        placeholder: "Buscar producto...",
        useQueryHook: useProductAsyncSearch,
        asyncOptionsMapper: (item: any) => ({
          label: item.name,
          value: String(item.id),
        }),
      },
      {
        name: "warehouse_id",
        label: "Almacén",
        type: "selectasync",
        required: true,
        placeholder: "Buscar almacén...",
        useQueryHook: useWarehouseAsyncSearch,
        asyncOptionsMapper: (item: any) => ({
          label: item.name,
          value: String(item.id),
        }),
      },
    ],
    defaultParams: {},
  },
];
