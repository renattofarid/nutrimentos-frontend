"use client";

import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import { useAllCreditNoteMotives } from "@/pages/credit-note-motive/lib/credit-note-motive.hook";
import { useAllClients } from "@/pages/client/lib/client.hook";
import { CREDIT_NOTE_STATUSES } from "../lib/credit-note.interface";

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
  const { data: clients } = useAllClients();

  const motiveOptions = (motives ?? []).map((m) => ({
    value: String(m.id),
    label: m.name,
  }));

  const clientOptions = (clients ?? []).map((c) => ({
    value: String(c.id),
    label: c.business_name || `${c.names} ${c.father_surname}`,
  }));

  const statusOptions = CREDIT_NOTE_STATUSES.map((s) => ({
    value: s.value,
    label: s.label,
  }));

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="N° Nota de Crédito"
      />

      <SearchableSelect
        options={clientOptions}
        value={customer_id}
        onChange={setCustomerId}
        placeholder="Cliente"
      />

      <SearchableSelect
        options={motiveOptions}
        value={motive_id}
        onChange={setMotiveId}
        placeholder="Motivo"
      />

      <SearchableSelect
        options={statusOptions}
        value={status}
        onChange={setStatus}
        placeholder="Estado"
      />

      <DateRangePickerFilter
        dateFrom={issue_date_from}
        dateTo={issue_date_to}
        onDateChange={onDateChange}
        placeholder="Fecha de emisión"
        className="w-[240px]"
      />
    </div>
  );
}
