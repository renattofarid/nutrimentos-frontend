"use client"

import * as React from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type {
  ChartConfig,
} from "@/components/ui/chart"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface MonthlyData {
  month: string
  total: number
}

interface MonthlyPurchasesChartProps {
  data: MonthlyData[]
}

const chartConfig = {
  total: {
    label: "Total",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function MonthlyPurchasesChart({ data }: MonthlyPurchasesChartProps) {
  // Transformar datos al formato necesario
  const chartData = React.useMemo(
    () =>
      data.map((item) => ({
        month: item.month,
        total: item.total,
        fill: "var(--chart-1)",
      })),
    [data]
  )

  // Calcular el índice de la barra activa (última barra con datos)
  const activeIndex = React.useMemo(
    () => (chartData.length > 0 ? chartData.length - 1 : 0),
    [chartData]
  )

  // Calcular el cambio porcentual del último mes
  const trendData = React.useMemo(() => {
    if (chartData.length < 2) {
      return { percentage: 0, isPositive: true }
    }

    const currentMonth = chartData[chartData.length - 1]?.total || 0
    const previousMonth = chartData[chartData.length - 2]?.total || 0

    if (previousMonth === 0) {
      return { percentage: 0, isPositive: true }
    }

    const change = ((currentMonth - previousMonth) / previousMonth) * 100
    return {
      percentage: Math.abs(change),
      isPositive: change >= 0,
    }
  }, [chartData])

  // Calcular el total de todos los meses
  const totalAmount = React.useMemo(
    () => chartData.reduce((sum, item) => sum + item.total, 0),
    [chartData]
  )

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compras por Mes</CardTitle>
          <CardDescription>
            Monto total de compras en los últimos 6 meses
          </CardDescription>
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
    <Card>
      <CardHeader>
        <CardTitle>Compras por Mes</CardTitle>
        <CardDescription>
          Monto total de compras en los últimos {chartData.length} meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `S/. ${value.toLocaleString()}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) => (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold">
                        S/. {Number(value).toFixed(2)}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="total"
              strokeWidth={2}
              radius={[8, 8, 0, 0]}
              activeIndex={activeIndex}
              activeBar={({ ...props }) => {
                return (
                  <Rectangle
                    {...props}
                    fillOpacity={0.8}
                    stroke={props.payload.fill}
                    strokeDasharray={4}
                    strokeDashoffset={4}
                  />
                )
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {trendData.isPositive ? (
            <>
              Incremento de {trendData.percentage.toFixed(1)}% este mes
              <TrendingUp className="h-4 w-4 text-green-600" />
            </>
          ) : (
            <>
              Disminución de {trendData.percentage.toFixed(1)}% este mes
              <TrendingDown className="h-4 w-4 text-red-600" />
            </>
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          Total acumulado: S/. {totalAmount.toFixed(2)}
        </div>
      </CardFooter>
    </Card>
  )
}
