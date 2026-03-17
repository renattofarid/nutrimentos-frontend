"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { useWindowManager } from "@/stores/window-manager.store";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
      icon?: LucideIcon;
    }[];
  }[];
}) {
  const { state, setOpen } = useSidebar();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const { tabs, activeTabId, openTab } = useWindowManager();

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activePath = activeTab?.path ?? "";

  const isSubItemActive = (url: string): boolean =>
    activePath === url || activePath.startsWith(url + "/");

  const isItemActive = (item: (typeof items)[0]): boolean => {
    if (!item.items) return activePath === item.url;
    return item.items.some((sub) => isSubItemActive(sub.url));
  };

  useEffect(() => {
    const newOpenItems: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.items) {
        newOpenItems[item.title] = isItemActive(item);
      }
    });
    setOpenItems(newOpenItems);
  }, [activePath, items]);

  const handleItemClick = (itemTitle: string, isOpen: boolean) => {
    if (state === "collapsed") {
      setOpen(true);
      setOpenItems((prev) => ({ ...prev, [itemTitle]: true }));
    } else {
      setOpenItems((prev) => ({ ...prev, [itemTitle]: isOpen }));
    }
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) =>
          item.items ? (
            <Collapsible
              key={item.title}
              asChild
              open={openItems[item.title]}
              onOpenChange={(isOpen) => handleItemClick(item.title, isOpen)}
              className="group/collapsible"
            >
              <SidebarMenuItem className="p-0">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isItemActive(item)}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="pr-0 mr-0">
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isSubItemActive(subItem.url)}
                        >
                          <button onClick={() => openTab(subItem.url, subItem.title)}>
                            {subItem.icon && <subItem.icon />}
                            <span>{subItem.title}</span>
                          </button>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isItemActive(item)}
              >
                <button onClick={() => openTab(item.url, item.title)}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
