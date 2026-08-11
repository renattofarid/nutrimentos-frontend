"use client";

import { CheckIcon } from "lucide-react";
import type { Control } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tags,
  TagsContent,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsValue,
} from "./Tags";
import { useFormLayout } from "./GroupFormSection";

interface MultiSelectTagsItem {
  id: number;
  [key: string]: any;
}

interface MultiSelectTagsProps<T extends MultiSelectTagsItem> {
  control: Control<any>;
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  options: T[];
  className?: string;
  getDisplayValue: (item: T) => string;
  getSecondaryText?: (item: T) => string | undefined;
  disabled?: boolean;
  required?: boolean;
}

export function MultiSelectTags<T extends MultiSelectTagsItem>({
  control,
  name,
  label,
  description,
  placeholder = "Selecciona opciones",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron opciones.",
  options,
  className,
  getDisplayValue,
  getSecondaryText,
  disabled = false,
  required = false,
}: MultiSelectTagsProps<T>) {
  const { horizontal, labelWidth } = useFormLayout();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // El field.value contiene los IDs (números)
        const selectedIds: number[] = field.value || [];

        // Obtener los objetos completos basados en los IDs seleccionados
        const selectedItems = options.filter((item) =>
          selectedIds.includes(item.id),
        );

        const handleRemove = (itemId: number) => {
          const newIds = selectedIds.filter((id) => id !== itemId);
          field.onChange(newIds);
        };

        const handleSelect = (item: T) => {
          if (!item || item.id == null) return;
          if (!selectedIds.includes(item.id)) {
            const newIds = [...selectedIds, item.id];
            field.onChange(newIds);
          }
        };

        const isSelected = (itemId: number) => {
          return selectedIds.includes(itemId);
        };

        return (
          <FormItem
            className={cn(
              horizontal
                ? "flex flex-row items-center gap-3"
                : "flex flex-col justify-start gap-0.5",
            )}
          >
            {label && (
              <FormLabel
                className={cn(
                  "flex items-center font-bold uppercase",
                  horizontal
                    ? `${labelWidth} shrink-0 justify-end text-right`
                    : "justify-start",
                )}
              >
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
            )}

            <div
              className={cn(
                horizontal ? "flex-1 min-w-0 flex flex-col gap-0.5" : "contents",
              )}
            >
              {description && (
                <FormDescription className="text-sm text-muted-foreground !mb-0">
                  {description}
                </FormDescription>
              )}
              <FormControl>
                <Tags
                  className={className}
                  value={selectedItems}
                  setValue={() => {
                    // No hacer nada, manejamos cambios con handleSelect/handleRemove
                  }}
                >
                  <TagsTrigger placeholder={placeholder} disabled={disabled}>
                    {selectedItems.map((item: T) => (
                      <TagsValue
                        key={item.id}
                        onRemove={() => handleRemove(item.id)}
                      >
                        {getDisplayValue(item)}
                      </TagsValue>
                    ))}
                  </TagsTrigger>
                  <TagsContent
                    onWheel={(e) => e.stopPropagation()}
                    onWheelCapture={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                  >
                    <TagsInput placeholder={searchPlaceholder} />
                    <TagsList>
                      <TagsEmpty>{emptyMessage}</TagsEmpty>
                      <TagsGroup>
                        {options.map((item) => (
                          <TagsItem
                            key={item.id}
                            onSelect={() => handleSelect(item)}
                            value={getDisplayValue(item)}
                          >
                            <div className="flex-1">
                              <div className="font-medium">
                                {getDisplayValue(item)}
                              </div>
                              {getSecondaryText && getSecondaryText(item) && (
                                <div className="text-xs text-muted-foreground">
                                  {getSecondaryText(item)}
                                </div>
                              )}
                            </div>
                            {isSelected(item.id) && (
                              <CheckIcon
                                className="text-muted-foreground"
                                size={14}
                              />
                            )}
                          </TagsItem>
                        ))}
                      </TagsGroup>
                    </TagsList>
                  </TagsContent>
                </Tags>
              </FormControl>
              <FormMessage />
            </div>
          </FormItem>
        );
      }}
    />
  );
}
