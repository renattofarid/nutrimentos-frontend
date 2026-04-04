"use client";

import { useState } from "react";
import SearchInput from "@/components/SearchInput";
import type { CategoryResource } from "@/pages/category/lib/category.interface";
import type { BrandResource } from "@/pages/brand/lib/brand.interface";
import { SearchableSelect } from "@/components/SearchableSelect";
import type { CompanyResource } from "@/pages/company/lib/company.interface";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActiveFilter = "" | "category" | "brand" | "type" | "company";

interface ProductOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  searchCode: string;
  setSearchCode: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedBrand: string;
  setSelectedBrand: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  selectedCompany: string;
  setSelectedCompany: (value: string) => void;
  categories: CategoryResource[];
  brands: BrandResource[];
  companies: CompanyResource[];
}

export default function ProductOptions({
  search,
  setSearch,
  searchCode,
  setSearchCode,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  selectedType,
  setSelectedType,
  selectedCompany,
  setSelectedCompany,
  categories,
  brands,
  companies,
}: ProductOptionsProps) {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("");

  const resetAdditionalFilters = () => {
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedType("");
    setSelectedCompany("");
  };

  const handleFilterTypeChange = (value: string) => {
    resetAdditionalFilters();
    setActiveFilter((value === "none" ? "" : value) as ActiveFilter);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar producto"
      />

      <Input
        type="text"
        value={searchCode}
        onChange={(e) => setSearchCode(e.target.value)}
        placeholder="Buscar código"
        className="w-[160px] h-8"
      />

      <Select
        value={activeFilter || "none"}
        onValueChange={handleFilterTypeChange}
      >
        <SelectTrigger
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-8!",
          )}
        >
          <SelectValue placeholder="Filtro adicional" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">- Buscar por -</SelectItem>
          <SelectItem value="category">Categoría</SelectItem>
          <SelectItem value="brand">Marca</SelectItem>
          <SelectItem value="type">Tipo de producto</SelectItem>
          <SelectItem value="company">Empresa</SelectItem>
        </SelectContent>
      </Select>

      {activeFilter === "category" && (
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
      )}

      {activeFilter === "brand" && (
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
      )}

      {activeFilter === "type" && (
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
      )}

      {activeFilter === "company" && (
        <SearchableSelect
          options={companies.map((company) => ({
            value: company.id.toString(),
            label: company.social_reason,
          }))}
          placeholder="Empresa"
          value={selectedCompany}
          onChange={setSelectedCompany}
          className="min-w-[150px]"
          withValue={false}
        />
      )}
    </div>
  );
}
