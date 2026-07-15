// Catálogo central de permisos del sistema.
// Cada módulo aquí listado se traduce en:
//   1. Un grupo de menú (hijo) dentro de su sección (grupo padre).
//   2. Un permiso por cada acción declarada (nombre = "{Accion} {Label}").
// El backend exige que `route` sea única por permiso, así que solo la acción VER
// (visibilidad de página/menú) usa la ruta "pelada" del módulo (p.ej. "clientes");
// el resto de acciones usan una ruta compuesta "modulo.slug-accion" (p.ej. "clientes.crear").
// Si un módulo no declara VER explícitamente, se agrega implícitamente para
// reservar la ruta pelada y permitir la validación de acceso a la página/menú.
// Usado por GenerateSystemPermissionsModal para poblar grupos/permisos,
// y por usePermission()/can(route, action) en cada *Actions.tsx para mostrar/ocultar botones.

export const ACTIONS = {
  VER: "Ver",
  AGREGAR: "Agregar",
  EDITAR: "Editar",
  ELIMINAR: "Eliminar",
  EXPORTAR: "Exportar",
  IMPRIMIR: "Imprimir",
  ANULAR: "Anular",
  CONFIRMAR: "Confirmar",
  CANCELAR: "Cancelar",
  GESTIONAR: "Gestionar",
  PAGO_RAPIDO: "Pago Rápido",
  GENERAR_NOTA_CREDITO: "Generar Nota de Crédito",
  VER_LISTA_PRECIOS: "Ver Lista de Precios",
  ASIGNAR_LISTA: "Asignar Lista de Precios",
  VER_DIRECCIONES: "Ver Direcciones",
  VER_DETALLES: "Ver Detalles",
  ASIGNAR_CLIENTE: "Asignar Cliente",
  VER_ASIGNACIONES: "Ver Asignaciones",
  ASIGNAR_USUARIO: "Asignar Usuario",
  CAMBIAR_ESTADO: "Cambiar Estado",
  CERRAR_TURNO: "Cerrar Turno",
  REGISTRAR_PAGO: "Registrar Pago",
  ELIMINAR_PAGO: "Eliminar Pago",
  GESTIONAR_PERMISOS: "Gestionar Permisos",
  CREAR_EN_LOTE: "Crear en Lote",
} as const;

// Slug (sin tildes/espacios) por cada acción, usado para componer la ruta única
// "modulo.slug-accion" que exige el backend. VER no necesita slug: usa la ruta pelada.
const ACTION_ROUTE_SLUGS: Record<string, string> = {
  [ACTIONS.VER]: "ver",
  [ACTIONS.AGREGAR]: "crear",
  [ACTIONS.EDITAR]: "editar",
  [ACTIONS.ELIMINAR]: "eliminar",
  [ACTIONS.EXPORTAR]: "exportar",
  [ACTIONS.IMPRIMIR]: "imprimir",
  [ACTIONS.ANULAR]: "anular",
  [ACTIONS.CONFIRMAR]: "confirmar",
  [ACTIONS.CANCELAR]: "cancelar",
  [ACTIONS.GESTIONAR]: "gestionar",
  [ACTIONS.PAGO_RAPIDO]: "pago-rapido",
  [ACTIONS.GENERAR_NOTA_CREDITO]: "generar-nota-credito",
  [ACTIONS.VER_LISTA_PRECIOS]: "ver-lista-precios",
  [ACTIONS.ASIGNAR_LISTA]: "asignar-lista",
  [ACTIONS.VER_DIRECCIONES]: "ver-direcciones",
  [ACTIONS.VER_DETALLES]: "ver-detalles",
  [ACTIONS.ASIGNAR_CLIENTE]: "asignar-cliente",
  [ACTIONS.VER_ASIGNACIONES]: "ver-asignaciones",
  [ACTIONS.ASIGNAR_USUARIO]: "asignar-usuario",
  [ACTIONS.CAMBIAR_ESTADO]: "cambiar-estado",
  [ACTIONS.CERRAR_TURNO]: "cerrar-turno",
  [ACTIONS.REGISTRAR_PAGO]: "registrar-pago",
  [ACTIONS.ELIMINAR_PAGO]: "eliminar-pago",
  [ACTIONS.GESTIONAR_PERMISOS]: "gestionar-permisos",
  [ACTIONS.CREAR_EN_LOTE]: "crear-en-lote",
};

function slugForAction(action: string): string {
  return (
    ACTION_ROUTE_SLUGS[action] ??
    action
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );
}

