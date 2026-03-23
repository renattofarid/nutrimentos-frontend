import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandList,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Control } from "react-hook-form";
import type { Option } from "@/lib/core.interface";

interface FormSelectProps {
  name: string;
  description?: string;
  label: string | (() => React.ReactNode);
  placeholder?: string;
  options: Option[];
  control: Control<any>;
  disabled?: boolean;
  tooltip?: string | React.ReactNode;
  withValue?: boolean;
  classNameOption?: string;
  strictFilter?: boolean;
  enableCodeSearch?: boolean;
  autoSelectSingle?: boolean;
  uppercase?: boolean;
}

function getOptionLabel(opt: Option): string {
  if (typeof opt.label === "string") return opt.label;
  return opt.value;
}

export function FormSelect({
  name,
  description,
  label,
  placeholder,
  options,
  control,
  disabled,
  tooltip,
  withValue = false,
  classNameOption,
  enableCodeSearch = false,
  autoSelectSingle = false,
  uppercase = false,
}: FormSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchTab, setSearchTab] = useState<"name" | "code">("name");
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const displayLabelRef = useRef("");

  const handleFocus = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setSearch(displayLabelRef.current);
    setOpen(true);
  };

  const handleBlur = () => {
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      setSearch("");
      if (enableCodeSearch) setSearchTab("name");
    }, 150);
  };

  const handleListMouseDown = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selected = options.find((opt) => opt.value === field.value);
        const displayLabel = selected ? getOptionLabel(selected) : "";
        displayLabelRef.current = displayLabel;

        // Auto-select if only one option is available
        useEffect(() => {
          if (
            autoSelectSingle &&
            options.length === 1 &&
            !field.value &&
            !disabled
          ) {
            field.onChange(options[0].value);
          }
        }, [options, field.value, disabled, autoSelectSingle]);

        const filterByName = (opts: Option[]) =>
          search
            ? opts.filter((opt) =>
                getOptionLabel(opt)
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
            : opts;

        const filterByCode = (opts: Option[]) =>
          search
            ? opts.filter((opt) =>
                (opt.searchCode || "")
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
            : opts;

        const filteredOptions =
          enableCodeSearch && searchTab === "code"
            ? filterByCode(options)
            : filterByName(options);

        const handleSelect = (optionValue: string) => {
          const newValue =
            optionValue === field.value ? "" : optionValue;
          field.onChange(newValue);
          if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
          setOpen(false);
          setSearch("");
        };

        const handleClear = (e: React.MouseEvent) => {
          e.stopPropagation();
          field.onChange("");
        };

        const optionItem = (option: Option) => (
          <CommandItem
            key={option.value}
            className="cursor-pointer"
            onSelect={() => handleSelect(option.value)}
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4 shrink-0",
                option.value === field.value ? "opacity-100" : "opacity-0",
              )}
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span
                className={cn(
                  "truncate",
                  classNameOption,
                  uppercase && "uppercase",
                )}
              >
                {typeof option.label === "function"
                  ? option.label()
                  : option.label}
              </span>
              {option.description && (
                <span
                  className={cn(
                    "text-[10px] text-muted-foreground truncate",
                    uppercase && "uppercase",
                  )}
                >
                  {withValue && `${option.value} - `} {option.description}
                </span>
              )}
            </div>
          </CommandItem>
        );

        return (
          <FormItem className="flex flex-col justify-start gap-0.5">
            {typeof label === "function" ? (
              label()
            ) : (
              <FormLabel
                className={cn(
                  "flex justify-start items-center",
                  uppercase && "uppercase",
                )}
              >
                {label}
                {tooltip && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="default"
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
              <FormDescription className="text-sm text-muted-foreground !mb-0">
                {description}
              </FormDescription>
            )}

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverAnchor asChild>
                <FormControl>
                  <div className="relative">
                    <Input
                      value={open ? search : displayLabel}
                      onChange={(e) => setSearch(e.target.value)}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      onMouseDown={(e) => {
                        if (!open && !disabled && document.activeElement === e.currentTarget) {
                          if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                          setSearch(displayLabelRef.current);
                          setOpen(true);
                        }
                      }}
                      placeholder={placeholder}
                      disabled={disabled}
                      className={cn(
                        "h-8 pr-8 text-sm",
                        field.value && !open && "bg-muted",
                        uppercase && "uppercase",
                      )}
                      autoComplete="off"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                      {field.value && !disabled && (
                        <button
                          type="button"
                          tabIndex={-1}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={handleClear}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                      <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50 pointer-events-none" />
                    </div>
                  </div>
                </FormControl>
              </PopoverAnchor>

              <PopoverContent
                className="p-0 !min-w-(--radix-popover-trigger-width) w-auto"
                onMouseDown={handleListMouseDown}
                onWheel={(e) => e.stopPropagation()}
                onWheelCapture={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onFocusOutside={(e) => e.preventDefault()}
              >
                {enableCodeSearch ? (
                  <Tabs
                    value={searchTab}
                    onValueChange={(value) => {
                      setSearchTab(value as "name" | "code");
                      setSearch("");
                    }}
                    className="w-full"
                  >
                    <TabsList className="w-full grid grid-cols-2 rounded-b-none">
                      <TabsTrigger value="name" className="text-xs">
                        Por Nombre
                      </TabsTrigger>
                      <TabsTrigger value="code" className="text-xs">
                        Por Código
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="name" className="m-0">
                      <Command className="max-h-72 overflow-hidden" shouldFilter={false}>
                        <CommandList className="max-h-60 overflow-y-auto">
                          <CommandEmpty className="py-4 text-center text-sm">
                            No hay resultados.
                          </CommandEmpty>
                          {filterByName(options).map(optionItem)}
                        </CommandList>
                      </Command>
                    </TabsContent>
                    <TabsContent value="code" className="m-0">
                      <Command className="max-h-72 overflow-hidden" shouldFilter={false}>
                        <CommandList className="max-h-60 overflow-y-auto">
                          <CommandEmpty className="py-4 text-center text-sm">
                            No hay resultados.
                          </CommandEmpty>
                          {filterByCode(options).map(optionItem)}
                        </CommandList>
                      </Command>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <Command className="max-h-72 overflow-hidden" shouldFilter={false}>
                    <CommandList className="max-h-60 overflow-y-auto">
                      <CommandEmpty className="py-4 text-center text-sm">
                        No hay resultados.
                      </CommandEmpty>
                      {filteredOptions.map(optionItem)}
                    </CommandList>
                  </Command>
                )}
              </PopoverContent>
            </Popover>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
