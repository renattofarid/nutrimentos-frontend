import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { WarehouseDocReasonSchema } from "../lib/warehousedocreason.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { WAREHOUSEDOCREASON, type WarehouseDocReasonResource } from "../lib/warehousedocreason.interface";
import { useWarehouseDocReason, useWarehouseDocReasonById } from "../lib/warehousedocreason.hook";
import { useWarehouseDocReasonStore } from "../lib/warehousedocreason.store";
import { WarehouseDocReasonForm } from "./WarehouseDocReasonForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = WAREHOUSEDOCREASON;

export default function WarehouseDocReasonModal({ id, open, title, mode, onClose }: Props) {
  const { refetch } = useWarehouseDocReason();

  const {
    data: warehouseDocReason,
    isFinding: findingWarehouseDocReason,
    refetch: refetchWarehouseDocReason,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useWarehouseDocReasonById(id!);

  const mapWarehouseDocReasonToForm = (data: WarehouseDocReasonResource): Partial<WarehouseDocReasonSchema> => ({
    name: data?.name || "",
    type: data?.type || "",
  });

  const { isSubmitting, updateWarehouseDocReason, createWarehouseDocReason } = useWarehouseDocReasonStore();

  const handleSubmit = async (data: WarehouseDocReasonSchema) => {
    if (mode === "create") {
      await createWarehouseDocReason(data)
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
      await updateWarehouseDocReason(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetchWarehouseDocReason();
          refetch();
        })
        .catch(() => {
          errorToast(ERROR_MESSAGE(MODEL, "update"));
        });
    }
  };

  const isLoadingAny = isSubmitting || findingWarehouseDocReason;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && warehouseDocReason ? (
        <WarehouseDocReasonForm
          defaultValues={mapWarehouseDocReasonToForm(warehouseDocReason)}
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
