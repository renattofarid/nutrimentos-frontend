"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CREDIT_NOTE } from "../lib/credit-note.interface";
import { useNavigate } from "react-router-dom";
import ActionsWrapper from "@/components/ActionsWrapper";

export default function CreditNoteActions() {
  const navigate = useNavigate();
  const { MODEL } = CREDIT_NOTE;

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => navigate(CREDIT_NOTE.ROUTE_ADD)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </ActionsWrapper>
  );
}
