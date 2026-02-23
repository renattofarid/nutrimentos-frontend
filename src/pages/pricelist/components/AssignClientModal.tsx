import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePriceListStore } from "../lib/pricelist.store";
import {
  assignClientSchema,
  type AssignClientSchema,
} from "../lib/pricelist.schema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { successToast, errorToast } from "@/lib/core.function";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useClients } from "@/pages/client/lib/client.hook";
import { GeneralModal } from "@/components/GeneralModal";

interface AssignClientModalProps {
  priceListId: number;
  open: boolean;
  onClose: () => void;
}

export default function AssignClientModal({
  priceListId,
  open,
  onClose,
}: AssignClientModalProps) {
  const { assignClient, isSubmitting } = usePriceListStore();

  const form = useForm<AssignClientSchema>({
    resolver: zodResolver(assignClientSchema),
    defaultValues: {
      person_id: "",
    },
    mode: "onChange",
  });

  const handleSubmit = async (data: AssignClientSchema) => {
    try {
      await assignClient(priceListId, data);
      successToast("Cliente asignado exitosamente a la lista de precios");
      onClose();
      form.reset();
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || "Error al asignar cliente",
        "No se pudo asignar el cliente a la lista de precios",
      );
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Asignar Cliente"
      subtitle="Selecciona el cliente para asignar a esta lista de precios"
      maxWidth="md"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormSelectAsync
            label={"Cliente"}
            control={form.control}
            name="person_id"
            placeholder="Seleccionar cliente"
            useQueryHook={useClients}
            mapOptionFn={(person: PersonResource) => ({
              label:
                person.business_name ??
                `${person.names} ${person.father_surname} ${person.mother_surname}`,
              value: person.id.toString(),
              description: person.number_document ?? undefined,
            })}
          />

          <div className="flex gap-4 justify-end mt-6">
            <Button type="button" variant="neutral" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !form.formState.isValid}
            >
              {isSubmitting ? "Asignando..." : "Asignar Cliente"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
