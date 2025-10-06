import { DataTable } from "@/components/ui/data-table";
import { SettingColumns } from "./SettingColumns";
import { useSettings, useDeleteSetting } from "../lib/setting.hook";
import { useSettingStore } from "../lib/setting.store";

export const SettingTable = () => {
  const { data, isLoading } = useSettings();
  const { setSettingModal, setSettingIdEdit } = useSettingStore();
  const deleteMutation = useDeleteSetting();

  const handleEdit = (id: number) => {
    setSettingIdEdit(id);
    setSettingModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta configuración?")) {
      deleteMutation.mutate(id);
    }
  };

  const columns = SettingColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return <DataTable columns={columns} data={data || []} />;
};
