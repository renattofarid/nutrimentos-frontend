import { useState } from "react";
import { useCustomerAccountStatement } from "../lib/reports.hook";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  CustomerAccountStatementItem,
  CustomerAccountStatementParams,
} from "../lib/reports.interface";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useAllZones } from "@/pages/zone/lib/zone.hook";
import { useAllClients } from "@/pages/client/lib/client.hook";
import { useAllWorkers } from "@/pages/worker/lib/worker.hook";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { exportCustomerAccountStatement } from "../lib/reports.actions";
import { toast } from "sonner";

const columns: ColumnDef<CustomerAccountStatementItem>[] = [
  {
    accessorKey: "customer_name",
    header: "Cliente",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "document_number",
    header: "Documento",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "zone_name",
    header: "Zona",
    cell: ({ getValue }) => {
      const zone = getValue() as string;
      return zone ? (
        <Badge variant="outline">{zone}</Badge>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
  },
  {
    accessorKey: "total_debt",
    header: "Deuda Total",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <span className="font-bold text-lg">S/ {Number(value).toFixed(2)}</span>
      );
    },
  },
  {
    accessorKey: "pending_amount",
    header: "Pendiente",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      const variant = value > 0 ? "destructive" : "default";
      return (
        <Badge variant={variant} className="font-bold">
          S/ {Number(value).toFixed(2)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paid_amount",
    header: "Pagado",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <span className="font-medium text-green-600">
          S/ {Number(value).toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "last_payment_date",
    header: "Último Pago",
    cell: ({ getValue }) => {
      const date = getValue() as string | undefined;
      return date ? (
        <span className="text-sm">
          {new Date(date).toLocaleDateString("es-ES")}
        </span>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
  },
  {
    accessorKey: "oldest_debt_date",
    header: "Deuda Más Antigua",
    cell: ({ getValue }) => {
      const date = getValue() as string | undefined;
      return date ? (
        <span className="text-sm text-orange-600">
          {new Date(date).toLocaleDateString("es-ES")}
        </span>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
  },
];

export default function CustomerAccountStatementPage() {
  const [zoneId, setZoneId] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");
  const [vendedorId, setVendedorId] = useState<string>("");
  const [paymentType, setPaymentType] = useState<
    "CONTADO" | "CREDITO" | "ALL"
  >("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [queryType, setQueryType] = useState<"solo_deuda" | "todo">("todo");
  const [showOld, setShowOld] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data: zones } = useAllZones();
  const { data: clients } = useAllClients();
  const { data: workers } = useAllWorkers();

  const { data, isLoading, meta, fetch } = useCustomerAccountStatement();

  const handleSearch = () => {
    const params: CustomerAccountStatementParams = {
      zone_id: zoneId ? Number(zoneId) : null,
      customer_id: customerId ? Number(customerId) : null,
      vendedor_id: vendedorId ? Number(vendedorId) : null,
      payment_type: paymentType === "ALL" ? null : paymentType,
      start_date: startDate || null,
      end_date: endDate || null,
      query_type: queryType,
      show_old: showOld,
    };

    fetch(params);
  };

  const handleExport = async (exportType: "excel" | "pdf") => {
    setIsExporting(true);
    try {
      const params: CustomerAccountStatementParams = {
        zone_id: zoneId ? Number(zoneId) : null,
        customer_id: customerId ? Number(customerId) : null,
        vendedor_id: vendedorId ? Number(vendedorId) : null,
        payment_type: paymentType === "ALL" ? null : paymentType,
        start_date: startDate || null,
        end_date: endDate || null,
        query_type: queryType,
        show_old: showOld,
      };

      const blob = await exportCustomerAccountStatement(params, exportType);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `estado-cuenta-clientes.${exportType === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Reporte exportado exitosamente en formato ${exportType.toUpperCase()}`);
    } catch (error) {
      toast.error("Error al exportar el reporte");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <TitleComponent
        title="Estado de Cuenta de Clientes"
        subtitle="Consulta el estado de cuenta y deudas de los clientes"
      />

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Zona</Label>
              <SearchableSelect
                options={
                  zones?.map((zone) => ({
                    value: zone.id.toString(),
                    label: zone.name,
                  })) || []
                }
                value={zoneId}
                onChange={setZoneId}
                placeholder="Seleccionar zona"
              />
            </div>

            <div className="space-y-2">
              <Label>Cliente</Label>
              <SearchableSelect
                options={
                  clients?.map((client) => ({
                    value: client.id.toString(),
                    label: `${client.names} ${client.father_surname} ${client.mother_surname}`,
                  })) || []
                }
                value={customerId}
                onChange={setCustomerId}
                placeholder="Seleccionar cliente"
              />
            </div>

            <div className="space-y-2">
              <Label>Vendedor</Label>
              <SearchableSelect
                options={
                  workers?.map((worker) => ({
                    value: worker.id.toString(),
                    label: `${worker.names} ${worker.father_surname} ${worker.mother_surname}`,
                  })) || []
                }
                value={vendedorId}
                onChange={setVendedorId}
                placeholder="Seleccionar vendedor"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Pago</Label>
              <Select
                value={paymentType}
                onValueChange={(value) =>
                  setPaymentType(value as "CONTADO" | "CREDITO" | "ALL")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="CONTADO">Contado</SelectItem>
                  <SelectItem value="CREDITO">Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Consulta</Label>
              <Select
                value={queryType}
                onValueChange={(value) =>
                  setQueryType(value as "solo_deuda" | "todo")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="solo_deuda">Solo Deudas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="showOld"
                checked={showOld}
                onCheckedChange={(checked) => setShowOld(checked as boolean)}
              />
              <Label htmlFor="showOld" className="cursor-pointer">
                Mostrar antiguos
              </Label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>

            <Button
              variant="outline"
              onClick={() => handleExport("excel")}
              disabled={isExporting || !data || data.length === 0}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>

            <Button
              variant="outline"
              onClick={() => handleExport("pdf")}
              disabled={isExporting || !data || data.length === 0}
            >
              <FileText className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {meta && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Clientes</p>
                <p className="text-2xl font-bold">{meta.total}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Deuda Total</p>
                <p className="text-2xl font-bold text-red-600">
                  S/ {meta.total_debt?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Pendiente</p>
                <p className="text-2xl font-bold text-orange-600">
                  S/ {meta.total_pending?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Pagado</p>
                <p className="text-2xl font-bold text-green-600">
                  S/ {meta.total_paid?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={data || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
