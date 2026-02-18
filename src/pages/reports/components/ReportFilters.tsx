"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2, Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";
import type {
  ReportField,
  ReportFilterValues,
  ReportFormat,
} from "./ReportCard";
import { DateRangePickerFormField } from "@/components/DateRangePickerFormField";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { FormInput } from "@/components/FormInput";
import { useSelectOptions } from "../lib/reports.hook";
import { FormSelect } from "@/components/FormSelect";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { MultiSelectTags } from "@/components/MultiSelectTags";

interface ReportFiltersProps {
  fields: ReportField[];
  onSubmit: (values: ReportFilterValues) => void;
  isLoading?: boolean;
}

export function ReportFilters({
  fields,
  onSubmit,
  isLoading,
}: ReportFiltersProps) {
  const [format, setFormat] = useState<ReportFormat>("excel");
  // Construir el schema dinámicamente basado en los campos
  const buildSchema = () => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    fields.forEach((field) => {
      if (field.type === "daterange") {
        // Para daterange, agregamos dos campos
        if (field.nameFrom && field.nameTo) {
          const dateSchema = field.required
            ? z.coerce.date({ message: `${field.label} es requerido` })
            : z.coerce.date().optional();

          schemaFields[field.nameFrom] = dateSchema;
          schemaFields[field.nameTo] = dateSchema;
        }
      } else if (field.type === "date") {
        schemaFields[field.name] = field.required
          ? z.coerce.date({ message: `${field.label} es requerido` })
          : z.coerce.date().optional();
      } else if (field.type === "number") {
        schemaFields[field.name] = field.required
          ? z.coerce.number({ message: `${field.label} es requerido` })
          : z.coerce.number().optional();
      } else if (field.type === "multiselect") {
        schemaFields[field.name] = field.required
          ? z
              .array(z.number())
              .min(1, { message: `${field.label} es requerido` })
          : z.array(z.number()).optional();
      } else {
        schemaFields[field.name] = field.required
          ? z.string({ message: `${field.label} es requerido` })
          : z.string().optional();
      }
    });

    return z.object(schemaFields);
  };

  const formSchema = buildSchema();
  type FormSchema = z.infer<typeof formSchema>;

  // Construir valores por defecto
  const buildDefaultValues = () => {
    const defaults: Record<string, any> = {};

    fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue;
      }
    });

    return defaults;
  };

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: buildDefaultValues() as any,
  });

  const handleSubmit = (values: FormSchema) => {
    // Limpiar valores vacíos o undefined antes de enviar
    const cleanedValues = Object.entries(values).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Para fechas, convertir a string ISO
          if (value instanceof Date) {
            acc[key] = value.toISOString().split("T")[0];
          } else {
            acc[key] = value;
          }
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    // Agregar el formato seleccionado del estado
    cleanedValues.format = format;

    onSubmit(cleanedValues as ReportFilterValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Campos dinámicos */}
        {fields.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {fields.map((field) => (
              <DynamicField
                key={field.name}
                field={field}
                control={form.control}
              />
            ))}
          </div>
        )}

        {/* Selector de formato y botón de descarga */}
        <div className="flex items-center justify-between">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <Button
              type="button"
              variant={format === "excel" ? "default" : "outline"}
              size="sm"
              onClick={() => setFormat("excel")}
              className="rounded-r-none"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="ml-2">Excel</span>
            </Button>
            <Button
              type="button"
              variant={format === "pdf" ? "default" : "outline"}
              size="sm"
              onClick={() => setFormat("pdf")}
              className="rounded-l-none border-l-0"
            >
              <FileText className="h-4 w-4" />
              <span className="ml-2">PDF</span>
            </Button>
          </div>

          <Button size={"sm"} type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Descargando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface DynamicFieldProps {
  field: ReportField;
  control: any;
}

function DynamicField({ field, control }: DynamicFieldProps) {
  switch (field.type) {
    case "select":
      return <SelectField field={field} control={control} />;

    case "selectasync":
      return <AsyncSelectField field={field} control={control} />;

    case "multiselect":
      return <MultiSelectField field={field} control={control} />;

    case "daterange":
      return (
        <DateRangePickerFormField
          control={control}
          nameFrom={field.nameFrom || `${field.name}_from`}
          nameTo={field.nameTo || `${field.name}_to`}
          label={field.label}
          placeholder={field.placeholder}
          required={field.required}
        />
      );

    case "date":
      return (
        <DatePickerFormField
          control={control}
          name={field.name}
          label={field.label}
          placeholder={field.placeholder}
        />
      );

    case "number":
      return (
        <FormInput
          name={field.name}
          label={field.label}
          placeholder={field.placeholder}
          type="number"
          control={control}
          required={field.required}
        />
      );

    case "text":
    default:
      return (
        <FormInput
          name={field.name}
          label={field.label}
          placeholder={field.placeholder}
          type="text"
          control={control}
          required={field.required}
        />
      );
  }
}

function SelectField({ field, control }: DynamicFieldProps) {
  // Si el campo tiene un endpoint, cargar las opciones dinámicamente
  const { data, isLoading } = useSelectOptions(field.endpoint);

  const options = field.endpoint
    ? field.optionsMapper && data
      ? field.optionsMapper(data)
      : []
    : field.options || [];

  return (
    <FormSelect
      name={field.name}
      label={field.label}
      placeholder={
        field.placeholder || `Seleccionar ${field.label.toLowerCase()}`
      }
      options={options}
      control={control}
      disabled={isLoading}
    />
  );
}

function AsyncSelectField({ field, control }: DynamicFieldProps) {
  if (!field.useQueryHook || !field.asyncOptionsMapper) return null;

  return (
    <FormSelectAsync
      name={field.name}
      label={field.label}
      placeholder={field.placeholder || `Seleccionar ${field.label.toLowerCase()}`}
      control={control}
      required={field.required}
      useQueryHook={field.useQueryHook}
      mapOptionFn={field.asyncOptionsMapper}
    />
  );
}

function MultiSelectField({ field, control }: DynamicFieldProps) {
  // Si el campo tiene un endpoint, cargar las opciones dinámicamente
  const { data, isLoading } = useSelectOptions(field.endpoint);

  const options = field.endpoint
    ? field.multiSelectMapper && data
      ? field.multiSelectMapper(data)
      : []
    : field.multiSelectOptions || [];

  return (
    <MultiSelectTags
      name={field.name}
      label={field.label}
      placeholder={
        field.placeholder || `Seleccionar ${field.label.toLowerCase()}`
      }
      options={options}
      control={control}
      required={field.required}
      disabled={isLoading}
      getDisplayValue={
        field.getDisplayValue || ((item) => item.name || String(item.id))
      }
      getSecondaryText={field.getSecondaryText}
    />
  );
}
