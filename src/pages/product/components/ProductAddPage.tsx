"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ProductForm } from "./ProductForm";
import { type ProductSchema } from "../lib/product.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { PRODUCT } from "../lib/product.interface";
import { useProductStore } from "../lib/product.store";
import { useAllUnits } from "@/pages/unit/lib/unit.hook";
import { useAllProductTypes } from "@/pages/product-type/lib/product-type.hook";
import { useAllPersons } from "@/pages/person/lib/person.hook";
import { useAllCompanies } from "@/pages/company/lib/company.hook";
import FormSkeleton from "@/components/FormSkeleton";
import { SUPPLIER_ROLE_CODE } from "@/pages/supplier/lib/supplier.interface";
import PageWrapper from "@/components/PageWrapper";

const { MODEL, ROUTE } = PRODUCT;

export default function ProductAddPage() {
  const navigate = useNavigate();
  const { createProduct } = useProductStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: companies } = useAllCompanies();
  const { data: units } = useAllUnits();
  const { data: productTypes } = useAllProductTypes();
  const { data: suppliers } = useAllPersons({
    role_names: [SUPPLIER_ROLE_CODE],
  });
  const getDefaultValues = (): Partial<ProductSchema> => ({
    codigo: "",
    name: "",
    company_id: undefined,
    product_type_id: undefined,
    unit_id: undefined,
    is_taxed: false,
    is_kg: false,
    supplier_id: undefined,
    weight: "0",
    price_per_kg: "0",
  });

  const handleSubmit = async (data: ProductSchema) => {
    setIsSubmitting(true);
    try {
      await createProduct(data);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
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
          : ERROR_MESSAGE(MODEL, "create");

      errorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = !units || !productTypes || !suppliers || !companies;

  return (
    <PageWrapper size="3xl">
      {isLoading ? (
        <FormSkeleton />
      ) : (
        <ProductForm
          defaultValues={getDefaultValues()}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
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
