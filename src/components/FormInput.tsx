import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Control } from "react-hook-form";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import RequiredField from "./RequiredField";
import { cn } from "@/lib/utils";
import { useFormLayout } from "./GroupFormSection";

interface FormInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "name"
> {
  name: string;
  description?: string;
  label?: string | React.ReactNode;
  control?: Control<any>;
  tooltip?: string | React.ReactNode;
  children?: React.ReactNode;
  required?: boolean;
  addonStart?: React.ReactNode;
  addonEnd?: React.ReactNode;
  error?: string;
  uppercase?: boolean;
  horizontalField?: boolean; // Nueva prop para forzar layout horizontal
}

export function FormInput({
  name,
  description,
  label,
  control,
  tooltip,
  children,
  required,
  className,
  addonStart,
  addonEnd,
  error,
  value,
  onChange,
  uppercase,
  horizontalField = false,
  ...inputProps
}: FormInputProps) {
  const isNumberType = inputProps.type === "number";
  const { horizontal } = useFormLayout();

  // Si no hay control, funcionar como input controlado estándar
  if (!control) {
    const handleStandaloneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        if (isNumberType) {
          const val = e.target.value;
          // Crear un evento sintético con el valor numérico
          const syntheticEvent = {
            ...e,
            target: {
              ...e.target,
              value: val === "" ? "" : Number(val),
            },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        } else {
          const val = uppercase ? e.target.value.toUpperCase() : e.target.value;
          const syntheticEvent = {
            ...e,
            target: {
              ...e.target,
              value: val,
            },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }
      }
    };

    const standaloneLabelNode = label ? (
      <label
        className={cn(
          "flex items-center text-xs md:text-sm leading-none font-bold uppercase text-muted-foreground",
          horizontal
            ? "w-48 shrink-0 justify-end text-right"
            : horizontalField
              ? "shrink-0 justify-end text-right"
              : "justify-start h-fit mb-0.5",
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
      </label>
    ) : null;

    return (
      <div
        className={cn(
          horizontal || horizontalField
            ? "flex flex-row items-center gap-3"
            : "flex flex-col justify-between",
        )}
      >
        {standaloneLabelNode}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <div className="flex flex-col gap-2 items-center">
            <div className="relative w-full">
              {addonStart && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground pointer-events-none z-10">
                  {addonStart}
                </div>
              )}
              <Input
                name={name}
                className={cn(
                  "h-7 md:h-8 text-xs md:text-sm",
                  addonStart && "pl-10",
                  addonEnd && "pr-10",
                  className,
                )}
                {...inputProps}
                onChange={handleStandaloneChange}
                value={value ?? ""}
              />
              {addonEnd && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground z-10">
                  {addonEnd}
                </div>
              )}
            </div>
            {children}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {error && (
            <p className="text-xs font-medium text-destructive mt-1">{error}</p>
          )}
        </div>
      </div>
    );
  }

  // Si hay control, funcionar como FormField (comportamiento original)
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          if (isNumberType) {
            const val = e.target.value;
            // Permitir string vacío temporalmente
            field.onChange(val === "" ? "" : Number(val));
          } else {
            const val = uppercase
              ? e.target.value.toUpperCase()
              : e.target.value;
            field.onChange(val);
          }
        };

        const labelNode = label ? (
          <FormLabel
            className={cn(
              "flex items-center text-xs md:text-sm leading-none font-bold uppercase dark:text-muted-foreground",
              horizontal
                ? "w-48 shrink-0 justify-end text-right"
                : horizontalField
                  ? "shrink-0 justify-end text-right"
                  : "justify-start h-fit",
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
        ) : null;

        const inputNode = (
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex flex-col gap-2 items-center">
              <div className="relative w-full">
                {addonStart && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground pointer-events-none z-10">
                    {addonStart}
                  </div>
                )}
                <FormControl>
                  <Input
                    className={cn(
                      "h-7 md:h-8 text-xs md:text-sm",
                      addonStart && "pl-10",
                      addonEnd && "pr-10",
                      className,
                    )}
                    {...field}
                    {...inputProps}
                    onChange={handleChange}
                    value={field.value ?? ""}
                  />
                </FormControl>
                {addonEnd && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground z-10">
                    {addonEnd}
                  </div>
                )}
              </div>
              {children}
            </div>
            {description && (
              <FormDescription className="text-xs text-muted-foreground mb-0!">
                {description}
              </FormDescription>
            )}
            <FormMessage />
          </div>
        );

        return (
          <FormItem
            className={cn(
              horizontal || horizontalField
                ? "flex flex-row items-center gap-3"
                : "flex flex-col justify-between gap-0.5",
            )}
          >
            {labelNode}
            {inputNode}
          </FormItem>
        );
      }}
    />
  );
}
