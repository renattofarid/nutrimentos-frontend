import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import type { UserResource } from "../lib/User.interface";

export type UserColumns = ColumnDef<UserResource>;

export const UserColumns = (): ColumnDef<UserResource>[] => [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ getValue }) => {
      return <div className="text-sm">{getValue() as string}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "business_name",
    accessorFn: (row) => row.person.business_name,
    header: "Razón Social",
  },
  {
    accessorKey: "type_person",
    accessorFn: (row) => row.person.type_person,
    header: "Tipo de Persona",
  },
  {
    accessorKey: "type_document",
    accessorFn: (row) => row.person.type_document,
    header: "Tipo de Documento",
  },
  {
    accessorKey: "number_document",
    accessorFn: (row) => row.person.number_document,
    header: "Número de Documento",
  },
  {
    accessorKey: "address",
    accessorFn: (row) => row.person.address,
    header: "Dirección",
  },
  {
    accessorKey: "phone",
    accessorFn: (row) => row.person.phone,
    header: "Teléfono",
  },
  {
    accessorKey: "email",
    accessorFn: (row) => row.person.email,
    header: "Correo Electrónico",
  },
  {
    accessorKey: "ocupation",
    accessorFn: (row) => row.person.ocupation,
    header: "Ocupación",
  },
  {
    accessorKey: "status",
    accessorFn: (row) => row.person.status,
    header: "Estado",
  },
  {
    accessorKey: "rol_name",
    header: "Rol",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <Badge variant={"outline"} className={`font-semibold`}>
          {status}
        </Badge>
      );
    },
  },
];
