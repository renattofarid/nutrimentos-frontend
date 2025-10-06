import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { FileText, Download, Trash2 } from "lucide-react";
import { deleteTechnicalSheet } from "../lib/product.actions";
import { useProductStore } from "../lib/product.store";
import {
  successToast,
  errorToast,
} from "@/lib/core.function";

interface ProductTechnicalSheetsProps {
  technicalSheets: string[];
  productId: number;
}

export function ProductTechnicalSheets({
  technicalSheets,
  productId
}: ProductTechnicalSheetsProps) {
  const [deleteSheetValue, setDeleteSheetValue] = useState<string | null>(null);
  const { fetchProduct } = useProductStore();

  const handleDeleteTechnicalSheet = async () => {
    if (!deleteSheetValue || !productId) return;
    try {
      await deleteTechnicalSheet(productId, {
        value: deleteSheetValue,
      });
      await fetchProduct(productId);
      successToast("Ficha técnica eliminada exitosamente");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al eliminar la ficha técnica";
      errorToast(errorMessage);
    } finally {
      setDeleteSheetValue(null);
    }
  };

  const getFileName = (url: string) => {
    return url.split('/').pop() || 'Archivo';
  };

  const getFileExtension = (url: string) => {
    const fileName = getFileName(url);
    return fileName.split('.').pop()?.toUpperCase() || '';
  };

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {technicalSheets.length > 0 ? (
        <div className="space-y-3 w-full max-w-full">
          {technicalSheets.map((sheet, index) => (
            <div
              key={index}
              className="p-3 sm:p-4 border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden"
            >
              <div className="flex flex-col gap-3">
                {/* Header de la card - Información principal */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-medium text-sm sm:text-base truncate max-w-full">
                      {getFileName(sheet)}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Documento {getFileExtension(sheet)}
                    </p>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(sheet, '_blank')}
                    className="gap-2 flex-1 sm:flex-none"
                  >
                    <Download className="h-4 w-4" />
                    <span>Ver</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteSheetValue(sheet)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 flex-1 sm:flex-none"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Eliminar</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 px-4 border-2 border-dashed border-muted rounded-xl">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay fichas técnicas</h3>
          <p className="text-muted-foreground mb-4 text-sm sm:text-base max-w-md mx-auto">
            Este producto no tiene fichas técnicas asociadas
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            Las fichas técnicas se pueden agregar al editar el producto
          </p>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteSheetValue !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteSheetValue(null)}
          onConfirm={handleDeleteTechnicalSheet}
        />
      )}
    </div>
  );
}