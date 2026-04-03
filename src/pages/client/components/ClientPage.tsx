import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClients } from "../lib/client.hook";
import type { RowSelectionState } from "@tanstack/react-table";

import ClientActions from "./ClientActions";
import PersonTable from "@/pages/person/components/PersonTable";
import PersonOptions from "@/pages/person/components/PersonOptions";
import { deletePerson } from "@/pages/person/lib/person.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { PersonColumns } from "@/pages/person/components/PersonColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { CLIENT } from "../lib/client.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { CLIENT_ROLE_ID } from "../lib/client.interface";
import ClientPriceListSheet from "./ClientPriceListSheet";
import AssignPriceListModal from "./AssignPriceListModal";
import ClientAddressesSheet from "./ClientAddressesSheet";
import PageWrapper from "@/components/PageWrapper";

const { MODEL } = CLIENT;

export default function ClientPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [priceListPerson, setPriceListPerson] = useState<PersonResource | null>(null);
  const [assignPriceListPerson, setAssignPriceListPerson] = useState<PersonResource | null>(null);
  const [addressesPerson, setAddressesPerson] = useState<PersonResource | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data, isLoading, refetch } = useClients({ page, per_page, search });

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const selectedClientId = Object.keys(rowSelection).find((key) => rowSelection[key]);
  const toolbarClient = selectedClientId
    ? (data?.data?.find((c) => c.id.toString() === selectedClientId) ?? null)
    : null;
  const hasSelection = !!toolbarClient;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePerson(deleteId, CLIENT_ROLE_ID);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(error.response.data.message, ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <PageWrapper>
      <ClientActions
        hasSelection={hasSelection}
        onNew={() => navigate("/clientes/agregar")}
        onEdit={() => toolbarClient && navigate(`/clientes/editar/${toolbarClient.id}`)}
        onDelete={() => toolbarClient && setDeleteId(toolbarClient.id)}
        onViewPriceList={() => toolbarClient && setPriceListPerson(toolbarClient)}
        onAssignPriceList={() => toolbarClient && setAssignPriceListPerson(toolbarClient)}
        onViewAddresses={() => toolbarClient && setAddressesPerson(toolbarClient)}
      />

      <PersonTable
        isLoading={isLoading}
        columns={PersonColumns()}
        isClientTable
        data={data?.data || []}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowDoubleClick={(person) => navigate(`/clientes/editar/${person.id}`)}
      >
        <PersonOptions search={search} setSearch={setSearch} />
      </PersonTable>

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />

      {priceListPerson && (
        <ClientPriceListSheet
          open={!!priceListPerson}
          onOpenChange={(open) => !open && setPriceListPerson(null)}
          personId={priceListPerson.id}
          personName={
            priceListPerson.business_name ||
            `${priceListPerson.names} ${priceListPerson.father_surname || ""} ${
              priceListPerson.mother_surname || ""
            }`.trim()
          }
        />
      )}

      {assignPriceListPerson && (
        <AssignPriceListModal
          open={!!assignPriceListPerson}
          onClose={() => setAssignPriceListPerson(null)}
          personId={assignPriceListPerson.id}
          personName={
            assignPriceListPerson.business_name ||
            `${assignPriceListPerson.names} ${
              assignPriceListPerson.father_surname || ""
            } ${assignPriceListPerson.mother_surname || ""}`.trim()
          }
        />
      )}

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {addressesPerson && (
        <ClientAddressesSheet
          open={!!addressesPerson}
          onOpenChange={(open) => !open && setAddressesPerson(null)}
          personId={addressesPerson.id}
          personName={
            addressesPerson.business_name ||
            `${addressesPerson.names} ${addressesPerson.father_surname || ""} ${
              addressesPerson.mother_surname || ""
            }`.trim()
          }
        />
      )}
    </PageWrapper>
  );
}
