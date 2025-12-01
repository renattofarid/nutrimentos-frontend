import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import BoxShiftOpenModal from "./BoxShiftOpenModal";

interface Props {
  refetch: () => void;
}

export default function BoxShiftActions({ refetch }: Props) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <Button onClick={() => setOpenModal(true)}>
        <Plus className="h-4 w-4 mr-2" />
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
    </>
  );
}
