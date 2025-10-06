import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { SettingSchemaCreate } from "../lib/setting.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { SETTING, type SettingResource } from "../lib/setting.interface";
import { useSettings, useSettingById } from "../lib/setting.hook";
import { useSettingStore } from "../lib/setting.store";
import { SettingForm } from "./SettingForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = SETTING;

export default function SettingModal({
  id,
  open,
  title,
  mode,
  onClose,
}: Props) {
  const { refetch } = useSettings();

  const {
    data: setting,
    isFinding: findingSetting,
    refetch: refetchSetting,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useSettingById(id!);

  const mapSettingToForm = (data: SettingResource | typeof EMPTY): Partial<SettingSchemaCreate> => {
    if ('id' in data) {
      // Es un SettingResource
      return {
        branch_id: data.branch_id.toString(),
        allow_multiple_prices: data.allow_multiple_prices === 1,
        allow_invoice: data.allow_invoice === 1,
        allow_negative_stock: data.allow_negative_stock === 1,
        default_currency: data.default_currency,
        tax_percentage: data.tax_percentage,
      };
    }
    // Es EMPTY
    return data;
  };

  const { isSubmitting, updateSetting, createSetting } = useSettingStore();

  const handleSubmit = async (data: SettingSchemaCreate) => {
    if (mode === "create") {
      await createSetting(data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "create"));
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            error.response.data.message ??
              error.response.data.error ??
              ERROR_MESSAGE(MODEL, "create")
          );
        });
    } else {
      await updateSetting(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetchSetting();
          refetch();
        })
        .catch((error: any) => {
          errorToast(
            error.response.data.message ??
              error.response.data.error ??
              ERROR_MESSAGE(MODEL, "update")
          );
        });
    }
  };

  const isLoadingAny = isSubmitting || findingSetting;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="!max-w-3xl"
    >
      {!isLoadingAny && setting ? (
        <SettingForm
          defaultValues={mapSettingToForm(setting)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode={mode}
          onCancel={onClose}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
