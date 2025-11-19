"use client";

import { Button } from "@/components/ui/button";
import JobPositionModal from "./JobPositionModal";
import { Plus } from "lucide-react";
import { JOBPOSITION } from "../lib/jobposition.interface";
import { useState } from "react";
import ActionsWrapper from "@/components/ActionsWrapper";

export default function JobPositionActions() {
  const [open, setOpen] = useState(false);

  const { MODEL } = JOBPOSITION;
  return (
    <ActionsWrapper>
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <JobPositionModal
        title={`Crear ${MODEL.name}`}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </ActionsWrapper>
  );
}
