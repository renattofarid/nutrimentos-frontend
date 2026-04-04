"use client";

import { useState } from "react";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// import { useAllBranches } from "@/pages/branch/lib/branch.hook";
// import { useAllCompaniesList } from "@/pages/company/lib/company.hook";
import { useAllZones } from "@/pages/zone/lib/zone.hook";
// import { useAllDrivers } from "@/pages/driver/lib/driver.hook";
// import { useAllClients } from "@/pages/client/lib/client.hook";

// const STATUS_OPTIONS = [
//   { value: "PENDIENTE", label: "Pendiente" },
//   { value: "RENDIDA", label: "Rendida" },
//   { value: "CERRADA", label: "Cerrada" },
// ];

const TYPE_OPTIONS = [
  { value: "CONTADO", label: "Contado" },
  { value: "CREDITO", label: "Crédito" },
];

type ActiveFilter = "" | "type" | "zone";

interface DeliverySheetOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  issue_date_from?: Date;
  issue_date_to?: Date;
  onIssueDateChange: (from: Date | undefined, to: Date | undefined) => void;
  delivery_date_from?: Date;
  delivery_date_to?: Date;
  onDeliveryDateChange: (from: Date | undefined, to: Date | undefined) => void;
  status: string;
  setStatus: (value: string) => void;
  type: string;
  setType: (value: string) => void;
  customer_id: string;
  setCustomerId: (value: string) => void;
  driver_id: string;
  setDriverId: (value: string) => void;
  zone_id: string;
  setZoneId: (value: string) => void;
  branch_id: string;
  setBranchId: (value: string) => void;
  company_id: string;
  setCompanyId: (value: string) => void;
}

export default function DeliverySheetOptions({
  search,
  setSearch,
  issue_date_from,
  issue_date_to,
  onIssueDateChange,
  // delivery_date_from,
  // delivery_date_to,
  // onDeliveryDateChange,
  setStatus,
  type,
  setType,
  setCustomerId,
  setDriverId,
  zone_id,
  setZoneId,
  setBranchId,
  setCompanyId,
  onDeliveryDateChange,
}: DeliverySheetOptionsProps) {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("");
  // const { data: branches } = useAllBranches();
  // const { data: companies } = useAllCompaniesList();
  const { data: zones } = useAllZones();
  // const { data: drivers } = useAllDrivers();
  // const { data: clients } = useAllClients();

  // const branchOptions =
  //   branches?.map((b) => ({ value: String(b.id), label: b.name })) ?? [];
  // const companyOptions =
  //   companies?.map((c) => ({
  //     value: String(c.id),
  //     label: c.trade_name || c.social_reason,
  //   })) ?? [];
  const zoneOptions =
    zones?.map((z) => ({ value: String(z.id), label: z.name })) ?? [];
  // const driverOptions =
  //   drivers?.map((d) => ({
  //     value: String(d.id),
  //     label: `${d.names} ${d.father_surname}`.trim(),
  //   })) ?? [];
  // const clientOptions =
  //   clients?.map((c) => ({
  //     value: String(c.id),
  //     label: c.business_name || `${c.names} ${c.father_surname}`.trim(),
  //   })) ?? [];

  const resetAdditionalFilters = () => {
    setType("");
    setZoneId("");
    setStatus("");
    setCustomerId("");
    setDriverId("");
    setBranchId("");
    setCompanyId("");
    onDeliveryDateChange(undefined, undefined);
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
        placeholder="Buscar por número, cliente o conductor"
      />

      <DateRangePickerFilter
        dateFrom={issue_date_from}
        dateTo={issue_date_to}
        onDateChange={onIssueDateChange}
        placeholder="F. Emisión"
        className="w-[220px]"
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
          <SelectItem value="type">Tipo</SelectItem>
          <SelectItem value="zone">Zona</SelectItem>
        </SelectContent>
      </Select>

      {activeFilter === "type" && (
        <SearchableSelect
          options={TYPE_OPTIONS}
          value={type}
          onChange={setType}
          placeholder="Tipo"
        />
      )}

      {/* 
      <SearchableSelect
        options={STATUS_OPTIONS}
        value={status}
        onChange={setStatus}
        placeholder="Estado"
      />

      <SearchableSelect
        options={clientOptions}
        value={customer_id}
        onChange={setCustomerId}
        placeholder="Cliente"
      />

      <SearchableSelect
        options={driverOptions}
        value={driver_id}
        onChange={setDriverId}
        placeholder="Conductor"
      /> */}

      {activeFilter === "zone" && (
        <SearchableSelect
          options={zoneOptions}
          value={zone_id}
          onChange={setZoneId}
          placeholder="Zona"
        />
      )}
      {/* 
      <SearchableSelect
        options={branchOptions}
        value={branch_id}
        onChange={setBranchId}
        placeholder="Sucursal"
      />

      <SearchableSelect
        options={companyOptions}
        value={company_id}
        onChange={setCompanyId}
        placeholder="Empresa"
      />

      <DateRangePickerFilter
        dateFrom={delivery_date_from}
        dateTo={delivery_date_to}
        onDateChange={onDeliveryDateChange}
        placeholder="F. Reparto"
        className="w-[220px]"
      /> */}

    </div>
  );
}
