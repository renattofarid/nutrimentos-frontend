import FormSkeleton from "@/components/FormSkeleton";
import { GeneralModal } from "@/components/GeneralModal";
import type { PaymentConceptSchema } from "../lib/payment-concept.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/lib/core.function";
import { PAYMENT_CONCEPT, type PaymentConceptResource } from "../lib/payment-concept.interface";
import {
  usePaymentConcept,
  usePaymentConceptById,
} from "../lib/payment-concept.hook";
import { usePaymentConceptStore } from "../lib/payment-concept.store";
import { PaymentConceptForm } from "./PaymentConceptForm";

interface Props {
  id?: number;
  open: boolean;
  title: string;
  mode: "create" | "update";
  onClose: () => void;
}

const { MODEL, EMPTY } = PAYMENT_CONCEPT;

export default function PaymentConceptModal({
  id,
  open,
  title,
  mode,
  onClose,
}: Props) {
  const { refetch } = usePaymentConcept();

  const {
    data: paymentConcept,
    isFinding: findingPaymentConcept,
    refetch: refetchPaymentConcept,
  } = mode === "create"
    ? {
        data: EMPTY,
        isFinding: false,
        refetch: refetch,
      }
    : usePaymentConceptById(id!);

  const mapPaymentConceptToForm = (
    data: PaymentConceptResource
  ): Partial<PaymentConceptSchema> => ({
    name: data.name,
    type: data.type,
  });

  const { isSubmitting, updatePaymentConcept, createPaymentConcept } = usePaymentConceptStore();

  const handleSubmit = async (data: PaymentConceptSchema) => {
    if (mode === "create") {
      await createPaymentConcept(data)
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
      await updatePaymentConcept(id!, data)
        .then(() => {
          onClose();
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          refetchPaymentConcept();
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

  const isLoadingAny = isSubmitting || findingPaymentConcept;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="!max-w-2xl"
    >
      {!isLoadingAny && paymentConcept ? (
        <PaymentConceptForm
          defaultValues={mapPaymentConceptToForm(paymentConcept)}
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
