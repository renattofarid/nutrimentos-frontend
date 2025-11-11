import SearchInput from "@/components/SearchInput";

interface PriceListOptionsProps {
  search: string;
  setSearch: (search: string) => void;
}

export default function PriceListOptions({
  search,
  setSearch,
}: PriceListOptionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nombre o código..."
      />
    </div>
  );
}
