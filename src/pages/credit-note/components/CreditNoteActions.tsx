"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, X, Download, Sheet, FileText, Loader2, Printer } from "lucide-react";
import { CREDIT_NOTE } from "../lib/credit-note.interface";
import { useNavigate } from "react-router-dom";
import { useWindowManager } from "@/stores/window-manager.store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { exportCreditNotes } from "../lib/credit-note.actions";
import { successToast, errorToast } from "@/lib/core.function";

interface CreditNoteActionsProps {
  hasSelection: boolean;
  onDelete: () => void;
  onPrint: () => void;
  filters?: Record<string, any>;
}

export default function CreditNoteActions({
  hasSelection,
  onDelete,
  onPrint,
  filters,
}: CreditNoteActionsProps) {
  const navigate = useNavigate();
  const { activeTabId, closeTab } = useWindowManager();
  const [isExporting, setIsExporting] = useState<"excel" | "pdf" | null>(null);
  const [open, setOpen] = useState(false);

  const handleCerrar = () => {
    if (activeTabId) closeTab(activeTabId);
  };

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
    <div className="flex items-center justify-between mb-1 pb-1 border-b w-full">
      <div className="flex items-center gap-1">
        <Button colorIcon="green" size="sm" variant="outline" onClick={() => navigate(CREDIT_NOTE.ROUTE_ADD)}>
          <Plus />
          Nuevo
        </Button>
        <Button
          colorIcon="red"
          size="sm"
          variant="outline"
          onClick={onDelete}
          disabled={!hasSelection}
        >
          <Trash2 />
          Eliminar
        </Button>
        <Button
          colorIcon="blue"
          size="sm"
          variant="outline"
          onClick={onPrint}
          disabled={!hasSelection}
        >
          <Printer />
          PDF
        </Button>
        <div className="h-6 mx-2">
          <Separator orientation="vertical" />
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">
              <Download />
              Exportar
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
        <div className="h-6 mx-2">
          <Separator orientation="vertical" />
        </div>
        <Button colorIcon="gray" size="sm" variant="outline" onClick={handleCerrar}>
          <X />
          Cerrar
        </Button>
      </div>
    </div>
  );
}
