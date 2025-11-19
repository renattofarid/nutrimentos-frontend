import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PRICELIST } from "../lib/pricelist.interface";

export default function PriceListActions() {
  const navigate = useNavigate();

  const handleAdd = () => {
    navigate(`${PRICELIST.ROUTE}/agregar`);
  };

  return (
    <Button size={"sm"} onClick={handleAdd}>
      <Plus className="h-4 w-4 mr-2" />
      Agregar Lista de Precio
    </Button>
  );
}
