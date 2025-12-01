import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        tertiary:
          "border-transparent-foreground bg-tertiary text-tertiary-foreground hover:bg-tertiary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        ghost:
          "border-transparent bg-ghost text-ghost-foreground hover:bg-ghost/80",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "h-fit py-0.25 px-2 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export type BadgeCustomProps = BadgeProps & {
  tooltip?: React.ReactNode;
  tooltipVariant?: "default" | "secondary" | "tertiary";
};

function getTooltipVariant(variant: BadgeCustomProps["tooltipVariant"]) {
  switch (variant) {
    case "secondary":
      return "!bg-secondary !text-secondary-foreground !fill-secondary";
    case "tertiary":
      return "!bg-tertiary !text-tertiary-foreground !fill-tertiary";
    default:
      return "!bg-primary !text-primary-foreground !fill-primary";
  }
}

function Badge({
  className,
  variant,
  size,
  tooltipVariant,
  tooltip,
  ...props
}: BadgeCustomProps) {
  return tooltip ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(badgeVariants({ variant, size }), className)}
          {...props}
        />
      </TooltipTrigger>
      <TooltipContent className={cn(getTooltipVariant(tooltipVariant))}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  ) : (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
