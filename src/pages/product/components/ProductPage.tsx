import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProduct } from "../lib/product.hook";
import { useAllCategories } from "@/pages/category/lib/category.hook";
import { useAllBrands } from "@/pages/brand/lib/brand.hook";
import TitleComponent from "@/components/TitleComponent";
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

const { MODEL, ICON } = PRODUCT;

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

  const { data, isLoading, refetch } = useProduct();
  const { data: categories } = useAllCategories();
  const { data: brands } = useAllBrands();
  const { data: companies } = useAllCompanies();

  useEffect(() => {
    setPage(1);
  }, [
    page,
    search,
    searchCode,
    per_page,
    selectedCategory,
    selectedBrand,
    selectedType,
    selectedCompany,
    refetch,
  ]);

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

  const handleCreateProduct = () => {
    navigate("/productos/agregar");
  };

  const handleEditProduct = (id: number) => {
    navigate(`/productos/actualizar/${id}`);
  };

  const handleViewProduct = (id: number) => {
    navigate(`/productos/${id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.plural!}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <ProductActions onCreateProduct={handleCreateProduct} />
      </div>

      <ProductTable
        isLoading={isLoading}
        columns={ProductColumns({
          onEdit: handleEditProduct,
          onDelete: setDeleteId,
          onView: handleViewProduct,
        })}
        data={data?.data || []}
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
    </div>
  );
}
