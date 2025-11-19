import SearchInput from "@/components/SearchInput";

interface DocumentTypeOptionsProps {
  search: string;
  setSearch: (search: string) => void;
}

export default function DocumentTypeOptions({
  search,
  setSearch,
}: DocumentTypeOptionsProps) {
  return (
    <div className="flex items-center justify-between">
      <SearchInput
        placeholder="Buscar tipos de documento..."
        value={search}
        onChange={setSearch}
      />
    </div>
  );
}
