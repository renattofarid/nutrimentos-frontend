"use client";

import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import SearchInput from "@/components/SearchInput";

interface DeliverySheetOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  start_date?: Date;
  end_date?: Date;
  onDateChange: (from: Date | undefined, to: Date | undefined) => void;
}

export default function DeliverySheetOptions({
  search,
  setSearch,
  start_date,
  end_date,
  onDateChange,
}: DeliverySheetOptionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Serie Input */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por número de documento, cliente o vendedor"
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
