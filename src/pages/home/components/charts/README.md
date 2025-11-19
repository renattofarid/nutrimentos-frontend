# Componentes de Gráficas Interactivas

Este directorio contiene los componentes de gráficas interactivas mejoradas para el Dashboard.

## Componentes

### PurchaseStatusChart

Gráfica de pie interactiva que muestra la distribución de compras por estado.

**Características:**
- Gráfica de pie con anillo interior (donut chart)
- Selector dropdown para cambiar el estado activo
- Animaciones al hacer hover y al cambiar de estado activo
- Muestra el total de compras del estado seleccionado en el centro
- Leyenda con porcentajes clickeable
- Colores personalizados por estado:
  - REGISTRADO: chart-3
  - PAGADA: chart-1
  - PENDIENTE: chart-4
  - CANCELADA: chart-5

**Props:**
```typescript
interface PurchaseStatusChartProps {
  data: Array<{ name: string; value: number }>
}
```

**Ejemplo de uso:**
```tsx
<PurchaseStatusChart
  data={[
    { name: "PAGADA", value: 45 },
    { name: "PENDIENTE", value: 23 },
    { name: "REGISTRADO", value: 12 }
  ]}
/>
```

### PaymentTypeChart

Gráfica de pie interactiva que muestra la distribución de compras por tipo de pago.

**Características:**
- Gráfica de pie con anillo interior (donut chart)
- Selector dropdown para cambiar el tipo de pago activo
- Iconos representativos (Wallet para Contado, CreditCard para Crédito)
- Animaciones al hacer hover y al cambiar de tipo activo
- Muestra el total de compras del tipo seleccionado en el centro
- Leyenda con porcentajes e iconos clickeable
- Colores personalizados por tipo:
  - CONTADO: chart-1
  - CREDITO: chart-2

**Props:**
```typescript
interface PaymentTypeChartProps {
  data: Array<{ name: string; value: number }>
}
```

**Ejemplo de uso:**
```tsx
<PaymentTypeChart
  data={[
    { name: "CONTADO", value: 38 },
    { name: "CREDITO", value: 42 }
  ]}
/>
```

## Tecnologías Utilizadas

- **Recharts**: Biblioteca de gráficas para React
- **Radix UI**: Componentes base (Select)
- **Tailwind CSS**: Estilos
- **Lucide React**: Iconos

## Características Comunes

Ambos componentes comparten las siguientes características:

1. **Interactividad:**
   - Selector dropdown para cambiar el segmento activo
   - Leyenda clickeable para cambiar el segmento activo
   - Animaciones suaves al cambiar de estado

2. **Responsive:**
   - Se adaptan al tamaño del contenedor
   - Diseño optimizado para móviles y escritorio

3. **Accesibilidad:**
   - Etiquetas ARIA apropiadas
   - Soporte de teclado

4. **Manejo de datos vacíos:**
   - Muestra un mensaje apropiado cuando no hay datos

5. **Indicador central:**
   - Muestra el número de compras del segmento activo
   - Actualización dinámica al cambiar de segmento

## Personalización

Para personalizar los colores, edita el objeto `chartConfig` en cada componente. Los colores usan variables CSS de Tailwind:

```typescript
const chartConfig = {
  ESTADO: {
    label: "Etiqueta",
    color: "hsl(var(--chart-N))", // N = 1-5
  },
}
```
