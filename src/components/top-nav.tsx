import {
  LayoutGrid,
  ShieldUser,
  Package,
  ShoppingBag,
  DollarSign,
  ClipboardCheck,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TYPE_USER } from "@/pages/type-users/lib/typeUser.interface";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
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
import { PRICELIST } from "@/pages/pricelist/lib/pricelist.interface";
import { PURCHASE } from "@/pages/purchase/lib/purchase.interface";
import { GUIDE } from "@/pages/guide/lib/guide.interface";
import { hasAccessToRoute } from "@/App";
import { ENABLE_PERMISSION_VALIDATION } from "@/lib/permissions.config";
import { SALE, SaleRoute } from "@/pages/sale/lib/sale.interface";
import { CREDIT_NOTE } from "@/pages/credit-note/lib/credit-note.interface";
import { BOX_SHIFT } from "@/pages/box-shift/lib/box-shift.interface";
import {
  ACCOUNTS_RECEIVABLE,
  AccountsReceivableRoute,
} from "@/pages/accounts-receivable/lib/accounts-receivable.interface";
import { ACCOUNTS_PAYABLE } from "@/pages/accounts-payable/lib/accounts-payable.interface";
import { WAREHOUSE_DOCUMENT } from "@/pages/warehouse-document/lib/warehouse-document.interface";
import { WAREHOUSE_PRODUCT } from "@/pages/warehouse-product/lib/warehouse-product.interface";
import {
  DELIVERY_SHEET,
  DeliverySheetSettlementRoute,
} from "@/pages/deliverysheet/lib/deliverysheet.interface";
import { DRIVER } from "@/pages/driver/lib/driver.interface";
import {
  CAR_LOAD_REPORT_ROUTE,
  COMMISSIONS_REPORT_ROUTE,
  CUSTOMER_ACCOUNT_STATEMENT_ROUTE,
  DETAILED_SALES_REPORT_ROUTE,
  INVENTORY_REPORT_ROUTE,
  KARDEX_REPORT_ROUTE,
  REPORTS,
  SALE_BY_SELLER_REPORT_ROUTE,
} from "@/pages/reports/lib/reports.interface";
import { PURCHASE_CREDIT_NOTE } from "@/pages/purchase-credit-note/lib/purchase-credit-note.interface";
import { SettlementTitle } from "@/pages/deliverysheet/components/settlement/SettlementHeader";
import { CustomerAccountStatementTitle } from "@/pages/reports/components/CustomerAccountStatementPage";
import type { LucideIcon } from "lucide-react";
import { useWindowManager } from "@/stores/window-manager.store";

