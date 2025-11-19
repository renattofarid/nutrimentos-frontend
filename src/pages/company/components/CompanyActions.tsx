"use client";

import { Button } from "@/components/ui/button";
import CompanyModal from "./CompanyModal";
import { Plus } from "lucide-react";
import { COMPANY } from "../lib/company.interface";
import { useState } from "react";
import ActionsWrapper from "@/components/ActionsWrapper";

export default function CompanyActions() {
  const [open, setOpen] = useState(false);

  const { MODEL } = COMPANY;
  return (
    <ActionsWrapper>
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <CompanyModal
        title={`Crear ${MODEL.name}`}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </ActionsWrapper>
  );
}