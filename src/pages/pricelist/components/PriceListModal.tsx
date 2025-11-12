import { useEffect } from "react";
import PriceListForm from "./PriceListForm";
import { usePriceListStore } from "../lib/pricelist.store";
import { PRICELIST } from "../lib/pricelist.interface";
import type {
  PriceListSchemaCreate,
  PriceListSchemaUpdate,
} from "../lib/pricelist.schema";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { GeneralModal } from "@/components/GeneralModal";

interface PriceListModalProps {
  id?: number | null;
  open: boolean;
  onClose: () => void;
  title?: string;
  mode?: "create" | "update";
  onSuccess?: () => void;
}

const { MODEL, TITLES } = PRICELIST;

export default function PriceListModal({
  id,
  open,
  onClose,
  title,
  mode = "create",
  onSuccess,
}: PriceListModalProps) {
  const {
    priceList,
    isSubmitting,
    isFinding,
    fetchPriceList,
    createPriceList,
    updatePriceList,
    clearPriceList,
  } = usePriceListStore();

  useEffect(() => {
    if (mode === "update" && id && open) {
      fetchPriceList(id);
    }

    return () => {
      if (!open) {
        clearPriceList();
      }
    };
  }, [id, mode, open, fetchPriceList, clearPriceList]);

  const handleSubmit = async (
    data: PriceListSchemaCreate | PriceListSchemaUpdate
  ) => {
    try {
      if (mode === "create") {
        await createPriceList(data as PriceListSchemaCreate);
        successToast(SUCCESS_MESSAGE(MODEL, "create"));
      } else if (mode === "update" && id) {
        await updatePriceList(id, data as PriceListSchemaUpdate);
        successToast(SUCCESS_MESSAGE(MODEL, "update"));
      }
      onSuccess?.();
      onClose();
    } catch (error: any) {
      errorToast(
        error.response?.data?.message,
        ERROR_MESSAGE(MODEL, mode === "create" ? "create" : "update")
      );
    }
  };

  const getDefaultValues = () => {
    if (mode === "update" && priceList) {
      return {
        name: priceList.name,
        code: priceList.code,
        description: priceList.description,
        is_active: priceList.is_active,
        weight_ranges: priceList.weight_ranges.map((range) => ({
          name: range.name,
          min_weight: parseFloat(range.min_weight as string),
          max_weight: range.max_weight
            ? parseFloat(range.max_weight as string)
            : null,
          order: range.order,
        })),
        product_prices: priceList.product_prices.map((price) => ({
          product_id: price.product_id,
          weight_range_index: priceList.weight_ranges.findIndex(
            (r) => r.id === price.weight_range_id
          ),
          price: parseFloat(price.price as string),
          currency: price.currency,
        })),
      };
    }
    return undefined;
  };

  const modalTitle =
    title || (mode === "create" ? TITLES.create.title : TITLES.update.title);
  const modalSubtitle =
    mode === "create" ? TITLES.create.subtitle : TITLES.update.subtitle;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      maxWidth="4xl"
    >
      {isFinding && mode === "update" ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      ) : (
        <PriceListForm
          defaultValues={getDefaultValues()}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
          mode={mode}
        />
      )}
    </GeneralModal>
  );
}
