import SearchInput from "@/components/SearchInput";

interface GuideOptionsProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function GuideOptions({ search, setSearch }: GuideOptionsProps) {
  return (
    <div className="flex items-center gap-2">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar guías..."
      />
    </div>
  );
}
