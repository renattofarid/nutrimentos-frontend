import { DataTable } from "@/components/DataTable.tsx";
import { UserColumns } from "./UserColumns";
import type { UserResource } from "../lib/User.interface";

interface Props {
  columns: UserColumns[];
  data: UserResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function UserTable({
  columns,
  data,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        initialColumnVisibility={{
          business_name: false,
          type_person: false,
          type_document: false,
          address: false,
          phone: false,
          email: false,
          ocupation: false,
          status: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
