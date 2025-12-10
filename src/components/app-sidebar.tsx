"use client";

import {
  LayoutGrid,
  ShieldUser,
  Package,
  ShoppingBag,
  DollarSign,
  Activity,
  Warehouse,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { NavMain } from "./nav-main";
import { TYPE_USER } from "@/pages/type-users/lib/typeUser.interface";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { NavUser } from "./nav-user";
import { USER } from "@/pages/users/lib/User.interface";
import { COMPANY } from "@/pages/company/lib/company.interface";
import { BRANCH } from "@/pages/branch/lib/branch.interface";
import { WAREHOUSE } from "@/pages/warehouse/lib/warehouse.interface";
import { BRAND } from "@/pages/brand/lib/brand.interface";
import { BOX } from "@/pages/box/lib/box.interface";
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
import { useEffect, useState } from "react";
import { ENABLE_PERMISSION_VALIDATION } from "@/lib/permissions.config";
import { SaleRoute } from "@/pages/sale/lib/sale.interface";
import { BOX_SHIFT } from "@/pages/box-shift/lib/box-shift.interface";
import { AccountsReceivableRoute } from "@/pages/accounts-receivable/lib/accounts-receivable.interface";
import { ACCOUNTS_PAYABLE } from "@/pages/accounts-payable/lib/accounts-payable.interface";
import { WAREHOUSE_DOCUMENT } from "@/pages/warehouse-document/lib/warehouse-document.interface";

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

const {
  ICON_REACT: AccountsPayableIcon,
  ROUTE: AccountsPayableRoute,
  MODEL: { name: AccountsPayableTitle },
} = ACCOUNTS_PAYABLE;

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/inicio",
      icon: LayoutGrid,
    },
    {
      title: "Ventas",
      url: "#",
      icon: ShoppingBag,
      items: [
        {
          title: "Ventas",
          url: SaleRoute,
          icon: ShoppingBag,
        },
        {
          title: "Cuentas por Cobrar",
          url: AccountsReceivableRoute,
          icon: DollarSign,
        },
      ],
    },
    {
      title: "Compras",
      url: "#",
      icon: DollarSign,
      items: [
        {
          title: PurchaseTitle,
          url: PurchaseRoute,
          icon: PurchaseIcon,
        },
        {
          title: AccountsPayableTitle,
          url: AccountsPayableRoute,
          icon: AccountsPayableIcon,
        },
      ],
    },
    {
      title: "Productos",
      url: "#",
      icon: Package,
      items: [
        {
          title: ProductTitle,
          url: ProductRoute,
          icon: ProductIcon,
        },
        {
          title: CategoryTitle,
          url: CategoryRoute,
          icon: CategoryIcon,
        },
        {
          title: ProductTypeTitle,
          url: ProductTypeRoute,
          icon: ProductTypeIcon,
        },
        {
          title: BrandTitle,
          url: BrandRoute,
          icon: BrandIcon,
        },
        {
          title: UnitTitle,
          url: UnitRoute,
          icon: UnitIcon,
        },
        {
          title: PriceListTitle,
          url: PriceListRoute,
          icon: PriceListIcon,
        },
      ],
    },
    {
      title: "Personas",
      url: "#",
      icon: ClientIcon,
      items: [
        {
          title: ClientTitle,
          url: ClientRoute,
          icon: ClientIcon,
        },
        {
          title: SupplierTitle,
          url: SupplierRoute,
          icon: SupplierIcon,
        },
        {
          title: WorkerTitle,
          url: WorkerRoute,
          icon: WorkerIcon,
        },
      ],
    },
    {
      title: "Organización",
      url: "#",
      icon: CompanyIcon,
      items: [
        {
          title: CompanyTitle,
          url: CompanyRoute,
          icon: CompanyIcon,
        },
        {
          title: BranchTitle,
          url: BranchRoute,
          icon: BranchIcon,
        },
        {
          title: WarehouseTitle,
          url: WarehouseRoute,
          icon: WarehouseIcon,
        },
        {
          title: ZoneTitle,
          url: ZoneRoute,
          icon: ZoneIcon,
        },
      ],
    },
    {
      title: "Operaciones",
      url: "#",
      icon: BoxIcon,
      items: [
        {
          title: WarehouseDocumentTitle,
          url: WarehouseDocumentRoute,
          icon: WarehouseDocumentIcon,
        },
        {
          title: "Kardex",
          url: "/kardex",
          icon: Activity,
        },
        {
          title: "Inventario Valorizado",
          url: "/inventario-valorizado",
          icon: Warehouse,
        },
        {
          title: BoxTitle,
          url: BoxRoute,
          icon: BoxIcon,
        },
        {
          title: BoxShiftTitle,
          url: BoxShiftRoute,
          icon: BoxShiftIcon,
        },
        {
          title: GuideTitle,
          url: GuideRoute,
          icon: GuideIcon,
        },
        {
          title: PaymentConceptTitle,
          url: PaymentConceptRoute,
          icon: PaymentConceptIcon,
        },
      ],
    },
    {
      title: "Configuración",
      url: "#",
      icon: SettingIcon,
      items: [
        {
          title: SettingTitle,
          url: SettingRoute,
          icon: SettingIcon,
        },
        {
          title: NationalityTitle,
          url: NationalityRoute,
          icon: NationalityIcon,
        },
        {
          title: BusinessTypeTitle,
          url: BusinessTypeRoute,
          icon: BusinessTypeIcon,
        },
        {
          title: JobPositionTitle,
          url: JobPositionRoute,
          icon: JobPositionIcon,
        },
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
        {
          title: UserTitle,
          url: UserRoute,
          icon: UserIcon,
        },
        {
          title: TypeUserTitle,
          url: TypeUserRoute,
          icon: TypeUserIcon,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, access } = useAuthStore();
  const [filteredNav, setFilteredNav] = useState<any[]>([]);

  useEffect(() => {
    if (!ENABLE_PERMISSION_VALIDATION) {
      // Si no está habilitada la validación, mostrar todos los elementos
      setFilteredNav(data.navMain);
      return;
    }

    if (!access) return;

    const filterNav = (items: any[]) =>
      items.filter((item) => {
        if (item.url === "#" && item.items) {
          item.items = filterNav(item.items);
          return item.items.length > 0;
        }
        return hasAccessToRoute(access, item.url);
      });

    setFilteredNav(filterNav(data.navMain));
  }, [access]);

  if (!user) {
    return null; // o spinner
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNav} />
      </SidebarContent>
      <SidebarFooter className="flex md:hidden">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
