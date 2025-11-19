"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type {
  ChartConfig,
} from "@/components/ui/chart"
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreditCard, Wallet } from "lucide-react"

interface PaymentTypeData {
  type: string
  count: number
  fill: string
}

interface PaymentTypeChartProps {
  data: Array<{ name: string; value: number }>
}

const chartConfig = {
  count: {
    label: "Compras",
  },
  CONTADO: {
    label: "Contado",
    color: "var(--chart-1)",
    icon: Wallet,
  },
  CREDITO: {
    label: "Crédito",
    color: "var(--chart-2)",
    icon: CreditCard,
  },
} satisfies ChartConfig

export function PaymentTypeChart({ data }: PaymentTypeChartProps) {
  const id = "pie-payment-type"

  // Transformar datos al formato necesario
  const chartData: PaymentTypeData[] = React.useMemo(
    () =>
      data.map((item) => {
        const config = chartConfig[item.name as keyof typeof chartConfig]
        const color = config && 'color' in config ? config.color : "var(--chart-3)"
        return {
          type: item.name,
          count: item.value,
          fill: color,
        }
      }),
    [data]
  )

  const [activeType, setActiveType] = React.useState(
    chartData[0]?.type || ""
  )

  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.type === activeType),
    [activeType, chartData]
  )

  const types = React.useMemo(
    () => chartData.map((item) => item.type),
    [chartData]
  )

  // Calcular total de compras
  const totalCount = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.count, 0),
    [chartData]
  )

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Pago</CardTitle>
          <CardDescription>Distribución por método de pago</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No hay datos disponibles
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Tipo de Pago</CardTitle>
          <CardDescription>Distribución por método de pago</CardDescription>
        </div>
        <Select value={activeType} onValueChange={setActiveType}>
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
            aria-label="Seleccionar tipo de pago"
          >
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {types.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig]

              if (!config) {
                return null
              }

              const Icon = config && 'icon' in config ? config.icon : undefined
              const backgroundColor = config && 'color' in config ? config.color : "var(--chart-3)"

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-sm"
                      style={{
                        backgroundColor,
                      }}
                    />
                    {Icon && <Icon className="h-3 w-3" />}
                    {config?.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="type"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {chartData[activeIndex]?.count.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Compras
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardContent className="pb-4">
        <div className="flex justify-center gap-6 flex-wrap pt-4 border-t">
          {chartData.map((entry) => {
            const config = chartConfig[entry.type as keyof typeof chartConfig]
            const percentage = ((entry.count / totalCount) * 100).toFixed(1)
            const Icon = config && 'icon' in config ? config.icon : undefined

            return (
              <div
                key={entry.type}
                className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setActiveType(entry.type)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{
                      backgroundColor: entry.fill,
                    }}
                  />
                  {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-xs font-medium">
                    {config?.label || entry.type}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {entry.count} ({percentage}%)
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
