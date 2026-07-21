"use client";

import {
  ChevronsUpDown,
  LogOut,
  Monitor,
  Moon,
  Sun,
  SunMoon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import type { User } from "@/pages/auth/lib/auth.interface";
import { configNavItem, securityNavItem } from "./nav-data";
import { useWindowManager } from "@/stores/window-manager.store";
import { useTheme } from "./theme-provider";

export function NavUser({ user }: { user: User }) {
  const { clearAuth } = useAuthStore();
  const { openTab } = useWindowManager();
  const { setTheme } = useTheme();

  const initials = (name: string, max = 2) =>
    name
      .split(" ")
      .slice(0, max)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" color="muted" size="xs">
          <Avatar className="h-6 w-6 rounded-lg">
            <AvatarFallback className="rounded-lg">
              {user.name && initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <ChevronsUpDown className="size-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-6 w-6 rounded-lg">
              <AvatarFallback className="rounded-lg">
                {user.name && initials(user.name, 3)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.username}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {[configNavItem, securityNavItem].map((group) => (
          <DropdownMenuSub key={group.title}>
            <DropdownMenuSubTrigger className="gap-1.5 uppercase text-foreground">
              {group.icon && <group.icon className="size-3.5 shrink-0" />}
              <span>{group.title}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="min-w-48">
              {group.items?.map((sub) => (
                <DropdownMenuItem
                  key={sub.url}
                  onClick={() => openTab(sub.url, sub.title)}
                  className="gap-1.5 uppercase text-foreground cursor-pointer"
                >
                  {sub.icon && <sub.icon className="size-3.5 shrink-0" />}
                  <span>{sub.title}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-1.5 uppercase text-foreground">
            <SunMoon className="size-3.5 shrink-0" />
            <span>Tema</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-48">
            <DropdownMenuItem
              onClick={() => setTheme("light")}
              className="gap-2"
            >
              <Sun className="w-4 h-4" />
              <p>Claro</p>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("dark")}
              className="gap-2"
            >
              <Moon className="w-4 h-4" />
              <p>Oscuro</p>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("system")}
              className="gap-2"
            >
              <Monitor className="w-4 h-4" />
              <p>Sistema</p>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={clearAuth}>
          <LogOut />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