// Ruta única de backend para un (moduloRoute, accion). VER siempre usa la ruta
// pelada del módulo (permite validar acceso a la página/menú); el resto se
// compone como "modulo.slug-accion" para no chocar con la restricción de
// unicidad de `route` en la tabla de permisos.
export function permissionRouteFor(moduleRoute: string, action: string): string {
  if (action === ACTIONS.VER) return moduleRoute;
  return `${moduleRoute}.${slugForAction(action)}`;
}

export interface PermissionCatalogModule {
  key: string;
  label: string;
  route: string;
  icon: string;
  actions: string[];
}

export interface PermissionCatalogSection {
  key: string;
  label: string;
  icon: string;
  modules: PermissionCatalogModule[];
}

export const PERMISSION_CATALOG: PermissionCatalogSection[] = [
  {
    key: "mantenimiento",
    label: "Mantenimiento",
    icon: "ShoppingBag",
    modules: [
      {
        key: "client",
        label: "Cliente",
        route: "clientes",
        icon: "Users",
        actions: [
          ACTIONS.AGREGAR,
          ACTIONS.EDITAR,
          ACTIONS.ELIMINAR,
          ACTIONS.VER_LISTA_PRECIOS,
          ACTIONS.ASIGNAR_LISTA,
          ACTIONS.VER_DIRECCIONES,
        ],
      },
      {
        key: "supplier",
        label: "Proveedor",
        route: "proveedores",
        icon: "Truck",
        actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR],
      },
      {
        key: "product",
        label: "Producto",
        route: "productos",
        icon: "Package",
        actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR, ACTIONS.VER],
      },
      {
        key: "pricelist",
        label: "Lista de Precio",
        route: "lista-precio",
        icon: "ListIcon",
        actions: [
          ACTIONS.AGREGAR,
          ACTIONS.EDITAR,
          ACTIONS.ELIMINAR,
          ACTIONS.VER_DETALLES,
          ACTIONS.ASIGNAR_CLIENTE,
        ],
      },
      {
        key: "zone",
        label: "Zona",
        route: "zona",
        icon: "MapPin",
        actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR],
      },
      {
        key: "driver",
        label: "Conductor",
        route: "conductores",
        icon: "Truck",
        actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR],
      },
      {
        key: "worker",
        label: "Trabajador",
        route: "trabajadores",
        icon: "HardHat",
        actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR],
      },
    ],
  },
  {
    key: "ing-facturas",
    label: "Ing. Facturas",
    icon: "DollarSign",
    modules: [
      {
        key: "purchase",
        label: "Compra",
        route: "compras",
        icon: "ShoppingCart",
        actions: [
          ACTIONS.AGREGAR,
          ACTIONS.EDITAR,
          ACTIONS.ELIMINAR,
          ACTIONS.VER,
          ACTIONS.GESTIONAR,
          ACTIONS.PAGO_RAPIDO,
          ACTIONS.IMPRIMIR,
          ACTIONS.EXPORTAR,
        ],
      },
      {
        key: "purchase-credit-note",
        label: "Nota de Crédito de Compra",
        route: "notas-credito-compra",
        icon: "FileText",
        actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR],
      },
      {
        key: "purchaseinstallment",
        label: "Cuota de Compra",
        route: "cuota-compra",
        icon: "Calendar",
        actions: [ACTIONS.VER, ACTIONS.ELIMINAR],
      },
      {
        key: "accounts-receivable",
        label: "Cuentas por Cobrar",
        route: "cuentas-por-cobrar",
        icon: "DollarSign",
        actions: [ACTIONS.VER, ACTIONS.REGISTRAR_PAGO, ACTIONS.ELIMINAR_PAGO],
      },
      {
        key: "accounts-payable",
        label: "Cuentas por Pagar",
        route: "cuentas-por-pagar",
        icon: "DollarSign",
        actions: [ACTIONS.VER, ACTIONS.REGISTRAR_PAGO, ACTIONS.ELIMINAR_PAGO],
      },
    ],
  },
  {
    key: "transacciones",
    label: "Transacciones",
    icon: "Package",
    modules: [
      {
        key: "sale",
        label: "Venta",
        route: "ventas",
        icon: "ShoppingBag",
        actions: [
          ACTIONS.AGREGAR,
          ACTIONS.EDITAR,
          ACTIONS.ELIMINAR,
          ACTIONS.ANULAR,
          ACTIONS.VER,
          ACTIONS.GESTIONAR,
          ACTIONS.PAGO_RAPIDO,
          ACTIONS.GENERAR_NOTA_CREDITO,
        ],
      },
      {
        key: "credit-note",
        label: "Nota de Crédito",
        route: "notas-credito",
        icon: "FileText",
        actions: [
          ACTIONS.AGREGAR,
          ACTIONS.GESTIONAR,
          ACTIONS.ELIMINAR,
          ACTIONS.IMPRIMIR,
          ACTIONS.EXPORTAR,
        ],
      },
      {
        key: "warehouse-document",
        label: "Documento de Almacén",
        route: "documentos-almacen",
        icon: "FileText",
        actions: [
          ACTIONS.AGREGAR,
          ACTIONS.EDITAR,
          ACTIONS.ELIMINAR,
          ACTIONS.VER,
          ACTIONS.IMPRIMIR,
          ACTIONS.CONFIRMAR,
          ACTIONS.CANCELAR,
          ACTIONS.EXPORTAR,
        ],
      },
      {
        key: "guide",
        label: "Guía",
        route: "guias",
        icon: "Truck",
        actions: [
          ACTIONS.AGREGAR,
          ACTIONS.EDITAR,
          ACTIONS.ELIMINAR,
          ACTIONS.IMPRIMIR,
          ACTIONS.EXPORTAR,
        ],
      },
      {
        key: "deliverysheet",
        label: "Planilla de Reparto",
        route: "planillas",
        icon: "FileText",
        actions: [
          ACTIONS.AGREGAR,
          ACTIONS.EDITAR,
          ACTIONS.ELIMINAR,
          ACTIONS.ANULAR,
          ACTIONS.VER,
          ACTIONS.CAMBIAR_ESTADO,
          ACTIONS.IMPRIMIR,
        ],
      },
      {
        key: "box-shift",
        label: "Turno de Caja",
        route: "turnos-caja",
        icon: "Wallet",
        actions: [ACTIONS.VER, ACTIONS.CERRAR_TURNO],
      },
      {
        key: "warehouse-product",
        label: "Stock de Almacén",
        route: "almacen-productos",
        icon: "PackageSearch",
        actions: [ACTIONS.VER],
      },
    ],
  },
  {
    key: "reportes",
    label: "Reportes",
    icon: "FileText",
    modules: [
      { key: "reporte-tickets", label: "Impresión de Comprobantes", route: "imprimir-tickets", icon: "FileText", actions: [ACTIONS.VER, ACTIONS.IMPRIMIR] },
      { key: "reporte-estado-cuenta-real", label: "Estado de Cuenta Real", route: "estado-cuenta-real", icon: "FileText", actions: [ACTIONS.VER, ACTIONS.EXPORTAR] },
      { key: "reporte-estado-cuenta-clientes", label: "Estado de Cuenta de Clientes", route: "estado-cuenta-clientes", icon: "FileText", actions: [ACTIONS.VER, ACTIONS.EXPORTAR] },
      { key: "reporte-ventas-detallado", label: "Registro de Ventas Detalladas", route: "ventas-detallado", icon: "FileText", actions: [ACTIONS.VER, ACTIONS.EXPORTAR] },
      { key: "reporte-ventas-detallado-credito", label: "Registro de Ventas Detallado de Crédito", route: "ventas-detallado-credito", icon: "FileText", actions: [ACTIONS.VER, ACTIONS.EXPORTAR] },
      { key: "reporte-registro-ventas", label: "Registro de Ventas (IGV)", route: "registro-ventas", icon: "FileText", actions: [ACTIONS.VER, ACTIONS.EXPORTAR] },
      { key: "reporte-registro-compras", label: "Registro de Compras (IGV)", route: "registro-compras", icon: "FileText", actions: [ACTIONS.VER, ACTIONS.EXPORTAR] },
      { key: "reporte-inventario", label: "Inventario", route: "inventario", icon: "FileText", actions: [ACTIONS.VER, ACTIONS.EXPORTAR] },
      { key: "reporte-kardex", label: "Kardex", route: "kardex", icon: "FileText", actions: [ACTIONS.VER, ACTIONS.EXPORTAR] },
      { key: "reporte-venta-vendedor", label: "Ventas por Vendedor", route: "venta-por-vendedor", icon: "FileText", actions: [ACTIONS.VER, ACTIONS.EXPORTAR] },
      { key: "reporte-comisiones", label: "Comisiones", route: "comisiones", icon: "FileText", actions: [ACTIONS.VER, ACTIONS.EXPORTAR] },
      { key: "reporte-llenado-carros", label: "Llenado de Carros", route: "llenado-carros", icon: "FileText", actions: [ACTIONS.VER, ACTIONS.EXPORTAR] },
      { key: "reporte-ventas-anuales", label: "Ventas Anuales", route: "ventas-anuales", icon: "FileText", actions: [ACTIONS.VER, ACTIONS.EXPORTAR] },
      { key: "reporte-ventas-producto", label: "Ventas por Producto", route: "ventas-por-producto", icon: "FileText", actions: [ACTIONS.VER, ACTIONS.EXPORTAR] },
      { key: "reporte-ventas-contabilidad", label: "Ventas Contabilidad", route: "ventas-contabilidad", icon: "FileText", actions: [ACTIONS.VER, ACTIONS.EXPORTAR] },
      { key: "reporte-costo-ventas", label: "Costo de Ventas", route: "costo-de-ventas", icon: "FileText", actions: [ACTIONS.VER, ACTIONS.EXPORTAR] },
      { key: "reporte-ventas-vendedor-mensual", label: "Ventas Detalladas por Vendedor", route: "ventas-detalladas-por-vendedor", icon: "FileText", actions: [ACTIONS.VER, ACTIONS.EXPORTAR] },
    ],
  },
  {
    key: "configuracion",
    label: "Configuración",
    icon: "Settings",
    modules: [
      { key: "company", label: "Empresa", route: "empresa", icon: "Building", actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR] },
      { key: "branch", label: "Tienda", route: "tienda", icon: "Building2", actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR] },
      { key: "warehouse", label: "Almacén", route: "almacen", icon: "Warehouse", actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR] },
      {
        key: "box",
        label: "Caja",
        route: "caja",
        icon: "ShoppingCart",
        actions: [
          ACTIONS.AGREGAR,
          ACTIONS.EDITAR,
          ACTIONS.ELIMINAR,
          ACTIONS.VER_ASIGNACIONES,
          ACTIONS.ASIGNAR_USUARIO,
          ACTIONS.CAMBIAR_ESTADO,
        ],
      },
      { key: "payment-concept", label: "Concepto de Pago", route: "conceptos-pago", icon: "Wallet", actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR] },
      { key: "vehicle", label: "Vehículo", route: "vehiculo", icon: "Truck", actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR] },
      { key: "category", label: "Categoría", route: "categoria", icon: "Tags", actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR] },
      { key: "product-type", label: "Tipo de Producto", route: "tipos-producto", icon: "Tag", actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR] },
      { key: "brand", label: "Marca", route: "marca", icon: "Tag", actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR] },
      { key: "unit", label: "Unidad", route: "unidad", icon: "Scale", actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR] },
      { key: "setting", label: "Configuración General", route: "configuracion", icon: "Settings", actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR] },
      { key: "nationality", label: "Nacionalidad", route: "nacionalidades", icon: "Globe", actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR] },
      { key: "businesstype", label: "Tipo de Negocio", route: "tipo-negocio", icon: "Briefcase", actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR] },
      { key: "jobposition", label: "Cargo de Trabajador", route: "cargo-trabajador", icon: "Briefcase", actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR] },
      { key: "document-type", label: "Tipo de Documento", route: "tipo-documento", icon: "IdCard", actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR] },
      { key: "warehousedocreason", label: "Motivo de Documento de Almacén", route: "motivos-documento-almacen", icon: "FileText", actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR] },
      { key: "userboxassignment", label: "Asignación de Caja", route: "asignacion-caja", icon: "UserCheck", actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR] },
    ],
  },
  {
    key: "seguridad",
    label: "Seguridad",
    icon: "ShieldUser",
    modules: [
      { key: "users", label: "Usuario", route: "usuarios", icon: "Users", actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR] },
      {
        key: "type-users",
        label: "Tipo de Usuario",
        route: "tipo-usuario",
        icon: "PersonStanding",
        actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR, ACTIONS.GESTIONAR_PERMISOS],
      },
      { key: "menu-group", label: "Grupo de Menú", route: "grupos-menu", icon: "FolderTree", actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR] },
      {
        key: "permission",
        label: "Permiso",
        route: "permisos",
        icon: "KeyRound",
        actions: [ACTIONS.AGREGAR, ACTIONS.EDITAR, ACTIONS.ELIMINAR, ACTIONS.CREAR_EN_LOTE],
      },
    ],
  },
];

export function flattenPermissionCatalog() {
  return PERMISSION_CATALOG.flatMap((section) =>
    section.modules.map((module) => ({ section, module }))
  );
}

export interface PermissionCatalogEntry {
  action: string;
  name: string;
  route: string;
}

// Lista de permisos concretos (acción + nombre + ruta única) a crear para un
// módulo, incluyendo el permiso VER implícito si el módulo no lo declaró.
export function getModulePermissions(
  module: PermissionCatalogModule
): PermissionCatalogEntry[] {
  const entries: PermissionCatalogEntry[] = [];

  if (!module.actions.includes(ACTIONS.VER)) {
    entries.push({
      action: ACTIONS.VER,
      name: `${ACTIONS.VER} ${module.label}`,
      route: permissionRouteFor(module.route, ACTIONS.VER),
    });
  }

  for (const action of module.actions) {
    entries.push({
      action,
      name: `${action} ${module.label}`,
      route: permissionRouteFor(module.route, action),
    });
  }

  return entries;
}
