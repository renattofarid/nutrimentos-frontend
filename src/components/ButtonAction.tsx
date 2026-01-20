import type { LucideIcon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface ButtonActionProps
  extends Omit<ButtonProps, "size" | "children" | "asChild"> {
  icon: LucideIcon;
  canRender?: boolean;
}

export function ButtonAction({
  icon: Icon,
  variant = "outline",
  canRender = true,
  ...props
}: ButtonActionProps) {
  if (!canRender) return null;

  return (
    <Button variant={variant} size="icon-xs" {...props}>
      <Icon />
    </Button>
  );
}
