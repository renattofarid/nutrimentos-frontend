"use client";

import SearchInput from "@/components/SearchInput";
import type { CategoryResource } from "@/pages/category/lib/category.interface";
import type { BrandResource } from "@/pages/brand/lib/brand.interface";
import { SearchableSelect } from "@/components/SearchableSelect";

interface ProductOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedBrand: string;
  setSelectedBrand: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  categories: CategoryResource[];
  brands: BrandResource[];
}

export default function ProductOptions({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  selectedType,
  setSelectedType,
  categories,
  brands,
}: ProductOptionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar producto"
      />

      <div className="flex gap-2">
        <SearchableSelect
          options={categories.map((category) => ({
            value: category.id.toString(),
            label: category.name,
          }))}
          placeholder="Seleccionar categoría"
          value={selectedCategory}
          onChange={setSelectedCategory}
          className="min-w-[200px]"
          withValue={false}
        />

        <SearchableSelect
          options={brands.map((brand) => ({
            value: brand.id.toString(),
            label: brand.name,
          }))}
          placeholder="Seleccionar marca"
          value={selectedBrand}
          onChange={setSelectedBrand}
          className="min-w-[200px]"
          withValue={false}
        />

        <SearchableSelect
          options={[
            { value: "Normal", label: "Normal" },
            { value: "Kit", label: "Kit" },
            { value: "Servicio", label: "Servicio" },
          ]}
          placeholder="Tipo de producto"
          value={selectedType}
          onChange={setSelectedType}
          className="min-w-[150px]"
          withValue={false}
        />
      </div>
    </div>
  );
}
