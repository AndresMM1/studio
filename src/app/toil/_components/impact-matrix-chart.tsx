
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Loader2 } from 'lucide-react';

interface AhorroPorProyectoChartProps {
    data: {
        proyecto: string;
        ahorro: number;
    }[];
    isLoading: boolean;
}

const chartConfig = {
    ahorro: {
        label: "Ahorro (Hrs/Mes)",
        color: "hsl(var(--chart-2))",
    },
};

export default function AhorroPorProyectoChart({ data, isLoading }: AhorroPorProyectoChartProps) {
    if (isLoading) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Ahorro de Horas por Proyecto</CardTitle>
                    <CardDescription>Total de horas mensuales ahorradas por cada proyecto de automatización.</CardDescription>
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
                    <CardTitle>Ahorro de Horas por Proyecto</CardTitle>
                    <CardDescription>Total de horas mensuales ahorradas por cada proyecto de automatización.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-96">
                        <p className="text-muted-foreground">No hay datos de ahorro para mostrar.</p>
                         <p className="text-sm text-muted-foreground mt-2 text-center">Asegúrese de que los proyectos tengan mediciones 'Reales' y 'Proyectadas' asociadas.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ahorro de Horas por Proyecto</CardTitle>
                <CardDescription>Total de horas mensuales ahorradas por cada proyecto de automatización.</CardDescription>
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
                                    cursor={{fill: 'transparent'}}
                                    content={<ChartTooltipContent
                                        formatter={(value, name) => [`${Number(value).toFixed(2)} hrs/mes`, "Ahorro"]}
                                    />}
                                />
                                <Legend />
                                <Bar dataKey="ahorro" fill="var(--color-ahorro)" radius={[4, 4, 0, 0]} name="Ahorro (Hrs/Mes)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                 </div>
            </CardContent>
        </Card>
    )
}
