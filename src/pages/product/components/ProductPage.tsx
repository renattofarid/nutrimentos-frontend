import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProduct } from "../lib/product.hook";
import { useAllCategories } from "@/pages/category/lib/category.hook";
import { useAllBrands } from "@/pages/brand/lib/brand.hook";
import { useAllUnits } from "@/pages/unit/lib/unit.hook";
import { useAllPersons } from "@/pages/person/lib/person.hook";
import { useAllProductTypes } from "@/pages/product-type/lib/product-type.hook";
import TitleComponent from "@/components/TitleComponent";
import ProductActions from "./ProductActions";
import ProductTable from "./ProductTable";
import ProductOptions from "./ProductOptions";
import { ProductForm } from "./ProductForm";
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
import { PRODUCT, type ProductResource } from "../lib/product.interface";
import { useProductStore } from "../lib/product.store";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductSchema } from "../lib/product.schema";
import { useAllCompanies } from "@/pages/company/lib/company.hook";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import { BackButton } from "@/components/BackButton";

const { MODEL, ICON } = PRODUCT;

type ViewMode = "list" | "create" | "edit";

export default function ProductPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );

  const { data, meta, isLoading, refetch } = useProduct();
  const { data: companies } = useAllCompanies();
  const { data: categories } = useAllCategories();
  const { data: brands } = useAllBrands();
  const { data: units } = useAllUnits();
  const { data: productTypes } = useAllProductTypes();
  const suppliers = useAllPersons();
  const { isSubmitting, createProduct, updateProduct, fetchProduct, product } =
    useProductStore();

  useEffect(() => {
    const filterParams = {
      page,
      search,
      per_page,
      ...(selectedCompany && { company_id: selectedCompany }),
      ...(selectedCategory && { category_id: selectedCategory }),
      ...(selectedBrand && { brand_id: selectedBrand }),
      ...(selectedType && { product_type: selectedType }),
    };
    refetch(filterParams);
  }, [
    page,
    search,
    per_page,
    selectedCategory,
    selectedBrand,
    selectedType,
    refetch,
  ]);

  useEffect(() => {
    if (selectedProductId && viewMode === "edit") {
      fetchProduct(selectedProductId);
    }
  }, [selectedProductId, viewMode, fetchProduct]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId);
      const filterParams = {
        page,
        search,
        per_page,
        ...(selectedCategory && { category_id: selectedCategory }),
        ...(selectedBrand && { brand_id: selectedBrand }),
        ...(selectedType && { product_type: selectedType }),
        ...(selectedCompany && { company_id: selectedCompany }),
      };
      await refetch(filterParams);
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
    setViewMode("create");
    setSelectedProductId(null);
  };

  const handleEditProduct = (id: number) => {
    setSelectedProductId(id);
    setViewMode("edit");
  };

  const handleViewProduct = (id: number) => {
    navigate(`/productos/${id}`);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedProductId(null);
  };

  const getDefaultValues = (): Partial<ProductSchema> => ({
    codigo: "",
    name: "",
    company_id: undefined,
    category_id: undefined,
    product_type_id: undefined,
    brand_id: undefined,
    unit_id: undefined,
    profit_margin: "",
    purchase_price: "",
    sale_price: "",
    is_taxed: 1,
    supplier_id: undefined,
    comment: "",
    weight: "",
    price_per_kg: "",
    commission_percentage: "",
    accounting_cost: "",
    inventory_cost: "",
  });

  const mapProductToForm = (data: ProductResource): Partial<ProductSchema> => ({
    codigo: data.codigo,
    name: data.name,
    company_id: data.company_id.toString(),
    category_id: data.category_id.toString(),
    product_type_id: data.product_type_id.toString(),
    brand_id: data.brand_id.toString(),
    unit_id: data.unit_id.toString(),
    profit_margin: data.profit_margin,
    purchase_price: data.purchase_price,
    sale_price: data.sale_price,
    is_taxed: data.is_taxed,
    supplier_id: data.supplier_id?.toString(),
    comment: data.comment,
    weight: data.weight,
    price_per_kg: data.price_per_kg,
    commission_percentage: data.commission_percentage,
    accounting_cost: data.accounting_cost,
    inventory_cost: data.inventory_cost,
  });

  const handleSubmit = async (data: ProductSchema) => {
    console.log("Submitted data:", data);
    try {
      if (viewMode === "create") {
        await createProduct(data);
        successToast(SUCCESS_MESSAGE(MODEL, "create"));
      } else if (viewMode === "edit" && selectedProductId) {
        await updateProduct(selectedProductId, data);
        successToast(SUCCESS_MESSAGE(MODEL, "update"));
      }

      const filterParams = {
        page,
        search,
        per_page,
        ...(selectedCompany && { company_id: selectedCompany }),
        ...(selectedCategory && { category_id: selectedCategory }),
        ...(selectedBrand && { brand_id: selectedBrand }),
        ...(selectedType && { product_type: selectedType }),
      };
      await refetch(filterParams);
      handleBackToList();
    } catch (error: any) {
      const errorMessage =
        (error.response.data.message || error.response.data.error) ??
        ERROR_MESSAGE(MODEL, viewMode === "create" ? "create" : "update");
      errorToast(errorMessage);
    }
  };

  // Render form view (create/edit)
  const renderFormView = () => {
    const isEdit = viewMode === "edit";
    const defaultValues =
      isEdit && product ? mapProductToForm(product) : getDefaultValues();

    return (
      <FormWrapper>
        <TitleFormComponent
          title="Producto"
          mode={isEdit ? "edit" : "create"}
          handleBack={handleBackToList}
        />

        {categories && brands && units && productTypes && suppliers && companies && (
          <ProductForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode={isEdit ? "update" : "create"}
            companies={companies}
            categories={categories}
            brands={brands}
            units={units}
            productTypes={productTypes}
            suppliers={suppliers}
            product={isEdit ? product || undefined : undefined}
            onCancel={handleBackToList}
          />
        )}
      </FormWrapper>
    );
  };

  // Render list view
  const renderListView = () => (
    <>
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
        data={data || []}
      >
        {categories && brands && (
          <ProductOptions
            search={search}
            setSearch={setSearch}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            categories={categories}
            brands={brands}
          />
        )}
      </ProductTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />
    </>
  );

  return (
    <div className="space-y-4">
      {viewMode === "list" && renderListView()}
      {(viewMode === "create" || viewMode === "edit") && renderFormView()}

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
