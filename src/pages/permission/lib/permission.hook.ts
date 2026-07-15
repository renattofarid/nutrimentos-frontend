import { useEffect } from "react";
import { usePermissionCrudStore } from "./permission.store";

export function usePermissionsCrud() {
  const { permissions, isLoading, error, fetchPermissions } =
    usePermissionCrudStore();

  useEffect(() => {
    if (!permissions) fetchPermissions();
  }, [permissions, fetchPermissions]);

  return {
    data: permissions ?? [],
    isLoading,
    error,
    refetch: fetchPermissions,
  };
}
