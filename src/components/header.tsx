import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { NavUser } from "./nav-user";
import { NotificationBell } from "./NotificationBell";
import { TopNav } from "./top-nav";
import { MobileNav } from "./mobile-nav";
import { Wheat } from "lucide-react";
import { useWindowManager } from "@/stores/window-manager.store";

export default function HeaderComponent() {
  const { user } = useAuthStore();
  const { openTab } = useWindowManager();

  if (!user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-3 border-b px-4 bg-quaternary/80 backdrop-blur-md">
      {/* Mobile: hamburger */}
      <div className="md:hidden">
        <MobileNav />
      </div>

      {/* Logo — only visible on desktop (lg+) */}
      <button
        onClick={() => openTab("/inicio", "Dashboard")}
        className="hidden lg:flex items-center gap-2 shrink-0 mr-2"
      >
        <div className="bg-sidebar-primary text-primary-foreground flex aspect-square size-7 items-center justify-center rounded-sm">
          <Wheat className="size-4" />
        </div>
        <div className="grid text-left leading-tight">
          <span className="text-sm font-bold text-primary truncate">Grupo el Milagro</span>
          <span className="text-xs truncate">Nutrialimentos</span>
        </div>
      </button>

      {/* Desktop navigation */}
      <div className="hidden md:flex flex-1 min-w-0">
        <TopNav />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 shrink-0 ml-auto">
        <NotificationBell />
        <NavUser user={user} />
      </div>
    </header>
  );
}
