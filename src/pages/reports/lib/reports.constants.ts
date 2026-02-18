import type { ReportConfig } from "../components/ReportCard";
import { useProductAsyncSearch } from "./reports.hook";

export const REPORTS: ReportConfig[] = [
  {
    id: "inventory",
    title: "Reporte de Inventario",
    type: "Inventario",
    description:
      "Exporta un reporte detallado del inventario actual, incluyendo cantidades, ubicaciones y estados de los productos.",
    icon: "Box",
    endpoint: "/inventory/export",
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
    ],
    defaultParams: {},
  },
];