const {
  ICON_REACT: TypeUserIcon,
  ROUTE: TypeUserRoute,
  MODEL: { name: TypeUserTitle },
} = TYPE_USER;
const {
  ICON_REACT: UserIcon,
  ROUTE: UserRoute,
  MODEL: { name: UserTitle },
} = USER;
const {
  ICON_REACT: CompanyIcon,
  ROUTE: CompanyRoute,
  MODEL: { name: CompanyTitle },
} = COMPANY;
const {
  ICON_REACT: BranchIcon,
  ROUTE: BranchRoute,
  MODEL: { name: BranchTitle },
} = BRANCH;
const {
  ICON_REACT: WarehouseIcon,
  ROUTE: WarehouseRoute,
  MODEL: { name: WarehouseTitle },
} = WAREHOUSE;
const {
  ICON_REACT: BrandIcon,
  ROUTE: BrandRoute,
  MODEL: { name: BrandTitle },
} = BRAND;
const {
  ICON_REACT: BoxIcon,
  ROUTE: BoxRoute,
  MODEL: { name: BoxTitle },
} = BOX;
const {
  ICON_REACT: VehicleIcon,
  ROUTE: VehicleRoute,
  MODEL: { name: VehicleTitle },
} = VEHICLE;
const {
  ICON_REACT: UnitIcon,
  ROUTE: UnitRoute,
  MODEL: { name: UnitTitle },
} = UNIT;
const {
  ICON_REACT: CategoryIcon,
  ROUTE: CategoryRoute,
  MODEL: { name: CategoryTitle },
} = CATEGORY;
const {
  ICON_REACT: ProductIcon,
  ROUTE: ProductRoute,
  MODEL: { name: ProductTitle },
} = PRODUCT;
const {
  ICON_REACT: ProductTypeIcon,
  ROUTE: ProductTypeRoute,
  MODEL: { name: ProductTypeTitle },
} = PRODUCT_TYPE;
const {
  ICON_REACT: NationalityIcon,
  ROUTE: NationalityRoute,
  MODEL: { name: NationalityTitle },
} = NATIONALITY;
const {
  ICON_REACT: ClientIcon,
  ROUTE: ClientRoute,
  MODEL: { name: ClientTitle },
} = CLIENT;
const {
  ICON_REACT: SupplierIcon,
  ROUTE: SupplierRoute,
  MODEL: { name: SupplierTitle },
} = SUPPLIER;
const {
  ICON_REACT: WorkerIcon,
  ROUTE: WorkerRoute,
  MODEL: { name: WorkerTitle },
} = WORKER;
const {
  ICON_REACT: DriverIcon,
  ROUTE: DriverRoute,
  MODEL: { name: DriverTitle },
} = DRIVER;
const {
  ICON_REACT: PaymentConceptIcon,
  ROUTE: PaymentConceptRoute,
  MODEL: { name: PaymentConceptTitle },
} = PAYMENT_CONCEPT;
const {
  ICON_REACT: BusinessTypeIcon,
  ROUTE: BusinessTypeRoute,
  MODEL: { name: BusinessTypeTitle },
} = BUSINESSTYPE;
const {
  ICON_REACT: ZoneIcon,
  ROUTE: ZoneRoute,
  MODEL: { name: ZoneTitle },
} = ZONE;
const {
  ICON_REACT: JobPositionIcon,
  ROUTE: JobPositionRoute,
  MODEL: { name: JobPositionTitle },
} = JOBPOSITION;
const {
  ICON_REACT: SettingIcon,
  ROUTE: SettingRoute,
  MODEL: { name: SettingTitle },
} = SETTING;
const {
  ICON_REACT: DocumentTypeIcon,
  ROUTE: DocumentTypeRoute,
  MODEL: { name: DocumentTypeTitle },
} = DOCUMENT_TYPE;
const {
  ICON_REACT: PriceListIcon,
  ROUTE: PriceListRoute,
  MODEL: { name: PriceListTitle },
} = PRICELIST;
const {
  ICON_REACT: PurchaseIcon,
  ROUTE: PurchaseRoute,
  MODEL: { name: PurchaseTitle },
} = PURCHASE;
const {
  ICON_REACT: WarehouseDocumentIcon,
  ROUTE: WarehouseDocumentRoute,
  MODEL: { plural: WarehouseDocumentTitle },
} = WAREHOUSE_DOCUMENT;
const {
  ICON_REACT: GuideIcon,
  ROUTE: GuideRoute,
  MODEL: { name: GuideTitle },
} = GUIDE;
const {
  ICON_REACT: BoxShiftIcon,
  ROUTE: BoxShiftRoute,
  MODEL: { plural: BoxShiftTitle },
} = BOX_SHIFT;
const { ICON_REACT: AccountsPayableIcon, ROUTE: AccountsPayableRoute } =
  ACCOUNTS_PAYABLE;
const {
  ICON_REACT: DeliverySheetIcon,
  ROUTE: DeliverySheetRoute,
  MODEL: { plural: DeliverySheetTitle },
} = DELIVERY_SHEET;
const {
  ICON_REACT: CreditNoteIcon,
  ROUTE: CreditNoteRoute,
  MODEL: { plural: CreditNoteTitle },
} = CREDIT_NOTE;
const {
  ICON_REACT: PurchaseCreditNoteIcon,
  ROUTE: PurchaseCreditNoteRoute,
  MODEL: { plural: PurchaseCreditNoteTitle },
} = PURCHASE_CREDIT_NOTE;
const {
  ICON_REACT: ReportsIcon,
  MODEL: { name: ReportsTitle },
} = REPORTS;
const {
  ICON_REACT: WarehouseProductIcon,
  ROUTE: WarehouseProductRoute,
  MODEL: { plural: WarehouseProductTitle },
} = WAREHOUSE_PRODUCT;

