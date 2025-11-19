"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SUPPLIER } from "../lib/supplier.interface";
import ActionsWrapper from "@/components/ActionsWrapper";

export default function SupplierActions() {
  const { MODEL } = SUPPLIER;
  const navigate = useNavigate();

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => navigate("/proveedores/agregar")}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </ActionsWrapper>
  );
}
