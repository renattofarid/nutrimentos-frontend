"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  type Control,
  type FieldValues,
  type Path,
  useController,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CalendarIcon } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { type Matcher } from "react-day-picker";
import { useFormLayout } from "./GroupFormSection";

interface DateTimePickerFormProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  dateFormat?: string;
  disabledRange?: Matcher | Matcher[];
  minDate?: Date;
  maxDate?: Date;
  horizontalField?: boolean;
  autoLabelWidth?: boolean;
}

export function DateTimePickerForm<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Selecciona fecha y hora",
  description,
  disabled = false,
  dateFormat = "dd/MM/yyyy hh:mm aa",
  disabledRange,
  minDate,
  maxDate,
  horizontalField = false,
  autoLabelWidth = false,
}: DateTimePickerFormProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const { horizontal } = useFormLayout();
  const [isOpen, setIsOpen] = React.useState(false);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  const selectedDate = field.value ? new Date(field.value) : undefined;

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      if (field.value) {
        const existingDate = new Date(field.value);
        selectedDate.setHours(existingDate.getHours());
        selectedDate.setMinutes(existingDate.getMinutes());
      } else {
        const now = new Date();
        selectedDate.setHours(now.getHours());
        selectedDate.setMinutes(now.getMinutes());
      }
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const h = String(selectedDate.getHours()).padStart(2, "0");
      const m = String(selectedDate.getMinutes()).padStart(2, "0");
      field.onChange(`${year}-${month}-${day}T${h}:${m}`);
    }
  };

  const handleTimeChange = (
    type: "hour" | "minute" | "ampm",
    value: string,
  ) => {
    const date = selectedDate || new Date();
    const newDate = new Date(date);

    if (type === "hour") {
      const hour = parseInt(value);
      const isPM = newDate.getHours() >= 12;
      let newHour = hour === 12 ? 0 : hour;
      if (isPM) newHour += 12;
      newDate.setHours(newHour);
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value));
    } else if (type === "ampm") {
      const currentHours = newDate.getHours();
      if (value === "PM" && currentHours < 12) {
        newDate.setHours(currentHours + 12);
      } else if (value === "AM" && currentHours >= 12) {
        newDate.setHours(currentHours - 12);
      }
    }

    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const day = String(newDate.getDate()).padStart(2, "0");
    const h = String(newDate.getHours()).padStart(2, "0");
    const m = String(newDate.getMinutes()).padStart(2, "0");
    field.onChange(`${year}-${month}-${day}T${h}:${m}`);
  };

  const buildDisabledMatcher = (): Matcher | Matcher[] | undefined => {
    const matchers: Matcher[] = [];
    if (disabledRange) {
      if (Array.isArray(disabledRange)) {
        matchers.push(...disabledRange);
      } else {
        matchers.push(disabledRange);
      }
    }
    if (minDate) matchers.push({ before: minDate });
    if (maxDate) matchers.push({ after: maxDate });
    return matchers.length > 0 ? matchers : undefined;
  };

  React.useEffect(() => {
    if (!field.value) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      field.onChange(`${year}-${month}-${day}T${h}:${m}`);
    }
  }, []);

  const pickerContent = (
    <>
      <FormControl>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal truncate",
                !selectedDate && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, dateFormat, { locale: es })
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <div className="sm:flex">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={buildDisabledMatcher()}
                autoFocus
                locale={es}
              />
              <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                <ScrollArea className="w-64 sm:w-auto">
                  <div className="flex sm:flex-col p-2">
                    {hours.reverse().map((hour) => {
                      const currentHour = selectedDate?.getHours() || 0;
                      const hour12 = currentHour % 12 || 12;
                      const isSelected = selectedDate && hour12 === hour;
                      return (
                        <Button
                          key={hour}
                          size="icon"
                          variant={isSelected ? "default" : "ghost"}
                          className="sm:w-full shrink-0 aspect-square"
                          onClick={() =>
                            handleTimeChange("hour", hour.toString())
                          }
                        >
                          {hour}
                        </Button>
                      );
                    })}
                  </div>
                  <ScrollBar orientation="horizontal" className="sm:hidden" />
                </ScrollArea>
                <ScrollArea className="w-64 sm:w-auto">
                  <div className="flex sm:flex-col p-2">
                    {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                      <Button
                        key={minute}
                        size="icon"
                        variant={
                          selectedDate && selectedDate.getMinutes() === minute
                            ? "default"
                            : "ghost"
                        }
                        className="sm:w-full shrink-0 aspect-square"
                        onClick={() =>
                          handleTimeChange("minute", minute.toString())
                        }
                      >
                        {minute.toString().padStart(2, "0")}
                      </Button>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" className="sm:hidden" />
                </ScrollArea>
                <ScrollArea className="">
                  <div className="flex sm:flex-col p-2">
                    {["AM", "PM"].map((ampm) => (
                      <Button
                        key={ampm}
                        size="icon"
                        variant={
                          selectedDate &&
                          ((ampm === "AM" && selectedDate.getHours() < 12) ||
                            (ampm === "PM" && selectedDate.getHours() >= 12))
                            ? "default"
                            : "ghost"
                        }
                        className="sm:w-full shrink-0 aspect-square"
                        onClick={() => handleTimeChange("ampm", ampm)}
                      >
                        {ampm}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage>{error?.message}</FormMessage>
    </>
  );

  if (horizontal || horizontalField) {
    return (
      <FormItem className="flex flex-row items-center gap-3">
        {label && (
          <FormLabel
            className={cn(
              horizontal &&
                !autoLabelWidth &&
                "w-48 shrink-0 justify-end text-right font-bold uppercase",
              (autoLabelWidth || horizontalField) &&
                "shrink-0 justify-end text-right font-bold uppercase",
            )}
          >
            {label}
          </FormLabel>
        )}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          {pickerContent}
        </div>
      </FormItem>
    );
  }

  return (
    <FormItem className="flex flex-col gap-0.5">
      {label && <FormLabel className="font-bold uppercase">{label}</FormLabel>}
      {pickerContent}
    </FormItem>
  );
}
