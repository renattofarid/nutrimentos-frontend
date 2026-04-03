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
      <Button colorIcon="green" size="sm" variant="outline" onClick={onCreateNationality}>
        <Plus />
        Nuevo
      </Button>
    </ActionsWrapper>
  );
}
