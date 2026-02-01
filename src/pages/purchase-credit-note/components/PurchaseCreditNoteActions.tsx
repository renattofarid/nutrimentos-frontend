"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PURCHASE_CREDIT_NOTE } from "../lib/purchase-credit-note.interface";
import { useNavigate } from "react-router-dom";
import ActionsWrapper from "@/components/ActionsWrapper";

export default function PurchaseCreditNoteActions() {
  const navigate = useNavigate();
  const { MODEL } = PURCHASE_CREDIT_NOTE;

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => navigate(PURCHASE_CREDIT_NOTE.ROUTE_ADD)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </ActionsWrapper>
  );
}