export type NavSubItem = { title: string; url: string; icon?: LucideIcon };
export type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: NavSubItem[];
};

export const navData: NavItem[] = [
  { title: "Dashboard", url: "/inicio", icon: LayoutGrid },
  {
    title: "Mantenimiento",
    url: "#",
    icon: ShoppingBag,
    items: [
      { title: ClientTitle, url: ClientRoute, icon: ClientIcon },
      { title: SupplierTitle, url: SupplierRoute, icon: SupplierIcon },
      { title: ProductTitle, url: ProductRoute, icon: ProductIcon },
      { title: PriceListTitle, url: PriceListRoute, icon: PriceListIcon },
      { title: ZoneTitle, url: ZoneRoute, icon: ZoneIcon },
      { title: DriverTitle, url: DriverRoute, icon: DriverIcon },
      { title: WorkerTitle, url: WorkerRoute, icon: WorkerIcon },
    ],
  },
  {
    title: "Ing. Facturas",
    url: "#",
    icon: DollarSign,
    items: [
      { title: PurchaseTitle, url: PurchaseRoute, icon: PurchaseIcon },
      {
        title: PurchaseCreditNoteTitle!,
        url: PurchaseCreditNoteRoute,
        icon: PurchaseCreditNoteIcon,
      },
      {
        title: ACCOUNTS_RECEIVABLE.MODEL.plural,
        url: AccountsReceivableRoute,
        icon: DollarSign,
      },
      {
        title: ACCOUNTS_PAYABLE.MODEL.plural,
        url: AccountsPayableRoute,
        icon: AccountsPayableIcon,
      },
    ],
  },
  {
    title: "Transacciones",
    url: "#",
    icon: Package,
    items: [
      { title: SALE.MODEL.plural!, url: SaleRoute, icon: ShoppingBag },
      { title: CreditNoteTitle!, url: CreditNoteRoute, icon: CreditNoteIcon },
      {
        title: WarehouseDocumentTitle!,
        url: WarehouseDocumentRoute,
        icon: WarehouseDocumentIcon,
      },
      { title: GuideTitle!, url: GuideRoute, icon: GuideIcon },
      {
        title: DeliverySheetTitle!,
        url: DeliverySheetRoute,
        icon: DeliverySheetIcon,
      },
      {
        title: SettlementTitle!,
        url: DeliverySheetSettlementRoute,
        icon: ClipboardCheck,
      },
      {
        title: CustomerAccountStatementTitle!,
        url: CUSTOMER_ACCOUNT_STATEMENT_ROUTE,
        icon: ReportsIcon,
      },
      { title: BoxShiftTitle!, url: BoxShiftRoute, icon: BoxShiftIcon },
      {
        title: WarehouseProductTitle!,
        url: WarehouseProductRoute,
        icon: WarehouseProductIcon,
      },
    ],
  },
  {
    title: ReportsTitle,
    url: "#",
    icon: ReportsIcon,
    items: [
      { title: "Inventario", url: INVENTORY_REPORT_ROUTE, icon: ReportsIcon },
      { title: "Kardex", url: KARDEX_REPORT_ROUTE, icon: ReportsIcon },
      {
        title: "Ventas por Vendedor",
        url: SALE_BY_SELLER_REPORT_ROUTE,
        icon: ReportsIcon,
      },
      { title: "Comisiones", url: COMMISSIONS_REPORT_ROUTE, icon: ReportsIcon },
      {
        title: "Llenado de Carros",
        url: CAR_LOAD_REPORT_ROUTE,
        icon: ReportsIcon,
      },
      {
        title: "Ventas Detallado",
        url: DETAILED_SALES_REPORT_ROUTE,
        icon: ReportsIcon,
      },
    ],
  },
  {
    title: "Configuración",
    url: "#",
    icon: SettingIcon,
    items: [
      { title: CompanyTitle, url: CompanyRoute, icon: CompanyIcon },
      { title: BranchTitle, url: BranchRoute, icon: BranchIcon },
      { title: WarehouseTitle, url: WarehouseRoute, icon: WarehouseIcon },
      { title: BoxTitle, url: BoxRoute, icon: BoxIcon },
      {
        title: PaymentConceptTitle,
        url: PaymentConceptRoute,
        icon: PaymentConceptIcon,
      },
      { title: VehicleTitle, url: VehicleRoute, icon: VehicleIcon },
      { title: CategoryTitle, url: CategoryRoute, icon: CategoryIcon },
      { title: ProductTypeTitle, url: ProductTypeRoute, icon: ProductTypeIcon },
      { title: BrandTitle, url: BrandRoute, icon: BrandIcon },
      { title: UnitTitle, url: UnitRoute, icon: UnitIcon },
      { title: SettingTitle, url: SettingRoute, icon: SettingIcon },
      { title: NationalityTitle, url: NationalityRoute, icon: NationalityIcon },
      {
        title: BusinessTypeTitle,
        url: BusinessTypeRoute,
        icon: BusinessTypeIcon,
      },
      { title: JobPositionTitle, url: JobPositionRoute, icon: JobPositionIcon },
      {
        title: DocumentTypeTitle,
        url: DocumentTypeRoute,
        icon: DocumentTypeIcon,
      },
    ],
  },
  {
    title: "Seguridad",
    url: "#",
    icon: ShieldUser,
    items: [
      { title: UserTitle, url: UserRoute, icon: UserIcon },
      { title: TypeUserTitle, url: TypeUserRoute, icon: TypeUserIcon },
    ],
  },
];

