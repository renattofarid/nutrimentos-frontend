import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { PermissionSchema } from "../lib/permission.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { PERMISSION, type PermissionResource } from "../lib/permission.interface";
import { usePermissionsCrud } from "../lib/permission.hook";
import { usePermissionCrudStore } from "../lib/permission.store";
import { PermissionForm } from "./PermissionForm";
import { useMenuGroups } from "@/pages/menu-group/lib/menuGroup.hook";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = PERMISSION;

export default function PermissionModal({ id, open, title, mode, onClose }: Props) {
  const { data: permissions, refetch } = usePermissionsCrud();
  const { data: menuGroups } = useMenuGroups();

  const permission: PermissionResource | undefined =
    mode === "update" ? permissions.find((p) => p.id === id) : undefined;

  const mapToForm = (
    data: Pick<PermissionResource, "name" | "route" | "group_menu_id">
  ): Partial<PermissionSchema> => ({
    name: data.name,
    route: data.route,
    group_menu_id: data.group_menu_id,
  });

  const { isSubmitting, createPermission, updatePermission } =
    usePermissionCrudStore();

  const handleSubmit = async (data: PermissionSchema) => {
    if (mode === "create") {
      await createPermission(data)
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
      await updatePermission(id!, data)
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

  const formData = mode === "create" ? EMPTY : permission;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {formData ? (
        <PermissionForm
          defaultValues={mapToForm(formData)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode={mode}
          onCancel={onClose}
          menuGroups={menuGroups}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
