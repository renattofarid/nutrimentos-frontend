import { useEffect, useState } from "react";
import { useProductType } from "../lib/product-type.hook";
import TitleComponent from "@/components/TitleComponent";
import ProductTypeActions from "./ProductTypeActions";
import ProductTypeTable from "./ProductTypeTable";
import { ProductTypeForm } from "./ProductTypeForm";
import { deleteProductType } from "../lib/product-type.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { ProductTypeColumns } from "./ProductTypeColumns";
import DataTablePagination from "@/components/DataTablePagination";
import {
  PRODUCT_TYPE,
  type ProductTypeResource,
} from "../lib/product-type.interface";
import { useProductTypeStore } from "../lib/product-type.store";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductTypeSchema } from "../lib/product-type.schema";

const { MODEL, ICON } = PRODUCT_TYPE;

type ViewMode = "list" | "create" | "edit";

export default function ProductTypePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<
    number | null
  >(null);

  const { data, meta, isLoading, refetch } = useProductType();
  const {
    isSubmitting,
    createProductType,
    updateProductType,
    fetchProductType,
    productType,
  } = useProductTypeStore();

  useEffect(() => {
    const filterParams = {
      page,
      search,
      per_page,
    };
    refetch(filterParams);
  }, [page, search, per_page, refetch]);

  useEffect(() => {
    if (selectedProductTypeId && viewMode === "edit") {
      fetchProductType(selectedProductTypeId);
    }
  }, [selectedProductTypeId, viewMode, fetchProductType]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProductType(deleteId);
      const filterParams = {
        page,
        search,
        per_page,
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

  const handleCreateProductType = () => {
    setViewMode("create");
    setSelectedProductTypeId(null);
  };

  const handleEditProductType = (id: number) => {
    setSelectedProductTypeId(id);
    setViewMode("edit");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedProductTypeId(null);
  };

  const getDefaultValues = (): Partial<ProductTypeSchema> => ({
    name: "",
    code: "",
  });

  const mapProductTypeToForm = (
    data: ProductTypeResource
  ): Partial<ProductTypeSchema> => ({
    name: data.name,
    code: data.code,
  });

  const handleSubmit = async (data: ProductTypeSchema) => {
    try {
      if (viewMode === "create") {
        await createProductType(data);
        successToast(SUCCESS_MESSAGE(MODEL, "create"));
      } else if (viewMode === "edit" && selectedProductTypeId) {
        await updateProductType(selectedProductTypeId, data);
        successToast(SUCCESS_MESSAGE(MODEL, "update"));
      }

      const filterParams = {
        page,
        search,
        per_page,
      };
      await refetch(filterParams);
      handleBackToList();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : ERROR_MESSAGE(MODEL, viewMode === "create" ? "create" : "update");
      errorToast(errorMessage);
    }
  };

  // Render form view (create/edit)
  const renderFormView = () => {
    const isEdit = viewMode === "edit";
    const defaultValues =
      isEdit && productType
        ? mapProductTypeToForm(productType)
        : getDefaultValues();

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {isEdit ? "Editar Tipo de Producto" : "Crear Nuevo Tipo de Producto"}
            </CardTitle>
            <Button variant="outline" onClick={handleBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ProductTypeForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode={isEdit ? "update" : "create"}
            onCancel={handleBackToList}
          />
        </CardContent>
      </Card>
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
        <ProductTypeActions onCreateProductType={handleCreateProductType} />
      </div>

      <ProductTypeTable
        isLoading={isLoading}
        columns={ProductTypeColumns({
          onEdit: handleEditProductType,
          onDelete: setDeleteId,
        })}
        data={data || []}
      />

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
