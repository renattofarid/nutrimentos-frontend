import { useEffect } from "react";
import HeaderComponent from "./header";
import { AuthInitializer } from "./AuthInitializer";
import { TabBar } from "./window-manager/TabBar";
import { WindowContainer } from "./window-manager/WindowContainer";
import { useWindowManager } from "@/stores/window-manager.store";

export default function LayoutComponent() {
  const { tabs, openTab } = useWindowManager();

  // Abre el Dashboard automáticamente si no hay ningún tab abierto
  useEffect(() => {
    if (tabs.length === 0) {
      openTab("/inicio", "Dashboard");
    }
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AuthInitializer />
      <HeaderComponent />
      <TabBar />
      <WindowContainer />
    </div>
  );
}
