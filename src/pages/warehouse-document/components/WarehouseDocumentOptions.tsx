"use client";

import { useState } from "react";
import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import { DatePickerFilter } from "@/components/DatePickerFilter";
import {
  DOCUMENT_TYPES,
  DOCUMENT_STATUS,
} from "../lib/warehouse-document.constants";
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
import { Separator } from "@/components/ui/separator";

type ActiveFilter =
  | ""
  | "warehouse_origin_id"
  | "warehouse_dest_id"
  | "type"
  | "status";

interface WarehouseDocumentOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  selectedWarehouseOrigin: string;
  setSelectedWarehouseOrigin: (value: string) => void;
  selectedWarehouseDest: string;
  setSelectedWarehouseDest: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  startDate?: Date;
  endDate?: Date;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
  warehouses: WarehouseResource[];
}

export default function WarehouseDocumentOptions({
  search,
  setSearch,
  selectedWarehouseOrigin,
  setSelectedWarehouseOrigin,
  selectedWarehouseDest,
  setSelectedWarehouseDest,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  warehouses,
}: WarehouseDocumentOptionsProps) {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("");

  const resetAdditionalFilters = () => {
    setSelectedWarehouseOrigin("");
    setSelectedWarehouseDest("");
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

      <DatePickerFilter
        label="Del"
        value={startDate}
        onChange={setStartDate}
        placeholder="Fecha inicio"
      />

      <DatePickerFilter
        label="Al"
        value={endDate}
        onChange={setEndDate}
        placeholder="Fecha fin"
      />

      <div className="h-full">
        <Separator orientation="vertical" />
      </div>

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
          <SelectItem value="warehouse_origin_id">Almacén de origen</SelectItem>
          <SelectItem value="warehouse_dest_id">Almacén de destino</SelectItem>
          <SelectItem value="type">Tipo</SelectItem>
          <SelectItem value="status">Estado</SelectItem>
        </SelectContent>
      </Select>

      {activeFilter === "warehouse_origin_id" && (
        <SearchableSelect
          options={warehouses.map((warehouse) => ({
            value: warehouse.id.toString(),
            label: warehouse.name,
          }))}
          value={selectedWarehouseOrigin}
          onChange={setSelectedWarehouseOrigin}
          placeholder="Todos los almacenes"
        />
      )}

      {activeFilter === "warehouse_dest_id" && (
        <SearchableSelect
          options={warehouses.map((warehouse) => ({
            value: warehouse.id.toString(),
            label: warehouse.name,
          }))}
          value={selectedWarehouseDest}
          onChange={setSelectedWarehouseDest}
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
