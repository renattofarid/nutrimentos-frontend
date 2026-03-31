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
import type { SaleResource } from "@/pages/sale/lib/sale.interface";
import { errorToast, promiseToast } from "@/lib/core.function";
import { FormInput } from "@/components/FormInput";

const DOCUMENT_TYPE_OPTIONS = [
  { value: "BOLETA", label: "Boleta" },
  { value: "FACTURA", label: "Factura" },
  { value: "TICKET", label: "Ticket" },
];

export default function SaleTicketsPrintPage() {
  const [searchParams, setSearchParams] = useState({
    document_type: "BOLETA",
    serie: "",
    numero_inicio: "",
    numero_fin: "",
  });
  const [salesByRange, setSalesByRange] = useState<SaleResource[]>([]);
  const [selectedSales, setSelectedSales] = useState<number[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleSearch = async () => {
    if (
      !searchParams.serie ||
      !searchParams.numero_inicio ||
      !searchParams.numero_fin
    ) {
      errorToast("Complete todos los campos de búsqueda");
      return;
    }

    setIsSearching(true);
    try {
      const response = await getSalesByRange(searchParams);
      if (response.data.length === 0) {
        errorToast("No se encontraron ventas en el rango especificado");
        setSalesByRange([]);
        setSelectedSales([]);
        return;
      }
      setSalesByRange(response.data);
      setSelectedSales(response.data.map((s) => s.id));
    } catch {
      errorToast("Error al buscar ventas");
      setSalesByRange([]);
      setSelectedSales([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleSale = (id: number) => {
    setSelectedSales((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleToggleAll = () => {
    if (selectedSales.length === salesByRange.length) {
      setSelectedSales([]);
    } else {
      setSelectedSales(salesByRange.map((s) => s.id));
    }
  };

  const handlePrint = () => {
    if (selectedSales.length === 0) {
      errorToast("No hay ventas seleccionadas");
      return;
    }

    setIsPrinting(true);
    const downloadPromise = exportBulkTickets(selectedSales).then((blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    });

    promiseToast(downloadPromise, {
      loading: "Generando tickets...",
      success: `${selectedSales.length} ticket(s) generado(s) correctamente`,
      error: "Error al generar tickets",
    });

    downloadPromise.finally(() => setIsPrinting(false));
  };

  const allSelected =
    salesByRange.length > 0 && selectedSales.length === salesByRange.length;
  const someSelected =
    selectedSales.length > 0 && selectedSales.length < salesByRange.length;

  return (
    <PageWrapper>
      <GroupFormSection
        title="Filtros"
        icon={Filter}
        cols={{ sm: 1, md: 2, lg: 4 }}
      >
        <SearchableSelect
          label="Tipo de documento"
          options={DOCUMENT_TYPE_OPTIONS}
          value={searchParams.document_type}
          onChange={(val) =>
            setSearchParams({ ...searchParams, document_type: val })
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
            setSearchParams({
              ...searchParams,
              numero_inicio: e.target.value,
            })
          }
          placeholder="Ej: 1"
          className="h-8"
        />

        <div className="flex gap-2 items-end">
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
          <Button
            size="sm"
            variant="secondary"
            onClick={handleSearch}
            disabled={isSearching}
            className="shrink-0"
          >
            {isSearching ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
          <Button
            onClick={handlePrint}
            disabled={isPrinting}
            className="shrink-0"
          >
            {isPrinting ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Printer className="mr-2 h-4 w-4" />
            )}
            Imprimir
            {selectedSales.length > 0 && ` (${selectedSales.length})`}
          </Button>
        </div>
      </GroupFormSection>

      {salesByRange.length > 0 && (
        <GroupFormSection
          title={`Ventas encontradas (${salesByRange.length})`}
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
                {salesByRange.map((sale) => (
                  <TableRow
                    key={sale.id}
                    className={`cursor-pointer hover:bg-muted/30 ${
                      selectedSales.includes(sale.id) ? "bg-muted/50" : ""
                    }`}
                    onClick={() => handleToggleSale(sale.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedSales.includes(sale.id)}
                        onCheckedChange={() => handleToggleSale(sale.id)}
                        className="cursor-pointer"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {sale.full_document_number}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {sale.document_type}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {sale.customer.business_name ||
                        `${sale.customer.names} ${sale.customer.father_surname}`}
                    </TableCell>
                    <TableCell>
                      {new Date(sale.issue_date).toLocaleDateString("es-PE", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {sale.currency} {sale.total_amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {selectedSales.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedSales.length} venta(s) seleccionada(s) para imprimir
              </p>
            </div>
          )}
        </GroupFormSection>
      )}
    </PageWrapper>
  );
}
