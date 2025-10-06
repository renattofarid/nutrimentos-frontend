import { useEffect, useState } from "react";
import { useNationality } from "../lib/nationality.hook";
import TitleComponent from "@/components/TitleComponent";
import NationalityActions from "./NationalityActions";
import NationalityTable from "./NationalityTable";
import NationalityModal from "./NationalityModal";
import { deleteNationality } from "../lib/nationality.actions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";
import { NationalityColumns } from "./NationalityColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { NATIONALITY } from "../lib/nationality.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import NationalityOptions from "./NationalityOptions";

const { MODEL, ICON, TITLES } = NATIONALITY;

export default function NationalityPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedNationalityId, setSelectedNationalityId] = useState<
    number | null
  >(null);

  const { data, meta, isLoading, refetch } = useNationality();

  useEffect(() => {
    const filterParams = {
      page,
      search,
      per_page,
    };
    refetch(filterParams);
  }, [page, search, per_page, refetch]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteNationality(deleteId);
      const filterParams = {
        page,
        search,
        per_page,
      };
      await refetch(filterParams);
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : ERROR_MESSAGE(MODEL, "delete");
      errorToast(errorMessage);
    } finally {
      setDeleteId(null);
    }
  };

  const handleCreateNationality = () => {
    setModalMode("create");
    setSelectedNationalityId(null);
    setModalOpen(true);
  };

  const handleEditNationality = (id: number) => {
    setModalMode("update");
    setSelectedNationalityId(id);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedNationalityId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.plural!}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <NationalityActions onCreateNationality={handleCreateNationality} />
      </div>

      <NationalityTable
        isLoading={isLoading}
        columns={NationalityColumns({
          onEdit: handleEditNationality,
          onDelete: setDeleteId,
        })}
        data={data || []}
      >
        <NationalityOptions search={search} setSearch={setSearch} />
      </NationalityTable>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {modalOpen && (
        <NationalityModal
          id={selectedNationalityId || undefined}
          open={modalOpen}
          title={
            modalMode === "create" ? TITLES.create.title : TITLES.update.title
          }
          mode={modalMode}
          onClose={handleCloseModal}
        />
      )}

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
