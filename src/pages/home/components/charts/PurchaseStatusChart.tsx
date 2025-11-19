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

interface PurchaseStatusData {
  status: string
  count: number
  fill: string
}

interface PurchaseStatusChartProps {
  data: Array<{ name: string; value: number }>
}

const chartConfig = {
  count: {
    label: "Compras",
  },
  REGISTRADO: {
    label: "Registrado",
    color: "var(--chart-3)",
  },
  PAGADA: {
    label: "Pagada",
    color: "var(--chart-1)",
  },
  PENDIENTE: {
    label: "Pendiente",
    color: "var(--chart-4)",
  },
  CANCELADA: {
    label: "Cancelada",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function PurchaseStatusChart({ data }: PurchaseStatusChartProps) {
  const id = "pie-purchase-status"

  // Transformar datos al formato necesario
  const chartData: PurchaseStatusData[] = React.useMemo(
    () =>
      data.map((item) => {
        const config = chartConfig[item.name as keyof typeof chartConfig]
        const color = config && 'color' in config ? config.color : "var(--chart-2)"
        return {
          status: item.name,
          count: item.value,
          fill: color,
        }
      }),
    [data]
  )

  const [activeStatus, setActiveStatus] = React.useState(
    chartData[0]?.status || ""
  )

  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.status === activeStatus),
    [activeStatus, chartData]
  )

  const statuses = React.useMemo(
    () => chartData.map((item) => item.status),
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
          <CardTitle>Estado de Compras</CardTitle>
          <CardDescription>Distribución por estado</CardDescription>
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
          <CardTitle>Estado de Compras</CardTitle>
          <CardDescription>Distribución por estado</CardDescription>
        </div>
        <Select value={activeStatus} onValueChange={setActiveStatus}>
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
            aria-label="Seleccionar estado"
          >
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {statuses.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig]

              if (!config) {
                return null
              }

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
                        backgroundColor: config && 'color' in config ? config.color : "var(--chart-2)",
                      }}
                    />
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
              nameKey="status"
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
        <div className="flex justify-center gap-4 flex-wrap pt-4 border-t">
          {chartData.map((entry) => {
            const config = chartConfig[entry.status as keyof typeof chartConfig]
            const percentage = ((entry.count / totalCount) * 100).toFixed(1)

            return (
              <div
                key={entry.status}
                className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setActiveStatus(entry.status)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{
                      backgroundColor: entry.fill,
                    }}
                  />
                  <span className="text-xs font-medium">
                    {config?.label || entry.status}
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
