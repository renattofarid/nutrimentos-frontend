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
      <Button colorIcon="green" size="sm" variant="outline" onClick={onCreateSetting}>
        <Plus />
        Nuevo
      </Button>
    </ActionsWrapper>
  );
}
