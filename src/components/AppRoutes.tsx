import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "@/pages/home/components/HomePage";
import TypeUserPage from "@/pages/type-users/components/TypeUserPage";
import UserPage from "@/pages/users/components/UserPage";
import CompanyPage from "@/pages/company/components/CompanyPage";
import BranchPage from "@/pages/branch/components/BranchPage";
import WarehousePage from "@/pages/warehouse/components/WarehousePage";
import BrandPage from "@/pages/brand/components/BrandPage";
import BoxPage from "@/pages/box/components/BoxPage";
import VehiclePage from "@/pages/vehicle/components/VehiclePage";
import UnitPage from "@/pages/unit/components/UnitPage";
import CategoryPage from "@/pages/category/components/CategoryPage";
import ProductPage from "@/pages/product/components/ProductPage";
import ProductDetail from "@/pages/product/components/ProductDetail";
import ProductAddPage from "@/pages/product/components/ProductAddPage";
import ProductEditPage from "@/pages/product/components/ProductEditPage";
import ProductTypePage from "@/pages/product-type/components/ProductTypePage";
import NationalityPage from "@/pages/nationality/components/NationalityPage";
import ClientPage from "@/pages/client/components/ClientPage";
import ClientAddPage from "@/pages/client/components/ClientAddPage";
import ClientEditPage from "@/pages/client/components/ClientEditPage";
import SupplierPage from "@/pages/supplier/components/SupplierPage";
import SupplierAddPage from "@/pages/supplier/components/SupplierAddPage";
import SupplierEditPage from "@/pages/supplier/components/SupplierEditPage";
import WorkerPage from "@/pages/worker/components/WorkerPage";
import WorkerAddPage from "@/pages/worker/components/WorkerAddPage";
import WorkerEditPage from "@/pages/worker/components/WorkerEditPage";
import PaymentConceptPage from "@/pages/payment-concept/components/PaymentConceptPage";
import BusinessTypePage from "@/pages/businesstype/components/BusinessTypePage";
import ZonePage from "@/pages/zone/components/ZonePage";
import JobPositionPage from "@/pages/jobposition/components/JobPositionPage";
import SettingPage from "@/pages/setting/components/SettingPage";
import DocumentTypePage from "@/pages/document-type/components/DocumentTypePage";
import PurchaseInstallmentPage from "@/pages/purchaseinstallment/components/PurchaseInstallmentPage";
import PriceListPage from "@/pages/pricelist/components/PriceListPage";
import PriceListAddPage from "@/pages/pricelist/components/PriceListAddPage";
import PriceListEditPage from "@/pages/pricelist/components/PriceListEditPage";
import PurchasePage from "@/pages/purchase/components/PurchasePage";
import PurchaseAddPage from "@/pages/purchase/components/PurchaseAddPage";
import { PurchaseDetailViewPage } from "@/pages/purchase/components/PurchaseDetailViewPage";
import PurchaseEditPage from "@/pages/purchase/components/PurchaseEditPage";
import { SaleAddPage, SaleEditPage, SalePage } from "@/pages/sale/components";
import SaleManagePage from "@/pages/sale/components/SaleManagePage";
import CreditNotePage from "@/pages/credit-note/components/CreditNotePage";
import CreditNoteAddPage from "@/pages/credit-note/components/CreditNoteAddPage";
import GuidePage from "@/pages/guide/components/GuidePage";
import GuideAddPage from "@/pages/guide/components/GuideAddPage";
import GuideEditPage from "@/pages/guide/components/GuideEditPage";
import GuideDetailPage from "@/pages/guide/components/GuideDetailPage";
import { BoxShiftDetailPage, BoxShiftPage } from "@/pages/box-shift/components";
import AccountsReceivablePage from "@/pages/accounts-receivable/components/AccountsReceivablePage";
import AccountsPayablePage from "@/pages/accounts-payable/components/AccountsPayablePage";
import {
  ValuatedInventoryPage,
  WarehouseDocumentAddPage,
  WarehouseDocumentEditPage,
  WarehouseDocumentPage,
  WarehouseKardexPage,
} from "@/pages/warehouse-document/components";
import WarehouseDocumentDetailPage from "@/pages/warehouse-document/components/WarehouseDocumentDetailPage";
import DeliverySheetPage from "@/pages/deliverysheet/components/DeliverySheetPage";
import SettlementPage from "@/pages/deliverysheet/components/SettlementPage";
import { DeliverySheetAddPage } from "@/pages/deliverysheet";
import DriverPage from "@/pages/driver/components/DriverPage";
import DriverAddPage from "@/pages/driver/components/DriverAddPage";
import DriverEditPage from "@/pages/driver/components/DriverEditPage";
import {
  CustomerAccountStatementPage,
  InventoryReportPage,
  KardexReportPage,
} from "@/pages/reports/components";
import PurchaseCreditNotePage from "@/pages/purchase-credit-note/components/PurchaseCreditNotePage";
import PurchaseCreditNoteAddPage from "@/pages/purchase-credit-note/components/PurchaseCreditNoteAddPage";
import PurchaseCreditNoteEditPage from "@/pages/purchase-credit-note/components/PurchaseCreditNoteEditPage";
import SaleBySellerReportPage from "@/pages/reports/components/SaleBySellerReportPage";
import DeliverySheetReportPage from "@/pages/reports/components/DeliverySheetReportPage";
import CommissionsReportPage from "@/pages/reports/components/CommissionsReportPage";
import CarLoadReportPage from "@/pages/reports/components/CarLoadReportPage";
import { TYPE_USER } from "@/pages/type-users/lib/typeUser.interface";
import { USER } from "@/pages/users/lib/User.interface";
import { COMPANY } from "@/pages/company/lib/company.interface";
import { BRANCH } from "@/pages/branch/lib/branch.interface";
import { WAREHOUSE } from "@/pages/warehouse/lib/warehouse.interface";
import { BRAND } from "@/pages/brand/lib/brand.interface";
import { BOX } from "@/pages/box/lib/box.interface";
import { VEHICLE } from "@/pages/vehicle/lib/vehicle.interface";
import { UNIT } from "@/pages/unit/lib/unit.interface";
import { CATEGORY } from "@/pages/category/lib/category.interface";
import { PRODUCT } from "@/pages/product/lib/product.interface";
import { PRODUCT_TYPE } from "@/pages/product-type/lib/product-type.interface";
import { NATIONALITY } from "@/pages/nationality/lib/nationality.interface";
import { CLIENT } from "@/pages/client/lib/client.interface";
import { SUPPLIER } from "@/pages/supplier/lib/supplier.interface";
import { WORKER } from "@/pages/worker/lib/worker.interface";
import { PAYMENT_CONCEPT } from "@/pages/payment-concept/lib/payment-concept.interface";
import { BUSINESSTYPE } from "@/pages/businesstype/lib/businesstype.interface";
import { ZONE } from "@/pages/zone/lib/zone.interface";
import { JOBPOSITION } from "@/pages/jobposition/lib/jobposition.interface";
import { SETTING } from "@/pages/setting/lib/setting.interface";
import { DOCUMENT_TYPE } from "@/pages/document-type/lib/document-type.interface";
import { PURCHASE_INSTALLMENT } from "@/pages/purchaseinstallment/lib/purchaseinstallment.interface";
import { PRICELIST } from "@/pages/pricelist/lib/pricelist.interface";
import { PURCHASE } from "@/pages/purchase/lib/purchase.interface";
import { SaleRoute } from "@/pages/sale/lib/sale.interface";
import { CREDIT_NOTE } from "@/pages/credit-note/lib/credit-note.interface";
import { GUIDE } from "@/pages/guide/lib/guide.interface";
import { BOX_SHIFT } from "@/pages/box-shift/lib/box-shift.interface";
import { AccountsReceivableRoute } from "@/pages/accounts-receivable/lib/accounts-receivable.interface";
import { ACCOUNTS_PAYABLE } from "@/pages/accounts-payable/lib/accounts-payable.interface";
import { WAREHOUSE_DOCUMENT } from "@/pages/warehouse-document/lib/warehouse-document.interface";
import {
  DELIVERY_SHEET,
  DeliverySheetSettlementRoute,
} from "@/pages/deliverysheet/lib/deliverysheet.interface";
import { DRIVER } from "@/pages/driver/lib/driver.interface";
import {
  CAR_LOAD_REPORT_ROUTE,
  COMMISSIONS_REPORT_ROUTE,
  CUSTOMER_ACCOUNT_STATEMENT_ROUTE,
  DELIVERY_SHEET_REPORT_ROUTE,
  INVENTORY_REPORT_ROUTE,
  KARDEX_REPORT_ROUTE,
  SALE_BY_SELLER_REPORT_ROUTE,
} from "@/pages/reports/lib/reports.interface";
import { PURCHASE_CREDIT_NOTE } from "@/pages/purchase-credit-note/lib/purchase-credit-note.interface";
import WarehouseProductPage from "@/pages/warehouse-product/components/WarehouseProductPage";
import { WAREHOUSE_PRODUCT } from "@/pages/warehouse-product/lib/warehouse-product.interface";

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
const { ROUTE: WarehouseProductRoute } = WAREHOUSE_PRODUCT;
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

