import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { JobPositionSchema } from "../lib/jobposition.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { JOBPOSITION, type JobPositionResource } from "../lib/jobposition.interface";
import { useJobPosition, useJobPositionById } from "../lib/jobposition.hook";
import { useJobPositionStore } from "../lib/jobposition.store";
import { JobPositionForm } from "./JobPositionForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = JOBPOSITION;

export default function JobPositionModal({ id, open, title, mode, onClose }: Props) {
  const { refetch } = useJobPosition();

  const {
    data: jobPosition,
    isFinding: findingJobPosition,
    refetch: refetchJobPosition,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useJobPositionById(id!);

  const mapJobPositionToForm = (data: JobPositionResource): Partial<JobPositionSchema> => ({
    name: data?.name || "",
    code: data?.code || "",
  });

  const { isSubmitting, updateJobPosition, createJobPosition } = useJobPositionStore();

  const handleSubmit = async (data: JobPositionSchema) => {
    if (mode === "create") {
      await createJobPosition(data)
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
      await updateJobPosition(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetchJobPosition();
          refetch();
        })
        .catch(() => {
          errorToast(ERROR_MESSAGE(MODEL, "update"));
        });
    }
  };

  const isLoadingAny = isSubmitting || findingJobPosition;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && jobPosition ? (
        <JobPositionForm
          defaultValues={mapJobPositionToForm(jobPosition)}
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
