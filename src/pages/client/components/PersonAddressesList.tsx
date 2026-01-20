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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { GroupFormSection } from "@/components/GroupFormSection";
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

interface PersonAddressesListProps {
  personId: number;
}

export default function PersonAddressesList({
  personId,
}: PersonAddressesListProps) {
  const { data: addresses, isLoading, fetch, refetch } = usePersonZones(personId);
  const { create, update, setPrimary, remove, isSubmitting } =
    usePersonZoneMutations();

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAddress, setEditingAddress] =
    useState<PersonZoneResource | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (personId) {
      fetch();
    }
  }, [personId, fetch]);

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
    <GroupFormSection
      title="Direcciones"
      icon={MapPin}
      cols={{ md: 1 }}
      headerExtra={
        <Button type="button" onClick={handleCreate} size="sm" variant="outline">
          <Plus className="size-4 mr-2" />
          Nueva Dirección
        </Button>
      }
    >
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : !addresses || addresses.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <AlertCircle className="size-10 mx-auto text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              No hay direcciones registradas
            </p>
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className="bg-sidebar p-3 rounded-lg border flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="bg-primary/10 text-primary rounded-md p-2 flex-shrink-0">
                  <MapPin className="size-4" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">
                      {address.address}
                    </span>
                    {address.is_primary && (
                      <Badge variant="default" className="text-xs flex-shrink-0">
                        <Star className="size-3 mr-1" />
                        Principal
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {address.zone.name}
                    </Badge>
                    <span>{address.zone.code}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!address.is_primary && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => handleSetPrimary(address.id)}
                    disabled={isSubmitting}
                    tooltip="Establecer como principal"
                  >
                    <Star className="size-3.5" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => handleEdit(address)}
                  tooltip="Editar"
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive hover:text-destructive"
                  onClick={() => setDeleteId(address.id)}
                  tooltip="Eliminar"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))
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
    </GroupFormSection>
  );
}
