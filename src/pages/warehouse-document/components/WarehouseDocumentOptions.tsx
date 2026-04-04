"use client";

import { useState } from "react";
import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import { DOCUMENT_TYPES, DOCUMENT_STATUS } from "../lib/warehouse-document.constants";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActiveFilter = "" | "warehouse" | "type" | "status";

interface WarehouseDocumentOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  selectedWarehouse: string;
  setSelectedWarehouse: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  warehouses: WarehouseResource[];
}

export default function WarehouseDocumentOptions({
  search,
  setSearch,
  selectedWarehouse,
  setSelectedWarehouse,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  warehouses,
}: WarehouseDocumentOptionsProps) {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("");

  const resetAdditionalFilters = () => {
    setSelectedWarehouse("");
    setSelectedType("");
    setSelectedStatus("");
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
        placeholder="Buscar documento"
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
          <SelectItem value="warehouse">Almacén</SelectItem>
          <SelectItem value="type">Tipo</SelectItem>
          <SelectItem value="status">Estado</SelectItem>
        </SelectContent>
      </Select>

      {activeFilter === "warehouse" && (
        <SearchableSelect
          options={warehouses.map((warehouse) => ({
            value: warehouse.id.toString(),
            label: warehouse.name,
          }))}
          value={selectedWarehouse}
          onChange={setSelectedWarehouse}
          placeholder="Todos los almacenes"
        />
      )}

      {activeFilter === "type" && (
        <SearchableSelect
          options={DOCUMENT_TYPES.map((type) => ({
            value: type.value,
            label: type.label,
          }))}
          value={selectedType}
          onChange={setSelectedType}
          placeholder="Todos los tipos"
        />
      )}

      {activeFilter === "status" && (
        <SearchableSelect
          options={DOCUMENT_STATUS.map((status) => ({
            value: status.value,
            label: status.label,
          }))}
          value={selectedStatus}
          onChange={setSelectedStatus}
          placeholder="Todos los estados"
        />
      )}
    </div>
  );
}
