import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWindowManager } from "@/stores/window-manager.store";

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useWindowManager();

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-end gap-0 px-2 pt-1.5 bg-muted/30 border-b shrink-0 min-h-[42px]">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            "group flex items-center gap-2 px-4 py-2 rounded-t-md text-sm cursor-pointer border border-b-0 transition-colors shrink-0 max-w-56 select-none",
            tab.id === activeTabId
              ? "bg-primary border-primary text-primary-foreground font-medium -mb-px pb-[9px]"
              : "bg-primary/20 border-transparent text-primary hover:text-primary hover:bg-primary/30"
          )}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="truncate">{tab.title}</span>
          <button
            className={cn(
              "shrink-0 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20",
              tab.id === activeTabId && "opacity-60 hover:opacity-100"
            )}
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
            title="Cerrar"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
