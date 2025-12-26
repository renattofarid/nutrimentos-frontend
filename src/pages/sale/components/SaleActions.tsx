"use client";

import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { SALE } from "../lib/sale.interface";
import { useNavigate } from "react-router-dom";
import ExportButtons from "@/components/ExportButtons";

interface SaleActionsProps {
  excelEndpoint?: string;
  selectedCount?: number;
  onExportTickets?: () => void;
}

export default function SaleActions({
  excelEndpoint,
  selectedCount = 0,
  onExportTickets
}: SaleActionsProps) {
  const navigate = useNavigate();
  const { MODEL } = SALE;

  return (
    <div className="flex items-center gap-2">
      {selectedCount > 0 && onExportTickets && (
        <Button
          size="sm"
          variant="outline"
          onClick={onExportTickets}
        >
          <FileText className="size-4 mr-2" />
          Exportar Tickets ({selectedCount})
        </Button>
      )}
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
