import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import type { Control } from "react-hook-form";

interface FormInputProps {
  name: string;
  description?: string;
  label: string | (() => React.ReactNode);
  placeholder?: string;
  control: Control<any>;
  disabled?: boolean;
  tooltip?: string | React.ReactNode;
  type?: "text" | "number" | "email" | "password" | "tel" | "url";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  autoComplete?: string;
  onChange?: (value: any) => void;
}

export function FormInput({
  name,
  description,
  label,
  placeholder,
  control,
  disabled,
  tooltip,
  type = "text",
  variant = "default",
  className,
  maxLength,
  min,
  max,
  step,
  autoComplete,
  onChange,
}: FormInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col justify-start">
          {typeof label === "function" ? (
            label()
          ) : (
            <FormLabel className="flex justify-start items-center">
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

          <FormControl>
            <Input
              type={type}
              variant={variant}
              placeholder={placeholder}
              className={className}
              maxLength={maxLength}
              min={min}
              max={max}
              step={step}
              autoComplete={autoComplete}
              disabled={disabled}
              {...field}
              onChange={(e) => {
                const value = type === "number" ? Number(e.target.value) : e.target.value;
                field.onChange(value);
                onChange?.(value);
              }}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
