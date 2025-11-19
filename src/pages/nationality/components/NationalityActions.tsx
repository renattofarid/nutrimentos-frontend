import ActionsWrapper from "@/components/ActionsWrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NationalityActionsProps {
  onCreateNationality: () => void;
}

export default function NationalityActions({
  onCreateNationality,
}: NationalityActionsProps) {
  return (
    <ActionsWrapper>
      <Button size={"sm"} onClick={onCreateNationality}>
        <Plus className="h-4 w-4 mr-2" />
        Agregar
      </Button>
    </ActionsWrapper>
  );
}
