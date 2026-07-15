import { useAuthStore } from "@/pages/auth/lib/auth.store";
import type { Access, User } from "@/pages/auth/lib/auth.interface";
import { ADMIN_ROLE_ID, ENABLE_PERMISSION_VALIDATION } from "./permissions.config";
import { permissionRouteFor } from "./permission-catalog";

// El backend siempre guarda "list" en Permission.action sin importar la acción
// real (confirmado contra /login y /permission), así que ese campo no sirve
// para distinguir Crear/Editar/Eliminar/etc. La única fuente confiable es la
// ruta compuesta ("modulo.slug-accion"), que ya es única por acción.
export function hasPermission(
  access: Access[] | undefined,
  route: string,
  action: string
): boolean {
  if (!access) return false;
  const composedRoute = permissionRouteFor(route, action);
  for (const node of access) {
    if (node.permissions?.some((p) => p.routes.includes(composedRoute))) {
      return true;
    }
    if (node.children && hasPermission(node.children, route, action)) {
      return true;
    }
  }
  return false;
}

export function isAdminUser(user?: Pick<User, "rol_id"> | null): boolean {
  return user?.rol_id === ADMIN_ROLE_ID;
}

export function usePermission() {
  const access = useAuthStore((s) => s.access);
  const user = useAuthStore((s) => s.user);

  const can = (route: string, action: string) => {
    if (!ENABLE_PERMISSION_VALIDATION) return true;
    if (isAdminUser(user)) return true;
    return hasPermission(access, route, action);
  };

  return { can };
}
