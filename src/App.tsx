import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { JSX } from "react";
import HomePage from "./pages/home/components/HomePage";
import LayoutComponent from "./components/layout";
import { ThemeProvider } from "./components/theme-provider";
import { useAuthStore } from "./pages/auth/lib/auth.store";
import LoginPage from "./pages/auth/components/Login";
import TypeUserPage from "./pages/type-users/components/TypeUserPage";
import UserPage from "./pages/users/components/UserPage";
import CompanyPage from "./pages/company/components/CompanyPage";
import BranchPage from "./pages/branch/components/BranchPage";
import WarehousePage from "./pages/warehouse/components/WarehousePage";
import BrandPage from "./pages/brand/components/BrandPage";
import BoxPage from "./pages/box/components/BoxPage";
import VehiclePage from "./pages/vehicle/components/VehiclePage";
import UnitPage from "./pages/unit/components/UnitPage";
import CategoryPage from "./pages/category/components/CategoryPage";
import ProductPage from "./pages/product/components/ProductPage";
import ProductDetail from "./pages/product/components/ProductDetail";
import ProductAddPage from "./pages/product/components/ProductAddPage";
import ProductEditPage from "./pages/product/components/ProductEditPage";
import ProductTypePage from "./pages/product-type/components/ProductTypePage";
import NationalityPage from "./pages/nationality/components/NationalityPage";
import ClientPage from "./pages/client/components/ClientPage";
import ClientAddPage from "./pages/client/components/ClientAddPage";
import ClientEditPage from "./pages/client/components/ClientEditPage";
import SupplierPage from "./pages/supplier/components/SupplierPage";
import SupplierAddPage from "./pages/supplier/components/SupplierAddPage";
import SupplierEditPage from "./pages/supplier/components/SupplierEditPage";
import WorkerPage from "./pages/worker/components/WorkerPage";
import WorkerAddPage from "./pages/worker/components/WorkerAddPage";
import WorkerEditPage from "./pages/worker/components/WorkerEditPage";
import PaymentConceptPage from "./pages/payment-concept/components/PaymentConceptPage";
import BusinessTypePage from "./pages/businesstype/components/BusinessTypePage";
import ZonePage from "./pages/zone/components/ZonePage";
import JobPositionPage from "./pages/jobposition/components/JobPositionPage";
import SettingPage from "./pages/setting/components/SettingPage";
import DocumentTypePage from "./pages/document-type/components/DocumentTypePage";
import PurchaseInstallmentPage from "./pages/purchaseinstallment/components/PurchaseInstallmentPage";
import PriceListPage from "./pages/pricelist/components/PriceListPage";
import PriceListAddPage from "./pages/pricelist/components/PriceListAddPage";
import PriceListEditPage from "./pages/pricelist/components/PriceListEditPage";
import { TYPE_USER } from "./pages/type-users/lib/typeUser.interface";
import { USER } from "./pages/users/lib/User.interface";
import { COMPANY } from "./pages/company/lib/company.interface";
import { BRANCH } from "./pages/branch/lib/branch.interface";
import { WAREHOUSE } from "./pages/warehouse/lib/warehouse.interface";
import { BRAND } from "./pages/brand/lib/brand.interface";
import { BOX } from "./pages/box/lib/box.interface";
import { VEHICLE } from "./pages/vehicle/lib/vehicle.interface";
import { UNIT } from "./pages/unit/lib/unit.interface";
import { CATEGORY } from "./pages/category/lib/category.interface";
import { PRODUCT } from "./pages/product/lib/product.interface";
import { PRODUCT_TYPE } from "./pages/product-type/lib/product-type.interface";
import { NATIONALITY } from "./pages/nationality/lib/nationality.interface";
import { CLIENT } from "./pages/client/lib/client.interface";
import { SUPPLIER } from "./pages/supplier/lib/supplier.interface";
import { WORKER } from "./pages/worker/lib/worker.interface";
import { PAYMENT_CONCEPT } from "./pages/payment-concept/lib/payment-concept.interface";
import { BUSINESSTYPE } from "./pages/businesstype/lib/businesstype.interface";
import { ZONE } from "./pages/zone/lib/zone.interface";
import { JOBPOSITION } from "./pages/jobposition/lib/jobposition.interface";
import { SETTING } from "./pages/setting/lib/setting.interface";
import { DOCUMENT_TYPE } from "./pages/document-type/lib/document-type.interface";
import { PURCHASE_INSTALLMENT } from "./pages/purchaseinstallment/lib/purchaseinstallment.interface";
import { PRICELIST } from "./pages/pricelist/lib/pricelist.interface";
import type { Access } from "./pages/auth/lib/auth.interface";
import { ENABLE_PERMISSION_VALIDATION } from "./lib/permissions.config";
import PurchasePage from "./pages/purchase/components/PurchasePage";
import PurchaseAddPage from "./pages/purchase/components/PurchaseAddPage";
import { PurchaseDetailViewPage } from "./pages/purchase/components/PurchaseDetailViewPage";
import { PURCHASE } from "./pages/purchase/lib/purchase.interface";
import PurchaseEditPage from "./pages/purchase/components/PurchaseEditPage";
import { SaleRoute } from "./pages/sale/lib/sale.interface";
import { SaleAddPage, SaleEditPage, SalePage } from "./pages/sale/components";
import SaleManagePage from "./pages/sale/components/SaleManagePage";
import { CREDIT_NOTE } from "./pages/credit-note/lib/credit-note.interface";
import CreditNotePage from "./pages/credit-note/components/CreditNotePage";
import CreditNoteAddPage from "./pages/credit-note/components/CreditNoteAddPage";
import GuidePage from "./pages/guide/components/GuidePage";
import GuideAddPage from "./pages/guide/components/GuideAddPage";
import GuideEditPage from "./pages/guide/components/GuideEditPage";
import GuideDetailPage from "./pages/guide/components/GuideDetailPage";
import { GUIDE } from "./pages/guide/lib/guide.interface";
import { BOX_SHIFT } from "./pages/box-shift/lib/box-shift.interface";
import { BoxShiftDetailPage, BoxShiftPage } from "./pages/box-shift/components";
import AccountsReceivablePage from "./pages/accounts-receivable/components/AccountsReceivablePage";
import { AccountsReceivableRoute } from "./pages/accounts-receivable/lib/accounts-receivable.interface";
import AccountsPayablePage from "./pages/accounts-payable/components/AccountsPayablePage";
import { ACCOUNTS_PAYABLE } from "./pages/accounts-payable/lib/accounts-payable.interface";
import {
  ValuatedInventoryPage,
  WarehouseDocumentAddPage,
  WarehouseDocumentEditPage,
  WarehouseDocumentPage,
  WarehouseKardexPage,
} from "./pages/warehouse-document/components";
import { WAREHOUSE_DOCUMENT } from "./pages/warehouse-document/lib/warehouse-document.interface";
import WarehouseDocumentDetailPage from "./pages/warehouse-document/components/WarehouseDocumentDetailPage";
import DeliverySheetPage from "./pages/deliverysheet/components/DeliverySheetPage";
import SettlementPage from "./pages/deliverysheet/components/SettlementPage";
import {
  DELIVERY_SHEET,
  DeliverySheetSettlementRoute,
} from "./pages/deliverysheet/lib/deliverysheet.interface";
import { DeliverySheetAddPage } from "./pages/deliverysheet";
import { DRIVER } from "./pages/driver/lib/driver.interface";
import DriverPage from "./pages/driver/components/DriverPage";
import DriverAddPage from "./pages/driver/components/DriverAddPage";
import DriverEditPage from "./pages/driver/components/DriverEditPage";
import {
  CustomerAccountStatementPage,
  InventoryReportPage,
  KardexReportPage,
} from "./pages/reports/components";
import {
  COMMISSIONS_REPORT_ROUTE,
  CUSTOMER_ACCOUNT_STATEMENT_ROUTE,
  DELIVERY_SHEET_REPORT_ROUTE,
  INVENTORY_REPORT_ROUTE,
  KARDEX_REPORT_ROUTE,
  SALE_BY_SELLER_REPORT_ROUTE,
} from "./pages/reports/lib/reports.interface";
import { PURCHASE_CREDIT_NOTE } from "./pages/purchase-credit-note/lib/purchase-credit-note.interface";
import PurchaseCreditNotePage from "./pages/purchase-credit-note/components/PurchaseCreditNotePage";
import PurchaseCreditNoteAddPage from "./pages/purchase-credit-note/components/PurchaseCreditNoteAddPage";
import PurchaseCreditNoteEditPage from "./pages/purchase-credit-note/components/PurchaseCreditNoteEditPage";
import SaleBySellerReportPage from "./pages/reports/components/SaleBySellerReportPage";
import DeliverySheetReportPage from "./pages/reports/components/DeliverySheetReportPage";
import CommissionsReportPage from "./pages/reports/components/CommissionsReportPage";

