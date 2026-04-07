"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { ProductForm } from "./ProductForm";
import { type ProductSchema } from "../lib/product.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { PRODUCT, type ProductResource } from "../lib/product.interface";
import { useProductStore } from "../lib/product.store";
import { useAllUnits } from "@/pages/unit/lib/unit.hook";
import { useAllProductTypes } from "@/pages/product-type/lib/product-type.hook";
import { useAllPersons } from "@/pages/person/lib/person.hook";
import { useAllCompanies } from "@/pages/company/lib/company.hook";
import FormSkeleton from "@/components/FormSkeleton";
import PageWrapper from "@/components/PageWrapper";

const { MODEL, ROUTE } = PRODUCT;

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchProduct, updateProduct, product } = useProductStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const { data: companies } = useAllCompanies();
  const { data: units } = useAllUnits();
  const { data: productTypes } = useAllProductTypes();
  const { data: suppliers } = useAllPersons();

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
    product: ProductResource,
  ): Partial<ProductSchema> => ({
    codigo: product.codigo,
    name: product.name,
    company_id: product.company_id.toString(),
    product_type_id: product.product_type_id.toString(),
    unit_id: product.unit_id.toString(),
    is_taxed: product.is_taxed === 1,
    supplier_id: product.supplier_id.toString(),
    weight: product.weight?.toString() || "0",
    is_kg: product.is_kg === 1,
    price_per_kg: product.price_per_kg?.toString() || "0",
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
    isLoadingProduct || !units || !productTypes || !suppliers || !companies || !product;

  return (
    <PageWrapper size="3xl">
      {isLoading ? (
        <FormSkeleton />
      ) : (
        <ProductForm
          defaultValues={mapProductToFormValues(product)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="update"
          companies={companies}
          units={units}
          productTypes={productTypes}
          suppliers={suppliers}
          onCancel={() => navigate(ROUTE)}
        />
      )}
    </PageWrapper>
  );
}