/**
 * Árbol de rutas de la app sin BrowserRouter ni Layout.
 * Se renderiza dentro de cada MemoryRouter (una por ventana/tab).
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/inicio" replace />} />
      <Route path="/inicio" element={<HomePage />} />

      {/* Seguridad */}
      <Route path={TypeUserRoute} element={<TypeUserPage />} />
      <Route path={UserRoute} element={<UserPage />} />

      {/* Configuración */}
      <Route path={CompanyRoute} element={<CompanyPage />} />
      <Route path={BranchRoute} element={<BranchPage />} />
      <Route path={WarehouseRoute} element={<WarehousePage />} />
      <Route path={BrandRoute} element={<BrandPage />} />
      <Route path={BoxRoute} element={<BoxPage />} />
      <Route path={VehicleRoute} element={<VehiclePage />} />
      <Route path={UnitRoute} element={<UnitPage />} />
      <Route path={CategoryRoute} element={<CategoryPage />} />
      <Route path={ProductTypeRoute} element={<ProductTypePage />} />
      <Route path={NationalityRoute} element={<NationalityPage />} />
      <Route path={PaymentConceptRoute} element={<PaymentConceptPage />} />
      <Route path={BusinessTypeRoute} element={<BusinessTypePage />} />
      <Route path={ZoneRoute} element={<ZonePage />} />
      <Route path={JobPositionRoute} element={<JobPositionPage />} />
      <Route path={SettingRoute} element={<SettingPage />} />
      <Route path={DocumentTypeRoute} element={<DocumentTypePage />} />
      <Route path={PurchaseInstallmentRoute} element={<PurchaseInstallmentPage />} />

      {/* Productos */}
      <Route path={ProductRoute} element={<ProductPage />} />
      <Route path={`${ProductRoute}/:id`} element={<ProductDetail />} />
      <Route path="/productos/agregar" element={<ProductAddPage />} />
      <Route path="/productos/actualizar/:id" element={<ProductEditPage />} />

      {/* Clientes */}
      <Route path={ClientRoute} element={<ClientPage />} />
      <Route path="/clientes/agregar" element={<ClientAddPage />} />
      <Route path="/clientes/editar/:id" element={<ClientEditPage />} />

      {/* Proveedores */}
      <Route path={SupplierRoute} element={<SupplierPage />} />
      <Route path="/proveedores/agregar" element={<SupplierAddPage />} />
      <Route path="/proveedores/editar/:id" element={<SupplierEditPage />} />

      {/* Trabajadores */}
      <Route path={WorkerRoute} element={<WorkerPage />} />
      <Route path="/trabajadores/agregar" element={<WorkerAddPage />} />
      <Route path="/trabajadores/editar/:id" element={<WorkerEditPage />} />

      {/* Conductores */}
      <Route path={DriverRoute} element={<DriverPage />} />
      <Route path="/conductores/agregar" element={<DriverAddPage />} />
      <Route path="/conductores/editar/:id" element={<DriverEditPage />} />

      {/* Lista de precios */}
      <Route path={PriceListRoute} element={<PriceListPage />} />
      <Route path={`${PriceListRoute}/agregar`} element={<PriceListAddPage />} />
      <Route path={`${PriceListRoute}/editar/:id`} element={<PriceListEditPage />} />

      {/* Compras */}
      <Route path={PurchaseRoute} element={<PurchasePage />} />
      <Route path="/compras/agregar" element={<PurchaseAddPage />} />
      <Route path="/compras/actualizar/:id" element={<PurchaseEditPage />} />
      <Route path="/compras/detalle/:id" element={<PurchaseDetailViewPage />} />

      {/* Notas de crédito compra */}
      <Route path={PurchaseCreditNoteRoute} element={<PurchaseCreditNotePage />} />
      <Route path={PurchaseCreditNoteRouteAdd} element={<PurchaseCreditNoteAddPage />} />
      <Route path={PurchaseCreditNoteRouteUpdate} element={<PurchaseCreditNoteEditPage />} />

      {/* Ventas */}
      <Route path={SaleRoute} element={<SaleAddPage />} />
      <Route path="/ventas/listado" element={<SalePage />} />
      <Route path="/ventas/agregar" element={<SaleAddPage />} />
      <Route path="/ventas/actualizar/:id" element={<SaleEditPage />} />
      <Route path="/ventas/gestionar/:id" element={<SaleManagePage />} />

      {/* Notas de crédito venta */}
      <Route path={CreditNoteRoute} element={<CreditNotePage />} />
      <Route path={CreditNoteRouteAdd} element={<CreditNoteAddPage />} />

      {/* Guías */}
      <Route path={GuideRoute} element={<GuidePage />} />
      <Route path={`${GuideRoute}/agregar`} element={<GuideAddPage />} />
      <Route path={`${GuideRoute}/actualizar/:id`} element={<GuideEditPage />} />
      <Route path={`${GuideRoute}/:id`} element={<GuideDetailPage />} />

      {/* Turnos de caja */}
      <Route path={BoxShiftRoute} element={<BoxShiftPage />} />
      <Route path="/turnos-caja/:id" element={<BoxShiftDetailPage />} />

      {/* Cuentas */}
      <Route path={AccountsReceivableRoute} element={<AccountsReceivablePage />} />
      <Route path={AccountsPayableRoute} element={<AccountsPayablePage />} />

      {/* Productos en almacén */}
      <Route path={WarehouseProductRoute} element={<WarehouseProductPage />} />

      {/* Documentos de almacén */}
      <Route path={WarehouseDocumentRoute} element={<WarehouseDocumentPage />} />
      <Route path="/documentos-almacen/agregar" element={<WarehouseDocumentAddPage />} />
      <Route path="/documentos-almacen/:id" element={<WarehouseDocumentDetailPage />} />
      <Route path="/documentos-almacen/actualizar/:id" element={<WarehouseDocumentEditPage />} />
      <Route path="/kardex" element={<WarehouseKardexPage />} />
      <Route path="/inventario-valorizado" element={<ValuatedInventoryPage />} />

      {/* Planillas de reparto */}
      <Route path={DeliverySheetRoute} element={<DeliverySheetAddPage />} />
      <Route path="/planillas/listado" element={<DeliverySheetPage />} />
      <Route path={DeliverySheetRouteAdd} element={<DeliverySheetAddPage />} />
      <Route path={DeliverySheetRouteUpdate} element={<DeliverySheetAddPage />} />
      <Route path={DeliverySheetSettlementRoute} element={<SettlementPage />} />

      {/* Reportes */}
      <Route path={CUSTOMER_ACCOUNT_STATEMENT_ROUTE} element={<CustomerAccountStatementPage />} />
      <Route path={INVENTORY_REPORT_ROUTE} element={<InventoryReportPage />} />
      <Route path={KARDEX_REPORT_ROUTE} element={<KardexReportPage />} />
      <Route path={SALE_BY_SELLER_REPORT_ROUTE} element={<SaleBySellerReportPage />} />
      <Route path={DELIVERY_SHEET_REPORT_ROUTE} element={<DeliverySheetReportPage />} />
      <Route path={COMMISSIONS_REPORT_ROUTE} element={<CommissionsReportPage />} />
      <Route path={CAR_LOAD_REPORT_ROUTE} element={<CarLoadReportPage />} />

      <Route path={PurchaseInstallmentRoute} element={<PurchaseInstallmentPage />} />

      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}
