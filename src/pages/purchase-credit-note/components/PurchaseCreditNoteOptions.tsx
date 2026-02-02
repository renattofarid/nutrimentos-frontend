"use client";

import SearchInput from "@/components/SearchInput";

export default function PurchaseCreditNoteOptions({
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
        placeholder="Buscar nota de crédito de compra"
      />
    </div>
  );
}
