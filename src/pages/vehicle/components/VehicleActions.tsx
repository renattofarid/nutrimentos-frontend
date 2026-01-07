"use client";

import { Button } from "@/components/ui/button";
import VehicleModal from "./VehicleModal";
import { Plus } from "lucide-react";
import { VEHICLE } from "../lib/vehicle.interface";
import { useState } from "react";
import ActionsWrapper from "@/components/ActionsWrapper";

export default function VehicleActions() {
  const [open, setOpen] = useState(false);

  const { MODEL } = VEHICLE;
  return (
    <ActionsWrapper>
      <Button size="sm" className="ml-auto" onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <VehicleModal
        title={`Crear ${MODEL.name}`}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </ActionsWrapper>
  );
}
