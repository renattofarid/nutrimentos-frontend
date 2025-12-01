# Ejemplo de Uso - Formulario de Guía con Creación Rápida de Productos

## Vista Previa del Formulario

El formulario de Guía incluye una sección de "Detalles de la Guía" donde puedes seleccionar productos. Ahora incluye un botón "+" para crear productos sobre la marcha.

```
┌─────────────────────────────────────────────────────────────┐
│ Detalles de la Guía                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Producto                        Cantidad  Código Unidad   │
│  ┌──────────────────────────┐    ┌─────┐  ┌────────────┐  │
│  │ Seleccione un producto ▼ │ [+]│  10 │  │    NIU     │  │
│  └──────────────────────────┘    └─────┘  └────────────┘  │
│                                                             │
│  Descripción                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Producto de ejemplo para guía de remisión          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                                      [Agregar Detalle] ──┐  │
└─────────────────────────────────────────────────────────────┘
```

## Flujo al Hacer Clic en el Botón "+"

```
Paso 1: Usuario hace clic en [+]
        ↓
Paso 2: Se abre el Modal de Creación Rápida

┌─────────────────────────────────────────────────────────────┐
│ Crear Producto Rápido                                    [X]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Código                    Nombre del Producto             │
│  ┌────────────────────┐    ┌──────────────────────────┐   │
│  │ PROD-001           │    │ Leche Evaporada Gloria   │   │
│  └────────────────────┘    └──────────────────────────┘   │
│                                                             │
│  Empresa                   Categoría                       │
│  ┌────────────────────┐    ┌──────────────────────────┐   │
│  │ Mi Empresa SAC    ▼│    │ Lácteos               ▼ │   │
│  └────────────────────┘    └──────────────────────────┘   │
│                                                             │
│  Tipo de Producto          Marca                           │
│  ┌────────────────────┐    ┌──────────────────────────┐   │
│  │ Producto Final    ▼│    │ Gloria                ▼ │   │
│  └────────────────────┘    └──────────────────────────┘   │
│                                                             │
│  Unidad                    Proveedor                       │
│  ┌────────────────────┐    ┌──────────────────────────┐   │
│  │ Unidad (NIU)      ▼│    │ Distribuidora XYZ     ▼ │   │
│  └────────────────────┘    └──────────────────────────┘   │
│                                                             │
│  Nacionalidad (Opcional)                                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Perú                                             ▼ │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ☑ ¿Está Gravado?                                          │
│                                                             │
│                              [Cancelar] [Crear Producto]   │
└─────────────────────────────────────────────────────────────┘

Paso 3: Usuario llena el formulario y hace clic en "Crear Producto"
        ↓
Paso 4: Producto se crea en el backend
        ↓
Paso 5: Modal se cierra automáticamente
        ↓
Paso 6: Producto aparece seleccionado en el formulario

┌─────────────────────────────────────────────────────────────┐
│ Detalles de la Guía                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Producto                        Cantidad  Código Unidad   │
│  ┌──────────────────────────┐    ┌─────┐  ┌────────────┐  │
│  │ Leche Evaporada Gloria ▼ │ [+]│  10 │  │    NIU     │  │
│  └──────────────────────────┘    └─────┘  └────────────┘  │
│       ↑                                                     │
│       └─ Producto recién creado, seleccionado              │
│          automáticamente                                    │
│                                                             │
│  Descripción                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Leche evaporada entera                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                                      [Agregar Detalle]      │
└─────────────────────────────────────────────────────────────┘
```

## Código de Implementación

### 1. En el Formulario (GuideForm.tsx)

```tsx
import { ProductSelectWithCreate } from "@/components/ProductSelectWithCreate";

// Estado local para productos
const [localProducts, setLocalProducts] = useState<ProductResource[]>(products);

// Handler para cuando se crea un producto
const handleProductCreated = (productId: number, productName: string) => {
  // Agregar el producto recién creado a la lista local
  const newProduct: ProductResource = {
    id: productId,
    name: productName,
    // ... otros campos
  };
  setLocalProducts([...localProducts, newProduct]);

  // Seleccionar automáticamente el producto recién creado
  detailTempForm.setValue("temp_product_id", productId.toString());
};

// En el JSX
<ProductSelectWithCreate
  control={detailTempForm.control}
  name="temp_product_id"
  label="Producto"
  placeholder="Seleccione un producto"
  products={localProducts}
  companies={companies}
  categories={categories}
  brands={brands}
  units={units}
  productTypes={productTypes}
  nationalities={nationalities}
  suppliers={suppliers}
  onProductCreated={handleProductCreated}
/>
```

### 2. Estructura Completa del Formulario de Guía

El formulario está dividido en secciones organizadas:

1. **Información General**
   - Empresa, Sucursal, Almacén
   - Cliente, Motivo de Traslado
   - Modalidad de Transporte
   - Fechas (Emisión, Traslado)

2. **Información del Transportista**
   - Tipo y Número de Documento
   - Nombre del Transportista
   - RUC, Número MTC
   - Placa del Vehículo

3. **Información del Conductor** (Opcional)
   - Tipo y Número de Documento
   - Nombre del Conductor
   - Licencia de Conducir

4. **Direcciones de Origen y Destino**
   - Dirección y Ubigeo de Origen
   - Dirección y Ubigeo de Destino

5. **Información de Carga**
   - Unidad de Medida
   - Peso Total
   - Total de Bultos

6. **Detalles de la Guía** ← Aquí está el ProductSelectWithCreate
   - Selector de productos con botón "+"
   - Cantidad, Código de Unidad
   - Descripción
   - Tabla de detalles agregados

7. **Observaciones** (Opcional)
   - Campo de texto libre

## Datos Necesarios

Para usar el formulario de guía, necesitas cargar:

```tsx
// Hooks para cargar datos
const { data: companies } = useAllCompanies();
const { data: branches } = useAllBranches();
const { data: warehouses } = useAllWarehouses();
const { data: products } = useAllProducts();
const { data: customers } = useAllPersons({ role_names: ["CLIENTE"] });
const { data: motives } = useAllGuideMotives();
const { data: categories } = useAllCategories();
const { data: brands } = useAllBrands();
const { data: units } = useAllUnits();
const { data: productTypes } = useAllProductTypes();
const { data: nationalities } = useAllNationalities();
const { data: suppliers } = useAllPersons({ role_names: ["PROVEEDOR"] });

// Pasar todos los datos al formulario
<GuideForm
  defaultValues={getDefaultValues()}
  onSubmit={handleSubmit}
  isSubmitting={isSubmitting}
  mode="create"
  companies={companies}
  branches={branches}
  warehouses={warehouses}
  products={products}
  customers={customers}
  motives={motives}
  categories={categories}
  brands={brands}
  units={units}
  productTypes={productTypes}
  nationalities={nationalities}
  suppliers={suppliers}
  onCancel={() => navigate(ROUTE)}
/>
```

## Ventajas para el Usuario

1. **Sin Interrupciones**: No necesita salir del formulario actual
2. **Creación Rápida**: Solo llena los campos esenciales del producto
3. **Selección Automática**: El producto se selecciona automáticamente
4. **Actualización en Tiempo Real**: La lista se actualiza sin recargar
5. **Flujo Natural**: Continúa con el formulario sin perder contexto

## Casos de Uso

- **Guía de Remisión**: Crear productos que faltan al registrar una guía
- **Compras**: Agregar productos nuevos al hacer una compra
- **Ventas**: Crear productos sobre la marcha al hacer una venta
- **Cualquier formulario que necesite seleccionar productos**
