import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";

interface PurchaseOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  selectedPaymentType: string;
  setSelectedPaymentType: (value: string) => void;
}

export const PurchaseOptions = ({
  search,
  setSearch,
  selectedStatus,
  setSelectedStatus,
  selectedPaymentType,
  setSelectedPaymentType,
}: PurchaseOptionsProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <SearchInput
        onChange={setSearch}
        value={search}
        placeholder="Buscar..."
      />

      <SearchableSelect
        className="w-full md:w-44"
        placeholder="Estado"
        value={selectedStatus}
        onChange={(value) => setSelectedStatus(value)}
        options={[
          {
            label: "Registrado",
            value: "PENDIENTE",
          },
          {
            label: "Pagado",
            value: "PAGADO",
          },
          {
            label: "Cancelado",
            value: "CANCELADO",
          },
        ]}
      />

      <SearchableSelect
        className="w-full md:w-44"
        placeholder="Tipo de Pago"
        value={selectedPaymentType}
        onChange={(value) => setSelectedPaymentType(value)}
        options={[
          {
            label: "Contado",
            value: "CONTADO",
          },
          {
            label: "Crédito",
            value: "CREDITO",
          },
        ]}
      />
    </div>
  );
};
