import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DocumentTypeModal from "./DocumentTypeModal";
import { DOCUMENT_TYPE } from "../lib/document-type.interface";
import ActionsWrapper from "@/components/ActionsWrapper";

const { TITLES } = DOCUMENT_TYPE;

export default function DocumentTypeActions() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <ActionsWrapper>
      <Button size={"sm"} onClick={() => setIsCreateModalOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Agregar Tipo de Documento
      </Button>

      {isCreateModalOpen && (
        <DocumentTypeModal
          open={true}
          onClose={() => setIsCreateModalOpen(false)}
          title={TITLES.create.title}
          mode="create"
        />
      )}
    </ActionsWrapper>
  );
}
