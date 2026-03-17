import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWindowManager } from "@/stores/window-manager.store";

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useWindowManager();

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-end gap-0 px-2 pt-1 bg-muted/30 border-b overflow-x-auto shrink-0 min-h-[36px]">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            "group flex items-center gap-1.5 px-3 py-1.5 rounded-t-md text-xs cursor-pointer border border-b-0 transition-colors shrink-0 max-w-52 select-none",
            tab.id === activeTabId
              ? "bg-background border-border text-foreground font-medium -mb-px pb-2"
              : "bg-muted/60 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="truncate">{tab.title}</span>
          <button
            className={cn(
              "shrink-0 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive",
              tab.id === activeTabId && "opacity-50 hover:opacity-100"
            )}
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
            title="Cerrar"
          >
            <X size={10} />
          </button>
        </div>
      ))}
    </div>
  );
}
