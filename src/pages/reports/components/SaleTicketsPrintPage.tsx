import { useState } from "react";

import PageWrapper from "@/components/PageWrapper";
import { GroupFormSection } from "@/components/GroupFormSection";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchableSelect } from "@/components/SearchableSelect";
import { Filter, Printer, Search, Loader } from "lucide-react";
import {
  getSalesByRange,
  exportBulkTickets,
} from "@/pages/sale/lib/sale.actions";
import { DOCUMENT_TYPES } from "@/pages/sale/lib/sale.interface";
import { errorToast, promiseToast } from "@/lib/core.function";
import { FormInput } from "@/components/FormInput";
import { exportBulkCreditNoteTickets } from "@/pages/credit-note/lib/credit-note.actions";

interface DisplayItem {
  id: number;
  full_document_number: string;
  document_type: string;
  customer_name: string;
  issue_date: string;
  currency: string;
  total_amount: number;
}

export default function SaleTicketsPrintPage() {
  const [searchParams, setSearchParams] = useState({
    document_type: "BOLETA",
    serie: "",
    numero_inicio: "",
    numero_fin: "",
  });
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const isCreditNote = searchParams.document_type === "NOTA_CREDITO";

  const handleSearch = async () => {
    if (!searchParams.numero_inicio || !searchParams.numero_fin) {
      errorToast("Complete todos los campos de búsqueda");
      return;
    }

    setIsSearching(true);
    try {
      const params = {
        document_type: searchParams.document_type,
        numero_inicio: searchParams.numero_inicio,
        numero_fin: searchParams.numero_fin,
        ...(searchParams.serie && { serie: searchParams.serie }),
      };
      const response = await getSalesByRange(params);
      if (response.data.length === 0) {
        errorToast("No se encontraron ventas en el rango especificado");
        setItems([]);
        setSelectedIds([]);
        return;
      }
      const mapped: DisplayItem[] = response.data.map((s) => ({
        id: s.id,
        full_document_number: s.full_document_number,
        document_type: s.document_type,
        customer_name:
          s.customer.business_name ||
          `${s.customer.names} ${s.customer.father_surname}`,
        issue_date: s.issue_date,
        currency: s.currency,
        total_amount: s.total_amount,
      }));
      setItems(mapped);
      setSelectedIds(mapped.map((i) => i.id));
    } catch (error: any) {
      errorToast(error.response?.data?.message || "Error al buscar ventas");
      setItems([]);
      setSelectedIds([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePrintCreditNote = () => {
    if (!searchParams.numero_inicio || !searchParams.numero_fin) {
      errorToast("Complete los campos de número inicio y fin");
      return;
    }

    setIsPrinting(true);

    const printPromise = exportBulkCreditNoteTickets({
      document_series: searchParams.serie,
      numero_inicio: Number(searchParams.numero_inicio),
      numero_fin: Number(searchParams.numero_fin),
    }).then((blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    });

    promiseToast(printPromise, {
      loading: "Generando ticket...",
      success: "Ticket generado correctamente",
      error: (err: any) => err?.message || "Error al generar ticket",
    });

    printPromise.finally(() => setIsPrinting(false));
  };

  const handleToggleItem = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleToggleAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const handlePrintSales = () => {
    if (selectedIds.length === 0) {
      errorToast("No hay ventas seleccionadas");
      return;
    }

    setIsPrinting(true);
    const downloadPromise = exportBulkTickets(selectedIds).then((blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    });

    promiseToast(downloadPromise, {
      loading: "Generando tickets...",
      success: `${selectedIds.length} ticket(s) generado(s) correctamente`,
      error: "Error al generar tickets",
    });

    downloadPromise.finally(() => setIsPrinting(false));
  };

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < items.length;

  const creditNotePrintDisabled =
    isPrinting || !searchParams.numero_inicio || !searchParams.numero_fin;

  return (
    <PageWrapper>
      <GroupFormSection
        title="Filtros"
        icon={Filter}
        cols={{ sm: 1, md: 2, lg: 5 }}
      >
        <SearchableSelect
          label="Tipo de documento"
          options={DOCUMENT_TYPES}
          value={searchParams.document_type}
          onChange={(val) =>
            setSearchParams({
              document_type: val,
              serie: "",
              numero_inicio: "",
              numero_fin: "",
            })
          }
          placeholder="Tipo de documento"
          className="w-full!"
        />

        <FormInput
          label="Serie"
          name="serie"
          value={searchParams.serie}
          onChange={(e) =>
            setSearchParams({ ...searchParams, serie: e.target.value })
          }
          placeholder="Ej: B001"
          className="h-8"
        />

        <FormInput
          label="Número inicio"
          name="numero_inicio"
          type="number"
          value={searchParams.numero_inicio}
          onChange={(e) =>
            setSearchParams({ ...searchParams, numero_inicio: e.target.value })
          }
          placeholder="Ej: 1"
          className="h-8"
        />

        <FormInput
          label="Número fin"
          name="numero_fin"
          type="number"
          value={searchParams.numero_fin}
          onChange={(e) =>
            setSearchParams({ ...searchParams, numero_fin: e.target.value })
          }
          placeholder="Ej: 100"
          className="h-8"
        />

        <div className="flex justify-end items-end h-full gap-2">
          {!isCreditNote && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Buscar
            </Button>
          )}
          <Button
            onClick={isCreditNote ? handlePrintCreditNote : handlePrintSales}
            disabled={
              isCreditNote ? creditNotePrintDisabled : isPrinting || selectedIds.length === 0
            }
          >
            {isPrinting ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            Imprimir
            {!isCreditNote && selectedIds.length > 0 && ` (${selectedIds.length})`}
          </Button>
        </div>
      </GroupFormSection>

      {!isCreditNote && items.length > 0 && (
        <GroupFormSection
          title={`Ventas encontradas (${items.length})`}
          icon={Filter}
          cols={{ sm: 1 }}
        >
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        allSelected
                          ? true
                          : someSelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={handleToggleAll}
                      className="cursor-pointer"
                    />
                  </TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className={`cursor-pointer hover:bg-muted/30 ${
                      selectedIds.includes(item.id) ? "bg-muted/50" : ""
                    }`}
                    onClick={() => handleToggleItem(item.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={() => handleToggleItem(item.id)}
                        className="cursor-pointer"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {item.full_document_number}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.document_type}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.customer_name}</TableCell>
                    <TableCell>
                      {new Date(item.issue_date).toLocaleDateString("es-PE", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.currency} {item.total_amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {selectedIds.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedIds.length} venta(s) seleccionada(s) para imprimir
              </p>
            </div>
          )}
        </GroupFormSection>
      )}
    </PageWrapper>
  );
}
