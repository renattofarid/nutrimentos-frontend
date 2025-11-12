import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { DocumentTypeSchema } from "../lib/document-type.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { DOCUMENT_TYPE, type DocumentTypeResource } from "../lib/document-type.interface";
import { useDocumentType, useDocumentTypeById } from "../lib/document-type.hook";
import { useDocumentTypeStore } from "../lib/document-type.store";
import { DocumentTypeForm } from "./DocumentTypeForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = DOCUMENT_TYPE;

export default function DocumentTypeModal({ id, open, title, mode, onClose }: Props) {
  const { refetch } = useDocumentType();

  const {
    data: documentType,
    isFinding: findingDocumentType,
    refetch: refetchDocumentType,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : useDocumentTypeById(id!);

  const mapDocumentTypeToForm = (data: DocumentTypeResource): Partial<DocumentTypeSchema> => ({
    name: data?.name || "",
  });

  const { isSubmitting, updateDocumentType, createDocumentType } = useDocumentTypeStore();

  const handleSubmit = async (data: DocumentTypeSchema) => {
    if (mode === "create") {
      await createDocumentType(data)
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
      await updateDocumentType(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetchDocumentType();
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

  const isLoadingAny = isSubmitting || findingDocumentType;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && documentType ? (
        <DocumentTypeForm
          defaultValues={mapDocumentTypeToForm(documentType)}
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

