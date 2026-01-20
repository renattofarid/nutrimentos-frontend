import type { PersonResource } from "../lib/person.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ButtonAction } from "@/components/ButtonAction";
import { Pencil, Trash2, MapPin, List, ListPlus } from "lucide-react";

export const PersonColumns = ({
  onEdit,
  onDelete,
  onViewPriceList,
  onAssignPriceList,
  onViewAddresses,
}: // onManageRoles,
{
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onViewPriceList?: (person: PersonResource) => void;
  onAssignPriceList?: (person: PersonResource) => void;
  onViewAddresses?: (person: PersonResource) => void;
  // onManageRoles: (person: PersonResource) => void;
}): ColumnDef<PersonResource>[] => [
  {
    accessorKey: "full_name",
    header: "Nombre Completo",
    cell: ({ row }) => {
      const person = row.original;
      const typeDocument = person?.document_type_name;
      const numberDocument = person?.number_document;
      return (
        <div>
          <div className="font-medium">
            {typeDocument === "RUC"
              ? person.business_name
              : typeDocument === "PASAPORTE"
                ? person.names
                : typeDocument === "CE"
                  ? person.names
                  : (person.business_name ??
                    `${person.names} ${person.father_surname} ${person.mother_surname}`)}
          </div>
          <div className="text-sm text-muted-foreground">
            {typeDocument &&
              numberDocument &&
              `${typeDocument}: ${person.number_document}`}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type_person",
    header: "Tipo",
    cell: ({ row }) => {
      const typePersona = row.original.type_person ?? "NATURAL";
      return (
        <Badge variant={typePersona === "NATURAL" ? "default" : "secondary"}>
          {typePersona}
        </Badge>
      );
    },
  },
  {
    accessorKey: "document_type_name",
    header: "Tipo Documento",
    cell: ({ row }) => {
      const value = row.original.document_type_name;
      return value && <Badge variant="outline">{value}</Badge>;
    },
  },
  {
    accessorKey: "number_document",
    header: "N° Doc.",
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "zone_name",
    header: "Zona",
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "address",
    header: "Dirección",
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "birth_date",
    header: "Fecha de Nacimiento",
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue() as string}</span>
    ),
  },
  // {
  //   accessorKey: "person.status",
  //   header: "Estado",
  //   cell: ({ row }) => {
  //     const status = row.original. ?? "Desconocido";
  //     return (
  //       <Badge variant={status === "Activo" ? "default" : "destructive"}>
  //         {status}
  //       </Badge>
  //     );
  //   },
  // },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const person = row.original;

      return (
        <div className="flex items-center gap-1">
          <ButtonAction
            icon={List}
            canRender={!!onViewPriceList}
            onClick={() => onViewPriceList?.(person)}
            tooltip="Ver Lista de Precios"
            color="blue"
          />
          <ButtonAction
            icon={ListPlus}
            canRender={!!onAssignPriceList}
            onClick={() => onAssignPriceList?.(person)}
            tooltip="Asignar Lista de Precios"
          />
          <ButtonAction
            icon={MapPin}
            color="indigo"
            canRender={!!onViewAddresses}
            onClick={() => onViewAddresses?.(person)}
            tooltip="Ver Direcciones"
          />
          <ButtonAction
            icon={Pencil}
            onClick={() => onEdit(person.id)}
            tooltip="Editar"
          />
          <ButtonAction
            icon={Trash2}
            color="red"
            onClick={() => onDelete(person.id)}
            tooltip="Eliminar"
          />
        </div>
      );
    },
  },
];
