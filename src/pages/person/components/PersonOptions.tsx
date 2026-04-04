"use client";

import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";

export type PersonSearchField =
  | "search"
  | "names"
  | "number_document"
  | "address"
  | "phone"
  | "email";

const SEARCH_FIELD_OPTIONS: { value: PersonSearchField; label: string }[] = [
  { value: "search", label: "Cualquier campo" },
  { value: "names", label: "Nombre" },
  { value: "number_document", label: "N° Documento" },
  { value: "address", label: "Dirección" },
  { value: "phone", label: "Teléfono" },
  { value: "email", label: "Correo" },
];

const SEARCH_PLACEHOLDER: Record<PersonSearchField, string> = {
  search: "Buscar persona",
  names: "Buscar por nombre",
  number_document: "Buscar por número de documento",
  address: "Buscar por dirección",
  phone: "Buscar por teléfono",
  email: "Buscar por correo",
};

const SEARCH_FIELD_SELECT_OPTIONS = SEARCH_FIELD_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

export default function PersonOptions({
  searchField,
  setSearchField,
  search,
  setSearch,
}: {
  searchField: PersonSearchField;
  setSearchField: (value: PersonSearchField) => void;
  search: string;
  setSearch: (value: string) => void;
}) {
  const handleSearchFieldChange = (value: string) => {
    setSearchField(value as PersonSearchField);
    setSearch("");
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchableSelect
        horizontalField
        label="Buscar por"
        options={SEARCH_FIELD_SELECT_OPTIONS}
        value={searchField}
        onChange={handleSearchFieldChange}
        placeholder="General"
        className="w-36 h-8!"
      />
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder={SEARCH_PLACEHOLDER[searchField]}
      />
    </div>
  );
}
