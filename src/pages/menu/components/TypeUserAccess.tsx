"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { useTypeUser } from "../../type-users/lib/typeUser.hook";
import { useOptionsMenus } from "../lib/menu.hook";
import FormSkeleton from "@/components/FormSkeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { errorToast, successToast } from "@/lib/core.function";
import { usePermissionStore } from "../lib/menu.store";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import SearchInput from "@/components/SearchInput";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CheckedItems {
  [key: number]: boolean;
}

const TypeUser = z.object({
  permisos: z.array(z.number()),
});

interface Props {
  id: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function TypeUserAccess({ id, open, setOpen }: Props) {
  const form = useForm<z.infer<typeof TypeUser>>({
    resolver: zodResolver(TypeUser),
    defaultValues: {
      permisos: [],
    },
  });

  const { data: typeUser, isFinding } = useTypeUser(id);
  const { data: optionMenus, isLoading } = useOptionsMenus();
  const [checkedItems, setCheckedItems] = useState<CheckedItems>({});
  const [search, setSearch] = useState("");

  const { authenticate } = useAuthStore();

  // marcar los permisos que ya tiene el rol
  useEffect(() => {
    if (typeUser && optionMenus) {
      const typeUserData: any = typeUser;
      const permisosIds = typeUserData.permissions.map((p: any) => p.id);

      form.reset({ permisos: permisosIds });

      const updated: CheckedItems = {};
      permisosIds.forEach((id: number) => {
        updated[id] = true;
      });
      setCheckedItems(updated);
    }
  }, [typeUser, optionMenus, form]);

  const handleCheckboxChange = (id: number, checked: boolean) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const groups = useMemo(() => {
    const lower = search.toLowerCase();
    const filtered = search
      ? optionMenus.filter((p: any) => p.name.toLowerCase().includes(lower))
      : optionMenus;

    const byGroup = new Map<string, any[]>();
    filtered.forEach((perm: any) => {
      const key = perm.group_menu_name ?? "Sin grupo";
      if (!byGroup.has(key)) byGroup.set(key, []);
      byGroup.get(key)!.push(perm);
    });
    return Array.from(byGroup.entries()).map(([name, perms]) => ({
      name,
      perms,
    }));
  }, [optionMenus, search]);

  const toggleGroup = (perms: any[], checked: boolean) => {
    setCheckedItems((prev) => {
      const updated = { ...prev };
      perms.forEach((p) => {
        updated[p.id] = checked;
      });
      return updated;
    });
  };

  const { isSubmitting, setAccessTypeUser } = usePermissionStore();

  const handleSubmit = async () => {
    const access = optionMenus.map((perm: any) => ({
      permission_id: perm.id,
      state: checkedItems[perm.id] ? 1 : 0,
    }));

    if (isSubmitting) return;
    setAccessTypeUser(id, { access })
      .then(() => {
        successToast("Permisos actualizados con éxito");
      })
      .catch((error: any) => {
        errorToast(
          error.response.data.message ??
            error.response.data.error ??
            "Error al actualizar permisos"
        );
      })
      .finally(() => {
        setOpen(false);
        authenticate();
      });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="overflow-auto md:overflow-hidden gap-0">
        <SheetHeader>
          <SheetTitle>Actualizar Permisos del Rol</SheetTitle>
          <SheetDescription className="text-xs">
            {id === 1 ? (
              <>
                <span>
                  El rol
                  <strong className="ml-1">{typeUser?.name}</strong> tiene todos
                  los permisos por defecto.
                </span>
              </>
            ) : (
              <>
                <span>Seleccione los permisos para el rol </span>
                <strong className="ml-1">{typeUser?.name}</strong>.
              </>
            )}
          </SheetDescription>
        </SheetHeader>
        {isFinding || isLoading ? (
          <FormSkeleton />
        ) : (
          <div className="flex items-center justify-center p-4 h-full">
            <div className="flex flex-col items-center w-full h-full">
              <Form {...form}>
                <form
                  className="w-full flex flex-col gap-3 justify-between"
                  onSubmit={form.handleSubmit(handleSubmit)}
                >
                  <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Buscar permiso"
                  />

                  <div className="h-full max-h-[min(70vh,700px)] overflow-y-auto">
                    <Accordion
                      type="multiple"
                      defaultValue={groups.map((g) => g.name)}
                      className="w-full"
                    >
                      {groups.map((group) => {
                        const selectedCount = group.perms.filter(
                          (p) => checkedItems[p.id]
                        ).length;
                        const allSelected =
                          selectedCount === group.perms.length;

                        return (
                          <AccordionItem key={group.name} value={group.name}>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                disabled={id === 1}
                                checked={allSelected}
                                onCheckedChange={(val) =>
                                  toggleGroup(group.perms, !!val)
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                              <AccordionTrigger className="py-2 flex-1">
                                <span className="flex items-center gap-2 text-sm font-semibold">
                                  {group.name}
                                  <span className="text-xs font-normal text-muted-foreground">
                                    ({selectedCount}/{group.perms.length})
                                  </span>
                                </span>
                              </AccordionTrigger>
                            </div>
                            <AccordionContent>
                              <div className="flex flex-col gap-2 pl-6">
                                {group.perms.map((perm: any) => (
                                  <label
                                    key={perm.id}
                                    className="flex items-center gap-2 text-xs font-medium"
                                  >
                                    <Checkbox
                                      disabled={id === 1}
                                      checked={!!checkedItems[perm.id]}
                                      onCheckedChange={(val) =>
                                        handleCheckboxChange(perm.id, !!val)
                                      }
                                    />
                                    {perm.name}
                                  </label>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </div>

                  <div className="pt-4 w-full flex justify-end gap-2">
                    <Button type="submit" disabled={id === 1}>
                      Guardar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
