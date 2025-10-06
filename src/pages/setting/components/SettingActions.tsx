import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SettingActionsProps {
  onCreateSetting: () => void;
}

export default function SettingActions({
  onCreateSetting,
}: SettingActionsProps) {
  return (
    <div className="flex justify-end">
      <Button onClick={onCreateSetting}>
        <Plus className="h-4 w-4 mr-2" />
        Agregar
      </Button>
    </div>
  );
}
