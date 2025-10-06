import { useState } from "react";
import { useSettings } from "../lib/setting.hook";
import TitleComponent from "@/components/TitleComponent";
import SettingTable from "./SettingTable";
import SettingModal from "./SettingModal";
import { deleteSetting } from "../lib/setting.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { SettingColumns } from "./SettingColumns";
import { SETTING } from "../lib/setting.interface";
import SettingActions from "./SettingActions";

const { MODEL, ICON, TITLES } = SETTING;

export default function SettingPage() {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedSettingId, setSelectedSettingId] = useState<number | null>(
    null
  );

  const { data, isLoading, refetch } = useSettings();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSetting(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : ERROR_MESSAGE(MODEL, "delete");
      errorToast(errorMessage);
    } finally {
      setDeleteId(null);
    }
  };

  const handleCreateSetting = () => {
    setModalMode("create");
    setSelectedSettingId(null);
    setModalOpen(true);
  };

  const handleEditSetting = (id: number) => {
    setModalMode("update");
    setSelectedSettingId(id);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSettingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.plural!}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <SettingActions onCreateSetting={handleCreateSetting} />
      </div>

      <SettingTable
        isLoading={isLoading}
        columns={SettingColumns({
          onEdit: handleEditSetting,
          onDelete: setDeleteId,
        })}
        data={data || []}
      />

      {modalOpen && (
        <SettingModal
          id={selectedSettingId || undefined}
          open={modalOpen}
          title={
            modalMode === "create" ? TITLES.create.title : TITLES.update.title
          }
          mode={modalMode}
          onClose={handleCloseModal}
        />
      )}

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
