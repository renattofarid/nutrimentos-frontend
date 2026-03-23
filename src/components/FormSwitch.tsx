import type { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useFormLayout } from "./GroupFormSection";

interface FormSwitchProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  text?: string;
  description?: string;
  textDescription?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  autoHeight?: boolean;
}

export function FormSwitch<T extends FieldValues>({
  control,
  name,
  label,
  text,
  description,
  textDescription,
  className,
  disabled,
  size = "sm",
  autoHeight = false,
}: FormSwitchProps<T>) {
  const { horizontal } = useFormLayout();

  const sizeClasses = {
    sm: "h-7 md:h-8 p-2 gap-2",
    md: "h-9 md:h-10 p-3 gap-3",
    lg: "h-11 md:h-12 p-4 gap-4",
  };

  const switchControl = (field: { value: boolean; onChange: (v: boolean) => void }) => (
    <FormLabel
      className={cn(
        "flex flex-row items-center justify-between rounded-lg border shadow-xs bg-background hover:bg-muted hover:cursor-pointer",
        horizontal ? "flex-1 min-w-0" : "",
        className,
        autoHeight ? "h-auto" : sizeClasses[size],
      )}
    >
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {text && <p className="text-sm font-medium leading-tight">{text}</p>}
        {textDescription && (
          <p className="text-xs text-muted-foreground font-normal leading-tight">
            {textDescription}
          </p>
        )}
      </div>
      <FormControl>
        <Switch
          checked={field.value}
          onCheckedChange={field.onChange}
          disabled={disabled}
          className="shrink-0"
        />
      </FormControl>
    </FormLabel>
  );

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) =>
        horizontal ? (
          <FormItem className="flex flex-row items-center gap-3">
            {label && (
              <span className="w-48 shrink-0 text-right text-xs font-bold uppercase text-muted-foreground leading-none">
                {label}
              </span>
            )}
            {switchControl(field)}
            {description && (
              <FormDescription className="text-xs font-normal">
                {description}
              </FormDescription>
            )}
          </FormItem>
        ) : (
          <FormItem className="flex flex-col gap-0.5">
            {label && (
              <FormLabel className="h-fit flex font-bold uppercase">
                {label}
              </FormLabel>
            )}
            {switchControl(field)}
            {description && (
              <FormDescription className="text-xs font-normal">
                {description}
              </FormDescription>
            )}
          </FormItem>
        )
      }
    />
  );
}
