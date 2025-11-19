"use client";

import { Button } from "@/components/ui/button";
import BranchModal from "./BranchModal";
import { Plus } from "lucide-react";
import { BRANCH } from "../lib/branch.interface";
import { useState } from "react";
import ActionsWrapper from "@/components/ActionsWrapper";

export default function BranchActions() {
  const [open, setOpen] = useState(false);

  const { MODEL } = BRANCH;
  return (
    <ActionsWrapper>
      <Button size="sm" className="ml-auto" onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <BranchModal
        title={`Crear ${MODEL.name}`}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </ActionsWrapper>
  );
}
