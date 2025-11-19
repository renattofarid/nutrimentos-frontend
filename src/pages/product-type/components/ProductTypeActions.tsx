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
      <Button size={"sm"} onClick={onCreateProductType}>
        <Plus className="h-4 w-4 mr-2" />
        Agregar
      </Button>
    </ActionsWrapper>
  );
}
