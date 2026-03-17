import { useEffect } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { AppRoutes } from "@/components/AppRoutes";
import { useWindowManager } from "@/stores/window-manager.store";

/**
 * Vive DENTRO de cada MemoryRouter y sincroniza el path actual
 * con el store para que el sidebar pueda marcar el item activo correcto.
 */
function RouteTracker({ tabId }: { tabId: string }) {
  const location = useLocation();
  const { updateTabPath } = useWindowManager();

  useEffect(() => {
    updateTabPath(tabId, location.pathname);
  }, [location.pathname, tabId]);

  return null;
}

/**
 * Una sola ventana — tiene su propio MemoryRouter aislado.
 * Persiste mientras el tab exista (aunque esté oculto con display:none).
 */
function WindowFrame({
  tabId,
  initialPath,
}: {
  tabId: string;
  initialPath: string;
}) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <RouteTracker tabId={tabId} />
      <AppRoutes />
    </MemoryRouter>
  );
}

/**
 * Renderiza todos los tabs a la vez; solo el activo es visible (display:block).
 * El resto quedan montados pero ocultos (display:none) — su estado se preserva.
 */
export function WindowContainer() {
  const { tabs, activeTabId } = useWindowManager();

  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p className="text-sm">Selecciona una opción del menú para comenzar</p>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className="absolute inset-0 overflow-auto"
          style={{ display: tab.id === activeTabId ? "block" : "none" }}
        >
          <WindowFrame tabId={tab.id} initialPath={tab.initialPath} />
        </div>
      ))}
    </div>
  );
}
