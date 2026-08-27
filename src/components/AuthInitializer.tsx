import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { useEffect } from "react";

export const AuthInitializer = () => {
  const { authenticate, user } = useAuthStore();

  useEffect(() => {
    authenticate();
  }, []);

  // Acento visual del header según la empresa del usuario
  useEffect(() => {
    const root = document.documentElement;
    if (user?.company_id) {
      root.dataset.company = String(user.company_id);
    } else {
      delete root.dataset.company;
    }
  }, [user?.company_id]);

  return null;
};
