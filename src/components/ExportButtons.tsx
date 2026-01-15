"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { api } from "@/lib/config";
import { errorToast, successToast } from "@/lib/core.function";
import { Sheet, FileText } from "lucide-react";

interface ExportButtonsProps {
  excelEndpoint?: string;
  pdfEndpoint?: string;
  excelFileName?: string;
  pdfFileName?: string;
  onExcelDownload?: () => void | Promise<void>;
  onPdfDownload?: () => void | Promise<void>;
  disableExcel?: boolean;
  disablePdf?: boolean;
  variant?: "grouped" | "separate";
}

export default function ExportButtons({
  excelEndpoint,
  pdfEndpoint,
  excelFileName = "export.xlsx",
  pdfFileName = "export.pdf",
  onExcelDownload,
  onPdfDownload,
  disableExcel = false,
  disablePdf = false,
  variant = "grouped",
}: ExportButtonsProps) {
  const handleExcelDownload = async () => {
    // Si se proporciona una función personalizada, usarla
    if (onExcelDownload) {
      await onExcelDownload();
      return;
    }

    // Si no, usar el endpoint por defecto
    if (!excelEndpoint) return;

    try {
      const response = await api.get(excelEndpoint, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", excelFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      successToast("Excel descargado exitosamente");
    } catch (error) {
      console.error("Error al descargar Excel:", error);
      errorToast("Error al descargar el archivo Excel");
    }
  };

  const handlePDFDownload = async () => {
    // Si se proporciona una función personalizada, usarla
    if (onPdfDownload) {
      await onPdfDownload();
      return;
    }

    // Si no, usar el endpoint por defecto
    if (!pdfEndpoint) return;

    try {
      const response = await api.get(pdfEndpoint, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", pdfFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      successToast("PDF descargado exitosamente");
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      errorToast("Error al descargar el archivo PDF");
    }
  };

  const showExcelButton = excelEndpoint || onExcelDownload;
  const showPdfButton = pdfEndpoint || onPdfDownload;

  if (variant === "grouped") {
    return (
      <div className="flex items-center gap-1 rounded-lg border">
        {showExcelButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="gap-2 hover:bg-green-700/5 hover:text-green-700 transition-colors dark:hover:bg-green-950 dark:hover:text-green-50 dark:bg-gray-800"
                onClick={handleExcelDownload}
                disabled={disableExcel}
              >
                <Sheet className="h-4 w-4" />
                Excel
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Descargar Excel</p>
            </TooltipContent>
          </Tooltip>
        )}

        {showPdfButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="gap-2 hover:bg-red-700/5 hover:text-red-700 transition-colors dark:hover:bg-red-950 dark:hover:text-red-50 dark:bg-gray-800"
                onClick={handlePDFDownload}
                disabled={disablePdf}
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Descargar PDF</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  }

  // Variant "separate" - botones individuales sin agrupar
  return (
    <>
      {showExcelButton && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-green-700/5 hover:text-green-700 transition-colors"
              onClick={handleExcelDownload}
              disabled={disableExcel}
            >
              <Sheet className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Descargar Excel</p>
          </TooltipContent>
        </Tooltip>
      )}

      {showPdfButton && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-red-700/5 hover:text-red-700 transition-colors"
              onClick={handlePDFDownload}
              disabled={disablePdf}
            >
              <FileText className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Descargar PDF</p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
