"use client";

import { useMemo, useState } from "react";
import { GeneralModal } from "@/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Loader, CheckCircle2, Sparkles } from "lucide-react";
import { useMenuGroups } from "@/pages/menu-group/lib/menuGroup.hook";
import { usePermissionsCrud } from "../lib/permission.hook";
import { usePermissionCrudStore } from "../lib/permission.store";
import { storeMenuGroup } from "@/pages/menu-group/lib/menuGroup.actions";
import type { MenuGroupResource } from "@/pages/menu-group/lib/menuGroup.interface";
import { PERMISSION_CATALOG, getModulePermissions } from "@/lib/permission-catalog";
import { successToast, errorToast } from "@/lib/core.function";

interface Props {
  open: boolean;
  onClose: () => void;
}

const norm = (value: string) => value.trim().toLowerCase();

export default function GenerateSystemPermissionsModal({
  open,
  onClose,
}: Props) {
  const { data: menuGroups, refetch: refetchGroups } = useMenuGroups();
  const { data: permissions, refetch: refetchPermissions } =
    usePermissionsCrud();
  const { createPermission } = usePermissionCrudStore();

  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{
    groups: number;
    permissions: number;
    skipped: number;
    failed: number;
  } | null>(null);
  const [failures, setFailures] = useState<string[]>([]);

  const preview = useMemo(() => {
    const existingSectionNames = new Set(
      menuGroups
        .filter((g) => !g.group_menu_id)
        .map((g) => norm(g.name))
    );
    const existingChildKey = (name: string, parentId: number) =>
      `${parentId}:${norm(name)}`;
    const existingChildren = new Set(
      menuGroups
        .filter((g) => g.group_menu_id)
        .map((g) => existingChildKey(g.name, g.group_menu_id as number))
    );
    const existingPermissionRoutes = new Set(
      permissions.map((p) => norm(p.route))
    );

    let missingGroups = 0;
    let missingPermissions = 0;
    let totalPermissions = 0;

    for (const section of PERMISSION_CATALOG) {
      if (!existingSectionNames.has(norm(section.label))) missingGroups++;
      for (const module of section.modules) {
        // No sabemos aún el id real del grupo padre si es nuevo, así que solo
        // contamos como "ya existe" cuando el padre también existe.
        const parent = menuGroups.find(
          (g) => !g.group_menu_id && norm(g.name) === norm(section.label)
        );
        if (
          !parent ||
          !existingChildren.has(existingChildKey(module.label, parent.id))
        ) {
          missingGroups++;
        }
        for (const entry of getModulePermissions(module)) {
          totalPermissions++;
          if (!existingPermissionRoutes.has(norm(entry.route))) missingPermissions++;
        }
      }
    }

    return { missingGroups, missingPermissions, totalPermissions };
  }, [menuGroups, permissions]);

  const handleGenerate = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setResult(null);
    setFailures([]);

    let groupsCreated = 0;
    let permissionsCreated = 0;
    let skipped = 0;
    let failed = 0;
    const failureMessages: string[] = [];

    let currentGroups: MenuGroupResource[] = [...menuGroups];
    const existingPermissionRoutes = new Set(
      permissions.map((p) => norm(p.route))
    );

    const findSection = (label: string) =>
      currentGroups.find(
        (g) => !g.group_menu_id && norm(g.name) === norm(label)
      );
    const findChild = (label: string, parentId: number) =>
      currentGroups.find(
        (g) => g.group_menu_id === parentId && norm(g.name) === norm(label)
      );

    for (const section of PERMISSION_CATALOG) {
      let sectionGroup = findSection(section.label);
      if (!sectionGroup) {
        try {
          sectionGroup = await storeMenuGroup({
            name: section.label,
            icon: section.icon,
            group_menu_id: null,
          });
          currentGroups = [...currentGroups, sectionGroup];
          groupsCreated++;
        } catch (error: any) {
          failed++;
          failureMessages.push(
            `Grupo "${section.label}": ${error?.response?.data?.message ?? "error desconocido"}`
          );
          continue;
        }
      }

      for (const module of section.modules) {
        let moduleGroup = findChild(module.label, sectionGroup.id);
        if (!moduleGroup) {
          try {
            moduleGroup = await storeMenuGroup({
              name: module.label,
              icon: module.icon,
              group_menu_id: sectionGroup.id,
            });
            currentGroups = [...currentGroups, moduleGroup];
            groupsCreated++;
          } catch (error: any) {
            failed++;
            failureMessages.push(
              `Grupo "${module.label}": ${error?.response?.data?.message ?? "error desconocido"}`
            );
            continue;
          }
        }

        for (const entry of getModulePermissions(module)) {
          if (existingPermissionRoutes.has(norm(entry.route))) {
            skipped++;
            continue;
          }
          try {
            await createPermission({
              name: entry.name,
              route: entry.route,
              group_menu_id: moduleGroup.id,
            });
            existingPermissionRoutes.add(norm(entry.route));
            permissionsCreated++;
          } catch (error: any) {
            failed++;
            failureMessages.push(
              `Permiso "${entry.name}" (${entry.route}): ${error?.response?.data?.message ?? "error desconocido"}`
            );
          }
        }
      }
    }

    await Promise.all([refetchGroups(), refetchPermissions()]);
    setResult({
      groups: groupsCreated,
      permissions: permissionsCreated,
      skipped,
      failed,
    });
    setFailures(failureMessages);
    setIsRunning(false);

    if (failed === 0) {
      successToast(
        `Generación completa: ${groupsCreated} grupo(s) y ${permissionsCreated} permiso(s) creados.`
      );
    } else {
      errorToast(
        `Se crearon ${groupsCreated} grupo(s) y ${permissionsCreated} permiso(s), pero ${failed} fallaron.`,
        "Revisa el detalle en el panel."
      );
    }
  };

  const handleClose = () => {
    if (isRunning) return;
    setResult(null);
    setFailures([]);
    onClose();
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Generar permisos del sistema"
      subtitle="Crea automáticamente los grupos de menú y permisos de todos los módulos del sistema. Es seguro ejecutarlo varias veces: lo que ya existe se omite."
      size="lg"
    >
      <div className="space-y-4 w-full">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-sidebar rounded-lg p-3 text-center">
            <p className="text-2xl font-semibold">{PERMISSION_CATALOG.length}</p>
            <p className="text-xs text-muted-foreground">Secciones</p>
          </div>
          <div className="bg-sidebar rounded-lg p-3 text-center">
            <p className="text-2xl font-semibold">{preview.missingGroups}</p>
            <p className="text-xs text-muted-foreground">Grupos por crear</p>
          </div>
          <div className="bg-sidebar rounded-lg p-3 text-center">
            <p className="text-2xl font-semibold">
              {preview.missingPermissions}/{preview.totalPermissions}
            </p>
            <p className="text-xs text-muted-foreground">Permisos por crear</p>
          </div>
        </div>

        {result && (
          <div
            className={`flex items-center gap-2 text-sm rounded-lg p-3 ${
              result.failed > 0
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            <CheckCircle2 className="size-4 shrink-0" />
            <span>
              {result.groups} grupo(s) y {result.permissions} permiso(s)
              creados. {result.skipped} ya existían.
              {result.failed > 0 && ` ${result.failed} fallaron.`}
            </span>
          </div>
        )}

        {failures.length > 0 && (
          <div className="max-h-40 overflow-y-auto text-xs text-destructive space-y-1 bg-destructive/5 rounded-lg p-3">
            {failures.map((message, index) => (
              <p key={index}>{message}</p>
            ))}
          </div>
        )}

        <div className="flex gap-4 w-full justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isRunning}
          >
            Cerrar
          </Button>
          <Button
            size="sm"
            type="button"
            disabled={isRunning || preview.missingGroups + preview.missingPermissions === 0}
            onClick={handleGenerate}
          >
            {isRunning ? (
              <Loader className="mr-2 h-4 w-4" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isRunning ? "Generando..." : "Generar permisos"}
          </Button>
        </div>
      </div>
    </GeneralModal>
  );
}
