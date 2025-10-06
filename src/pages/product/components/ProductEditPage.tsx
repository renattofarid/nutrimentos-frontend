"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import { ProductForm } from "./ProductForm";
import { type ProductSchema } from "../lib/product.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { PRODUCT, type ProductResource } from "../lib/product.interface";
import FormWrapper from "@/components/FormWrapper";
import { useProductStore } from "../lib/product.store";
import { useAllCategories } from "@/pages/category/lib/category.hook";
import { useAllBrands } from "@/pages/brand/lib/brand.hook";
import { useAllUnits } from "@/pages/unit/lib/unit.hook";
import { useAllProductTypes } from "@/pages/product-type/lib/product-type.hook";
import { useAllNationalities } from "@/pages/nationality/lib/nationality.hook";
import { useAllPersons } from "@/pages/person/lib/person.hook";
import { useAllCompanies } from "@/pages/company/lib/company.hook";
import FormSkeleton from "@/components/FormSkeleton";

const { MODEL, ROUTE } = PRODUCT;

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchProduct, updateProduct, product } = useProductStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);

  const { data: companies } = useAllCompanies();
  const { data: categories } = useAllCategories();
  const { data: brands } = useAllBrands();
  const { data: units } = useAllUnits();
  const { data: productTypes } = useAllProductTypes();
  const { data: nationalities } = useAllNationalities();
  const suppliers = useAllPersons();

  useEffect(() => {
    const loadProductData = async () => {
      if (!id) {
        navigate(ROUTE);
        return;
      }

      try {
        setIsLoadingProduct(true);
        await fetchProduct(Number(id));
      } catch {
        errorToast("Error al cargar los datos del producto");
        navigate(ROUTE);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    loadProductData();
  }, [id, navigate, fetchProduct]);

  const mapProductToFormValues = (
    product: ProductResource
  ): Partial<ProductSchema> => ({
    codigo: product.codigo,
    name: product.name,
    company_id: product.company_id.toString(),
    category_id: product.category_id.toString(),
    product_type_id: product.product_type_id.toString(),
    brand_id: product.brand_id.toString(),
    unit_id: product.unit_id.toString(),
    profit_margin: product.profit_margin.toString(),
    purchase_price: product.purchase_price.toString(),
    sale_price: product.sale_price.toString(),
    is_taxed: product.is_taxed,
    supplier_id: product.supplier_id.toString(),
    nationality_id: product.nationality_id.toString(),
    comment: product.comment || "",
    weight: product.weight?.toString() || "",
    price_per_kg: product.price_per_kg?.toString() || "",
    commission_percentage: product.commission_percentage?.toString() || "",
    accounting_cost: product.accounting_cost?.toString() || "",
    inventory_cost: product.inventory_cost?.toString() || "",
  });

  const handleSubmit = async (data: ProductSchema) => {
    if (!product) return;

    setIsSubmitting(true);
    try {
      await updateProduct(product.id, data);
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      navigate(ROUTE);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data
          ? (error.response.data.message as string)
          : ERROR_MESSAGE(MODEL, "update");

      errorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading =
    isLoadingProduct ||
    !categories ||
    !brands ||
    !units ||
    !productTypes ||
    !nationalities ||
    !suppliers ||
    !companies ||
    !product;

  return (
    <FormWrapper>
      <TitleFormComponent title={MODEL.name} mode="edit" />

      {isLoading ? (
        <FormSkeleton />
      ) : (
        <ProductForm
          defaultValues={mapProductToFormValues(product)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="update"
          companies={companies}
          categories={categories}
          brands={brands}
          units={units}
          productTypes={productTypes}
          nationalities={nationalities}
          suppliers={suppliers}
          onCancel={() => navigate(ROUTE)}
        />
      )}
    </FormWrapper>
  );
}
