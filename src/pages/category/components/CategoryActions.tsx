"use client";

import { Button } from "@/components/ui/button";
import CategoryModal from "./CategoryModal";
import { Plus } from "lucide-react";
import { CATEGORY } from "../lib/category.interface";
import { useState } from "react";
import ActionsWrapper from "@/components/ActionsWrapper";

export default function CategoryActions() {
  const [open, setOpen] = useState(false);

  const { MODEL } = CATEGORY;
  return (
    <ActionsWrapper>
      <Button size="sm" className="ml-auto" onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <CategoryModal
        title={`Crear ${MODEL.name}`}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </ActionsWrapper>
  );
}
