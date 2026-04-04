import { ChevronDown } from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { hasAccessToRoute } from "@/App";
import { ENABLE_PERMISSION_VALIDATION } from "@/lib/permissions.config";
import { useWindowManager } from "@/stores/window-manager.store";
import { buttonVariants } from "./ui/button";
import { navData, type NavItem } from "./nav-data";

export type { NavSubItem, NavItem } from "./nav-data";
export { navData } from "./nav-data";

export function TopNav() {
  const { access } = useAuthStore();
  const [filteredNav, setFilteredNav] = useState<NavItem[]>([]);
  const { tabs, activeTabId, openTab } = useWindowManager();

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activePath = activeTab?.path ?? "";

  useEffect(() => {
    if (!ENABLE_PERMISSION_VALIDATION) {
      setFilteredNav(navData);
      return;
    }
    if (!access) return;

    const filterNav = (items: NavItem[]): NavItem[] =>
      items.reduce<NavItem[]>((acc, item) => {
        if (item.url === "#" && item.items) {
          const filteredItems = item.items.filter((sub) =>
            hasAccessToRoute(access, sub.url),
          );
          if (filteredItems.length > 0) {
            acc.push({ ...item, items: filteredItems });
          }
        } else if (hasAccessToRoute(access, item.url)) {
          acc.push(item);
        }
        return acc;
      }, []);

    setFilteredNav(filterNav(navData));
  }, [access]);

  const isSubItemActive = (url: string) =>
    activePath === url || activePath.startsWith(url + "/");

  const isItemActive = (item: NavItem): boolean => {
    if (!item.items) return activePath === item.url;
    return item.items.some((sub) => isSubItemActive(sub.url));
  };

  return (
    <Menubar className="border-none shadow-none bg-transparent h-auto p-0 gap-1">
      {filteredNav.map((item) =>
        item.items ? (
          <MenubarMenu key={item.title}>
            <MenubarTrigger
              className={cn(
                buttonVariants({ variant: "default", color: "muted" }),
                "h-7 text-sm px-1.5 uppercase cursor-pointer text-zinc-700 font-semibold",
                isItemActive(item) && "font-bold",
              )}
            >
              {item.title}
              <ChevronDown className="ml-1 size-3 opacity-60" />
            </MenubarTrigger>
            <MenubarContent className="min-w-52">
              {item.items.map((sub) => (
                <MenubarItem
                  key={sub.title}
                  onClick={() => openTab(sub.url, sub.title)}
                  className={cn(
                    "gap-1.5 uppercase cursor-pointer text-zinc-700",
                    isSubItemActive(sub.url) &&
                      "bg-accent/50 text-accent-foreground font-bold",
                  )}
                >
                  {sub.icon && <sub.icon className="size-3.5 shrink-0" />}
                  <span>{sub.title}</span>
                </MenubarItem>
              ))}
            </MenubarContent>
          </MenubarMenu>
        ) : (
          <MenubarMenu key={item.title}>
            <MenubarTrigger
              onClick={() => openTab(item.url, item.title)}
              className={cn(
                buttonVariants({ variant: "default", color: "muted" }),
                "h-7 text-sm px-1.5 uppercase cursor-pointer text-zinc-700 font-semibold",
                isItemActive(item) && "font-bold",
              )}
            >
              {item.title}
            </MenubarTrigger>
          </MenubarMenu>
        ),
      )}
    </Menubar>
  );
}
