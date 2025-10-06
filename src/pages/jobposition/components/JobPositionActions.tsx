"use client";

import { Button } from "@/components/ui/button";
import JobPositionModal from "./JobPositionModal";
import { Plus } from "lucide-react";
import { JOBPOSITION } from "../lib/jobposition.interface";
import { useState } from "react";

export default function JobPositionActions() {
  const [open, setOpen] = useState(false);

  const { MODEL } = JOBPOSITION;
  return (
    <div className="flex items-center gap-2">
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
    </div>
  );
}
