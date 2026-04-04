import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2, X, List, ListPlus, MapPin } from "lucide-react";
import { useWindowManager } from "@/stores/window-manager.store";

interface Props {
  hasSelection: boolean;
  onNew: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewPriceList: () => void;
  onAssignPriceList: () => void;
  onViewAddresses: () => void;
}

export default function ClientActions({
  hasSelection,
  onNew,
  onEdit,
  onDelete,
  onViewPriceList,
  onAssignPriceList,
  onViewAddresses,
}: Props) {
  const { activeTabId, closeTab } = useWindowManager();

  const handleCerrar = () => {
    if (activeTabId) closeTab(activeTabId);
  };

  return (
    <div className="flex items-center justify-between mb-1 pb-1 border-b w-full">
      <div className="flex items-center gap-1">
        <Button colorIcon="green" size="sm" variant="outline" onClick={onNew}>
          <Plus />
          Nuevo
        </Button>
        <Button
          colorIcon="amber"
          size="sm"
          variant="outline"
          onClick={onEdit}
          disabled={!hasSelection}
        >
          <Pencil />
          Editar
        </Button>
        <Button
          colorIcon="red"
          size="sm"
          variant="outline"
          onClick={onDelete}
          disabled={!hasSelection}
        >
          <Trash2 />
          Eliminar
        </Button>
        <div className="h-6 mx-2">
          <Separator orientation="vertical" />
        </div>
        <Button
          colorIcon="blue"
          size="sm"
          variant="outline"
          onClick={onViewPriceList}
          disabled={!hasSelection}
        >
          <List />
          Lista de Precios
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onAssignPriceList}
          disabled={!hasSelection}
        >
          <ListPlus />
          Asignar Lista
        </Button>
        <Button
          colorIcon="indigo"
          size="sm"
          variant="outline"
          onClick={onViewAddresses}
          disabled={!hasSelection}
        >
          <MapPin />
          Direcciones
        </Button>
        <div className="h-6 mx-2">
          <Separator orientation="vertical" />
        </div>
        <Button colorIcon="gray" size="sm" variant="outline" onClick={handleCerrar}>
          <X />
          Cerrar
        </Button>
      </div>
    </div>
  );
}
