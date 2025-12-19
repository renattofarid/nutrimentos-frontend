import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import TitleComponent from "@/components/TitleComponent";
import PriceListForm from "./PriceListForm";
import { usePriceListStore } from "../lib/pricelist.store";
import { PRICELIST } from "../lib/pricelist.interface";
import type { PriceListSchemaUpdate } from "../lib/pricelist.schema";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import FormSkeleton from "@/components/FormSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { ListCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const { MODEL, ICON, TITLES } = PRICELIST;

export default function PriceListEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    priceList,
    isFinding,
    fetchPriceList,
    updatePriceList,
    isSubmitting,
    clearPriceList,
  } = usePriceListStore();

  useEffect(() => {
    if (id) {
      fetchPriceList(Number(id));
    }

    return () => {
      clearPriceList();
    };
  }, [id, fetchPriceList, clearPriceList]);

  const handleSubmit = async (data: PriceListSchemaUpdate) => {
    if (!id) return;

    try {
      await updatePriceList(Number(id), data);
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      navigate(PRICELIST.ROUTE);
    } catch (error: any) {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, "update"));
    }
  };

  const handleCancel = () => {
    navigate(PRICELIST.ROUTE);
  };

  const getDefaultValues = () => {
    if (priceList) {
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

  if (isFinding) {
    return (
      <div className="space-y-4">
        <TitleComponent
          title={TITLES.update.title}
          subtitle={TITLES.update.subtitle}
          icon={ICON}
        />
        <Card>
          <CardContent className="pt-6">
            <FormSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!priceList) {
    return (
      <div className="space-y-4">
        <TitleComponent
          title={TITLES.update.title}
          subtitle={TITLES.update.subtitle}
          icon={ICON}
        />
        <EmptyState
          icon={ListCheck}
          title="No hay lista de precios encontrada"
          description="Agrega rangos de peso y precios para los productos a este lista de precios."
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(PRICELIST.ROUTE)}
              className="gap-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Agregar lista de precios
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TitleComponent
        title={TITLES.update.title}
        subtitle={TITLES.update.subtitle}
        icon={ICON}
      />

      <PriceListForm
        defaultValues={getDefaultValues()}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        mode="update"
      />
    </div>
  );
}
