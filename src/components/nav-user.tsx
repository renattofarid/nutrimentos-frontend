"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import type { User } from "@/pages/auth/lib/auth.interface";

export function NavUser({ user }: { user: User }) {
  const { clearAuth } = useAuthStore();

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
        <DropdownMenuItem onClick={clearAuth}>
          <LogOut />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
