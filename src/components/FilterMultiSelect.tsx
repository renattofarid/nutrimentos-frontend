"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
  CommandItem,
  CommandGroup,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Option } from "@/lib/core.interface";

const normalizeText = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9_\s]/g, "");

interface FilterComboboxProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: Option[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  isLoadingOptions?: boolean;
  className?: string;
  popoverWidth?: string;
}

export function FilterMultiSelect({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  label,
  disabled = false,
  isLoadingOptions = false,
  className,
  popoverWidth = "min-w-(--radix-popover-trigger-width) w-auto",
}: FilterComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const isMobile = useIsMobile();

  const normalizedSearch = normalizeText(searchValue);

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options;
    return options.filter((option) => {
      const labelText =
        typeof option.label === "function"
          ? (option.label()?.toString() ?? "")
          : (option.label?.toString() ?? "");
      return normalizeText(labelText).includes(normalizedSearch);
    });
  }, [options, searchValue, normalizedSearch]);

  const handleSelect = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) setSearchValue("");
  };

  const triggerLabel = React.useMemo(() => {
    if (value.length === 0) return null;
    if (value.length === 1) {
      const opt = options.find((o) => o.value === value[0]);
      if (!opt) return value[0];
      return typeof opt.label === "function" ? opt.label() : opt.label;
    }
    return `${value.length} seleccionados`;
  }, [value, options]);

  const commandContent = (
    <Command className="md:max-h-72 overflow-hidden" shouldFilter={false}>
      <CommandInput
        className="border-none focus:ring-0"
        placeholder="Buscar..."
        value={searchValue}
        onValueChange={setSearchValue}
      />
      <CommandList className="md:max-h-60 overflow-y-auto">
        {isLoadingOptions ? (
          <div className="py-6 text-center text-sm flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-muted-foreground">Cargando...</span>
          </div>
        ) : (
          <>
            {filteredOptions.length === 0 && (
              <CommandEmpty className="py-4 text-center text-sm">
                No hay resultados.
              </CommandEmpty>
            )}
            {filteredOptions.length > 0 && (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    className="cursor-pointer"
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate">
                        {typeof option.label === "function"
                          ? option.label()
                          : option.label}
                      </span>
                      {option.description && (
                        <span className="text-[10px] text-muted-foreground truncate">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </Command>
  );

  const triggerButton = (
    <Button
      type="button"
      variant="outline"
      role="combobox"
      size="sm"
      disabled={disabled}
      className={cn(
        "w-full justify-between flex",
        value.length === 0 && "text-muted-foreground",
        className,
      )}
    >
      <span className="text-nowrap! line-clamp-1">
        {triggerLabel ?? placeholder}
      </span>
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  return (
    <div className="flex flex-col gap-1 min-w-0">
      {label && (
        <span className="text-xs md:text-sm font-medium text-foreground">
          {label}
        </span>
      )}
      {isMobile ? (
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
          <DrawerContent className="px-4 pb-4 max-h-[80vh]">
            <DrawerHeader>
              <DrawerTitle>{label || placeholder}</DrawerTitle>
              <DrawerDescription className="hidden" />
            </DrawerHeader>
            <div className="overflow-hidden">{commandContent}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent
            className={cn("p-0", popoverWidth)}
            onWheel={(e) => e.stopPropagation()}
            onWheelCapture={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {commandContent}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
