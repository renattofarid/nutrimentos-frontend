"use client";

import { useState } from "react";
import { GeneralModal } from "@/components/GeneralModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from "lucide-react";
import { usePermissionCrudStore } from "../lib/permission.store";
import { usePermissionsCrud } from "../lib/permission.hook";
import { useMenuGroups } from "@/pages/menu-group/lib/menuGroup.hook";
import { successToast, errorToast } from "@/lib/core.function";

interface Props {
  open: boolean;
  onClose: () => void;
}

const DEFAULT_ACTIONS = ["Ver", "Agregar", "Editar", "Eliminar", "Exportar"];

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function PermissionBulkModal({ open, onClose }: Props) {
  const { data: menuGroups } = useMenuGroups();
  const { refetch } = usePermissionsCrud();
  const { createPermission, isSubmitting } = usePermissionCrudStore();

  const [groupMenuId, setGroupMenuId] = useState<number | undefined>();
  const [moduleName, setModuleName] = useState("");
  const [route, setRoute] = useState("");
  const [routeTouched, setRouteTouched] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({
    Ver: true,
    Agregar: true,
    Editar: true,
    Eliminar: true,
    Exportar: false,
  });
  const [names, setNames] = useState<Record<string, string>>({});

  const handleModuleNameChange = (value: string) => {
    setModuleName(value);
    if (!routeTouched) setRoute(slugify(value));
  };

  const getName = (action: string) =>
    names[action] ?? `${action} ${moduleName}`.trim();

  const selectedActions = DEFAULT_ACTIONS.filter((a) => checked[a]);

  const canSubmit =
    !!groupMenuId &&
    !!moduleName.trim() &&
    !!route.trim() &&
    selectedActions.length > 0;

  const resetForm = () => {
    setGroupMenuId(undefined);
    setModuleName("");
    setRoute("");
    setRouteTouched(false);
    setNames({});
    setChecked({
      Ver: true,
      Agregar: true,
      Editar: true,
      Eliminar: true,
      Exportar: false,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    const results = await Promise.allSettled(
      selectedActions.map((action) =>
        createPermission({
          name: getName(action),
          route,
          group_menu_id: groupMenuId!,
        })
      )
    );
    const ok = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - ok;
    if (ok) successToast(`${ok} permiso(s) creado(s) correctamente.`);
    if (failed) errorToast(`${failed} permiso(s) no se pudieron crear.`);
    refetch();
    if (!failed) handleClose();
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Crear permisos en lote"
      subtitle="Genera de una sola vez los permisos típicos de un módulo, todos con la misma ruta."
      size="lg"
    >
      <div className="space-y-4 w-full">
        <div className="grid grid-cols-1 gap-4 bg-sidebar p-4 rounded-lg">
          <div className="space-y-1">
            <label className="text-sm font-medium">Grupo de menú</label>
            <Select
              onValueChange={(v) => setGroupMenuId(Number(v))}
              value={groupMenuId ? String(groupMenuId) : undefined}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione un grupo de menú" />
              </SelectTrigger>
              <SelectContent>
                {menuGroups.map((group) => (
                  <SelectItem key={group.id} value={String(group.id)}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Módulo</label>
              <Input
                variant="default"
                placeholder="Ej: Cliente"
                value={moduleName}
                onChange={(e) => handleModuleNameChange(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Ruta (compartida)</label>
              <Input
                variant="default"
                placeholder="Ej: cliente"
                value={route}
                onChange={(e) => {
                  setRouteTouched(true);
                  setRoute(e.target.value);
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Permisos a crear</p>
          {DEFAULT_ACTIONS.map((action) => (
            <div key={action} className="flex items-center gap-2">
              <Checkbox
                checked={!!checked[action]}
                onCheckedChange={(v) =>
                  setChecked((prev) => ({ ...prev, [action]: !!v }))
                }
              />
              <Input
                variant="default"
                className="flex-1"
                disabled={!checked[action]}
                value={getName(action)}
                onChange={(e) =>
                  setNames((prev) => ({ ...prev, [action]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={handleSubmit}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting
              ? "Creando..."
              : `Crear ${selectedActions.length || ""} permiso(s)`}
          </Button>
        </div>
      </div>
    </GeneralModal>
  );
}
