import type { PersonResource } from "../lib/person.interface";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const PersonColumns = (): ColumnDef<PersonResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "full_name",
    header: "Nombre Completo",
    cell: ({ row }) => {
      const person = row.original;
      const typeDocument = person?.document_type_name;
      return (
        <div className="font-medium">
          {typeDocument === "RUC"
            ? person.business_name
            : typeDocument === "PASAPORTE"
              ? person.names
              : typeDocument === "CE"
                ? person.names
                : (person.business_name ??
                  `${person.names ?? ""} ${person.father_surname ?? ""} ${person.mother_surname ?? ""}`)}
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
        <Badge color={typePersona === "NATURAL" ? "default" : "secondary"}>
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
];
