"use client";

import { useState } from "react";
import { SearchableSelect } from "@/components/SearchableSelect";
import { DatePickerFilter } from "@/components/DatePickerFilter";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAllWorkers } from "@/pages/worker/lib/worker.hook";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DOCUMENT_TYPE_OPTIONS = [
  { value: "FACTURA", label: "Factura" },
  { value: "BOLETA", label: "Boleta" },
  { value: "TICKET", label: "Ticket" },
];

const STATUS_OPTIONS = [
  { value: "REGISTRADA", label: "Registrada" },
  { value: "PARCIAL", label: "Parcial" },
  { value: "PAGADA", label: "Pagada" },
  { value: "ANULADA", label: "Anulada" },
];

type ActiveFilter =
  | ""
  | "documento"
  | "warehouse"
  | "vendedor"
  | "document_type"
  | "status";

interface SaleOptionsProps {
  branch_id: string;
  setBranchId: (value: string) => void;
  document_type: string;
  setDocumentType: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  warehouse_id: string;
  setWarehouseId: (value: string) => void;
  vendedor_id: string;
  setVendedorId: (value: string) => void;
  start_date?: Date;
  end_date?: Date;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
  documento: string;
  setDocumento: (value: string) => void;
}

export default function SaleOptions({
  branch_id,
  setBranchId,
  document_type,
  setDocumentType,
  status,
  setStatus,
  warehouse_id,
  setWarehouseId,
  vendedor_id,
  setVendedorId,
  start_date,
  end_date,
  setStartDate,
  setEndDate,
  documento,
  setDocumento,
}: SaleOptionsProps) {
  const { user } = useAuthStore();
  const company_id = user?.company_id;

  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("");

  const { data: branches } = useAllBranches({ company_id });
  const { data: warehouses } = useAllWarehouses();
  const { data: workers = [] } = useAllWorkers();

  const branchOptions =
    branches?.map((b) => ({
      value: String(b.id),
      label: b.name,
    })) || [];

  const warehouseOptions =
    warehouses?.map((w) => ({
      value: String(w.id),
      label: w.name,
    })) || [];

  const workerOptions =
    workers?.map((w) => ({
      value: String(w.id),
      label: `${w.names} ${w.father_surname}`,
    })) || [];

  const resetAllFilters = () => {
    setDocumento("");
    setWarehouseId("");
    setVendedorId("");
    setDocumentType("");
    setStatus("");
  };

  const handleFilterTypeChange = (value: string) => {
    resetAllFilters();
    setActiveFilter((value === "none" ? "" : value) as ActiveFilter);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Tienda - siempre visible */}
      <SearchableSelect
        options={branchOptions}
        value={branch_id}
        onChange={setBranchId}
        placeholder="Tienda"
      />

      {/* Fecha de emisión - siempre visible */}
      <DatePickerFilter
        label="Del"
        value={start_date}
        onChange={setStartDate}
      />
      <DatePickerFilter label="Al" value={end_date} onChange={setEndDate} />

      {/* Selector de filtro adicional */}
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
          <SelectItem value="none">— Buscar por —</SelectItem>
          <SelectItem value="documento">Número de documento</SelectItem>
          <SelectItem value="warehouse">Almacén</SelectItem>
          <SelectItem value="vendedor">Vendedor</SelectItem>
          <SelectItem value="document_type">Tipo de documento</SelectItem>
          <SelectItem value="status">Estado</SelectItem>
        </SelectContent>
      </Select>

      {/* Control dinámico según el filtro seleccionado */}
      {activeFilter === "documento" && (
        <Input
          type="text"
          value={documento}
          onChange={(e) => setDocumento(e.target.value)}
          placeholder="Ej: F001-00123"
          className="w-[160px] h-8"
        />
      )}

      {activeFilter === "warehouse" && (
        <SearchableSelect
          options={warehouseOptions}
          value={warehouse_id}
          onChange={setWarehouseId}
          placeholder="Almacén"
        />
      )}

      {activeFilter === "vendedor" && (
        <SearchableSelect
          options={workerOptions}
          value={vendedor_id}
          onChange={setVendedorId}
          placeholder="Vendedor"
        />
      )}

      {activeFilter === "document_type" && (
        <SearchableSelect
          options={DOCUMENT_TYPE_OPTIONS}
          value={document_type}
          onChange={setDocumentType}
          placeholder="Tipo de documento"
        />
      )}

      {activeFilter === "status" && (
        <SearchableSelect
          options={STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
          placeholder="Estado"
        />
      )}
    </div>
  );
}
