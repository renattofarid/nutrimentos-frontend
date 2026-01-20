import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { GeneralModal } from "@/components/GeneralModal";
import { FormSelect } from "@/components/FormSelect";
import { FormInput } from "@/components/FormInput";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAllZones } from "@/pages/zone/lib/zone.hook";
import {
  personZoneSchema,
  type PersonZoneSchema,
} from "../lib/personzone.schema";
import type { PersonZoneResource } from "../lib/personzone.interface";

interface AddressFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PersonZoneSchema) => Promise<void>;
  isSubmitting: boolean;
  editingAddress?: PersonZoneResource | null;
}

export default function AddressFormModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  editingAddress,
}: AddressFormModalProps) {
  const { data: zones } = useAllZones();

  const form = useForm<PersonZoneSchema>({
    resolver: zodResolver(personZoneSchema),
    defaultValues: {
      zone_id: "",
      address: "",
      is_primary: false,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (editingAddress) {
      form.reset({
        zone_id: editingAddress.zone_id.toString(),
        address: editingAddress.address,
        is_primary: editingAddress.is_primary,
      });
    } else {
      form.reset({
        zone_id: "",
        address: "",
        is_primary: false,
      });
    }
  }, [editingAddress, form]);

  const handleSubmit = async (data: PersonZoneSchema) => {
    await onSubmit(data);
    form.reset();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      icon="MapPin"
      title={editingAddress ? "Editar Dirección" : "Nueva Dirección"}
      subtitle={
        editingAddress
          ? "Modifica los datos de la dirección"
          : "Agrega una nueva dirección para este cliente"
      }
      size="md"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormSelect
            label="Zona"
            control={form.control}
            name="zone_id"
            placeholder="Seleccionar zona"
            options={
              zones && zones.length > 0
                ? zones.map((zone) => ({
                    label: zone.name,
                    value: zone.id.toString(),
                    description: zone.code,
                  }))
                : []
            }
          />

          <FormInput
            label="Dirección"
            control={form.control}
            name="address"
            placeholder="Ingrese la dirección completa"
          />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_primary"
              checked={form.watch("is_primary")}
              onCheckedChange={(checked) =>
                form.setValue("is_primary", checked === true)
              }
            />
            <Label htmlFor="is_primary" className="text-sm cursor-pointer">
              Establecer como dirección principal
            </Label>
          </div>

          <div className="flex gap-4 justify-end mt-6">
            <Button type="button" variant="neutral" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !form.formState.isValid}
            >
              {isSubmitting
                ? "Guardando..."
                : editingAddress
                ? "Actualizar"
                : "Crear"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
