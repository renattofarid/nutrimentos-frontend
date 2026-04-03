import ActionsWrapper from "@/components/ActionsWrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProductTypeActionsProps {
  onCreateProductType: () => void;
}

export default function ProductTypeActions({
  onCreateProductType,
}: ProductTypeActionsProps) {
  return (
    <ActionsWrapper>
      <Button colorIcon="green" size="sm" variant="outline" onClick={onCreateProductType}>
        <Plus />
        Nuevo
      </Button>
    </ActionsWrapper>
  );
}
