import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import BoxShiftOpenModal from "./BoxShiftOpenModal";
import ActionsWrapper from "@/components/ActionsWrapper";

interface Props {
  refetch: () => void;
}

export default function BoxShiftActions({ refetch }: Props) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <ActionsWrapper>
      <Button colorIcon="green" size="sm" variant="outline" onClick={() => setOpenModal(true)}>
        <Plus />
        Abrir Turno
      </Button>

      <BoxShiftOpenModal
        open={openModal}
        onOpenChange={setOpenModal}
        onSuccess={() => {
          setOpenModal(false);
          refetch();
        }}
      />
    </ActionsWrapper>
  );
}
