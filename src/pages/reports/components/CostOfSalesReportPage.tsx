import { useMemo, useState } from "react";

import PageWrapper from "@/components/PageWrapper";
import { GroupFormSection } from "@/components/GroupFormSection";
import ExportButtons from "@/components/ExportButtons";
import { SearchableSelect } from "@/components/SearchableSelect";
import { DatePickerFilter } from "@/components/DatePickerFilter";
import { format } from "date-fns";
import { Filter } from "lucide-react";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllBrands } from "@/pages/brand/lib/brand.hook";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { useProductAsyncSearch } from "../lib/reports.hook";

export default function CostOfSalesReportPage() {
  const { user } = useAuthStore();
  const company_id = user?.company_id;

  const [branch_id, setBranchId] = useState("");
  const [brand_id, setBrandId] = useState("");
  const [warehouse_id, setWarehouseId] = useState("");
  const [product_id, setProductId] = useState("");
  const [start_date, setStartDate] = useState<Date | undefined>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() - 3, 1);
  });
  const [end_date, setEndDate] = useState<Date | undefined>(() => new Date());

  const { data: branches } = useAllBranches({ company_id });
  const { data: warehouses } = useAllWarehouses();
  const { data: brands } = useAllBrands();

  const productSearch = useProductAsyncSearch({ search: "", per_page: 100 });
  const productOptions =
    productSearch.data?.data?.map((p: any) => ({
      value: String(p.id),
      label: p.name,
    })) ?? [];

  const branchOptions =
    branches?.map((b) => ({ value: String(b.id), label: b.name })) ?? [];
  const warehouseOptions =
    warehouses?.map((w) => ({ value: String(w.id), label: w.name })) ?? [];
  const brandOptions =
    brands?.map((b: any) => ({ value: String(b.id), label: b.name })) ?? [];

  const buildQs = (formato: "excel" | "pdf") => {
    const params = new URLSearchParams();
    params.append("format", formato);
    if (branch_id) params.append("branch_id", branch_id);
    if (brand_id) params.append("brand_id", brand_id);
    if (warehouse_id) params.append("warehouse_id", warehouse_id);
    if (product_id) params.append("product_id", product_id);
    if (start_date)
      params.append("start_date", format(start_date, "yyyy-MM-dd"));
    if (end_date) params.append("end_date", format(end_date, "yyyy-MM-dd"));
    return params.toString();
  };

  const excelEndpoint = useMemo(
    () => `/reports/cost-of-sales?${buildQs("excel")}`,
    [branch_id, brand_id, warehouse_id, product_id, start_date, end_date],
  );

  const pdfEndpoint = useMemo(
    () => `/reports/cost-of-sales?${buildQs("pdf")}`,
    [branch_id, brand_id, warehouse_id, product_id, start_date, end_date],
  );

  return (
    <PageWrapper>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <GroupFormSection title="Filtros" icon={Filter} cols={{ sm: 1 }}>
          <p className="text-sm text-muted-foreground text-justify">
            Este reporte muestra el costo de ventas por producto, marca, almacén
            y tienda. Aplica los filtros deseados y descarga el archivo en Excel
            o PDF.
          </p>
          <SearchableSelect
            options={branchOptions}
            value={branch_id}
            onChange={setBranchId}
            placeholder="Todas las tiendas"
            className="w-full!"
            label="Tienda"
          />

          <SearchableSelect
            label="Almacén"
            options={warehouseOptions}
            value={warehouse_id}
            onChange={setWarehouseId}
            placeholder="Todos los almacenes"
            className="w-full!"
          />

          <SearchableSelect
            label="Marca"
            options={brandOptions}
            value={brand_id}
            onChange={setBrandId}
            placeholder="Todas las marcas"
            className="w-full!"
          />

          <SearchableSelect
            label="Producto"
            options={productOptions}
            value={product_id}
            onChange={setProductId}
            placeholder="Todos los productos"
            className="w-full!"
          />

          <DatePickerFilter
            label="Del"
            value={start_date}
            onChange={setStartDate}
            placeholder="DD-MM-YYYY"
            vertical
            className="w-full"
          />
          <DatePickerFilter
            label="Al"
            value={end_date}
            onChange={setEndDate}
            placeholder="DD-MM-YYYY"
            vertical
            className="w-full"
          />

          <div className="flex justify-end">
            <div className="w-fit">
              <ExportButtons
                excelEndpoint={excelEndpoint}
                pdfEndpoint={pdfEndpoint}
                excelFileName="costo-de-ventas.xlsx"
                pdfFileName="costo-de-ventas.pdf"
              />
            </div>
          </div>
        </GroupFormSection>
      </div>
    </PageWrapper>
  );
}
