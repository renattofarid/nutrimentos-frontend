import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProduct } from "../lib/product.hook";
import { useAllCategories } from "@/pages/category/lib/category.hook";
import { useAllBrands } from "@/pages/brand/lib/brand.hook";
import type { RowSelectionState } from "@tanstack/react-table";

import ProductActions from "./ProductActions";
import ProductTable from "./ProductTable";
import ProductOptions from "./ProductOptions";
import { deleteProduct } from "../lib/product.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { ProductColumns } from "./ProductColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { PRODUCT } from "../lib/product.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useAllCompanies } from "@/pages/company/lib/company.hook";
import PageWrapper from "@/components/PageWrapper";

const { MODEL } = PRODUCT;

export default function ProductPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data, isLoading, refetch } = useProduct({
    page,
    per_page,
    search,
    codigo: searchCode,
    category_id: selectedCategory,
    brand_id: selectedBrand,
    type: selectedType,
    company_id: selectedCompany,
  });
  const { data: categories } = useAllCategories();
  const { data: brands } = useAllBrands();
  const { data: companies } = useAllCompanies();

  useEffect(() => {
    setPage(1);
  }, [search, searchCode, per_page, selectedCategory, selectedBrand, selectedType, selectedCompany]);

  const selectedProductId = Object.keys(rowSelection).find((key) => rowSelection[key]);
  const toolbarProduct = selectedProductId
    ? (data?.data?.find((p) => p.id.toString() === selectedProductId) ?? null)
    : null;
  const hasSelection = !!toolbarProduct;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : ERROR_MESSAGE(MODEL, "delete");
      errorToast(errorMessage);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <PageWrapper>
      <ProductActions
        hasSelection={hasSelection}
        onNew={() => navigate("/productos/agregar")}
        onEdit={() => toolbarProduct && navigate(`/productos/actualizar/${toolbarProduct.id}`)}
        onDelete={() => toolbarProduct && setDeleteId(toolbarProduct.id)}
        onView={() => toolbarProduct && navigate(`/productos/${toolbarProduct.id}`)}
      />

      <ProductTable
        isLoading={isLoading}
        columns={ProductColumns()}
        data={data?.data || []}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowDoubleClick={(product) => navigate(`/productos/actualizar/${product.id}`)}
      >
        {categories && brands && companies && (
          <ProductOptions
            searchCode={searchCode}
            setSearchCode={setSearchCode}
            search={search}
            setSearch={setSearch}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedCompany={selectedCompany}
            setSelectedCompany={setSelectedCompany}
            categories={categories}
            brands={brands}
            companies={companies}
          />
        )}
      </ProductTable>

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </PageWrapper>
  );
}
