import { useEffect, useState } from "react";
import { Menu, Wheat, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { hasAccessToRoute } from "@/App";
import { ENABLE_PERMISSION_VALIDATION } from "@/lib/permissions.config";
import { navData, type NavItem } from "./top-nav";
import { useWindowManager } from "@/stores/window-manager.store";

export function MobileNav() {
  const { access } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [filteredNav, setFilteredNav] = useState<NavItem[]>([]);
  const { tabs, activeTabId, openTab } = useWindowManager();

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activePath = activeTab?.path ?? "";

  // Cerrar al abrir un tab
  const handleOpen = (url: string, title: string) => {
    openTab(url, title);
    setOpen(false);
  };

  useEffect(() => {
    if (!ENABLE_PERMISSION_VALIDATION) {
      setFilteredNav(navData);
      return;
    }
    if (!access) return;

    const filtered = navData.reduce<NavItem[]>((acc, item) => {
      if (item.url === "#" && item.items) {
        const filteredItems = item.items.filter((sub) =>
          hasAccessToRoute(access, sub.url)
        );
        if (filteredItems.length > 0) acc.push({ ...item, items: filteredItems });
      } else if (hasAccessToRoute(access, item.url)) {
        acc.push(item);
      }
      return acc;
    }, []);

    setFilteredNav(filtered);
  }, [access]);

  const isSubItemActive = (url: string) =>
    activePath === url || activePath.startsWith(url + "/");

  const isItemActive = (item: NavItem): boolean => {
    if (!item.items) return activePath === item.url;
    return item.items.some((sub) => isSubItemActive(sub.url));
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="shrink-0"
        aria-label="Abrir menú"
      >
        <Menu className="size-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b shrink-0">
            <SheetTitle asChild>
              <button
                className="flex items-center gap-2 w-full"
                onClick={() => handleOpen("/inicio", "Dashboard")}
              >
                <div className="bg-sidebar-primary text-primary-foreground flex aspect-square size-7 items-center justify-center rounded-sm">
                  <Wheat className="size-4" />
                </div>
                <div className="grid text-left leading-tight">
                  <span className="text-sm font-bold text-primary">Grupo el Milagro</span>
                  <span className="text-xs text-muted-foreground">Nutrialimentos</span>
                </div>
              </button>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex-1 overflow-y-auto py-2">
            <ul className="px-2 space-y-0.5">
              {filteredNav.map((item) =>
                item.items ? (
                  <li key={item.title}>
                    <Collapsible defaultOpen={isItemActive(item)}>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "group w-full justify-between h-8 px-2 font-normal text-sm",
                            isItemActive(item) && "text-primary font-semibold"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            {item.icon && <item.icon className="size-4 shrink-0" />}
                            {item.title}
                          </span>
                          <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <ul className="ml-4 mt-0.5 border-l pl-2 space-y-0.5">
                          {item.items.map((sub) => (
                            <li key={sub.title}>
                              <button
                                onClick={() => handleOpen(sub.url, sub.title)}
                                className={cn(
                                  "w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                                  isSubItemActive(sub.url) &&
                                    "bg-accent/50 text-accent-foreground font-medium"
                                )}
                              >
                                {sub.icon && <sub.icon className="size-4 shrink-0" />}
                                <span>{sub.title}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  </li>
                ) : (
                  <li key={item.title}>
                    <button
                      onClick={() => handleOpen(item.url, item.title)}
                      className={cn(
                        "w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                        isItemActive(item) &&
                          "bg-accent/50 text-accent-foreground font-medium"
                      )}
                    >
                      {item.icon && <item.icon className="size-4 shrink-0" />}
                      <span className="font-medium">{item.title}</span>
                    </button>
                  </li>
                )
              )}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
