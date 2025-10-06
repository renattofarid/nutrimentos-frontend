import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { NationalitySchema } from "../lib/nationality.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { NATIONALITY, type NationalityResource } from "../lib/nationality.interface";
import {
  useNationality,
  useNationalityById,
} from "../lib/nationality.hook";
import { useNationalityStore } from "../lib/nationality.store";
import { NationalityForm } from "./NationalityForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = NATIONALITY;

export default function NationalityModal({
  id,
  open,
  title,
  mode,
  onClose,
}: Props) {
  const { refetch } = useNationality();

  const {
    data: nationality,
    isFinding: findingNationality,
    refetch: refetchNationality,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useNationalityById(id!);

  const mapNationalityToForm = (
    data: NationalityResource
  ): Partial<NationalitySchema> => ({
    name: data.name,
    code: data.code,
  });

  const { isSubmitting, updateNationality, createNationality } = useNationalityStore();

  const handleSubmit = async (data: NationalitySchema) => {
    if (mode === "create") {
      await createNationality(data)
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
      await updateNationality(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetchNationality();
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

  const isLoadingAny = isSubmitting || findingNationality;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="!max-w-2xl"
    >
      {!isLoadingAny && nationality ? (
        <NationalityForm
          defaultValues={mode === "create" ? {} : mapNationalityToForm(nationality as NationalityResource)}
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
