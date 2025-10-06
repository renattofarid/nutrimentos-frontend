import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { BusinessTypeSchema } from "../lib/businesstype.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { BUSINESSTYPE, type BusinessTypeResource } from "../lib/businesstype.interface";
import { useBusinessType, useBusinessTypeById } from "../lib/businesstype.hook";
import { useBusinessTypeStore } from "../lib/businesstype.store";
import { BusinessTypeForm } from "./BusinessTypeForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = BUSINESSTYPE;

export default function BusinessTypeModal({ id, open, title, mode, onClose }: Props) {
  const { refetch } = useBusinessType();

  const {
    data: businessType,
    isFinding: findingBusinessType,
    refetch: refetchBusinessType,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useBusinessTypeById(id!);

  const mapBusinessTypeToForm = (data: BusinessTypeResource): Partial<BusinessTypeSchema> => ({
    name: data?.name || "",
    code: data?.code || "",
  });

  const { isSubmitting, updateBusinessType, createBusinessType } = useBusinessTypeStore();

  const handleSubmit = async (data: BusinessTypeSchema) => {
    if (mode === "create") {
      await createBusinessType(data)
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
      await updateBusinessType(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetchBusinessType();
          refetch();
        })
        .catch(() => {
          errorToast(ERROR_MESSAGE(MODEL, "update"));
        });
    }
  };

  const isLoadingAny = isSubmitting || findingBusinessType;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && businessType ? (
        <BusinessTypeForm
          defaultValues={mapBusinessTypeToForm(businessType)}
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
