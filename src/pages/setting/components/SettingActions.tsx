import ActionsWrapper from "@/components/ActionsWrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SettingActionsProps {
  onCreateSetting: () => void;
}

export default function SettingActions({
  onCreateSetting,
}: SettingActionsProps) {
  return (
    <ActionsWrapper>
      <Button size="sm" className="ml-auto" onClick={onCreateSetting}>
        <Plus className="h-4 w-4 mr-2" />
        Agregar
      </Button>
    </ActionsWrapper>
  );
}
