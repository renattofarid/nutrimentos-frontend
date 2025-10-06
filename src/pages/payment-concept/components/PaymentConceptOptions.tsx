"use client";

import SearchInput from "@/components/SearchInput";

export default function PaymentConceptOptions({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar concepto de pago"
      />
    </div>
  );
}
