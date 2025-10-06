"use client";

import { Button } from "@/components/ui/button";
import ZoneModal from "./ZoneModal";
import { Plus } from "lucide-react";
import { ZONE } from "../lib/zone.interface";
import { useState } from "react";

export default function ZoneActions() {
  const [open, setOpen] = useState(false);

  const { MODEL } = ZONE;
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <ZoneModal
        title={`Crear ${MODEL.name}`}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
