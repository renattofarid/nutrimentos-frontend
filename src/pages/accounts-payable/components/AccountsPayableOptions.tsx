import SearchInput from "@/components/SearchInput";

interface AccountsPayableOptionsProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function AccountsPayableOptions({
  search,
  setSearch,
}: AccountsPayableOptionsProps) {
  return (
    <div className="flex items-center gap-2 py-4">
      <div className="relative flex-1">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar cuenta por pagar..."
        />
      </div>
    </div>
  );
}
