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
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Control } from "react-hook-form";
import { useController } from "react-hook-form";
import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import type { Option } from "@/lib/core.interface";
import RequiredField from "./RequiredField";

interface FormSelectAsyncProps {
  name: string;
  description?: string;
  label?: string | (() => React.ReactNode);
  placeholder?: string;
  control: Control<any>;
  disabled?: boolean;
  tooltip?: string | React.ReactNode;
  classNameOption?: string;
  withValue?: boolean;
  children?: React.ReactNode;
  className?: string;
  required?: boolean;
  useQueryHook: (params: {
    search?: string;
    2?: number;
    per_page?: number;
    [key: string]: any;
  }) => {
    data?: { data: any[]; meta?: { last_page?: number } };
    isLoading: boolean;
    isFetching?: boolean;
  };
  mapOptionFn: (item: any) => Option;
  perPage?: number;
  debounceMs?: number;
  defaultOption?: Option;
  additionalParams?: Record<string, any>;
  onValueChange?: (value: string, item?: any) => void;
  preloadItemId?: string;
  uppercase?: boolean;
}

function getOptionLabel(opt: Option): string {
  if (typeof opt.label === "string") return opt.label;
  return opt.value;
}

export function FormSelectAsync({
  name,
  description,
  label,
  placeholder,
  control,
  disabled,
  tooltip,
  classNameOption,
  withValue = true,
  children,
  className,
  required = false,
  useQueryHook,
  mapOptionFn,
  perPage = 10,
  debounceMs = 500,
  defaultOption,
  additionalParams = {},
  onValueChange,
  preloadItemId,
  uppercase = false,
}: FormSelectAsyncProps) {
  const { field: controlField } = useController({ name, control });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [allOptions, setAllOptions] = useState<Option[]>(
    defaultOption ? [defaultOption] : [],
  );
  const [selectedOption, setSelectedOption] = useState<Option | null>(
    defaultOption || null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const rawItemsMap = useRef<Map<string, any>>(new Map());
  const hasAutoSelected = useRef(false);
  const displayLabelRef = useRef("");
  const mapOptionFnRef = useRef(mapOptionFn);
  mapOptionFnRef.current = mapOptionFn;
  const onValueChangeRef = useRef(onValueChange);
  onValueChangeRef.current = onValueChange;
  const controlFieldRef = useRef(controlField);
  controlFieldRef.current = controlField;

  const { data, isLoading, isFetching } = useQueryHook({
    search: debouncedSearch,
    page,
    per_page: perPage,
    ...additionalParams,
  });

  // Debounce search → API call
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      if (debouncedSearch !== search) {
        setDebouncedSearch(search);
        setPage(1);
        if (search !== "" || open) {
          setAllOptions([]);
        }
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [search, debounceMs, debouncedSearch, open]);

  // Accumulate options from API
  useEffect(() => {
    if (data?.data) {
      const newOptions = data.data.map(mapOptionFnRef.current);
      for (const item of data.data) {
        const opt = mapOptionFnRef.current(item);
        rawItemsMap.current.set(opt.value, item);
      }
      if (page === 1) {
        setAllOptions(newOptions);
      } else {
        setAllOptions((prev) => {
          const existingIds = new Set(prev.map((opt) => opt.value));
          const uniqueNew = newOptions.filter(
            (opt) => !existingIds.has(opt.value),
          );
          return [...prev, ...uniqueNew];
        });
      }
    }
  }, [data, page]);

  // Preload item by id (paginate until found)
  useEffect(() => {
    if (
      preloadItemId &&
      !isLoading &&
      !isFetching &&
      data?.meta?.last_page &&
      page < data.meta.last_page
    ) {
      const itemFound = allOptions.some((opt) => opt.value === preloadItemId);
      if (!itemFound) {
        setPage((prev) => prev + 1);
      }
    }
  }, [preloadItemId, allOptions, isLoading, isFetching, data?.meta?.last_page, page]);

  // Auto-select preloaded item
  useEffect(() => {
    if (!preloadItemId || hasAutoSelected.current || controlFieldRef.current.value) return;
    const found = allOptions.find((opt) => opt.value === preloadItemId);
    if (found) {
      hasAutoSelected.current = true;
      controlFieldRef.current.onChange(preloadItemId);
      setSelectedOption(found);
      if (onValueChangeRef.current) {
        const rawItem = rawItemsMap.current.get(preloadItemId);
        onValueChangeRef.current(preloadItemId, rawItem);
      }
    }
  }, [allOptions, preloadItemId]);

  // Infinite scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const bottom =
        target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
      if (
        bottom &&
        !isLoading &&
        !isFetching &&
        data?.meta?.last_page &&
        page < data.meta.last_page
      ) {
        setPage((prev) => prev + 1);
      }
    },
    [isLoading, isFetching, data?.meta?.last_page, page],
  );

  const handleFocus = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setSearch("");
    setPage(1);
    setOpen(true);

    if (debouncedSearch === "") {
      // La query no va a refetchear porque debouncedSearch no cambia.
      // Repoblar desde el cache inmediatamente.
      if (data?.data) {
        const newOptions = data.data.map(mapOptionFnRef.current);
        for (const item of data.data) {
          const opt = mapOptionFnRef.current(item);
          rawItemsMap.current.set(opt.value, item);
        }
        setAllOptions(newOptions);
      }
    } else {
      setDebouncedSearch("");
      setAllOptions([]);
    }
  };

  const handleBlur = () => {
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      setSearch("");
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
        const selected =
          allOptions.find((opt) => opt.value === field.value) ||
          (field.value && selectedOption?.value === field.value
            ? selectedOption
            : null);

        const displayLabel = selected ? getOptionLabel(selected) : "";
        displayLabelRef.current = displayLabel;

        const handleSelect = (option: Option) => {
          const newValue =
            option.value === field.value ? "" : option.value;
          field.onChange(newValue);
          setSelectedOption(newValue ? option : null);
          if (onValueChange) {
            const selectedItem = rawItemsMap.current.get(option.value);
            onValueChange(newValue, selectedItem);
          }
          if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
          setOpen(false);
          setSearch("");
        };

        const handleClear = (e: React.MouseEvent) => {
          e.stopPropagation();
          field.onChange("");
          setSelectedOption(null);
          if (onValueChange) onValueChange("");
        };

        return (
          <FormItem className="flex flex-col justify-between gap-0.5">
            {label && typeof label === "function"
              ? label()
              : label && (
                  <FormLabel
                    className={cn(
                      "flex justify-start items-center",
                      uppercase && "uppercase",
                    )}
                  >
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

            <div className="flex gap-2 items-center">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverAnchor asChild>
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        value={open ? search : displayLabel}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onMouseDown={(e) => {
                          if (!open && !disabled && document.activeElement === e.currentTarget) {
                            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                            setSearch("");
                            setPage(1);
                            setOpen(true);
                            if (debouncedSearch === "") {
                              if (data?.data) {
                                const newOptions = data.data.map(mapOptionFnRef.current);
                                for (const item of data.data) {
                                  const opt = mapOptionFnRef.current(item);
                                  rawItemsMap.current.set(opt.value, item);
                                }
                                setAllOptions(newOptions);
                              }
                            } else {
                              setDebouncedSearch("");
                              setAllOptions([]);
                            }
                          }
                        }}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={cn(
                          "h-8 pr-8 text-sm",
                          field.value && !open && "bg-muted",
                          uppercase && "uppercase",
                          className,
                        )}
                        autoComplete="off"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                        {(isLoading || isFetching) && open ? (
                          <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        ) : field.value && !disabled ? (
                          <button
                            type="button"
                            tabIndex={-1}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleClear}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        ) : null}
                        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50 pointer-events-none" />
                      </div>
                    </div>
                  </FormControl>
                </PopoverAnchor>

                <PopoverContent
                  className="p-0 min-w-(--radix-popover-trigger-width)! w-auto"
                  onMouseDown={handleListMouseDown}
                  onWheel={(e) => e.stopPropagation()}
                  onWheelCapture={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onFocusOutside={(e) => e.preventDefault()}
                >
                  <Command className="max-h-72 overflow-hidden" shouldFilter={false}>
                    <CommandList
                      className="max-h-60 overflow-y-auto"
                      ref={scrollRef}
                      onScroll={handleScroll}
                    >
                      {isLoading && page === 1 ? (
                        <div className="py-6 text-center text-sm flex flex-col items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-muted-foreground">
                            Buscando...
                          </span>
                        </div>
                      ) : (
                        <>
                          <CommandEmpty className="py-4 text-center text-sm">
                            No hay resultados.
                          </CommandEmpty>
                          {allOptions.map((option) => (
                            <CommandItem
                              key={option.value}
                              className="cursor-pointer"
                              onSelect={() => handleSelect(option)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 shrink-0",
                                  option.value === field.value
                                    ? "opacity-100"
                                    : "opacity-0",
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
                                    {withValue && `${option.value} - `}{" "}
                                    {option.description}
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                          {isFetching && page > 1 && (
                            <div className="py-2 text-center text-sm flex items-center justify-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin text-primary" />
                              <span className="text-xs text-muted-foreground">
                                Cargando más...
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {children}
            </div>

            {description && (
              <FormDescription
                className={cn(
                  "text-xs text-muted-foreground mb-0!",
                  uppercase && "uppercase",
                )}
              >
                {description}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
