# Arquitectura del Proyecto - Nutrimentos Frontend

Este documento describe los lineamientos, convenciones y patrones arquitectónicos del proyecto para mantener consistencia en el desarrollo.

## Tabla de Contenidos

1. [Estructura General](#estructura-general)
2. [Enrutamiento](#enrutamiento)
3. [Módulos por Feature](#módulos-por-feature)
4. [Convenciones de Nomenclatura](#convenciones-de-nomenclatura)
5. [Gestión de Estado](#gestión-de-estado)
6. [Manejo de Errores y Toasts](#manejo-de-errores-y-toasts)
7. [Vistas vs Modales - Cuándo usar cada uno](#vistas-vs-modales---cuándo-usar-cada-uno)
8. [Formularios con Detalles (Master-Detail)](#formularios-con-detalles-master-detail)
9. [Formularios](#formularios)
10. [Componentes Compartidos](#componentes-compartidos)
11. [Guía de Implementación Completa](#guía-de-implementación-completa)

---

## Estructura General

El proyecto sigue una arquitectura basada en **features** donde cada módulo del negocio tiene su propia carpeta con todos sus archivos relacionados.

```
src/
├── components/           # Componentes compartidos globales
├── lib/                 # Utilidades, configuración y schemas core
├── pages/               # Módulos por feature
│   └── {model}/
│       ├── components/  # Componentes React del módulo
│       └── lib/         # Lógica de negocio del módulo
└── App.tsx             # Definición de rutas principales
```

---

## Enrutamiento

### App.tsx

Las rutas se declaran en [App.tsx](src/App.tsx) pero **NO se escriben directamente**. En su lugar, se importan constantes desde el archivo de interfaz del modelo.

```tsx
// ❌ INCORRECTO
<Route path="/marca" element={<BrandPage />} />

// ✅ CORRECTO
import { BRAND } from "./pages/brand/lib/brand.interface";
const { ROUTE: BrandRoute } = BRAND;

<Route path={BrandRoute} element={<BrandPage />} />
```

### Tipos de Rutas

Cada modelo puede definir las siguientes rutas:

```typescript
export const MODEL: ModelComplete<ResourceType> = {
  ROUTE: "/modelo",              // Ruta principal (listado)
  ROUTE_ADD: "/modelo/agregar",  // Ruta para crear
  ROUTE_UPDATE: "/modelo/actualizar", // Ruta para editar
  ENDPOINT: "/api/model",        // Endpoint del API
  // ... otras constantes
};
```

---

## Módulos por Feature

Cada módulo sigue esta estructura:

```
pages/{model}/
├── components/
│   ├── {Model}Page.tsx         # Página principal (listado)
│   ├── {Model}AddPage.tsx      # Página de creación (opcional)
│   ├── {Model}EditPage.tsx     # Página de edición (opcional)
│   ├── {Model}Form.tsx         # Formulario reutilizable
│   ├── {Model}Modal.tsx        # Modal para crear/editar (alternativa)
│   ├── {Model}Table.tsx        # Tabla de datos
│   ├── {Model}Columns.tsx      # Definición de columnas (TanStack Table)
│   ├── {Model}Options.tsx      # Filtros y búsqueda
│   └── {Model}Actions.tsx      # Botones de acción (Crear, etc.)
└── lib/
    ├── {model}.interface.ts    # Interfaces y constantes
    ├── {model}.schema.ts       # Validación con Zod
    ├── {model}.actions.ts      # Llamadas a API (Axios)
    ├── {model}.store.ts        # Store de Zustand
    └── {model}.hook.ts         # Custom hooks
```

---

## Convenciones de Nomenclatura

### 1. Interfaces y Tipos

#### `{Model}Response`
Respuesta paginada del endpoint `index`:

```typescript
import type { Links, Meta } from "@/lib/pagination.interface";

export interface BrandResponse {
  data: BrandResource[];    // Array de recursos
  links: Links;             // Enlaces de paginación
  meta: Meta;              // Metadata de paginación
}
```

**IMPORTANTE:** `Links` y `Meta` siempre se importan desde `@/lib/pagination.interface`

#### `{Model}Resource`
Objeto individual que representa un elemento del array `data`:

```typescript
export interface BrandResource {
  id: number;
  name: string;
  code: string;
  created_at: string;
}
```

#### `{Model}ResourceById`
Respuesta al obtener un único recurso por ID:

```typescript
export interface BrandResourceById {
  data: BrandResource;
}
```

### 2. Constantes del Modelo

Cada modelo define una constante `MODEL` exportada que centraliza toda su configuración:

```typescript
const ROUTE = "/marca";
const NAME = "Marca";

export const BRAND: ModelComplete<BrandResource> = {
  MODEL: {
    name: NAME,                   // Nombre singular
    description: "Descripción",   // Descripción del módulo
    plural: "Marcas",            // Nombre plural
    gender: false,               // true=masculino, false=femenino
  },
  ICON: "Tag",                   // Nombre del ícono Lucide
  ICON_REACT: Tag,               // Componente del ícono
  ENDPOINT: "/brand",            // Endpoint del API
  QUERY_KEY: "brands",           // Key para React Query (futuro)
  ROUTE,                         // Ruta absoluta principal
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  TITLES: {
    create: {
      title: `Crear ${NAME}`,
      subtitle: `Complete los campos...`,
    },
    update: {
      title: `Actualizar ${NAME}`,
      subtitle: `Actualice los campos...`,
    },
    delete: {
      title: `Eliminar ${NAME}`,
      subtitle: `Confirme para eliminar...`,
    },
  },
  EMPTY: {                       // Objeto vacío para formularios
    id: 0,
    name: "",
    code: "",
    created_at: "",
  },
};
```

---

## Gestión de Estado

### Zustand Store

Usamos **Zustand** para gestionar el estado de cada módulo.

#### Estructura del Store

```typescript
interface BrandStore {
  // Estado
  allBrands: BrandResource[] | null;  // Todos los registros (sin paginación)
  brands: BrandResource[] | null;      // Registros paginados
  brand: BrandResource | null;         // Registro individual
  meta: Meta | null;                   // Metadata de paginación

  // Estados de carga
  isLoadingAll: boolean;               // Cargando todos
  isLoading: boolean;                  // Cargando paginados
  isFinding: boolean;                  // Buscando por ID
  isSubmitting: boolean;               // Enviando formulario
  error: string | null;

  // Acciones
  fetchAllBrands: () => Promise<void>;
  fetchBrands: (params?: Record<string, any>) => Promise<void>;
  fetchBrand: (id: number) => Promise<void>;
  createBrand: (data: BrandSchema) => Promise<void>;
  updateBrand: (id: number, data: BrandSchema) => Promise<void>;
}

export const useBrandStore = create<BrandStore>((set) => ({
  // ... implementación
}));
```

### Custom Hooks

Los hooks encapsulan la lógica del store y se usan en los componentes:

```typescript
// Hook para listado paginado
export function useBrand(params?: Record<string, unknown>) {
  const { brands, meta, isLoading, error, fetchBrands } = useBrandStore();

  useEffect(() => {
    if (!brands) fetchBrands(params);
  }, [brands, fetchBrands]);

  return {
    data: brands,
    meta,
    isLoading,
    error,
    refetch: fetchBrands,
  };
}

// Hook para obtener todos (sin paginación)
export function useAllBrands() {
  const { allBrands, isLoadingAll, error, fetchAllBrands } = useBrandStore();

  useEffect(() => {
    if (!allBrands) fetchAllBrands();
  }, [allBrands, fetchAllBrands]);

  return {
    data: allBrands,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllBrands,
  };
}

// Hook para obtener por ID
export function useBrandById(id: number) {
  const { brand, isFinding, error, fetchBrand } = useBrandStore();

  useEffect(() => {
    fetchBrand(id);
  }, [id]);

  return {
    data: brand,
    isFinding,
    error,
    refetch: () => fetchBrand(id),
  };
}
```

---

## Manejo de Errores y Toasts

### Principios Fundamentales

**IMPORTANTE:** El manejo de errores sigue estas reglas estrictas:

1. **Los errores solo se definen en el Store** - NO en pages ni hooks
2. **Usar `successToast` y `errorToast`** - NO usar `toast` genérico
3. **Los errores del backend pueden venir en dos formatos:**
   - `error.response.data.error`
   - `error.response.data.message`

### Implementación en el Store

Los errores se manejan exclusivamente en las acciones del store:

```typescript
export const useBrandStore = create<BrandStore>((set) => ({
  // ... estado

  createBrand: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeBrand(data);
      // ❌ NO mostrar toasts aquí
      // ✅ Solo actualizar estado
    } catch (err: any) {
      // Capturar el error del backend
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Error desconocido";
      set({ error: errorMessage });
      throw err; // Propagar el error para que el componente lo maneje
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateBrand: async (id: number, data: BrandSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateBrand(id, data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Error desconocido";
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  fetchBrands: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getBrand({ params });
      set({ brands: data, meta: meta, isLoading: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Error al cargar marcas";
      set({ error: errorMessage, isLoading: false });
    }
  },
}));
```

### Uso de Toasts en Componentes

Los componentes usan `successToast` y `errorToast` importados de `@/lib/core.function`:

```typescript
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/lib/core.function";

// En el componente
const handleSubmit = async (data: BrandSchema) => {
  try {
    await createBrand(data);
    successToast(SUCCESS_MESSAGE(MODEL, "create"));
    navigate(BRAND.ROUTE);
  } catch (error: any) {
    // El error ya está en el store, solo mostramos el toast
    const message = error.response?.data?.error || error.response?.data?.message || ERROR_MESSAGE(MODEL, "create");
    errorToast(message);
  }
};

const handleDelete = async () => {
  if (!deleteId) return;
  try {
    await deleteBrand(deleteId);
    await refetch();
    successToast(SUCCESS_MESSAGE(MODEL, "delete"));
  } catch (error: any) {
    const message = error.response?.data?.error || error.response?.data?.message || ERROR_MESSAGE(MODEL, "delete");
    errorToast(message);
  } finally {
    setDeleteId(null);
  }
};
```

### Funciones de Toast

**✅ USAR:**
```typescript
successToast(message: string) // Para operaciones exitosas
errorToast(message: string)   // Para errores - el mensaje se muestra directamente
```

**Nota:** `errorToast` tiene un parámetro opcional `title`, pero normalmente solo usamos el mensaje. Si el backend no devuelve mensaje, usar `ERROR_MESSAGE()` como fallback.

**❌ NO USAR:**
```typescript
toast({ ... })                           // No usar toast genérico
errorToast(message, ERROR_MESSAGE(...))  // ❌ ERROR_MESSAGE no va como segundo parámetro
```

**✅ PATRÓN CORRECTO:**
```typescript
// Si message es null/undefined, usar ERROR_MESSAGE como fallback
const message = error.response?.data?.error || error.response?.data?.message || ERROR_MESSAGE(MODEL, "operation");
errorToast(message); // message ya incluye el fallback
```

### Mensajes Estándar

Usar las funciones helper de `@/lib/core.function`:

```typescript
SUCCESS_MESSAGE(MODEL, "create")  // "Marca creada exitosamente"
SUCCESS_MESSAGE(MODEL, "update")  // "Marca actualizada exitosamente"
SUCCESS_MESSAGE(MODEL, "delete")  // "Marca eliminada exitosamente"

ERROR_MESSAGE(MODEL, "create")    // "Error al crear Marca"
ERROR_MESSAGE(MODEL, "update")    // "Error al actualizar Marca"
ERROR_MESSAGE(MODEL, "delete")    // "Error al eliminar Marca"
```

### Patrón de Catch

**Siempre tipear el error como `any` en el catch:**

```typescript
try {
  // operación
} catch (error: any) {
  // ✅ CORRECTO
  const message = error.response?.data?.error || error.response?.data?.message || ERROR_MESSAGE(MODEL, "operation");
  errorToast(message);
}
```

**IMPORTANTE:** Si el backend no envía un mensaje de error, usamos `ERROR_MESSAGE()` como fallback. El primer parámetro de `errorToast` es el mensaje que se muestra.

### Resumen de Reglas

| ❌ NO | ✅ SÍ |
|-------|-------|
| Definir errores en pages | Definir errores solo en store |
| Definir errores en hooks | Leer errores del store en componentes |
| Usar `toast()` | Usar `successToast()` y `errorToast()` |
| `catch (error)` | `catch (error: any)` |
| Asumir solo `error.response.data.message` | Verificar `error.response.data.error` OR `error.response.data.message` |

---

## Vistas vs Modales - Cuándo usar cada uno

### Regla Principal

**USAR VISTAS (AddPage/EditPage) cuando:**
- El formulario tiene **más de 10 campos**
- El request tiene **detalles** (array de items dentro del request)
- Necesita una **tabla de detalles** dentro del formulario (Master-Detail)

**USAR MODALES cuando:**
- El formulario tiene **10 campos o menos**
- Es un CRUD simple sin detalles
- No requiere tablas internas

### Ejemplos

```typescript
// ❌ NO usar modal - tiene más de 10 campos
interface ProductRequest {
  name: string;
  code: string;
  description: string;
  category_id: number;
  brand_id: number;
  unit_id: number;
  price: number;
  stock: number;
  min_stock: number;
  max_stock: number;
  barcode: string;
  image: string;
  // ✅ USAR VISTA (ProductAddPage.tsx, ProductEditPage.tsx)
}

// ❌ NO usar modal - tiene detalles (array)
interface PurchaseRequest {
  supplier_id: number;
  date: string;
  total: number;
  details: PurchaseDetail[]; // Array de detalles
  // ✅ USAR VISTA (PurchaseAddPage.tsx, PurchaseEditPage.tsx)
}

// ✅ CORRECTO usar modal - simple, sin detalles, pocos campos
interface BrandRequest {
  name: string;
  code: string;
  // ✅ USAR MODAL (BrandModal.tsx)
}
```

---

## Formularios con Detalles (Master-Detail)

### Filosofía: Navegación Estilo Excel

**IMPORTANTE:** Este proyecto prioriza la **velocidad de captura de datos** mediante teclado sobre el uso del mouse.

### Principios

1. **Tab es el rey** - La navegación entre campos debe ser fluida usando TAB
2. **Enter para agregar** - Al presionar Enter en el último campo, agregar el detalle a la tabla
3. **Foco automático** - Después de agregar, el foco vuelve al primer campo del detalle
4. **Edición rápida** - Doble click o Enter en la tabla para editar
5. **Eliminar rápido** - Tecla Delete o botón visible

### Estructura de Vista con Detalles

```
{Model}AddPage.tsx o {Model}EditPage.tsx
├── Campos del Master (encabezado)
├── DataTable para los detalles
│   ├── Fila de captura (inputs inline)
│   └── Filas de datos capturados
└── Botones de acción (Guardar/Cancelar)
```

### Componentes Requeridos

#### Para Sheets (recomendado)
- `<GeneralSheet />` - Para agregar/editar items desde un sheet lateral
- Ejemplo: Al seleccionar un producto, abrir sheet con su información

#### Para Modales
- `<GeneralModal />` - Para confirmaciones o formularios pequeños
- Ejemplo: Confirmar eliminación de un detalle

### Ejemplo de Tabla de Detalles

```tsx
// En PurchaseAddPage.tsx
import { DataTable } from "@/components/DataTable";

export default function PurchaseAddPage() {
  const [details, setDetails] = useState<PurchaseDetail[]>([]);
  const [currentDetail, setCurrentDetail] = useState<PurchaseDetail>({
    product_id: "",
    quantity: 0,
    price: 0,
  });

  const handleAddDetail = () => {
    setDetails([...details, currentDetail]);
    setCurrentDetail({ product_id: "", quantity: 0, price: 0 });
    // Foco automático al primer campo
    document.getElementById("product_id")?.focus();
  };

  return (
    <PageWrapper>
      {/* Campos del Master */}
      <div className="grid grid-cols-2 gap-4">
        <FormSelect name="supplier_id" label="Proveedor" />
        <DatePickerFormField name="date" label="Fecha" />
      </div>

      {/* Tabla de Detalles */}
      <div className="space-y-2">
        <h3>Detalles de Compra</h3>

        {/* Fila de captura */}
        <div className="grid grid-cols-4 gap-2">
          <FormSelect
            id="product_id"
            value={currentDetail.product_id}
            onChange={(value) => setCurrentDetail({ ...currentDetail, product_id: value })}
            onKeyDown={(e) => e.key === "Tab" && /* mover al siguiente */}
          />
          <FormInput
            type="number"
            value={currentDetail.quantity}
            onChange={(e) => setCurrentDetail({ ...currentDetail, quantity: e.target.value })}
            onKeyDown={(e) => e.key === "Tab" && /* mover al siguiente */}
          />
          <FormInput
            type="number"
            value={currentDetail.price}
            onChange={(e) => setCurrentDetail({ ...currentDetail, price: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleAddDetail()}
          />
          <Button onClick={handleAddDetail}>Agregar</Button>
        </div>

        {/* DataTable con los detalles capturados */}
        <DataTable
          data={details}
          columns={detailColumns}
          onRowDoubleClick={(row) => editDetail(row)}
          onRowDelete={(row) => deleteDetail(row)}
        />
      </div>

      {/* Botones de acción */}
      <div className="flex gap-4 justify-end">
        <Button variant="neutral" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit}>Guardar</Button>
      </div>
    </PageWrapper>
  );
}
```

### Atajos de Teclado Recomendados

| Tecla | Acción |
|-------|--------|
| **Tab** | Navegar al siguiente campo |
| **Shift + Tab** | Navegar al campo anterior |
| **Enter** | Agregar detalle (en último campo) |
| **Enter** | Editar fila (con foco en tabla) |
| **Delete** | Eliminar fila seleccionada |
| **Esc** | Cancelar edición |
| **Ctrl + S** | Guardar formulario |

### Validaciones en Detalles

- Validar cada detalle antes de agregarlo a la tabla
- No permitir detalles duplicados (mismo producto, etc.)
- Mostrar errores inline en la fila de captura
- Validar que haya al menos 1 detalle antes de guardar el master

### Request Final con Detalles

```typescript
interface PurchaseRequest {
  // Campos del master
  supplier_id: number;
  date: string;
  warehouse_id: number;

  // Array de detalles
  details: [
    {
      product_id: number;
      quantity: number;
      price: number;
    }
  ];
}
```

---

## API Actions

Las acciones de API usan la instancia `api` de Axios configurada en `@/lib/config`.

### Archivo: `{model}.actions.ts`

```typescript
import { api } from "@/lib/config";
import {
  BRAND,
  type getBrandProps,
  type BrandResource,
  type BrandResourceById,
  type BrandResponse,
} from "./brand.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = BRAND;

// Obtener registros paginados
export async function getBrand({ params }: getBrandProps): Promise<BrandResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<BrandResponse>(ENDPOINT, config);
  return data;
}

// Obtener todos los registros (sin paginación)
export async function getAllBrands(): Promise<BrandResource[]> {
  const config: AxiosRequestConfig = {
    params: { all: true },
  };
  const { data } = await api.get<BrandResource[]>(ENDPOINT, config);
  return data;
}

// Buscar por ID
export async function findBrandById(id: number): Promise<BrandResourceById> {
  const response = await api.get<BrandResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

// Crear
export async function storeBrand(data: any): Promise<BrandResponse> {
  const response = await api.post<BrandResponse>(ENDPOINT, data);
  return response.data;
}

// Actualizar
export async function updateBrand(id: number, data: any): Promise<BrandResponse> {
  const response = await api.put<BrandResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

// Eliminar
export async function deleteBrand(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
```

---

## Validación con Zod

### Archivo: `{model}.schema.ts`

Los schemas usan **Zod** para validación de formularios. Utilizan funciones del archivo `@/lib/core.schema.ts`.

```typescript
import { z } from "zod";
import {
  requiredStringId,
  optionalStringId,
  requiredNumberId,
  optionalNumericId,
  phoneSchemaOptional,
  dateStringSchema,
} from "@/lib/core.schema";

export const brandSchemaCreate = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "El nombre no puede tener más de 255 caracteres"),

  code: z
    .string()
    .min(1, "El código es requerido")
    .max(10, "El código no puede tener más de 10 caracteres")
    .regex(/^[A-Z0-9]+$/, "El código solo debe contener letras mayúsculas y números"),
});

export const brandSchemaUpdate = brandSchemaCreate.partial();

export type BrandSchema = z.infer<typeof brandSchemaCreate>;
```

### Funciones de Validación Core

**Archivo:** `src/lib/core.schema.ts`

```typescript
// Para IDs de selects que pueden ser opcionales
export const optionalStringId = (message: string) =>
  z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().min(1, message).optional()
  );

// Para IDs de selects requeridos
export const requiredStringId = (message: string) =>
  z.string()
    .min(1, message)
    .max(100, message)
    .refine((val) => val !== undefined, { message });

// Para IDs numéricos opcionales
export const optionalNumericId = (message: string) =>
  z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      const parsed = Number(val);
      return isNaN(parsed) ? val : parsed;
    },
    z.number().optional().refine((val) => val !== undefined, { message })
  );

// Para IDs numéricos requeridos
export const requiredNumberId = (message: string) =>
  z.preprocess(
    (val) => {
      const parsed = Number(val);
      return isNaN(parsed) ? val : parsed;
    },
    z.number().refine((val) => val !== undefined && !isNaN(val), { message })
  );

// Para teléfonos opcionales
export const phoneSchemaOptional = z
  .string()
  .max(9, "El teléfono no puede tener más de 9 caracteres")
  .refine((val) => !val || /^\d+$/.test(val), {
    message: "El teléfono solo puede contener números",
  })
  .optional()
  .or(z.literal(""));

// Para fechas como strings
export const dateStringSchema = (field: string) =>
  z.string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: `${field} no es una fecha válida`,
    })
    .optional()
    .or(z.literal(""));
```

---

## Formularios

### Componentes de Formulario

Los formularios usan **React Hook Form** con **Zod resolver**.

#### Componentes Disponibles

- `<FormInput />` - Input de texto
- `<FormSelect />` - Select dropdown
- `<FormSwitch />` - Switch on/off
- `<DatePickerFormField />` - Selector de fecha
- `<FormTextarea />` - Área de texto
- `<FormCheckbox />` - Checkbox

#### Ejemplo de Formulario

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { brandSchemaCreate, type BrandSchema } from "../lib/brand.schema";

interface BrandFormProps {
  defaultValues: Partial<BrandSchema>;
  onSubmit: (data: BrandSchema) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const BrandForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = "create",
}: BrandFormProps) => {
  const form = useForm({
    resolver: zodResolver(mode === "create" ? brandSchemaCreate : brandSchemaUpdate),
    defaultValues: {
      name: "",
      code: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-sidebar p-4 rounded-lg">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Marca 01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: M01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
            {isSubmitting ? "Guardando" : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
```

---

## Componentes Compartidos

### Estructura de Página Principal

La página principal de un módulo sigue esta estructura:

```tsx
import { useEffect, useState } from "react";
import { useBrand } from "../lib/brand.hook";
import TitleComponent from "@/components/TitleComponent";
import BrandActions from "./BrandActions";
import BrandTable from "./BrandTable";
import BrandOptions from "./BrandOptions";
import { BrandColumns } from "./BrandColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { BRAND } from "../lib/brand.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { MODEL, ICON } = BRAND;

export default function BrandPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, meta, isLoading, refetch } = useBrand();

  useEffect(() => {
    refetch({ page, search, per_page });
  }, [page, search, per_page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBrand(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || ERROR_MESSAGE(MODEL, "delete");
      errorToast(message);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.name}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <BrandActions />
      </div>

      {/* Tabla */}
      <BrandTable
        isLoading={isLoading}
        columns={BrandColumns({
          onEdit: setEditId,
          onDelete: setDeleteId,
        })}
        data={data || []}
      >
        <BrandOptions search={search} setSearch={setSearch} />
      </BrandTable>

      {/* Paginación */}
      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {/* Diálogos */}
      {editId !== null && (
        <BrandModal
          id={editId}
          open={true}
          onClose={() => setEditId(null)}
          title={`Editar ${MODEL.name}`}
          mode="update"
        />
      )}

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
```

### Componentes Clave

#### `<TitleComponent />`
Título y subtítulo de la página con ícono.

```tsx
<TitleComponent
  title={MODEL.name}
  subtitle={MODEL.description}
  icon={ICON}
/>
```

#### `<DataTablePagination />`
Componente de paginación.

```tsx
<DataTablePagination
  page={page}
  totalPages={meta?.last_page || 1}
  onPageChange={setPage}
  per_page={per_page}
  setPerPage={setPerPage}
  totalData={meta?.total || 0}
/>
```

#### `<SimpleDeleteDialog />`
Diálogo de confirmación para eliminar.

```tsx
<SimpleDeleteDialog
  open={deleteId !== null}
  onOpenChange={(open) => !open && setDeleteId(null)}
  onConfirm={handleDelete}
/>
```

#### `<ConfirmationDialog />`
Diálogo de confirmación genérico.

```tsx
<ConfirmationDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  onConfirm={handleConfirm}
  title="Confirmar Acción"
  description="¿Está seguro de realizar esta acción?"
/>
```

### Skeleton para Loading

Para estados de carga, usar `<FormSkeleton />`:

```tsx
import { FormSkeleton } from "@/components/FormSkeleton";

{isLoading ? <FormSkeleton /> : <YourContent />}
```

---

## Tablas con TanStack Table

### Definición de Columnas

Archivo: `{Model}Columns.tsx`

```tsx
import { ColumnDef } from "@tanstack/react-table";
import { BrandResource } from "../lib/brand.interface";
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BrandColumnsProps {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const BrandColumns = ({
  onEdit,
  onDelete,
}: BrandColumnsProps): ColumnDef<BrandResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "code",
    header: "Código",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(row.original.id)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(row.original.id)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
```

---

## Páginas de Formulario (Add/Edit)

Para módulos que usan páginas separadas en lugar de modales:

### Estructura de AddPage

```tsx
export default function BrandAddPage() {
  const navigate = useNavigate();
  const { createBrand, isSubmitting } = useBrandStore();
  const { MODEL } = BRAND;

  const handleSubmit = async (data: BrandSchema) => {
    try {
      await createBrand(data);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      navigate(BRAND.ROUTE);
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || ERROR_MESSAGE(MODEL, "create");
      errorToast(message);
    }
  };

  return (
    <PageWrapper>
      <TitleComponent
        title={BRAND.TITLES.create.title}
        subtitle={BRAND.TITLES.create.subtitle}
        icon={BRAND.ICON}
      />

      <BrandForm
        defaultValues={{}}
        onSubmit={handleSubmit}
        onCancel={() => navigate(BRAND.ROUTE)}
        isSubmitting={isSubmitting}
        mode="create"
      />
    </PageWrapper>
  );
}
```

### Estructura de EditPage

```tsx
export default function BrandEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isFinding } = useBrandById(Number(id));
  const { updateBrand, isSubmitting } = useBrandStore();
  const { MODEL } = BRAND;

  const handleSubmit = async (formData: BrandSchema) => {
    try {
      await updateBrand(Number(id), formData);
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      navigate(BRAND.ROUTE);
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || ERROR_MESSAGE(MODEL, "update");
      errorToast(message);
    }
  };

  if (isFinding) return <FormSkeleton />;

  return (
    <PageWrapper>
      <TitleComponent
        title={BRAND.TITLES.update.title}
        subtitle={BRAND.TITLES.update.subtitle}
        icon={BRAND.ICON}
      />

      <BrandForm
        defaultValues={data || {}}
        onSubmit={handleSubmit}
        onCancel={() => navigate(BRAND.ROUTE)}
        isSubmitting={isSubmitting}
        mode="update"
      />
    </PageWrapper>
  );
}
```

---

## Guía de Implementación Completa

Al crear un nuevo módulo, seguir estos pasos:

### 1. Crear Estructura de Carpetas

```
src/pages/{model}/
├── components/
└── lib/
```

### 2. Crear Archivo de Interfaces

`lib/{model}.interface.ts`

- Importar `Links` y `Meta` desde `@/lib/pagination.interface`
- Definir `{Model}Response` (con Links y Meta)
- Definir `{Model}Resource`
- Definir `{Model}ResourceById`
- Exportar constante `MODEL` con toda la configuración

```typescript
import type { Links, Meta } from "@/lib/pagination.interface";
import type { ModelComplete } from "@/lib/core.interface";

export interface BrandResponse {
  data: BrandResource[];
  links: Links;
  meta: Meta;
}

export interface BrandResource {
  id: number;
  name: string;
  // ... otros campos
}

export interface BrandResourceById {
  data: BrandResource;
}

export const BRAND: ModelComplete<BrandResource> = {
  // ... configuración
};
```

### 3. Crear Schema de Validación

`lib/{model}.schema.ts`

- Definir `{model}SchemaCreate` con Zod
- Definir `{model}SchemaUpdate` (usualmente `.partial()`)
- Exportar tipo TypeScript inferido

### 4. Crear Actions de API

`lib/{model}.actions.ts`

- Implementar funciones CRUD usando `api` de Axios
- Usar constantes del interface

### 5. Crear Store de Zustand

`lib/{model}.store.ts`

- Definir interface del store
- Implementar estado y acciones
- Usar actions para llamadas API

### 6. Crear Custom Hooks

`lib/{model}.hook.ts`

- `use{Model}` - Para listado paginado
- `useAll{Models}` - Para obtener todos
- `use{Model}ById` - Para obtener por ID

### 7. Crear Componentes

`components/`

- `{Model}Page.tsx` - Página principal
- `{Model}Form.tsx` - Formulario reutilizable
- `{Model}Table.tsx` - Componente de tabla
- `{Model}Columns.tsx` - Definición de columnas
- `{Model}Options.tsx` - Filtros y búsqueda
- `{Model}Actions.tsx` - Botones de acción
- `{Model}Modal.tsx` - Modal (si aplica)
- `{Model}AddPage.tsx` - Página de creación (si aplica)
- `{Model}EditPage.tsx` - Página de edición (si aplica)

### 8. Registrar Rutas en App.tsx

```tsx
import { MODEL } from "./pages/{model}/lib/{model}.interface";
const { ROUTE: ModelRoute } = MODEL;

<Route
  path={ModelRoute}
  element={
    <ProtectedRoute path={ModelRoute}>
      <ModelPage />
    </ProtectedRoute>
  }
/>
```

---

## Resumen de Convenciones

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Respuesta paginada | `{Model}Response` | `BrandResponse` |
| Recurso individual | `{Model}Resource` | `BrandResource` |
| Respuesta por ID | `{Model}ResourceById` | `BrandResourceById` |
| Schema Zod | `{model}SchemaCreate`, `{model}SchemaUpdate` | `brandSchemaCreate` |
| Tipo TypeScript | `{Model}Schema` | `BrandSchema` |
| Store | `use{Model}Store` | `useBrandStore` |
| Hook principal | `use{Model}` | `useBrand` |
| Hook todos | `useAll{Models}` | `useAllBrands` |
| Hook por ID | `use{Model}ById` | `useBrandById` |
| Actions | `get{Model}`, `store{Model}`, `update{Model}`, `delete{Model}`, `find{Model}ById` | `getBrand`, `storeBrand` |
| Componentes | `{Model}Page`, `{Model}Form`, etc. | `BrandPage`, `BrandForm` |

---

## Notas Finales

### Reglas de Oro

1. **Rutas y Endpoints**
   - Siempre usar las constantes del archivo `interface.ts`
   - Nunca hardcodear rutas en componentes

2. **Validación**
   - Usar funciones de `core.schema.ts` para validaciones comunes (IDs, teléfonos, fechas)
   - Seguir la convención de nombres para schemas

3. **Gestión de Estado**
   - Usar Zustand para gestión de estado
   - Los errores SOLO se definen en el Store, no en pages ni hooks
   - Hooks solo exponen el estado, no manejan lógica de errores

4. **Toasts y Mensajes**
   - **SIEMPRE usar `successToast` y `errorToast`** - NUNCA `toast()`
   - Usar `SUCCESS_MESSAGE()` y `ERROR_MESSAGE()` para mensajes estándar
   - Los errores del backend pueden venir en `error.response.data.error` O `error.response.data.message`
   - Siempre verificar ambos formatos: `error.response?.data?.error || error.response?.data?.message`

5. **Manejo de Errores**
   - Siempre tipear como `catch (error: any)`
   - Capturar errores en el store y propagar con `throw err`
   - Mostrar toasts en los componentes
   - Verificar ambos formatos de error del backend

6. **Tablas y UI**
   - Usar TanStack Table para todas las tablas
   - Usar componentes compartidos de `@/components`
   - Manejar estados de carga con skeletons apropiados
   - Usar `PageWrapper` para envolver páginas de formulario

7. **Nomenclatura**
   - Seguir estrictamente la convención de nombres
   - `{Model}Response` para paginados (importar `Links` y `Meta` desde `@/lib/pagination.interface`)
   - `{Model}Resource` para objetos individuales
   - `{Model}ResourceById` para respuestas por ID

8. **Imports Comunes**
   - `Links` y `Meta` siempre desde `@/lib/pagination.interface`
   - `ModelComplete` desde `@/lib/core.interface`
   - Funciones de validación desde `@/lib/core.schema`
   - `api` (instancia Axios) desde `@/lib/config`
   - Toasts y mensajes desde `@/lib/core.function`

9. **Vistas vs Modales**
   - **Usar VISTA** si tiene más de 10 campos
   - **Usar VISTA** si el request tiene detalles (array de items)
   - **Usar MODAL** solo para CRUDs simples (≤10 campos, sin detalles)

10. **Formularios con Detalles (Master-Detail)**
   - **Navegación estilo Excel** - Tab es el rey, Enter para agregar
   - **DataTable** para mostrar los detalles capturados
   - **Fila de captura** inline para agregar detalles rápidamente
   - **Usar `<GeneralSheet />`** para sheets laterales
   - **Usar `<GeneralModal />`** para modales/confirmaciones
   - **Validar detalles** antes de agregar y antes de guardar el master
   - **Atajos de teclado** - Tab, Enter, Delete, Esc, Ctrl+S

---

**Última actualización:** 2026-01-07
