"use client";

import { Button } from "@/components/ui/button";
import BrandModal from "./BrandModal";
import { Plus } from "lucide-react";
import { BRAND } from "../lib/brand.interface";
import { useState } from "react";
import ActionsWrapper from "@/components/ActionsWrapper";

export default function BrandActions() {
  const [open, setOpen] = useState(false);

  const { MODEL } = BRAND;
  return (
    <ActionsWrapper>
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <BrandModal
        title={`Crear ${MODEL.name}`}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </ActionsWrapper>
  );
}