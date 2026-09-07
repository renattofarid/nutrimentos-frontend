import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { DEFAULT_COMPANY_ID } from "@/lib/config";
import { useEffect } from "react";

export const AuthInitializer = () => {
  const { authenticate, user } = useAuthStore();

  useEffect(() => {
    authenticate();
  }, []);

  // Acento visual del header según la empresa del usuario
  useEffect(() => {
    // main.tsx ya deja seteado el acento por defecto de esta instancia
    // (VITE_DEFAULT_COMPANY_ID). Aquí solo lo sobreescribimos si el usuario
    // autenticado pertenece a otra empresa; si no hay usuario, mantenemos
    // el acento por defecto en vez de quitarlo.
    const root = document.documentElement;
    root.dataset.company = String(user?.company_id ?? DEFAULT_COMPANY_ID);
  }, [user?.company_id]);

  return null;
};
