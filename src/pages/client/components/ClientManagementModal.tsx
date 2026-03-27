"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Maximize2,
  Minimize2,
  X,
  Search,
  Loader2,
  AlertCircle,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import DataTablePagination from "@/components/DataTablePagination";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { cn } from "@/lib/utils";
import { useClients } from "../lib/client.hook";
import { CLIENT, CLIENT_ROLE_ID } from "../lib/client.interface";
import { deletePerson } from "@/pages/person/lib/person.actions";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { useQueryClient } from "@tanstack/react-query";
import { ClientDialog } from "./ClientDialog";
import { ClientEditDialog } from "./ClientEditDialog";
import ClientAddressesSheet from "./ClientAddressesSheet";

const PER_PAGE = 10;

interface ClientManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientChange?: () => void;
}

export function ClientManagementModal({
  open,
  onOpenChange,
  onClientChange,
}: ClientManagementModalProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editPersonId, setEditPersonId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [addressesPerson, setAddressesPerson] = useState<PersonResource | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, refetch } = useClients({
    page,
    per_page: PER_PAGE,
    search: debouncedSearch,
  });

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: [CLIENT.QUERY_KEY] });
    onClientChange?.();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePerson(deleteId, CLIENT_ROLE_ID);
      successToast(SUCCESS_MESSAGE({ name: "Cliente", gender: false }, "delete"));
      handleRefresh();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message,
        ERROR_MESSAGE({ name: "Cliente", gender: false }, "delete")
      );
    } finally {
      setDeleteId(null);
    }
  };

  const getPersonName = (person: PersonResource) =>
    person.business_name ||
    `${person.names ?? ""} ${person.father_surname ?? ""} ${person.mother_surname ?? ""}`.trim();

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) onOpenChange(false);
        }}
      >
        <DialogContent
          className={cn(
            isExpanded
              ? "w-screen! max-w-screen! h-screen! max-h-screen! rounded-none! top-0! left-0! translate-x-0! translate-y-0! m-0!"
              : "max-w-4xl! w-[95vw] max-h-[90vh]",
            "flex flex-col overflow-hidden p-0 gap-0"
          )}
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground rounded-md p-2">
                <Users className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold leading-none">Gestión de Clientes</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {data?.meta?.total ?? 0} clientes registrados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded((v) => !v)}
                title={isExpanded ? "Reducir" : "Expandir"}
              >
                {isExpanded ? (
                  <Minimize2 className="size-4" />
                ) : (
                  <Maximize2 className="size-4" />
                )}
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <X className="size-4" />
                </Button>
              </DialogClose>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 px-6 py-3 border-b flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="size-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>

          {/* Client list */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : !data?.data || data.data.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <AlertCircle className="size-14 mx-auto text-muted-foreground opacity-40" />
                <p className="text-lg font-semibold">No se encontraron clientes</p>
                <p className="text-sm text-muted-foreground">
                  {debouncedSearch
                    ? "Intenta con otro término de búsqueda"
                    : "Agrega un cliente con el botón \"Nuevo Cliente\""}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.data.map((person) => (
                  <div
                    key={person.id}
                    className="bg-sidebar rounded-lg border p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-primary/10 text-primary rounded-md p-2 flex-shrink-0">
                        <User className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{getPersonName(person)}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {person.number_document && (
                            <span className="text-xs text-muted-foreground">
                              {person.number_document}
                            </span>
                          )}
                          {person.zone_name && (
                            <Badge variant="outline" className="text-xs">
                              {person.zone_name}
                            </Badge>
                          )}
                          {person.client_category && (
                            <Badge variant="secondary" className="text-xs">
                              {person.client_category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => setEditPersonId(person.id)}
                        tooltip="Editar"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(person.id)}
                        tooltip="Eliminar"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => setAddressesPerson(person)}
                        tooltip="Gestionar direcciones"
                      >
                        <MapPin className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.last_page > 1 && (
            <div className="border-t px-6 py-3 flex-shrink-0">
              <DataTablePagination
                page={page}
                totalPages={data.meta.last_page}
                onPageChange={setPage}
                per_page={PER_PAGE}
                setPerPage={() => {}}
                totalData={data.meta.total}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create client */}
      <ClientDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onClientCreated={handleRefresh}
      />

      {/* Edit client */}
      {editPersonId !== null && (
        <ClientEditDialog
          open={editPersonId !== null}
          onOpenChange={(v) => !v && setEditPersonId(null)}
          personId={editPersonId}
          onClientUpdated={handleRefresh}
        />
      )}

      {/* Delete client */}
      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(v) => !v && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* Addresses sheet */}
      {addressesPerson && (
        <ClientAddressesSheet
          open={!!addressesPerson}
          onOpenChange={(v) => !v && setAddressesPerson(null)}
          personId={addressesPerson.id}
          personName={getPersonName(addressesPerson)}
        />
      )}
    </>
  );
}
