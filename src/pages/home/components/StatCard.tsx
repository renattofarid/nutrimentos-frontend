import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Variant = "primary" | "destructive" | "secondary" | "accent" | "success" | "warning"

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  variant?: Variant
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "primary",
}: StatCardProps) {
  const variantStyles: Record<Variant, string> = {
    primary: "bg-primary/10 border-primary/20",
    destructive: "bg-destructive/10 border-destructive/20",
    secondary: "bg-secondary/10 border-secondary/20",
    accent: "bg-accent/10 border-accent/20",
    success: "bg-green-500/10 border-green-500/20",
    warning: "bg-orange-500/10 border-orange-500/20",
  }

  const textStyles: Record<Variant, string> = {
    primary: "text-primary",
    destructive: "text-destructive",
    secondary: "text-secondary",
    accent: "text-accent",
    success: "text-green-600 dark:text-green-500",
    warning: "text-orange-600 dark:text-orange-500",
  }

  return (
    <div
      className={cn(
        "rounded-xl p-5 shadow-sm border transition-all hover:shadow-md",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p
            className={cn(
              "text-2xl md:text-3xl font-bold tracking-tight",
              textStyles[variant]
            )}
          >
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className={cn("rounded-lg p-2", variantStyles[variant])}>
          <Icon className={cn("h-8 w-8 md:h-10 md:w-10", textStyles[variant])} />
        </div>
      </div>
    </div>
  )
}
