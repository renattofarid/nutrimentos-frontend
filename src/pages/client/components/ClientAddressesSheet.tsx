import { useEffect, useState } from "react";
import {
  Loader2,
  MapPin,
  Plus,
  Star,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react";
import GeneralSheet from "@/components/GeneralSheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { usePersonZones, usePersonZoneMutations } from "../lib/personzone.hook";
import type { PersonZoneResource } from "../lib/personzone.interface";
import type { PersonZoneSchema } from "../lib/personzone.schema";
import AddressFormModal from "./AddressFormModal";

interface ClientAddressesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personId: number;
  personName: string;
}

export default function ClientAddressesSheet({
  open,
  onOpenChange,
  personId,
  personName,
}: ClientAddressesSheetProps) {
  const { data: addresses, isLoading, fetch, refetch } = usePersonZones(personId);
  const { create, update, setPrimary, remove, isSubmitting } =
    usePersonZoneMutations();

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAddress, setEditingAddress] =
    useState<PersonZoneResource | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (open && personId) {
      fetch();
    }
  }, [open, personId, fetch]);

  const handleCreate = () => {
    setEditingAddress(null);
    setShowFormModal(true);
  };

  const handleEdit = (address: PersonZoneResource) => {
    setEditingAddress(address);
    setShowFormModal(true);
  };

  const handleFormSubmit = async (data: PersonZoneSchema) => {
    try {
      if (editingAddress) {
        await update(editingAddress.id, {
          zone_id: parseInt(data.zone_id),
          address: data.address,
          is_primary: data.is_primary,
        });
        successToast(SUCCESS_MESSAGE({ name: "Dirección", gender: false }, "update"));
      } else {
        await create({
          person_id: personId,
          zone_id: parseInt(data.zone_id),
          address: data.address,
          is_primary: data.is_primary,
        });
        successToast(SUCCESS_MESSAGE({ name: "Dirección", gender: false }, "create"));
      }
      setShowFormModal(false);
      setEditingAddress(null);
      await refetch();
    } catch (error: any) {
      const action = editingAddress ? "update" : "create";
      errorToast(
        error.response?.data?.message,
        ERROR_MESSAGE({ name: "Dirección", gender: false }, action)
      );
    }
  };

  const handleSetPrimary = async (id: number) => {
    try {
      await setPrimary(id);
      successToast("Dirección establecida como principal");
      await refetch();
    } catch (error: any) {
      errorToast(
        error.response?.data?.message,
        "Error al establecer como principal"
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await remove(deleteId);
      successToast(SUCCESS_MESSAGE({ name: "Dirección", gender: false }, "delete"));
      await refetch();
    } catch (error: any) {
      errorToast(
        error.response?.data?.message,
        ERROR_MESSAGE({ name: "Dirección", gender: false }, "delete")
      );
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title={`Direcciones - ${personName}`}
      subtitle={`${addresses?.length || 0} direcciones registradas`}
      icon="MapPin"
      size="xl"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={handleCreate} size="sm">
            <Plus className="size-4 mr-2" />
            Nueva Dirección
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : !addresses || addresses.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <AlertCircle className="size-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <div className="space-y-2">
              <p className="text-lg font-semibold">
                Este cliente no tiene direcciones registradas
              </p>
              <p className="text-sm text-muted-foreground">
                Puedes agregar una nueva dirección haciendo clic en el botón
                "Nueva Dirección"
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="bg-sidebar p-4 rounded-lg border space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 text-primary rounded-md p-2">
                      <MapPin className="size-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{address.address}</span>
                        {address.is_primary && (
                          <Badge variant="default" className="text-xs">
                            <Star className="size-3 mr-1" />
                            Principal
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{address.zone.name}</Badge>
                        <span className="text-xs">{address.zone.code}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!address.is_primary && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => handleSetPrimary(address.id)}
                        disabled={isSubmitting}
                        tooltip="Establecer como principal"
                      >
                        <Star className="size-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => handleEdit(address)}
                      tooltip="Editar"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(address.id)}
                      tooltip="Eliminar"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddressFormModal
        open={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingAddress(null);
        }}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        editingAddress={editingAddress}
      />

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </GeneralSheet>
  );
}
