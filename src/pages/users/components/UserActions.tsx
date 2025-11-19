"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { USER } from "../lib/User.interface";
import { useState } from "react";
import UserModal from "./UserModal";
import ActionsWrapper from "@/components/ActionsWrapper";

export default function UserActions() {
  const [open, setOpen] = useState(false);
  const { MODEL } = USER;
  return (
    <ActionsWrapper>
      <Button size="sm" className="ml-auto" onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <UserModal
        title={`Crear ${MODEL.name}`}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </ActionsWrapper>
  );
}
