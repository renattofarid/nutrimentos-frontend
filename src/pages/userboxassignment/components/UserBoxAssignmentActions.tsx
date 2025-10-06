"use client";

import { Button } from "@/components/ui/button";
import UserBoxAssignmentModal from "./UserBoxAssignmentModal";
import { Plus } from "lucide-react";
import { USERBOXASSIGNMENT } from "../lib/userboxassignment.interface";
import { useState } from "react";

export default function UserBoxAssignmentActions() {
  const [open, setOpen] = useState(false);

  const { MODEL } = USERBOXASSIGNMENT;
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <UserBoxAssignmentModal
        title={`Crear ${MODEL.name}`}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
