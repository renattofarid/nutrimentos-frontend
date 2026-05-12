import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  MapPin,
  Plus,
  Star,
  Pencil,
  Trash2,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { GroupFormSection } from "@/components/GroupFormSection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { usePersonZones, usePersonZoneMutations } from "../lib/personzone.hook";
import type { PersonZoneResource } from "../lib/personzone.interface";
import { personZoneSchema, type PersonZoneSchema } from "../lib/personzone.schema";
import { useAllZones } from "@/pages/zone/lib/zone.hook";
import type { ZoneResource } from "@/pages/zone/lib/zone.interface";

interface StagedAddress {
  zone_id: string;
  address: string;
  is_primary: boolean;
}

interface PersonAddressesListProps {
  personId?: number;
  onStagedChange?: (staged: StagedAddress[]) => void;
}

interface InlineFormProps {
  zones: ZoneResource[];
  initialValues?: PersonZoneSchema;
  onSave: (data: PersonZoneSchema) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function InlineAddressForm({
  zones,
  initialValues,
  onSave,
  onCancel,
  isSubmitting,
}: InlineFormProps) {
  const form = useForm<PersonZoneSchema>({
    resolver: zodResolver(personZoneSchema),
    defaultValues: initialValues ?? {
      zone_id: zones[0]?.id.toString() ?? "",
      address: "",
      is_primary: false,
    },
    mode: "onChange",
  });

  const handleConfirm = async () => {
    const valid = await form.trigger();
    if (!valid) return;
    await onSave(form.getValues());
  };

  return (
    <div className="bg-sidebar border rounded-lg p-3 space-y-2">
      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
        {/* Zone select */}
        <Select
          value={form.watch("zone_id")}
          onValueChange={(v) => form.setValue("zone_id", v, { shouldValidate: true })}
        >
          <SelectTrigger className="h-8 w-auto min-w-[130px] flex-shrink-0 text-xs">
            <SelectValue placeholder="Zona" />
          </SelectTrigger>
          <SelectContent>
            {zones.map((z) => (
              <SelectItem key={z.id} value={z.id.toString()} className="text-xs">
                {z.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Address input */}
        <Input
          {...form.register("address")}
          placeholder="Ingrese la dirección"
          className="h-8 text-xs flex-1 min-w-0"
        />

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            type="button"
            size="icon"
            className="size-8"
            onClick={handleConfirm}
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* is_primary */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="inline-is-primary"
          checked={form.watch("is_primary")}
          onCheckedChange={(c) => form.setValue("is_primary", c === true)}
        />
        <Label htmlFor="inline-is-primary" className="text-xs cursor-pointer text-muted-foreground">
          Dirección principal
        </Label>
      </div>
    </div>
  );
}

export default function PersonAddressesList({
  personId,
  onStagedChange,
}: PersonAddressesListProps) {
  const { data: addresses, isLoading, fetch, refetch } = usePersonZones(personId ?? null);
  const { update, setPrimary, remove, isSubmitting } = usePersonZoneMutations();
  const { data: zonesRaw } = useAllZones();
  const zones: ZoneResource[] = zonesRaw ?? [];

  const [editingId, setEditingId] = useState<number | null>(null);
  const [staged, setStaged] = useState<StagedAddress[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (personId) fetch();
  }, [personId, fetch]);

  // Auto-open form when there are no existing and no staged addresses
  useEffect(() => {
    if (!isLoading && (addresses?.length ?? 0) === 0 && staged.length === 0) {
      setShowNew(true);
    }
  }, [isLoading, addresses?.length, staged.length]);

  const updateStaged = (next: StagedAddress[]) => {
    setStaged(next);
    onStagedChange?.(next);
  };

  // New addresses are always staged (saved when main form submits)
  const handleAddStaged = (data: PersonZoneSchema) => {
    const next = [...staged, { zone_id: data.zone_id, address: data.address, is_primary: data.is_primary ?? false }];
    updateStaged(next);
    setShowNew(false);
  };

  const handleRemoveStaged = (index: number) => {
    updateStaged(staged.filter((_, i) => i !== index));
  };

  // Edits/deletes of existing addresses hit the API immediately
  const handleUpdate = async (id: number, data: PersonZoneSchema) => {
    try {
      await update(id, {
        zone_id: parseInt(data.zone_id),
        address: data.address,
        is_primary: data.is_primary,
      });
      successToast(SUCCESS_MESSAGE({ name: "Dirección", gender: false }, "update"));
      setEditingId(null);
      await refetch();
    } catch (error: any) {
      errorToast(error.response?.data?.message, ERROR_MESSAGE({ name: "Dirección", gender: false }, "update"));
    }
  };

  const handleSetPrimary = async (id: number) => {
    try {
      await setPrimary(id);
      successToast("Dirección establecida como principal");
      await refetch();
    } catch (error: any) {
      errorToast(error.response?.data?.message, "Error al establecer como principal");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await remove(deleteId);
      successToast(SUCCESS_MESSAGE({ name: "Dirección", gender: false }, "delete"));
      await refetch();
    } catch (error: any) {
      errorToast(error.response?.data?.message, ERROR_MESSAGE({ name: "Dirección", gender: false }, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  const getInitialValues = (address: PersonZoneResource): PersonZoneSchema => ({
    zone_id: address.zone_id.toString(),
    address: address.address,
    is_primary: address.is_primary,
  });

  const hasAny = (addresses?.length ?? 0) > 0 || staged.length > 0;

  return (
    <GroupFormSection
      title="Direcciones"
      icon={MapPin}
      cols={{ md: 1 }}
      headerExtra={
        <Button
          type="button"
          onClick={() => { setShowNew(true); setEditingId(null); }}
          size="sm"
          variant="outline"
          disabled={showNew}
        >
          <Plus className="size-4 mr-1" />
          Nueva
        </Button>
      }
    >
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Existing saved addresses */}
            {(addresses ?? []).map((address) =>
              editingId === address.id ? (
                <InlineAddressForm
                  key={address.id}
                  zones={zones}
                  initialValues={getInitialValues(address)}
                  onSave={(data) => handleUpdate(address.id, data)}
                  onCancel={() => setEditingId(null)}
                  isSubmitting={isSubmitting}
                />
              ) : (
                <div
                  key={address.id}
                  className="bg-sidebar p-2.5 rounded-lg border flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {address.zone.name}
                    </Badge>
                    <span className="text-sm truncate">{address.address}</span>
                    {address.is_primary && (
                      <Badge variant="default" className="text-xs flex-shrink-0 gap-1">
                        <Star className="size-2.5" />
                        Principal
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {!address.is_primary && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => handleSetPrimary(address.id)}
                        disabled={isSubmitting}
                        tooltip="Principal"
                      >
                        <Star className="size-3.5" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => { setEditingId(address.id); setShowNew(false); }}
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
              )
            )}

            {/* Staged (pending) addresses */}
            {staged.map((addr, i) => {
              const zoneName = zones.find((z) => z.id.toString() === addr.zone_id)?.name ?? addr.zone_id;
              return (
                <div
                  key={i}
                  className="bg-sidebar p-2.5 rounded-lg border border-dashed border-primary/40 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {zoneName}
                    </Badge>
                    <span className="text-sm truncate">{addr.address}</span>
                    {addr.is_primary && (
                      <Badge variant="default" className="text-xs flex-shrink-0 gap-1">
                        <Star className="size-2.5" />
                        Principal
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      Pendiente
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive hover:text-destructive flex-shrink-0"
                    onClick={() => handleRemoveStaged(i)}
                    tooltip="Quitar"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              );
            })}

            {/* Empty state */}
            {!hasAny && !showNew && (
              <div className="text-center py-6 space-y-1">
                <AlertCircle className="size-8 mx-auto text-muted-foreground opacity-40" />
                <p className="text-xs text-muted-foreground">No hay direcciones registradas</p>
              </div>
            )}

            {/* Inline new address form */}
            {showNew && (
              <InlineAddressForm
                zones={zones}
                onSave={handleAddStaged}
                onCancel={() => setShowNew(false)}
                isSubmitting={false}
              />
            )}
          </>
        )}
      </div>

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
