import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { createContext, useContext, type ReactNode } from "react";

interface FormLayoutContextValue {
  horizontal: boolean;
}

export const FormLayoutContext = createContext<FormLayoutContextValue>({
  horizontal: false,
});

export const useFormLayout = () => useContext(FormLayoutContext);

interface FormSectionProps {
  horizontal?: boolean;
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  children: ReactNode;
  cols?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6;
    md?: 1 | 2 | 3 | 4 | 5 | 6;
    lg?: 1 | 2 | 3 | 4 | 5 | 6;
    xl?: 1 | 2 | 3 | 4 | 5 | 6;
    "2xl"?: 1 | 2 | 3 | 4 | 5 | 6;
  };
  className?: string;
  gap?: string;
  headerExtra?: ReactNode;
  bordered?: boolean;
}

const colsMap = {
  sm: {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
    5: "sm:grid-cols-5",
    6: "sm:grid-cols-6",
  },
  md: {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
  },
  lg: {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
  },
  xl: {
    1: "xl:grid-cols-1",
    2: "xl:grid-cols-2",
    3: "xl:grid-cols-3",
    4: "xl:grid-cols-4",
    5: "xl:grid-cols-5",
    6: "xl:grid-cols-6",
  },
  "2xl": {
    1: "2xl:grid-cols-1",
    2: "2xl:grid-cols-2",
    3: "2xl:grid-cols-3",
    4: "2xl:grid-cols-4",
    5: "2xl:grid-cols-5",
    6: "2xl:grid-cols-6",
  },
} as const;

export const GroupFormSection = ({
  title,
  icon: Icon,
  iconColor = "text-primary dark:text-primary-foreground",
  bgColor = "bg-muted",
  children,
  cols = { sm: 2, md: 3, lg: 4 },
  className,
  gap = "gap-3",
  headerExtra,
  horizontal = false,
  bordered = true,
}: FormSectionProps) => {
  const gridClasses = [
    "grid",
    "grid-cols-1",
    cols.sm && colsMap.sm[cols.sm],
    cols.md && colsMap.md[cols.md],
    cols.lg && colsMap.lg[cols.lg],
    cols.xl && colsMap.xl[cols.xl],
    cols["2xl"] && colsMap["2xl"][cols["2xl"]],
    gap,
    "items-start",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cn(
        bordered
          ? "relative rounded-md border border-muted bg-background shadow-sm"
          : "bg-background rounded-md border border-muted shadow-sm overflow-hidden",
        className,
      )}
    >
      {!bordered && (
        <div className={`${bgColor} px-2 py-0 border-b border-muted`}>
          <div className="flex flex-row flex-wrap justify-between sm:items-center gap-3">
            <h3
              className={cn(
                "text-xs md:text-sm font-semibold flex items-center",
                iconColor,
              )}
            >
              <Icon className={`size-2 md:size-3 mr-2`} />
              {title}
            </h3>
            {headerExtra}
          </div>
        </div>
      )}
      {bordered && (
        <span
          className={cn(
            "absolute -top-1.5 left-3 px-1 bg-background text-xs font-semibold flex items-center gap-1",
            iconColor,
          )}
        >
          <Icon className="size-2 md:size-3" />
          {title}
        </span>
      )}
      <div className={bordered ? "p-2 pt-4" : "p-2"}>
        <FormLayoutContext.Provider value={{ horizontal }}>
          <div className={cn(gridClasses)}>{children}</div>
        </FormLayoutContext.Provider>
      </div>
    </div>
  );
};
