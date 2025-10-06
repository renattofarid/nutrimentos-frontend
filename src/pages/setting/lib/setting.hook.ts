import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSettings,
  createSetting,
  updateSetting,
  deleteSetting,
} from "./setting.actions";
import { toast } from "sonner";
import { SETTING } from "./setting.interface";

const { MODEL } = SETTING;

export const useSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });
};

export const useCreateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success(`${MODEL.name} creada correctamente`);
    },
    onError: () => {
      toast.error(`Error al crear ${MODEL.name}`);
    },
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateSetting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success(`${MODEL.name} actualizada correctamente`);
    },
    onError: () => {
      toast.error(`Error al actualizar ${MODEL.name}`);
    },
  });
};

export const useDeleteSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success(`${MODEL.name} eliminada correctamente`);
    },
    onError: () => {
      toast.error(`Error al eliminar ${MODEL.name}`);
    },
  });
};
