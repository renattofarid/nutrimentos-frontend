import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePriceListStore } from "../lib/pricelist.store";
import {
  assignClientSchema,
  type AssignClientSchema,
} from "../lib/pricelist.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAllPersons } from "@/pages/person/lib/person.hook";
import { successToast, errorToast } from "@/lib/core.function";
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
  const persons = useAllPersons({ is_client: 1 }); // Filtrar solo clientes
  const { assignClient, isSubmitting } = usePriceListStore();

  const form = useForm<AssignClientSchema>({
    resolver: zodResolver(assignClientSchema),
    defaultValues: {
      person_id: 0,
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
        "No se pudo asignar el cliente a la lista de precios"
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
          <FormField
            control={form.control}
            name="person_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {persons && persons.length > 0 ? (
                      persons.map((person: any) => (
                        <SelectItem
                          key={person.id}
                          value={person.id.toString()}
                        >
                          {person.name || person.business_name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="0" disabled>
                        No hay clientes disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
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
