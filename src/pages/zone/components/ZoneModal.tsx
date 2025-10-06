import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { ZoneSchema } from "../lib/zone.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { ZONE, type ZoneResource } from "../lib/zone.interface";
import { useZone, useZoneById } from "../lib/zone.hook";
import { useZoneStore } from "../lib/zone.store";
import { ZoneForm } from "./ZoneForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = ZONE;

export default function ZoneModal({ id, open, title, mode, onClose }: Props) {
  const { refetch } = useZone();

  const {
    data: zone,
    isFinding: findingZone,
    refetch: refetchZone,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useZoneById(id!);

  const mapZoneToForm = (data: ZoneResource): Partial<ZoneSchema> => ({
    name: data?.name || "",
    code: data?.code || "",
  });

  const { isSubmitting, updateZone, createZone } = useZoneStore();

  const handleSubmit = async (data: ZoneSchema) => {
    if (mode === "create") {
      await createZone(data)
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
      await updateZone(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetchZone();
          refetch();
        })
        .catch(() => {
          errorToast(ERROR_MESSAGE(MODEL, "update"));
        });
    }
  };

  const isLoadingAny = isSubmitting || findingZone;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && zone ? (
        <ZoneForm
          defaultValues={mapZoneToForm(zone)}
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
