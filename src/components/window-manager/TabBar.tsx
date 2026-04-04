import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWindowManager } from "@/stores/window-manager.store";

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useWindowManager();

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-stretch gap-1 px-2 bg-muted/30 border-b shrink-0 min-h-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(
            "group relative flex items-center px-8 rounded-md text-sm cursor-pointer transition-colors shrink-0 max-w-56 select-none",
            tab.id === activeTabId
              ? "bg-primary text-primary-foreground font-medium"
              : "bg-primary/20 text-primary hover:bg-primary/30"
          )}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="truncate">{tab.title}</span>
          <span
            className={cn(
              "absolute top-0.5 right-0.5 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20",
              tab.id === activeTabId && "opacity-60 hover:opacity-100"
            )}
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
            title="Cerrar"
          >
            <X size={10} />
          </span>
        </button>
      ))}
    </div>
  );
}