const { ROUTE: TypeUserRoute } = TYPE_USER;
const { ROUTE: UserRoute } = USER;
const { ROUTE: CompanyRoute } = COMPANY;
const { ROUTE: BranchRoute } = BRANCH;
const { ROUTE: WarehouseRoute } = WAREHOUSE;
const { ROUTE: BrandRoute } = BRAND;
const { ROUTE: BoxRoute } = BOX;
const { ROUTE: VehicleRoute } = VEHICLE;
const { ROUTE: UnitRoute } = UNIT;
const { ROUTE: CategoryRoute } = CATEGORY;
const { ROUTE: ProductRoute } = PRODUCT;
const { ROUTE: ProductTypeRoute } = PRODUCT_TYPE;
const { ROUTE: NationalityRoute } = NATIONALITY;
const { ROUTE: ClientRoute } = CLIENT;
const { ROUTE: SupplierRoute } = SUPPLIER;
const { ROUTE: WorkerRoute } = WORKER;
const { ROUTE: PaymentConceptRoute } = PAYMENT_CONCEPT;
const { ROUTE: BusinessTypeRoute } = BUSINESSTYPE;
const { ROUTE: ZoneRoute } = ZONE;
const { ROUTE: JobPositionRoute } = JOBPOSITION;
const { ROUTE: SettingRoute } = SETTING;
const { ROUTE: DocumentTypeRoute } = DOCUMENT_TYPE;
const { ROUTE: PurchaseRoute } = PURCHASE;
const { ROUTE: PurchaseInstallmentRoute } = PURCHASE_INSTALLMENT;
const { ROUTE: PriceListRoute } = PRICELIST;
const { ROUTE: GuideRoute } = GUIDE;
const { ROUTE: BoxShiftRoute } = BOX_SHIFT;
const { ROUTE: AccountsPayableRoute } = ACCOUNTS_PAYABLE;
const { ROUTE: WarehouseDocumentRoute } = WAREHOUSE_DOCUMENT;
const { ROUTE: DriverRoute } = DRIVER;
const {
  ROUTE: DeliverySheetRoute,
  ROUTE_ADD: DeliverySheetRouteAdd,
  ROUTE_UPDATE: DeliverySheetRouteUpdate,
} = DELIVERY_SHEET;
const { ROUTE: CreditNoteRoute, ROUTE_ADD: CreditNoteRouteAdd } = CREDIT_NOTE;
const {
  ROUTE: PurchaseCreditNoteRoute,
  ROUTE_ADD: PurchaseCreditNoteRouteAdd,
  ROUTE_UPDATE: PurchaseCreditNoteRouteUpdate,
} = PURCHASE_CREDIT_NOTE;

