"use client";

import { Button } from "@/components/ui/button";
import TypeUserModal from "./TypeUserModal";
import { Plus } from "lucide-react";
import { TYPE_USER } from "../lib/typeUser.interface";
import { useState } from "react";
import ActionsWrapper from "@/components/ActionsWrapper";

export default function TypeUserActions() {
  const [open, setOpen] = useState(false);

  const { MODEL } = TYPE_USER;
  return (
    <ActionsWrapper>
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <TypeUserModal
        title={`Crear ${MODEL.name}`}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </ActionsWrapper>
  );
}
