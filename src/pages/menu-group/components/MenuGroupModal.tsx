import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { MenuGroupSchema } from "../lib/menuGroup.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { MENU_GROUP, type MenuGroupResource } from "../lib/menuGroup.interface";
import { useMenuGroups } from "../lib/menuGroup.hook";
import { useMenuGroupStore } from "../lib/menuGroup.store";
import { MenuGroupForm } from "./MenuGroupForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = MENU_GROUP;

export default function MenuGroupModal({ id, open, title, mode, onClose }: Props) {
  const { data: menuGroups, refetch } = useMenuGroups();

  const menuGroup: MenuGroupResource | undefined =
    mode === "update" ? menuGroups.find((m) => m.id === id) : undefined;

  const mapToForm = (data: {
    name: string;
    icon: string;
    group_menu_id?: number | null;
  }): Partial<MenuGroupSchema> => ({
    name: data.name,
    icon: data.icon,
    group_menu_id: data.group_menu_id,
  });

  const { isSubmitting, createMenuGroup, updateMenuGroup } =
    useMenuGroupStore();

  const handleSubmit = async (data: MenuGroupSchema) => {
    if (mode === "create") {
      await createMenuGroup(data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "create"));
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            error.response?.data?.message ??
              error.response?.data?.error ??
              ERROR_MESSAGE(MODEL, "create")
          );
        });
    } else {
      await updateMenuGroup(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            error.response?.data?.message ??
              error.response?.data?.error ??
              ERROR_MESSAGE(MODEL, "update")
          );
        });
    }
  };

  const formData = mode === "create" ? EMPTY : menuGroup;
  const parentOptions = menuGroups.filter(
    (m) => m.group_menu_id === null && m.id !== id
  );

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {formData ? (
        <MenuGroupForm
          defaultValues={mapToForm(formData)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode={mode}
          onCancel={onClose}
          parentOptions={parentOptions}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
