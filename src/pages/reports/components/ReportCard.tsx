"use client";

import { useState } from "react";
import { FileBarChart } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useDownloadReport } from "../lib/reports.hook";
import GeneralSheet from "@/components/GeneralSheet";
import { ReportFilters } from "./ReportFilters";

export type ReportFormat = "excel" | "pdf";

export type ReportFieldType =
  | "date"
  | "daterange"
  | "select"
  | "selectasync"
  | "multiselect"
  | "text"
  | "number";

export interface ReportFieldOption {
  label: string;
  value: string;
}

export interface MultiSelectOption {
  id: number;
  [key: string]: any;
}

export interface ReportField {
  name: string;
  label: string;
  type: ReportFieldType;
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  // Para campos de tipo select
  options?: ReportFieldOption[];
  // Para campos de tipo select que cargan datos de un endpoint
  endpoint?: string;
  // Mapper para transformar la respuesta del endpoint a opciones
  optionsMapper?: (data: any) => ReportFieldOption[];
  // Para campos de tipo multiselect
  multiSelectOptions?: MultiSelectOption[];
  multiSelectMapper?: (data: any) => MultiSelectOption[];
  getDisplayValue?: (item: MultiSelectOption) => string;
  getSecondaryText?: (item: MultiSelectOption) => string | undefined;
  // Para campos de tipo selectasync (FormSelectAsync)
  useQueryHook?: (params: {
    search?: string;
    page?: number;
    per_page?: number;
    [key: string]: any;
  }) => {
    data?: { data: any[]; meta?: { last_page?: number } };
    isLoading: boolean;
    isFetching?: boolean;
  };
  asyncOptionsMapper?: (item: any) => { label: string; value: string };
  // Para daterange
  nameFrom?: string;
  nameTo?: string;
}

export interface ReportConfig {
  id: string;
  title: string;
  type: string;
  description: string;
  icon?: string;
  endpoint: string;
  fields: ReportField[];
  // Parámetros adicionales que siempre se envían
  defaultParams?: Record<string, any>;
}

export interface ReportFilterValues {
  format: ReportFormat;
  [key: string]: any;
}

interface ReportCardProps {
  report: ReportConfig;
}

export function ReportCard({ report }: ReportCardProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { mutate: downloadReport, isPending } = useDownloadReport();

  const handleDownload = (values: ReportFilterValues) => {
    const params = {
      ...report.defaultParams,
      ...values,
    };

    downloadReport({
      endpoint: report.endpoint,
      params,
    });
  };

  // Obtener el ícono dinámicamente
  const IconComponent = report.icon
    ? (LucideIcons as any)[report.icon] || FileBarChart
    : FileBarChart;

  return (
    <>
      <Card>
        <CardHeader className="flex justify-between items-start gap-3 w-full">
          <div className="p-3 rounded-md bg-primary/10 shrink-0">
            <IconComponent className="h-7 w-7 text-primary" />
          </div>
          <p className="font-mono uppercase font-bold text-muted-foreground text-xs">
            {report.type}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold leading-tight">
              {report.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              {report.description}
            </p>
          </div>
          <div className="flex justify-end w-full">
            <Button
              variant="default"
              color="muted"
              size="default"
              className="w-fit"
              onClick={() => setIsSheetOpen(true)}
            >
              Configurar Descarga
            </Button>
          </div>
        </CardContent>
      </Card>

      <GeneralSheet
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={report.title}
        subtitle={report.description}
        icon={report.icon as keyof typeof LucideIcons}
        size="md"
      >
        <ReportFilters
          fields={report.fields}
          onSubmit={handleDownload}
          isLoading={isPending}
        />
      </GeneralSheet>
    </>
  );
}
