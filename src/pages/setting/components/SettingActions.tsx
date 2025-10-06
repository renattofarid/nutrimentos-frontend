import { Button } from "@/components/ui/button";
import { SettingOptions } from "./SettingOptions";

interface SettingActionsProps {
  id: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const SettingActions = ({
  id,
  onEdit,
  onDelete,
}: SettingActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(id)}>
        Editar
      </Button>
      <SettingOptions id={id} onDelete={onDelete} />
    </div>
  );
};
