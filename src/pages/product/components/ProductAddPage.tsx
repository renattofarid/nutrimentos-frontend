"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import TitleFormComponent from "@/components/TitleFormComponent";
import { ProductForm } from "./ProductForm";
import { type ProductSchema } from "../lib/product.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { PRODUCT } from "../lib/product.interface";
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

export default function ProductAddPage() {
  const navigate = useNavigate();
  const { createProduct } = useProductStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: companies } = useAllCompanies();
  const { data: categories } = useAllCategories();
  const { data: brands } = useAllBrands();
  const { data: units } = useAllUnits();
  const { data: productTypes } = useAllProductTypes();
  const { data: nationalities } = useAllNationalities();
  const suppliers = useAllPersons();

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
    nationality_id: undefined,
    comment: "",
    weight: "",
    price_per_kg: "",
    commission_percentage: "",
    accounting_cost: "",
    inventory_cost: "",
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

  const isLoading = !categories || !brands || !units || !productTypes || !nationalities || !suppliers || !companies;

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton to={ROUTE} />
          <TitleFormComponent title={MODEL.name} mode="create" />
        </div>
      </div>

      {isLoading ? (
        <FormSkeleton />
      ) : (
        <ProductForm
          defaultValues={getDefaultValues()}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
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
