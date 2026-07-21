import { Building2 } from "lucide-react";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { NavUser } from "./nav-user";
import { NotificationBell } from "./NotificationBell";
import { TopNav } from "./top-nav";
import { MobileNav } from "./mobile-nav";
import { Badge } from "./ui/badge";

export default function HeaderComponent() {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  return (
    <header className="bg-primary py-2 sticky top-0 z-50 flex h-fit shrink-0 items-center gap-3 border-b px-4 bg-quaternary/80 backdrop-blur-md">
      {/* Mobile: hamburger */}
      <div className="md:hidden">
        <MobileNav />
      </div>

      {/* Desktop navigation */}
      <div className="hidden md:flex flex-1 min-w-0 justify-start">
        <TopNav />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        {user.company && (
          <Badge variant="default" color="sky" size="lg" icon={Building2}>
            <span className="truncate">{user.company}</span>
          </Badge>
        )}
        <NotificationBell />
        <NavUser user={user} />
      </div>
    </header>
  );
}
