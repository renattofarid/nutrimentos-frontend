import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SettingForm } from "./SettingForm";
import { useSettingStore } from "../lib/setting.store";
import {
  useCreateSetting,
  useUpdateSetting,
  useSettings,
} from "../lib/setting.hook";
import { SettingSchemaCreate } from "../lib/setting.schema";
import { SETTING } from "../lib/setting.interface";

const { MODEL } = SETTING;

export const SettingModal = () => {
  const { settingModal, setSettingModal, settingIdEdit, setSettingIdEdit } =
    useSettingStore();

  const { data: settings } = useSettings();
  const createMutation = useCreateSetting();
  const updateMutation = useUpdateSetting();

  const settingToEdit = settings?.find(
    (setting) => setting.id === settingIdEdit
  );

  const handleSubmit = (data: SettingSchemaCreate) => {
    if (settingIdEdit) {
      updateMutation.mutate(
        { id: settingIdEdit, data },
        {
          onSuccess: () => {
            setSettingModal(false);
            setSettingIdEdit(null);
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setSettingModal(false);
        },
      });
    }
  };

  const handleClose = () => {
    setSettingModal(false);
    setSettingIdEdit(null);
  };

  return (
    <Dialog open={settingModal} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {settingIdEdit ? `Editar ${MODEL.name}` : `Crear ${MODEL.name}`}
          </DialogTitle>
        </DialogHeader>
        <SettingForm
          defaultValues={settingToEdit || {}}
          onSubmit={handleSubmit}
          isEdit={!!settingIdEdit}
          isPending={createMutation.isPending || updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};
