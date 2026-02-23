"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Sheet, FileText, Loader2 } from "lucide-react";
import { CREDIT_NOTE } from "../lib/credit-note.interface";
import { useNavigate } from "react-router-dom";
import ActionsWrapper from "@/components/ActionsWrapper";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { exportCreditNotes } from "../lib/credit-note.actions";
import { successToast, errorToast } from "@/lib/core.function";

interface CreditNoteActionsProps {
  filters?: Record<string, any>;
}

export default function CreditNoteActions({ filters }: CreditNoteActionsProps) {
  const navigate = useNavigate();
  const { MODEL } = CREDIT_NOTE;
  const [isExporting, setIsExporting] = useState<"excel" | "pdf" | null>(null);
  const [open, setOpen] = useState(false);

  const handleExport = async (format: "excel" | "pdf") => {
    setIsExporting(format);
    try {
      const blob = await exportCreditNotes({ ...filters, export: format });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      const ext = format === "excel" ? "xlsx" : "pdf";
      link.setAttribute(
        "download",
        `notas_credito_${new Date().toISOString().split("T")[0]}.${ext}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      successToast(
        `${format === "excel" ? "Excel" : "PDF"} descargado exitosamente`,
      );
      setOpen(false);
    } catch {
      errorToast(
        `Error al descargar el ${format === "excel" ? "Excel" : "PDF"}`,
      );
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <ActionsWrapper>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">
            <Download className="size-4 mr-2" /> Exportar
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-36 p-2" align="end">
          <div className="flex flex-col gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="justify-start"
              disabled={isExporting !== null}
              onClick={() => handleExport("excel")}
            >
              {isExporting === "excel" ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Sheet className="size-4 mr-2" />
              )}
              Excel
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="justify-start"
              disabled={isExporting !== null}
              onClick={() => handleExport("pdf")}
            >
              {isExporting === "pdf" ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <FileText className="size-4 mr-2" />
              )}
              PDF
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button size="sm" onClick={() => navigate(CREDIT_NOTE.ROUTE_ADD)}>
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </ActionsWrapper>
  );
}
