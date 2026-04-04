"use client";

import { useState } from "react";
import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import { useAllCreditNoteMotives } from "@/pages/credit-note-motive/lib/credit-note-motive.hook";
import { CREDIT_NOTE_STATUSES } from "../lib/credit-note.interface";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { useClients } from "@/pages/client/lib/client.hook";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActiveFilter = "" | "customer" | "motive" | "status";

interface CreditNoteOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  motive_id: string;
  setMotiveId: (value: string) => void;
  customer_id: string;
  setCustomerId: (value: string) => void;
  issue_date_from?: Date;
  issue_date_to?: Date;
  onDateChange: (from: Date | undefined, to: Date | undefined) => void;
}

export default function CreditNoteOptions({
  search,
  setSearch,
  status,
  setStatus,
  motive_id,
  setMotiveId,
  customer_id,
  setCustomerId,
  issue_date_from,
  issue_date_to,
  onDateChange,
}: CreditNoteOptionsProps) {
  const { data: motives = [] } = useAllCreditNoteMotives();
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("");

  const motiveOptions = (motives ?? []).map((m) => ({
    value: String(m.id),
    label: m.name,
  }));

  const statusOptions = CREDIT_NOTE_STATUSES.map((s) => ({
    value: s.value,
    label: s.label,
  }));

  const resetAdditionalFilters = () => {
    setCustomerId("");
    setMotiveId("");
    setStatus("");
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
        placeholder="N° Nota de Crédito"
      />

      <DateRangePickerFilter
        dateFrom={issue_date_from}
        dateTo={issue_date_to}
        onDateChange={onDateChange}
        placeholder="Fecha de emisión"
        className="w-[240px]"
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
          <SelectItem value="customer">Cliente</SelectItem>
          <SelectItem value="motive">Motivo</SelectItem>
          <SelectItem value="status">Estado</SelectItem>
        </SelectContent>
      </Select>

      {activeFilter === "customer" && (
        <SearchableSelectAsync
          useQueryHook={useClients}
          mapOptionFn={(customer: PersonResource) => ({
            value: customer.id.toString(),
            label:
              customer.business_name ??
              `${customer.names} ${customer.father_surname} ${customer.mother_surname}`.trim(),
            description: customer.number_document ?? "-",
          })}
          value={customer_id}
          onChange={setCustomerId}
          placeholder="Cliente"
        />
      )}

      {activeFilter === "motive" && (
        <SearchableSelect
          options={motiveOptions}
          value={motive_id}
          onChange={setMotiveId}
          placeholder="Motivo"
        />
      )}

      {activeFilter === "status" && (
        <SearchableSelect
          options={statusOptions}
          value={status}
          onChange={setStatus}
          placeholder="Estado"
        />
      )}
    </div>
  );
}
