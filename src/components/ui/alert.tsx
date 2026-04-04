import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "grid gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4 w-full relative group/alert",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        info: "text-blue-600 bg-blue-50 *:data-[slot=alert-description]:text-blue-600/90 *:[svg]:text-blue-600 border-blue-200 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-50 dark:*:[svg]:text-blue-50",
        destructive:
          "text-destructive bg-card *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current border-destructive dark:border-destructive/50 dark:bg-destructive/10 dark:text-destructive dark:*:[svg]:text-destructive",
        warning:
          "text-amber-600 bg-amber-50 *:data-[slot=alert-description]:text-amber-600/90 *:[svg]:text-amber-600 border-amber-200 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50 dark:*:[svg]:text-amber-50",
        success:
          "text-green-600 bg-green-50 *:data-[slot=alert-description]:text-green-600/90 *:[svg]:text-green-600 border-green-200 dark:border-green-900 dark:bg-green-950 dark:text-green-50 dark:*:[svg]:text-green-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground! text-sm text-balance md:text-pretty [&_p:not(:last-child)]:mb-4 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3",
        className,
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2 right-2", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