export const hasAccessToRoute = (access: Access[], route: string): boolean => {
  const transformRoute = route.split("/").pop();
  for (const node of access) {
    if (node.permissions.some((p) => p.routes.includes(transformRoute!))) {
      return true;
    }
    if (node.children && hasAccessToRoute(node.children, transformRoute!)) {
      return true;
    }
  }
  return false;
};

function ProtectedRoute({
  children,
  path,
}: {
  children: JSX.Element;
  path?: string;
}) {
  const { token, access } = useAuthStore();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (path && ENABLE_PERMISSION_VALIDATION) {
    if (!access) {
      return <Navigate to="/inicio" replace />;
    }

    const hasAccess = hasAccessToRoute(access, path);
    if (!hasAccess) {
      return <Navigate to="/inicio" replace />;
    }
  }

  return <LayoutComponent>{children}</LayoutComponent>;
}

export default function App() {
  const { token } = useAuthStore();
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route
            path="/login"
            element={token ? <Navigate to="/inicio" /> : <LoginPage />}
          />

          {/* Ruta protegida */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inicio"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path={TypeUserRoute}
            element={
              <ProtectedRoute path={TypeUserRoute}>
                <TypeUserPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={UserRoute}
            element={
              <ProtectedRoute path={UserRoute}>
                <UserPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={CompanyRoute}
            element={
              <ProtectedRoute path={CompanyRoute}>
                <CompanyPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={BranchRoute}
            element={
              <ProtectedRoute path={BranchRoute}>
                <BranchPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={WarehouseRoute}
            element={
              <ProtectedRoute path={WarehouseRoute}>
                <WarehousePage />
              </ProtectedRoute>
            }
          />

          <Route
            path={BrandRoute}
            element={
              <ProtectedRoute path={BrandRoute}>
                <BrandPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={VehicleRoute}
            element={
              <ProtectedRoute path={VehicleRoute}>
                <VehiclePage />
              </ProtectedRoute>
            }
          />

          <Route
            path={BoxRoute}
            element={
              <ProtectedRoute path={BoxRoute}>
                <BoxPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={UnitRoute}
            element={
              <ProtectedRoute path={UnitRoute}>
                <UnitPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={CategoryRoute}
            element={
              <ProtectedRoute path={CategoryRoute}>
                <CategoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ProductRoute}
            element={
              <ProtectedRoute path={ProductRoute}>
                <ProductPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={`${ProductRoute}/:id`}
            element={
              <ProtectedRoute path={ProductRoute}>
                <ProductDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/productos/agregar"
            element={
              <ProtectedRoute path={ProductRoute}>
                <ProductAddPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/productos/actualizar/:id"
            element={
              <ProtectedRoute path={ProductRoute}>
                <ProductEditPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ProductTypeRoute}
            element={
              <ProtectedRoute path={ProductTypeRoute}>
                <ProductTypePage />
              </ProtectedRoute>
            }
          />

          <Route
            path={WarehouseDocumentRoute}
            element={
              <ProtectedRoute path={WarehouseDocumentRoute}>
                <WarehouseDocumentPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/documentos-almacen/agregar"
            element={
              <ProtectedRoute path={WarehouseDocumentRoute}>
                <WarehouseDocumentAddPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documentos-almacen/:id"
            element={
              <ProtectedRoute path={WarehouseDocumentRoute}>
                <WarehouseDocumentDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/documentos-almacen/actualizar/:id"
            element={
              <ProtectedRoute path={WarehouseDocumentRoute}>
                <WarehouseDocumentEditPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/kardex"
            element={
              <ProtectedRoute path="/kardex">
                <WarehouseKardexPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventario-valorizado"
            element={
              <ProtectedRoute path="/inventario-valorizado">
                <ValuatedInventoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={NationalityRoute}
            element={
              <ProtectedRoute path={NationalityRoute}>
                <NationalityPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ClientRoute}
            element={
              <ProtectedRoute path={ClientRoute}>
                <ClientPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clientes/agregar"
            element={
              <ProtectedRoute path={ClientRoute}>
                <ClientAddPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clientes/editar/:id"
            element={
              <ProtectedRoute path={ClientRoute}>
                <ClientEditPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={SupplierRoute}
            element={
              <ProtectedRoute path={SupplierRoute}>
                <SupplierPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/proveedores/agregar"
            element={
              <ProtectedRoute path={SupplierRoute}>
                <SupplierAddPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/proveedores/editar/:id"
            element={
              <ProtectedRoute path={SupplierRoute}>
                <SupplierEditPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={WorkerRoute}
            element={
              <ProtectedRoute path={WorkerRoute}>
                <WorkerPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trabajadores/agregar"
            element={
              <ProtectedRoute path={WorkerRoute}>
                <WorkerAddPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trabajadores/editar/:id"
            element={
              <ProtectedRoute path={WorkerRoute}>
                <WorkerEditPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={DriverRoute}
            element={
              <ProtectedRoute path={DriverRoute}>
                <DriverPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/conductores/agregar"
            element={
              <ProtectedRoute path={DriverRoute}>
                <DriverAddPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/conductores/editar/:id"
            element={
              <ProtectedRoute path={DriverRoute}>
                <DriverEditPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={PaymentConceptRoute}
            element={
              <ProtectedRoute path={PaymentConceptRoute}>
                <PaymentConceptPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={BusinessTypeRoute}
            element={
              <ProtectedRoute path={BusinessTypeRoute}>
                <BusinessTypePage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ZoneRoute}
            element={
              <ProtectedRoute path={ZoneRoute}>
                <ZonePage />
              </ProtectedRoute>
            }
          />

          <Route
            path={JobPositionRoute}
            element={
              <ProtectedRoute path={JobPositionRoute}>
                <JobPositionPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={SettingRoute}
            element={
              <ProtectedRoute path={SettingRoute}>
                <SettingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={DocumentTypeRoute}
            element={
              <ProtectedRoute path={DocumentTypeRoute}>
                <DocumentTypePage />
              </ProtectedRoute>
            }
          />

          <Route
            path={PurchaseRoute}
            element={
              <ProtectedRoute path={PurchaseRoute}>
                <PurchasePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/compras/agregar"
            element={
              <ProtectedRoute path={PurchaseRoute}>
                <PurchaseAddPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/compras/actualizar/:id"
            element={
              <ProtectedRoute path={PurchaseRoute}>
                <PurchaseEditPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/compras/detalle/:id"
            element={
              <ProtectedRoute path={PurchaseRoute}>
                <PurchaseDetailViewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={PurchaseInstallmentRoute}
            element={
              <ProtectedRoute path={PurchaseInstallmentRoute}>
                <PurchaseInstallmentPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={PriceListRoute}
            element={
              <ProtectedRoute path={PriceListRoute}>
                <PriceListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={`${PriceListRoute}/agregar`}
            element={
              <ProtectedRoute path={PriceListRoute}>
                <PriceListAddPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={`${PriceListRoute}/editar/:id`}
            element={
              <ProtectedRoute path={PriceListRoute}>
                <PriceListEditPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={SaleRoute}
            element={
              <ProtectedRoute path={SaleRoute}>
                <SalePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ventas/agregar"
            element={
              <ProtectedRoute path={SaleRoute}>
                <SaleAddPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ventas/actualizar/:id"
            element={
              <ProtectedRoute path={SaleRoute}>
                <SaleEditPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ventas/gestionar/:id"
            element={
              <ProtectedRoute path={SaleRoute}>
                <SaleManagePage />
              </ProtectedRoute>
            }
          />

          <Route
            path={CreditNoteRoute}
            element={
              <ProtectedRoute path={CreditNoteRoute}>
                <CreditNotePage />
              </ProtectedRoute>
            }
          />

          <Route
            path={CreditNoteRouteAdd}
            element={
              <ProtectedRoute path={CreditNoteRoute}>
                <CreditNoteAddPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={PurchaseCreditNoteRoute}
            element={
              <ProtectedRoute path={PurchaseCreditNoteRoute}>
                <PurchaseCreditNotePage />
              </ProtectedRoute>
            }
          />

          <Route
            path={PurchaseCreditNoteRouteAdd}
            element={
              <ProtectedRoute path={PurchaseCreditNoteRoute}>
                <PurchaseCreditNoteAddPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={PurchaseCreditNoteRouteUpdate}
            element={
              <ProtectedRoute path={PurchaseCreditNoteRoute}>
                <PurchaseCreditNoteEditPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={GuideRoute}
            element={
              <ProtectedRoute path={GuideRoute}>
                <GuidePage />
              </ProtectedRoute>
            }
          />

          <Route
            path={`${GuideRoute}/agregar`}
            element={
              <ProtectedRoute path={GuideRoute}>
                <GuideAddPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={`${GuideRoute}/actualizar/:id`}
            element={
              <ProtectedRoute path={GuideRoute}>
                <GuideEditPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={`${GuideRoute}/:id`}
            element={
              <ProtectedRoute path={GuideRoute}>
                <GuideDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Rutas de Caja Chica */}
          <Route
            path={BoxShiftRoute}
            element={
              <ProtectedRoute path={BoxShiftRoute}>
                <BoxShiftPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/turnos-caja/:id"
            element={
              <ProtectedRoute path={BoxShiftRoute}>
                <BoxShiftDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Rutas de Cuentas por Cobrar */}
          <Route
            path={AccountsReceivableRoute}
            element={
              <ProtectedRoute path={AccountsReceivableRoute}>
                <AccountsReceivablePage />
              </ProtectedRoute>
            }
          />

          {/* Rutas de Cuentas por Pagar */}
          <Route
            path={AccountsPayableRoute}
            element={
              <ProtectedRoute path={AccountsPayableRoute}>
                <AccountsPayablePage />
              </ProtectedRoute>
            }
          />

          {/* Rutas de Planillas de Reparto */}
          <Route
            path={DeliverySheetRoute}
            element={
              <ProtectedRoute path={DeliverySheetRoute}>
                <DeliverySheetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={DeliverySheetRouteAdd}
            element={
              <ProtectedRoute path={DeliverySheetRouteAdd}>
                <DeliverySheetAddPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={DeliverySheetRouteUpdate}
            element={
              <ProtectedRoute path={DeliverySheetRouteUpdate}>
                <DeliverySheetAddPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={DeliverySheetSettlementRoute}
            element={
              <ProtectedRoute path={DeliverySheetRoute}>
                <SettlementPage />
              </ProtectedRoute>
            }
          />

          {/* Rutas de Reportes */}
          <Route
            path={CUSTOMER_ACCOUNT_STATEMENT_ROUTE}
            element={
              <ProtectedRoute path={CUSTOMER_ACCOUNT_STATEMENT_ROUTE}>
                <CustomerAccountStatementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={INVENTORY_REPORT_ROUTE}
            element={
              <ProtectedRoute path={INVENTORY_REPORT_ROUTE}>
                <InventoryReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={KARDEX_REPORT_ROUTE}
            element={
              <ProtectedRoute path={KARDEX_REPORT_ROUTE}>
                <KardexReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={SALE_BY_SELLER_REPORT_ROUTE}
            element={
              <ProtectedRoute path={SALE_BY_SELLER_REPORT_ROUTE}>
                <SaleBySellerReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={DELIVERY_SHEET_REPORT_ROUTE}
            element={
              <ProtectedRoute path={DELIVERY_SHEET_REPORT_ROUTE}>
                <DeliverySheetReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={COMMISSIONS_REPORT_ROUTE}
            element={
              <ProtectedRoute path={COMMISSIONS_REPORT_ROUTE}>
                <CommissionsReportPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/inicio" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
