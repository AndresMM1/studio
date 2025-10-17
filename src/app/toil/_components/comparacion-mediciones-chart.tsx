
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Loader2 } from 'lucide-react';


interface ChartData {
    proyecto: string;
    real: number;
    proyectada: number;
}

interface ComparacionMedicionesChartProps {
    data: ChartData[];
    isLoading: boolean;
    title?: string;
    description?: string;
}

export default function ComparacionMedicionesChart({ data, isLoading, title, description }: ComparacionMedicionesChartProps) {

    if (isLoading) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>{title || 'Análisis de Mediciones'}</CardTitle>
                    <CardDescription>{description || 'Comparación de horas mensuales por proyecto antes (Real) y después (Proyectada) de la automatización.'}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-96">
                        <Loader2 className="h-16 w-16 animate-spin text-primary opacity-50" />
                    </div>
                </CardContent>
             </Card>
        );
    }
    
    if (data.length === 0) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>{title || 'Análisis de Mediciones'}</CardTitle>
                    <CardDescription>{description || 'Comparación de horas mensuales por proyecto antes (Real) y después (Proyectada) de la automatización.'}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-96">
                        <p className="text-muted-foreground">No hay datos suficientes para la comparación.</p>
                         <p className="text-sm text-muted-foreground mt-2 text-center">Asegúrese de que existan mediciones 'Reales' y 'Proyectadas' para las mismas actividades vinculadas a proyectos.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const chartConfig = {
        real: {
          label: "Real (Hrs/Mes)",
          color: "hsl(var(--chart-1))",
        },
        proyectada: {
          label: "Proyectada (Hrs/Mes)",
          color: "hsl(var(--chart-2))",
        },
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title || 'Análisis de Mediciones por Proyecto'}</CardTitle>
                <CardDescription>{description || 'Comparación de horas mensuales totales por proyecto antes (Real) y después (Proyectada) de la automatización.'}</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="h-[400px]">
                    <ChartContainer config={chartConfig}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="proyecto"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ textAnchor: 'middle', fontSize: 12 }}
                                    interval="preserveStartEnd"
                                />
                                <YAxis 
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}h`}
                                />
                                <Tooltip
                                    content={<ChartTooltipContent
                                        formatter={(value, name) => {
                                            const config = chartConfig[name as keyof typeof chartConfig];
                                            return (
                                                <div className="flex flex-col">
                                                    <span className="capitalize">{config?.label}</span>
                                                    <span className="font-bold">{`${Number(value).toFixed(2)} hrs/mes`}</span>
                                                </div>
                                            )
                                        }}
                                    />}
                                />
                                <Legend />
                                <Bar dataKey="real" fill="var(--color-real)" radius={[4, 4, 0, 0]} name="Real" />
                                <Bar dataKey="proyectada" fill="var(--color-proyectada)" radius={[4, 4, 0, 0]} name="Proyectada" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                 </div>
            </CardContent>
        </Card>
    )
}
