import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import UnitModal from "./UnitModal";
import { UNIT } from "../lib/unit.interface";
import ActionsWrapper from "@/components/ActionsWrapper";

const { TITLES } = UNIT;

export default function UnitActions() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <ActionsWrapper>
      <Button colorIcon="green" size="sm" variant="outline" onClick={() => setIsCreateModalOpen(true)}>
        <Plus />
        Nuevo
      </Button>

      {isCreateModalOpen && (
        <UnitModal
          open={true}
          onClose={() => setIsCreateModalOpen(false)}
          title={TITLES.create.title}
          mode="create"
        />
      )}
    </ActionsWrapper>
  );
}
