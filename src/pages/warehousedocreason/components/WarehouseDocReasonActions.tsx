"use client";

import { Button } from "@/components/ui/button";
import WarehouseDocReasonModal from "./WarehouseDocReasonModal";
import { Plus } from "lucide-react";
import { WAREHOUSEDOCREASON } from "../lib/warehousedocreason.interface";
import { useState } from "react";

export default function WarehouseDocReasonActions() {
  const [open, setOpen] = useState(false);

  const { MODEL } = WAREHOUSEDOCREASON;
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <WarehouseDocReasonModal
        title={`Crear ${MODEL.name}`}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
