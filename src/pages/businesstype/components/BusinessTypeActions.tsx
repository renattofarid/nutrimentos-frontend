"use client";

import { Button } from "@/components/ui/button";
import BusinessTypeModal from "./BusinessTypeModal";
import { Plus } from "lucide-react";
import { BUSINESSTYPE } from "../lib/businesstype.interface";
import { useState } from "react";
import ActionsWrapper from "@/components/ActionsWrapper";

export default function BusinessTypeActions() {
  const [open, setOpen] = useState(false);

  const { MODEL } = BUSINESSTYPE;
  return (
    <ActionsWrapper>
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <BusinessTypeModal
        title={`Crear ${MODEL.name}`}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </ActionsWrapper>
  );
}
