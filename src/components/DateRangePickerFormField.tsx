"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Matcher, DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";
import type { Control, FieldValues, Path } from "react-hook-form";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import RequiredField from "./RequiredField";
import { useIsMobile } from "@/hooks/use-mobile";

interface DateRangePickerFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  nameFrom: Path<T>;
  nameTo: Path<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  tooltip?: string | React.ReactNode;
  dateFormat?: string;
  disabled?: Matcher;
  required?: boolean;
  size?: "sm" | "default" | "lg";
}

export function DateRangePickerFormField<T extends FieldValues>({
  control,
  nameFrom,
  nameTo,
  label,
  placeholder = "Selecciona un rango",
  description,
  tooltip,
  dateFormat = "dd/MM/yyyy",
  disabled,
  required = false,
  size,
}: DateRangePickerFormFieldProps<T>) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  return (
    <FormField
      control={control}
      name={nameFrom}
      render={({ field: fieldFrom }) => (
        <FormField
          control={control}
          name={nameTo}
          render={({ field: fieldTo }) => {
            const dateRange: DateRange = {
              from: fieldFrom.value ? new Date(fieldFrom.value) : undefined,
              to: fieldTo.value ? new Date(fieldTo.value) : undefined,
            };

            const displayValue =
              dateRange.from && dateRange.to
                ? `${format(dateRange.from, dateFormat)} - ${format(
                    dateRange.to,
                    dateFormat
                  )}`
                : placeholder;

            return (
              <FormItem className="flex flex-col">
                {label && (
                  <FormLabel className="flex justify-start items-center">
                    {label}
                    {required && <RequiredField />}
                    {tooltip && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            color="tertiary"
                            className="ml-2 p-0 aspect-square w-4 h-4 text-center justify-center"
                          >
                            ?
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>{tooltip}</TooltipContent>
                      </Tooltip>
                    )}
                  </FormLabel>
                )}

                {description && (
                  <FormDescription>{description}</FormDescription>
                )}
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        size={size ? size : isMobile ? "sm" : "default"}
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground"
                        )}
                      >
                        {displayValue}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 max-h-none"
                    align="start"
                  >
                    <Calendar
                      locale={es}
                      mode="range"
                      numberOfMonths={2}
                      selected={dateRange}
                      defaultMonth={dateRange?.from}
                      onSelect={(range) => {
                        fieldFrom.onChange(range?.from ?? "");
                        fieldTo.onChange(range?.to ?? "");
                      }}
                      disabled={disabled}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      )}
    />
  );
}
