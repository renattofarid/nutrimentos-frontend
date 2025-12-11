"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SALE } from "../lib/sale.interface";
import { useNavigate } from "react-router-dom";
import ExportButtons from "@/components/ExportButtons";

interface SaleActionsProps {
  excelEndpoint?: string;
}

export default function SaleActions({ excelEndpoint }: SaleActionsProps) {
  const navigate = useNavigate();
  const { MODEL } = SALE;

  return (
    <div className="flex items-center gap-2">
      <ExportButtons
        excelEndpoint={excelEndpoint}
        excelFileName={`ventas_${new Date().toISOString().split("T")[0]}.xlsx`}
      />
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => navigate("/ventas/agregar")}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </div>
  );
}
