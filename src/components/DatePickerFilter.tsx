"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerFilterProps {
  label?: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  dateFormat?: string;
  className?: string;
  vertical?: boolean;
}

export function DatePickerFilter({
  label,
  value,
  onChange,
  placeholder = "Fecha",
  dateFormat = "dd-MM-yyyy",
  className,
  vertical = false,
}: DatePickerFilterProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1",
        vertical && "flex-col items-start gap-0.5",
      )}
    >
      {label && (
        <span className="text-sm text-muted-foreground whitespace-nowrap leading-none uppercase font-bold">
          {label}
        </span>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-[130px] justify-start text-left font-normal",
              !value && "text-muted-foreground",
              className,
            )}
          >
            {value ? format(value, dateFormat, { locale: es }) : placeholder}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            locale={es}
            mode="single"
            selected={value}
            defaultMonth={value}
            onSelect={onChange}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
