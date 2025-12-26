"use client";

import { SearchableSelect } from "@/components/SearchableSelect";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import { Input } from "@/components/ui/input";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";

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
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "COMPLETADO", label: "Completado" },
  { value: "CANCELADO", label: "Cancelado" },
];

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
  onDateChange: (from: Date | undefined, to: Date | undefined) => void;
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
  onDateChange,
}: PurchaseOptionsProps) => {
  const { data: warehouses } = useAllWarehouses();

  const warehouseOptions = [
    ...(warehouses?.map((warehouse) => ({
      value: String(warehouse.id),
      label: warehouse.name,
    })) || []),
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Document Number Input */}
      <Input
        type="text"
        value={document_number}
        onChange={(e) => setDocumentNumber(e.target.value)}
        placeholder="N° Documento"
        className="w-[140px] h-8"
      />

      {/* Reference Number Input */}
      <Input
        type="text"
        value={reference_number}
        onChange={(e) => setReferenceNumber(e.target.value)}
        placeholder="N° Referencia"
        className="w-[140px] h-8"
      />

      {/* Warehouse Filter */}
      <SearchableSelect
        options={warehouseOptions}
        value={warehouse_id}
        onChange={setWarehouseId}
        placeholder="Almacén"
      />

      {/* Document Type Filter */}
      <SearchableSelect
        options={DOCUMENT_TYPE_OPTIONS}
        value={document_type}
        onChange={setDocumentType}
        placeholder="Tipo de documento"
      />

      {/* Payment Type Filter */}
      <SearchableSelect
        options={PAYMENT_TYPE_OPTIONS}
        value={payment_type}
        onChange={setPaymentType}
        placeholder="Tipo de Pago"
      />

      {/* Status Filter */}
      <SearchableSelect
        options={STATUS_OPTIONS}
        value={status}
        onChange={setStatus}
        placeholder="Estado"
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
};
