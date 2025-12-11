"use client";

import { SearchableSelect } from "@/components/SearchableSelect";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import { Input } from "@/components/ui/input";
import { useAllBranches } from "@/pages/branch/lib/branch.hook";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import { useAuthStore } from "@/pages/auth/lib/auth.store";

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

interface SaleOptionsProps {
  branch_id: string;
  setBranchId: (value: string) => void;
  document_type: string;
  setDocumentType: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  warehouse_id: string;
  setWarehouseId: (value: string) => void;
  start_date?: Date;
  end_date?: Date;
  onDateChange: (from: Date | undefined, to: Date | undefined) => void;
  numero: string;
  setNumero: (value: string) => void;
  serie: string;
  setSerie: (value: string) => void;
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
  start_date,
  end_date,
  onDateChange,
  numero,
  setNumero,
  serie,
  setSerie,
}: SaleOptionsProps) {
  const { user } = useAuthStore();
  const company_id = user?.company_id;

  // Fetch branches and warehouses
  const { data: branches } = useAllBranches({ company_id });
  const { data: warehouses } = useAllWarehouses();

  const branchOptions = [
    ...(branches?.map((branch) => ({
      value: String(branch.id),
      label: branch.name,
    })) || []),
  ];

  const warehouseOptions = [
    ...(warehouses?.map((warehouse) => ({
      value: String(warehouse.id),
      label: warehouse.name,
    })) || []),
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Serie Input */}
      <Input
        type="text"
        value={serie}
        onChange={(e) => setSerie(e.target.value)}
        placeholder="Serie"
        className="w-[120px] h-8"
      />

      {/* Numero Input */}
      <Input
        type="text"
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
        placeholder="Número"
        className="w-[140px] h-8"
      />

      {/* Branch Filter */}
      <SearchableSelect
        options={branchOptions}
        value={branch_id}
        onChange={setBranchId}
        placeholder="Sucursal"
        widthPopover="w-48!"
      />

      {/* Warehouse Filter */}
      <SearchableSelect
        options={warehouseOptions}
        value={warehouse_id}
        onChange={setWarehouseId}
        placeholder="Almacén"
        widthPopover="w-48!"
      />

      {/* Document Type Filter */}
      <SearchableSelect
        options={DOCUMENT_TYPE_OPTIONS}
        value={document_type}
        onChange={setDocumentType}
        placeholder="Tipo de documento"
        widthPopover="w-32!"
      />

      {/* Status Filter */}
      <SearchableSelect
        options={STATUS_OPTIONS}
        value={status}
        onChange={setStatus}
        placeholder="Estado"
        widthPopover="w-36!"
      />

      {/* Date Range Filter */}
      <DateRangePickerFilter
        dateFrom={start_date}
        dateTo={end_date}
        onDateChange={onDateChange}
        placeholder="Rango de fechas"
        className="w-[240px]"
      />
    </div>
  );
}
