# Payloads para Crear Menús y Permisos

> Basado en la estructura actual del sidebar de la aplicación (`app-sidebar.tsx`).
> Los `group_menu_id` son **secuenciales** — asígnales el ID real que devuelva el backend al crear cada grupo.

---

## 1. Group Menus

Endpoint: `POST /group_menu` (o el que corresponda)

```json
{ "name": "Dashboard", "icon": "LayoutGrid" }
```
```json
{ "name": "Mantenimiento", "icon": "ShoppingBag" }
```
```json
{ "name": "Ing. Facturas", "icon": "DollarSign" }
```
```json
{ "name": "Transacciones", "icon": "Package" }
```
```json
{ "name": "Reportes", "icon": "FileText" }
```
```json
{ "name": "Configuración", "icon": "Settings" }
```
```json
{ "name": "Seguridad", "icon": "ShieldUser" }
```

---

## 2. Permisos (Permissions)

Endpoint: `POST /permission` (o el que corresponda)

> **Nota:** las `route` son sin `/` inicial, tal como en el ejemplo dado.

---

### Grupo 1 — Dashboard

```json
{ "name": "Inicio", "route": "inicio", "group_menu_id": 1 }
```

---

### Grupo 2 — Mantenimiento

```json
{ "name": "Clientes", "route": "clientes", "group_menu_id": 2 }
```
```json
{ "name": "Proveedores", "route": "proveedores", "group_menu_id": 2 }
```
```json
{ "name": "Productos", "route": "productos", "group_menu_id": 2 }
```
```json
{ "name": "Lista de Precio", "route": "lista-precio", "group_menu_id": 2 }
```
```json
{ "name": "Zona", "route": "zona", "group_menu_id": 2 }
```
```json
{ "name": "Conductores", "route": "conductores", "group_menu_id": 2 }
```
```json
{ "name": "Trabajadores", "route": "trabajadores", "group_menu_id": 2 }
```

---

### Grupo 3 — Ing. Facturas

```json
{ "name": "Compras", "route": "compras", "group_menu_id": 3 }
```
```json
{ "name": "Notas de Crédito Compra", "route": "notas-credito-compra", "group_menu_id": 3 }
```
```json
{ "name": "Cuentas por Cobrar", "route": "cuentas-por-cobrar", "group_menu_id": 3 }
```
```json
{ "name": "Cuentas por Pagar", "route": "cuentas-por-pagar", "group_menu_id": 3 }
```

---

### Grupo 4 — Transacciones

```json
{ "name": "Ventas", "route": "ventas", "group_menu_id": 4 }
```
```json
{ "name": "Notas de Crédito", "route": "notas-credito", "group_menu_id": 4 }
```
```json
{ "name": "Documentos de Almacén", "route": "documentos-almacen", "group_menu_id": 4 }
```
```json
{ "name": "Guías de Remisión", "route": "guias", "group_menu_id": 4 }
```
```json
{ "name": "Planillas de Cobranza", "route": "planillas", "group_menu_id": 4 }
```
```json
{ "name": "Rendición", "route": "planillas/rendicion", "group_menu_id": 4 }
```
```json
{ "name": "Estado de Cuenta Clientes", "route": "reportes/estado-cuenta-clientes", "group_menu_id": 4 }
```
```json
{ "name": "Turnos de Caja", "route": "turnos-caja", "group_menu_id": 4 }
```

---

### Grupo 5 — Reportes

```json
{ "name": "Imprimir Tickets", "route": "reportes/imprimir-tickets", "group_menu_id": 5 }
```
```json
{ "name": "Inventario", "route": "reportes/inventario", "group_menu_id": 5 }
```
```json
{ "name": "Kardex", "route": "reportes/kardex", "group_menu_id": 5 }
```
```json
{ "name": "Ventas por Vendedor", "route": "reportes/venta-por-vendedor", "group_menu_id": 5 }
```
```json
{ "name": "Comisiones", "route": "reportes/comisiones", "group_menu_id": 5 }
```
```json
{ "name": "Llenado de Carros", "route": "reportes/llenado-carros", "group_menu_id": 5 }
```
```json
{ "name": "Ventas Detallado", "route": "reportes/ventas-detallado", "group_menu_id": 5 }
```
```json
{ "name": "Ventas Anuales", "route": "reportes/ventas-anuales", "group_menu_id": 5 }
```
```json
{ "name": "Ventas por Producto", "route": "reportes/ventas-por-producto", "group_menu_id": 5 }
```

---

### Grupo 6 — Configuración

```json
{ "name": "Empresa", "route": "empresa", "group_menu_id": 6 }
```
```json
{ "name": "Tienda", "route": "tienda", "group_menu_id": 6 }
```
```json
{ "name": "Almacén", "route": "almacen", "group_menu_id": 6 }
```
```json
{ "name": "Caja", "route": "caja", "group_menu_id": 6 }
```
```json
{ "name": "Conceptos de Pago", "route": "conceptos-pago", "group_menu_id": 6 }
```
```json
{ "name": "Vehículo", "route": "vehiculo", "group_menu_id": 6 }
```
```json
{ "name": "Categoría", "route": "categoria", "group_menu_id": 6 }
```
```json
{ "name": "Tipos de Producto", "route": "tipos-producto", "group_menu_id": 6 }
```
```json
{ "name": "Marca", "route": "marca", "group_menu_id": 6 }
```
```json
{ "name": "Unidad", "route": "unidad", "group_menu_id": 6 }
```
```json
{ "name": "Configuración", "route": "configuracion", "group_menu_id": 6 }
```
```json
{ "name": "Nacionalidades", "route": "nacionalidades", "group_menu_id": 6 }
```
```json
{ "name": "Tipos de Negocio", "route": "tipo-negocio", "group_menu_id": 6 }
```
```json
{ "name": "Cargo Trabajador", "route": "cargo-trabajador", "group_menu_id": 6 }
```
```json
{ "name": "Tipo de Documento", "route": "tipo-documento", "group_menu_id": 6 }
```

---

### Grupo 7 — Seguridad

```json
{ "name": "Usuarios", "route": "usuarios", "group_menu_id": 7 }
```
```json
{ "name": "Tipo de Usuario", "route": "tipo-usuario", "group_menu_id": 7 }
```

---

## Resumen de íconos por módulo

| Módulo | Ícono (Lucide) |
|---|---|
| Dashboard | `LayoutGrid` |
| Mantenimiento | `ShoppingBag` |
| Ing. Facturas | `DollarSign` |
| Transacciones | `Package` |
| Reportes | `FileText` |
| Configuración | `Settings` |
| Seguridad | `ShieldUser` |
| Clientes | `Users` |
| Proveedores | `Truck` |
| Productos | `Package` |
| Lista de Precio | `Tags` |
| Zona | `MapPin` |
| Conductores | `Truck` |
| Trabajadores | `HardHat` |
| Compras | `ShoppingCart` |
| Notas de Crédito | `FileText` |
| Cuentas por Cobrar | `Wallet` |
| Cuentas por Pagar | `Briefcase` |
| Ventas | `ShoppingBag` |
| Guías | `Truck` |
| Planillas | `PackageOpen` |
| Turnos de Caja | `Calendar` |
| Empresa | `Building2` |
| Almacén | `Warehouse` |
| Caja | `Briefcase` |
| Tipo de Usuario | `PersonStanding` |
| Usuarios | `Users` |
