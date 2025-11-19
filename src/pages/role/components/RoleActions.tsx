"use client";

import { Button } from "@/components/ui/button";
import RoleModal from "./RoleModal";
import { Plus } from "lucide-react";
import { ROLE } from "../lib/role.interface";
import { useState } from "react";
import ActionsWrapper from "@/components/ActionsWrapper";

export default function RoleActions() {
  const [open, setOpen] = useState(false);

  const { MODEL } = ROLE;
  return (
    <ActionsWrapper>
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <RoleModal
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => setOpen(false)}
      />
    </ActionsWrapper>
  );
}