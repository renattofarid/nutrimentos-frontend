import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NationalityActionsProps {
  onCreateNationality: () => void;
}

export default function NationalityActions({
  onCreateNationality,
}: NationalityActionsProps) {
  return (
    <div className="flex justify-end">
      <Button onClick={onCreateNationality}>
        <Plus className="h-4 w-4 mr-2" />
        Agregar
      </Button>
    </div>
  );
}
