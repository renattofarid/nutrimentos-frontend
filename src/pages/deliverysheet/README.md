# Módulo de Planillas de Reparto (Delivery Sheet)

## Descripción
Este módulo gestiona las planillas de reparto del sistema, permitiendo crear, visualizar, actualizar el estado, realizar rendiciones y registrar pagos de las planillas.

## Estructura del Módulo

### 📁 lib/
Contiene la lógica de negocio, interfaces, schemas y store.

#### deliverysheet.interface.ts
- **Interfaces de Recursos**: Define todas las interfaces para los recursos de la API
  - `DeliverySheetResource`: Recurso principal de planilla
  - `DeliverySheetSale`: Venta incluida en la planilla
  - `DeliverySheetPayment`: Pago registrado
  - `AvailableSale`: Ventas disponibles para agregar
  - Interfaces auxiliares: `Zone`, `Driver`, `Customer`, `User`

- **Interfaces de Request/Response**:
  - `CreateDeliverySheetRequest`: Crear nueva planilla
  - `UpdateDeliverySheetRequest`: Actualizar planilla
  - `UpdateDeliverySheetStatusRequest`: Cambiar estado
  - `CreateSettlementRequest`: Registrar rendición
  - `CreateDeliverySheetPaymentRequest`: Registrar pago
  - `DeliverySheetResponse`: Respuesta paginada (usa `Meta` y `Link` de core.interface)

- **Constantes**:
  - `DELIVERY_SHEET_ENDPOINT`: "/delivery-sheet"
  - `DELIVERY_SHEET_TYPES`: ["CONTADO", "CREDITO"]
  - `DELIVERY_SHEET_STATUSES`: ["PENDIENTE", "EN_REPARTO", "COMPLETADO", "CANCELADO"]
  - `DELIVERY_STATUSES`: ["PENDIENTE", "ENTREGADO", "NO_ENTREGADO", "DEVUELTO"]

#### deliverysheet.schema.ts
Validación con Zod para todos los formularios:
- `deliverySheetSchemaCreate`: Crear planilla
- `deliverySheetSchemaUpdate`: Actualizar planilla
- `deliverySheetStatusSchema`: Cambiar estado (PENDIENTE/EN_REPARTO)
- `settlementSchema`: Rendición de ventas
- `deliverySheetPaymentSchema`: Registro de pagos

#### deliverysheet.actions.ts
Acciones para comunicarse con la API:
- **CRUD Básico**:
  - `getDeliverySheets(params)`: Lista paginada con filtros
  - `getAllDeliverySheets()`: Lista completa sin paginación
  - `findDeliverySheetById(id)`: Obtener por ID
  - `storeDeliverySheet(data)`: Crear nueva planilla
  - `updateDeliverySheet(id, data)`: Actualizar planilla
  - `deleteDeliverySheet(id)`: Eliminar planilla

- **Operaciones Especiales**:
  - `getAvailableSales(params)`: Obtener ventas disponibles
  - `updateDeliverySheetStatus(id, data)`: PATCH cambiar estado
  - `createSettlement(id, data)`: POST registrar rendición
  - `createDeliverySheetPayment(id, data)`: POST registrar pago

#### deliverysheet.store.ts
Store de Zustand para el estado global:
- **Estado**:
  - `deliverySheets`: Lista de planillas
  - `deliverySheet`: Planilla seleccionada
  - `availableSales`: Ventas disponibles
  - `meta`: Información de paginación
  - Flags de loading: `isLoading`, `isFinding`, `isLoadingAvailableSales`, `isSubmitting`

- **Acciones**:
  - `fetchDeliverySheets(params)`: Cargar planillas paginadas
  - `fetchDeliverySheet(id)`: Cargar planilla individual
  - `fetchAvailableSales(params)`: Cargar ventas disponibles
  - `createDeliverySheet(data)`: Crear planilla
  - `updateDeliverySheet(id, data)`: Actualizar planilla
  - `removeDeliverySheet(id)`: Eliminar planilla
  - `updateStatus(id, data)`: Cambiar estado
  - `submitSettlement(id, data)`: Registrar rendición
  - `submitPayment(id, data)`: Registrar pago

### 📁 components/
Componentes de UI y páginas.

#### DeliverySheetPage.tsx
Página principal con tabla de planillas:
- Lista paginada de planillas
- Filtros y búsqueda
- Acciones: Ver detalle, cambiar estado, rendición, pago, eliminar
- Paginación usando `DataTablePagination`

#### DeliverySheetAddPage.tsx
Página para crear nueva planilla:
- Formulario completo de creación
- Búsqueda de ventas disponibles
- Selección múltiple de ventas
- Cálculo automático de totales

#### DeliverySheetTable.tsx
Componente de tabla usando `DataTable` genérico:
- Recibe columnas y datos
- Maneja estado de loading
- Visibilidad de columnas

#### DeliverySheetColumns.tsx
Definición de columnas para la tabla:
- Columnas: ID, N° Planilla, Tipo, Estado, Zona, Conductor, Cliente, Fechas, Ventas, Totales
- Columna de acciones con dropdown menu
- Badges para estados y tipos
- Formateo de fechas y montos

#### DeliverySheetForm.tsx
Formulario principal para crear/editar:
- Sección de información general
- Búsqueda de ventas disponibles con filtros
- Tabla de selección de ventas con checkboxes
- Cálculo de total automático
- Validación con React Hook Form + Zod

