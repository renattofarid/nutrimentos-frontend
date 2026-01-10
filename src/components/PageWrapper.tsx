import { cn } from "@/lib/utils";

interface Props {
  children?: React.ReactNode;
  fluid?: boolean;
}

export default function PageWrapper({ children, fluid }: Props) {
  return (
    <div
      className={cn(
        "w-full md:px-4 space-y-6",
        !fluid && "max-w-[var(--breakpoint-2xl)] mx-auto"
      )}
    >
      {children}
    </div>
  );
}
