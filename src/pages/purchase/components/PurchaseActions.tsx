"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PURCHASE } from "../lib/purchase.interface";
import { useNavigate } from "react-router-dom";

export default function PurchaseActions() {
  const navigate = useNavigate();
  const { MODEL, ROUTE_ADD } = PURCHASE;

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => navigate(ROUTE_ADD)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </div>
  );
}
