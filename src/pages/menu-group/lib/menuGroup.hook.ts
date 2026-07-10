import { useEffect } from "react";
import { useMenuGroupStore } from "./menuGroup.store";

export function useMenuGroups() {
  const { menuGroups, isLoading, error, fetchMenuGroups } =
    useMenuGroupStore();

  useEffect(() => {
    if (!menuGroups) fetchMenuGroups();
  }, [menuGroups, fetchMenuGroups]);

  return {
    data: menuGroups ?? [],
    isLoading,
    error,
    refetch: fetchMenuGroups,
  };
}
