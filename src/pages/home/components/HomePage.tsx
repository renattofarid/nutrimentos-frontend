import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ShoppingCart,
  Package,
  CreditCard,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { usePurchase } from "@/pages/purchase/lib/purchase.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import { Badge } from "@/components/ui/badge";
import { PurchaseStatusChart, PaymentTypeChart, MonthlyPurchasesChart } from "./charts";
import { StatCard } from "./StatCard";

export default function HomePage() {
  const { data: purchases, isLoading: purchasesLoading } = usePurchase();
  const { data: products, isLoading: productsLoading } = useAllProducts();

  // Estados para las estadísticas
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalPurchaseAmount: 0,
    pendingAmount: 0,
    totalProducts: 0,
    paidPurchases: 0,
    pendingPurchases: 0,
  });

  const [purchasesByMonth, setPurchasesByMonth] = useState<any[]>([]);
  const [purchasesByStatus, setPurchasesByStatus] = useState<any[]>([]);
  const [purchasesByPaymentType, setPurchasesByPaymentType] = useState<any[]>(
    []
  );

  useEffect(() => {
    if (purchases) {
      // Calcular estadísticas
      const totalAmount = purchases.reduce(
        (sum, p) => sum + parseFloat(p.total_amount),
        0
      );
      const pendingAmount = purchases.reduce(
        (sum, p) => sum + parseFloat(p.current_amount),
        0
      );
      const paidCount = purchases.filter((p) => p.status === "PAGADA").length;
      const pendingCount = purchases.filter(
        (p) => p.status === "REGISTRADO" || p.status === "PENDIENTE"
      ).length;

      setStats({
        totalPurchases: purchases.length,
        totalPurchaseAmount: totalAmount,
        pendingAmount: pendingAmount,
        totalProducts: products?.length || 0,
        paidPurchases: paidCount,
        pendingPurchases: pendingCount,
      });

      // Agrupar compras por mes
      const monthGroups: Record<string, number> = {};
      purchases.forEach((purchase) => {
        const date = new Date(purchase.issue_date);
        const monthYear = `${date.toLocaleDateString("es-ES", {
          month: "short",
        })} ${date.getFullYear()}`;
        monthGroups[monthYear] =
          (monthGroups[monthYear] || 0) + parseFloat(purchase.total_amount);
      });

      const monthData = Object.entries(monthGroups)
        .map(([month, total]) => ({ month, total: Number(total.toFixed(2)) }))
        .slice(-6); // Últimos 6 meses

      setPurchasesByMonth(monthData);

      // Agrupar por estado
      const statusGroups: Record<string, number> = {};
      purchases.forEach((purchase) => {
        statusGroups[purchase.status] =
          (statusGroups[purchase.status] || 0) + 1;
      });

      const statusData = Object.entries(statusGroups).map(
        ([status, count]) => ({
          name: status,
          value: count,
        })
      );

      setPurchasesByStatus(statusData);

      // Agrupar por tipo de pago
      const paymentGroups: Record<string, number> = {};
      purchases.forEach((purchase) => {
        paymentGroups[purchase.payment_type] =
          (paymentGroups[purchase.payment_type] || 0) + 1;
      });

      const paymentData = Object.entries(paymentGroups).map(
        ([type, count]) => ({
          name: type,
          value: count,
        })
      );

      setPurchasesByPaymentType(paymentData);
    }
  }, [purchases, products]);

  if (purchasesLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Vista general de tu sistema de gestión
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Compras"
          value={stats.totalPurchases}
          subtitle={`${stats.paidPurchases} pagadas, ${stats.pendingPurchases} pendientes`}
          icon={ShoppingCart}
          variant="primary"
        />

        <StatCard
          title="Monto Total"
          value={`S/. ${stats.totalPurchaseAmount.toFixed(2)}`}
          subtitle="En compras realizadas"
          icon={DollarSign}
          variant="secondary"
        />

        <StatCard
          title="Saldo Pendiente"
          value={`S/. ${stats.pendingAmount.toFixed(2)}`}
          subtitle="Por pagar"
          icon={CreditCard}
          variant="warning"
        />

        <StatCard
          title="Productos"
          value={stats.totalProducts}
          subtitle="En el catálogo"
          icon={Package}
          variant="muted"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Compras por Mes */}
        <MonthlyPurchasesChart data={purchasesByMonth} />

        {/* Estado de Compras */}
        <PurchaseStatusChart data={purchasesByStatus} />

        {/* Tipo de Pago */}
        <PaymentTypeChart data={purchasesByPaymentType} />

        {/* Resumen de Pagos */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen Financiero</CardTitle>
            <CardDescription>Estado de pagos y saldos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Pagado</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  S/.{" "}
                  {(stats.totalPurchaseAmount - stats.pendingAmount).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Pendiente</span>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  S/. {stats.pendingAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Progreso de Pago</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {stats.totalPurchaseAmount > 0
                    ? (
                        ((stats.totalPurchaseAmount - stats.pendingAmount) /
                          stats.totalPurchaseAmount) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Total Compras
                </span>
                <Badge variant="outline">{stats.totalPurchases}</Badge>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Compras Pagadas
                </span>
                <Badge variant="default">{stats.paidPurchases}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Compras Pendientes
                </span>
                <Badge variant="secondary">{stats.pendingPurchases}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
