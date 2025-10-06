import { useEffect } from "react";
import { useSettingStore } from "./setting.store";

export function useSettings() {
  const { settings, isLoading, error, fetchSettings } = useSettingStore();

  useEffect(() => {
    if (!settings) fetchSettings();
  }, [settings, fetchSettings]);

  return {
    data: settings,
    isLoading,
    error,
    refetch: fetchSettings,
  };
}

export function useSettingById(id: number) {
  const { setting, isFinding, error, fetchSetting } = useSettingStore();

  useEffect(() => {
    if (id) {
      fetchSetting(id);
    }
  }, [id, fetchSetting]);

  return {
    data: setting,
    isFinding,
    error,
    refetch: () => fetchSetting(id),
  };
}
