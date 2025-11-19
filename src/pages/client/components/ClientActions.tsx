"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CLIENT } from "../lib/client.interface";
import ActionsWrapper from "@/components/ActionsWrapper";

export default function ClientActions() {
  const { MODEL } = CLIENT;
  const navigate = useNavigate();

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => navigate("/clientes/agregar")}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </ActionsWrapper>
  );
}
