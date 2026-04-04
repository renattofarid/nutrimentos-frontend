"use client";

import { useState } from "react";
import { SearchableSelect } from "@/components/SearchableSelect";
import { DatePickerFilter } from "@/components/DatePickerFilter";
import { Input } from "@/components/ui/input";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DOCUMENT_TYPE_OPTIONS = [
  { value: "FACTURA", label: "Factura" },
  { value: "BOLETA", label: "Boleta" },
  { value: "OTRO", label: "Otro" },
];

const PAYMENT_TYPE_OPTIONS = [
  { value: "CONTADO", label: "Contado" },
  { value: "CREDITO", label: "Crédito" },
];

const STATUS_OPTIONS = [
  { value: "REGISTRADO", label: "Registrado" },
  { value: "PAGADA", label: "Pagada" },
  { value: "CANCELADO", label: "Cancelado" },
];

type ActiveFilter =
  | ""
  | "reference_number"
  | "warehouse"
  | "document_type"
  | "payment_type"
  | "status";

interface PurchaseOptionsProps {
  document_type: string;
  setDocumentType: (value: string) => void;
  document_number: string;
  setDocumentNumber: (value: string) => void;
  reference_number: string;
  setReferenceNumber: (value: string) => void;
  payment_type: string;
  setPaymentType: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  warehouse_id: string;
  setWarehouseId: (value: string) => void;
  start_date?: Date;
  end_date?: Date;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
}

export const PurchaseOptions = ({
  document_type,
  setDocumentType,
  document_number,
  setDocumentNumber,
  reference_number,
  setReferenceNumber,
  payment_type,
  setPaymentType,
  status,
  setStatus,
  warehouse_id,
  setWarehouseId,
  start_date,
  end_date,
  setStartDate,
  setEndDate,
}: PurchaseOptionsProps) => {
  const { data: warehouses } = useAllWarehouses();
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("");

  const warehouseOptions = [
    ...(warehouses?.map((warehouse) => ({
      value: String(warehouse.id),
      label: warehouse.name,
    })) || []),
  ];

  const resetAdditionalFilters = () => {
    setReferenceNumber("");
    setWarehouseId("");
    setDocumentType("");
    setPaymentType("");
    setStatus("");
  };

  const handleFilterTypeChange = (value: string) => {
    resetAdditionalFilters();
    setActiveFilter((value === "none" ? "" : value) as ActiveFilter);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Filtro base 1: Número de documento */}
      <Input
        type="text"
        value={document_number}
        onChange={(e) => setDocumentNumber(e.target.value)}
        placeholder="N° Documento"
        className="w-[140px] h-8"
      />

      {/* Filtro base 2: Fecha de emisión */}
      <DatePickerFilter label="Del" value={start_date} onChange={setStartDate} />
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
          <SelectItem value="none">- Buscar por -</SelectItem>
          <SelectItem value="reference_number">N° Referencia</SelectItem>
          <SelectItem value="warehouse">Almacén</SelectItem>
          <SelectItem value="document_type">Tipo de documento</SelectItem>
          <SelectItem value="payment_type">Tipo de pago</SelectItem>
          <SelectItem value="status">Estado</SelectItem>
        </SelectContent>
      </Select>

      {/* Control dinámico según filtro adicional */}
      {activeFilter === "reference_number" && (
        <Input
          type="text"
          value={reference_number}
          onChange={(e) => setReferenceNumber(e.target.value)}
          placeholder="N° Referencia"
          className="w-[140px] h-8"
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

      {activeFilter === "document_type" && (
        <SearchableSelect
          options={DOCUMENT_TYPE_OPTIONS}
          value={document_type}
          onChange={setDocumentType}
          placeholder="Tipo de documento"
        />
      )}

      {activeFilter === "payment_type" && (
        <SearchableSelect
          options={PAYMENT_TYPE_OPTIONS}
          value={payment_type}
          onChange={setPaymentType}
          placeholder="Tipo de Pago"
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
};