#### DeliverySheetDetailSheet.tsx
Sheet lateral con detalles completos:
- Cards con totales destacados (Total, Cobrado, Pendiente)
- Información de la planilla
- Datos de zona, conductor y cliente
- Tabla de ventas incluidas
- Tabla de pagos registrados
- Observaciones y metadata

#### StatusUpdateDialog.tsx
Diálogo para cambiar estado:
- Estados permitidos: PENDIENTE, EN_REPARTO
- Campo de fecha de entrega
- Observaciones
- Validación con Zod

#### SettlementDialog.tsx
Diálogo para registrar rendición:
- Tabla con todas las ventas de la planilla
- Estado de entrega por venta: ENTREGADO, NO_ENTREGADO, DEVUELTO
- Notas de entrega por venta
- Validación completa

#### PaymentDialog.tsx
Diálogo para registrar pagos:
- Muestra monto pendiente
- Múltiples métodos de pago:
  - Efectivo, Tarjeta, Yape, Plin
  - Depósito, Transferencia, Otro
- Cálculo automático de total
- Observaciones
- Validación de montos

## Endpoints de API

### CRUD Principal
```
GET    /delivery-sheet?page=1&per_page=15          # Lista paginada
GET    /delivery-sheet/:id                          # Obtener por ID
POST   /delivery-sheet                              # Crear
PUT    /delivery-sheet/:id                          # Actualizar
DELETE /delivery-sheet/:id                          # Eliminar
```

### Operaciones Especiales
```
GET    /delivery-sheet/available-sales/list         # Ventas disponibles
       ?payment_type=CONTADO&zone_id=1&date_from=...&date_to=...

PATCH  /delivery-sheet/:id/status                   # Cambiar estado
       Body: { status, delivery_date?, observations? }

POST   /delivery-sheet/:id/settlement               # Registrar rendición
       Body: { sales: [{ sale_id, delivery_status, delivery_notes? }] }

POST   /delivery-sheet/:id/payment                  # Registrar pago
       Body: { payment_date, amount_cash, amount_card, ... }
```

## Rutas del Frontend

```
/planillas              -> DeliverySheetPage
/planillas/agregar      -> DeliverySheetAddPage
```

## Tipos de Datos

### Tipos de Pago
- **CONTADO**: Pago al contado
- **CREDITO**: Pago a crédito

### Estados de Planilla
- **PENDIENTE**: Recién creada, pendiente de salir a reparto
- **EN_REPARTO**: El conductor está realizando las entregas
- **COMPLETADO**: Todas las entregas completadas
- **CANCELADO**: Planilla cancelada

### Estados de Entrega (por venta)
- **PENDIENTE**: No se ha entregado
- **ENTREGADO**: Entregado exitosamente
- **NO_ENTREGADO**: No se pudo entregar
- **DEVUELTO**: El cliente devolvió la mercancía

## Flujo de Trabajo

1. **Crear Planilla**:
   - Seleccionar sucursal, tipo de pago, zona, conductor y cliente
   - Buscar ventas disponibles según criterios
   - Seleccionar ventas a incluir
   - Guardar planilla (estado inicial: PENDIENTE)

2. **Cambiar a EN_REPARTO**:
   - Cuando el conductor sale a hacer las entregas
   - Se puede actualizar la fecha de entrega

3. **Registrar Rendición**:
   - Solo disponible cuando está EN_REPARTO
   - Marcar cada venta como: ENTREGADO, NO_ENTREGADO o DEVUELTO
   - Agregar notas de entrega

4. **Registrar Pagos**:
   - Disponible cuando está EN_REPARTO o COMPLETADO
   - Ingresar los montos cobrados por cada método de pago
   - Los pagos se van acumulando hasta cubrir el total

5. **Completar Planilla**:
   - El sistema marca como COMPLETADO cuando:
     - Todas las ventas están rendidas
     - El monto cobrado cubre el total

## Dependencias Externas

### Stores de otros módulos usados:
- `useBranchStore`: Para obtener sucursales
- `usePersonStore`: Para obtener clientes/conductores

### Componentes compartidos:
- `DataTable`: Tabla genérica con paginación
- `DataTablePagination`: Componente de paginación
- `FormSelect`: Select para formularios
- `DatePickerFormField`: Selector de fechas
- `GroupFormSection`: Agrupador de secciones de formulario
- `SimpleDeleteDialog`: Diálogo de confirmación de eliminación
- `GeneralSheet`: Sheet lateral genérico
- `TitleComponent`: Componente de título de página
- `PageWrapper`: Wrapper de página

## Notas Importantes

1. **Paginación**: La respuesta usa las interfaces `Meta` y `Link` de `core.interface.ts`

2. **Zonas y Conductores**: En `DeliverySheetAddPage.tsx` hay data mock para zones. Deberías reemplazarlo con datos reales de tu API cuando estén disponibles.

3. **Validación**: Todos los formularios usan Zod para validación en el cliente antes de enviar a la API.

4. **Estados Permitidos**: Solo se puede cambiar de PENDIENTE a EN_REPARTO y viceversa. Los otros estados se manejan automáticamente.

5. **Montos**: Todos los montos se manejan como strings en las interfaces para evitar problemas de precisión decimal.

## Testing

Para probar el módulo:

1. Asegúrate de que el endpoint `/delivery-sheet` esté funcionando
2. Navega a `/planillas` para ver la lista
3. Click en "Nueva Planilla" para crear una
4. Selecciona ventas disponibles
5. Guarda y verifica que aparezca en la lista
6. Prueba las acciones: ver detalle, cambiar estado, rendición y pago
