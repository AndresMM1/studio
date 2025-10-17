
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Loader2 } from 'lucide-react';

interface TotalAhorroChartProps {
    totalReal: number;
    totalProyectado: number;
    isLoading: boolean;
}

export default function TotalAhorroChart({ totalReal, totalProyectado, isLoading }: TotalAhorroChartProps) {
    
    const chartData = [
        { name: 'Horas Totales', real: totalReal, proyectado: totalProyectado },
    ];

    const ahorroAbsoluto = totalReal - totalProyectado;
    const ahorroPorcentual = totalReal > 0 ? (ahorroAbsoluto / totalReal) * 100 : 0;
    
     const chartConfig = {
        real: {
          label: "Horas Reales",
          color: "hsl(var(--chart-1))",
        },
        proyectado: {
          label: "Horas Proyectadas",
          color: "hsl(var(--chart-2))",
        },
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Resumen General de Ahorro</CardTitle>
                    <CardDescription>Suma total de horas mensuales 'Reales' vs. 'Proyectadas'.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-48">
                    <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Resumen General de Ahorro</CardTitle>
                <CardDescription>Suma total de horas mensuales 'Reales' vs. 'Proyectadas'.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 items-center">
                <div className="h-48">
                    <ChartContainer config={chartConfig}>
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{left: 10, right: 10}}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" hide />
                                <Tooltip
                                    cursor={{fill: 'transparent'}}
                                    content={<ChartTooltipContent 
                                        hideLabel
                                        formatter={(value, name) => {
                                            const config = chartConfig[name as keyof typeof chartConfig];
                                            return (
                                                <div className="flex flex-col">
                                                    <span className="capitalize">{config.label}</span>
                                                    <span className="font-bold">{`${Number(value).toFixed(2)} hrs/mes`}</span>
                                                </div>
                                            )
                                        }}
                                    />}
                                />
                                <Legend />
                                <Bar dataKey="real" fill="var(--color-real)" radius={4} name="Total Real" />
                                <Bar dataKey="proyectado" fill="var(--color-proyectado)" radius={4} name="Total Proyectado"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
                 <div className="flex flex-col items-center justify-center space-y-2">
                    <p className="text-sm text-muted-foreground">Ahorro de Tiempo Proyectado</p>
                    <p className="text-3xl font-bold text-green-600">
                        {ahorroAbsoluto.toFixed(2)} hrs/mes
                    </p>
                    <p className="text-lg font-semibold text-green-500">
                        ({ahorroPorcentual.toFixed(1)}%)
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
