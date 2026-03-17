import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { useAuthStore } from "./pages/auth/lib/auth.store";
import LoginPage from "./pages/auth/components/Login";
import LayoutComponent from "./components/layout";
import type { Access } from "./pages/auth/lib/auth.interface";

export const hasAccessToRoute = (access: Access[], route: string): boolean => {
  const transformRoute = route.split("/").pop();
  for (const node of access) {
    if (node.permissions.some((p) => p.routes.includes(transformRoute!))) {
      return true;
    }
    if (node.children && hasAccessToRoute(node.children, transformRoute!)) {
      return true;
    }
  }
  return false;
};

export default function App() {
  const { token } = useAuthStore();

  if (token) {
    // Layout uses MemoryRouter per tab — must NOT be inside a BrowserRouter
    return (
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <LayoutComponent />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