export function TopNav() {
  const { access } = useAuthStore();
  const [filteredNav, setFilteredNav] = useState<NavItem[]>([]);
  const { tabs, activeTabId, openTab } = useWindowManager();

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activePath = activeTab?.path ?? "";

  useEffect(() => {
    if (!ENABLE_PERMISSION_VALIDATION) {
      setFilteredNav(navData);
      return;
    }
    if (!access) return;

    const filterNav = (items: NavItem[]): NavItem[] =>
      items.reduce<NavItem[]>((acc, item) => {
        if (item.url === "#" && item.items) {
          const filteredItems = item.items.filter((sub) =>
            hasAccessToRoute(access, sub.url),
          );
          if (filteredItems.length > 0) {
            acc.push({ ...item, items: filteredItems });
          }
        } else if (hasAccessToRoute(access, item.url)) {
          acc.push(item);
        }
        return acc;
      }, []);

    setFilteredNav(filterNav(navData));
  }, [access]);

  const isSubItemActive = (url: string) =>
    activePath === url || activePath.startsWith(url + "/");

  const isItemActive = (item: NavItem): boolean => {
    if (!item.items) return activePath === item.url;
    return item.items.some((sub) => isSubItemActive(sub.url));
  };

  return (
    <NavigationMenu viewport={false} className="justify-start">
      <NavigationMenuList className="gap-0">
        {filteredNav.map((item) =>
          item.items ? (
            <NavigationMenuItem key={item.title}>
              <NavigationMenuTrigger
                className={cn(
                  "h-7 text-sm px-1.5 bg-transparent hover:bg-accent/50 uppercase",
                  isItemActive(item) && "text-primary font-semibold",
                )}
              >
                {item.icon && <item.icon className="mr-1 size-3.5" />}
                {item.title}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid min-w-48 w-auto gap-0 p-1">
                  {item.items.map((sub) => (
                    <li key={sub.title}>
                      <NavigationMenuLink
                        asChild
                        active={isSubItemActive(sub.url)}
                      >
                        <button
                          onClick={() => openTab(sub.url, sub.title)}
                          className={cn(
                            "w-full flex flex-row justify-start text-start items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs transition-colors hover:bg-accent hover:text-accent-foreground uppercase",
                            isSubItemActive(sub.url) &&
                              "bg-accent/50 text-accent-foreground font-medium",
                          )}
                        >
                          {sub.icon && <sub.icon className="size-3.5 shrink-0" />}
                          <span className="text-start">{sub.title}</span>
                        </button>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={item.title}>
              <NavigationMenuLink asChild active={isItemActive(item)}>
                <button
                  onClick={() => openTab(item.url, item.title)}
                  className={cn(
                    "inline-flex flex-row justify-start text-start items-center gap-1 rounded-md px-1.5 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground uppercase",
                    isItemActive(item) && "text-primary font-semibold",
                  )}
                >
                  {item.icon && <item.icon className="size-3.5" />}
                  {item.title}
                </button>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ),
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
