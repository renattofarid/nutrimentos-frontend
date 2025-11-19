import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePriceListStore } from "@/pages/pricelist/lib/pricelist.store";
import {
  assignPriceListToClientSchema,
  type AssignPriceListToClientSchema,
} from "@/pages/pricelist/lib/pricelist.schema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { successToast, errorToast } from "@/lib/core.function";
import { GeneralModal } from "@/components/GeneralModal";
import { FormSelect } from "@/components/FormSelect";
import { useAllPriceList } from "@/pages/pricelist/lib/pricelist.hook";
import type { PriceList } from "@/pages/pricelist/lib/pricelist.interface";

interface AssignPriceListModalProps {
  personId: number;
  personName: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AssignPriceListModal({
  personId,
  personName,
  open,
  onClose,
  onSuccess,
}: AssignPriceListModalProps) {
  const { data: priceLists } = useAllPriceList();
  const { assignClient, isSubmitting } = usePriceListStore();

  const form = useForm<AssignPriceListToClientSchema>({
    resolver: zodResolver(assignPriceListToClientSchema),
    defaultValues: {
      price_list_id: "",
    },
    mode: "onChange",
  });

  const handleSubmit = async (data: AssignPriceListToClientSchema) => {
    try {
      const priceListId = parseInt(data.price_list_id);
      await assignClient(priceListId, { person_id: personId.toString() });
      successToast("Lista de precios asignada exitosamente al cliente");
      onClose();
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || "Error al asignar lista de precios",
        "No se pudo asignar la lista de precios al cliente"
      );
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Asignar Lista de Precios"
      subtitle={`Selecciona la lista de precios para ${personName}`}
      maxWidth="md"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormSelect
            label="Lista de Precios"
            control={form.control}
            name="price_list_id"
            placeholder="Seleccionar lista de precios"
            options={
              priceLists && priceLists.length > 0
                ? priceLists
                    .filter((pl) => pl.is_active)
                    .map((priceList: PriceList) => ({
                      label: priceList.name,
                      value: priceList.id.toString(),
                      description: priceList.description || priceList.code,
                    }))
                : []
            }
          />

          <div className="flex gap-4 justify-end mt-6">
            <Button type="button" variant="neutral" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !form.formState.isValid}
            >
              {isSubmitting ? "Asignando..." : "Asignar Lista"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
