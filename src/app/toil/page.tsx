"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BarChart as BarChartIcon, FolderKanban, Activity, ArrowRight } from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Bar } from "recharts";

const savingsData = [
  { month: "Ene", manualHours: 120, savedHours: 20 },
  { month: "Feb", manualHours: 140, savedHours: 45 },
  { month: "Mar", manualHours: 130, savedHours: 60 },
  { month: "Abr", manualHours: 160, savedHours: 70 },
  { month: "May", manualHours: 150, savedHours: 90 },
  { month: "Jun", manualHours: 170, savedHours: 110 },
];

const chartConfig = {
  manualHours: {
    label: "Horas Manuales",
    color: "hsl(var(--chart-2))",
  },
  savedHours: {
    label: "Horas Ahorradas",
    color: "hsl(var(--chart-1))",
  },
};

function ToilPage() {
  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <h1 className="text-xl font-bold tracking-tight">Gestión de TOIL</h1>
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Registrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Fases de Automatización</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/toil/definir-actividad">1. Definir Actividad TOIL</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/toil/registrar-iniciativa">2. Registrar Iniciativa</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/toil/crear-proyecto">3. Crear Proyecto</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Mediciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/toil/medir-actividad">Medir Actividad</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Ahorro por Automatización (Horas/Mes)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <BarChart data={savingsData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="manualHours" name="Horas Manuales" fill="var(--color-manualHours)" radius={4} />
                            <Bar dataKey="savedHours" name="Horas Ahorradas" fill="var(--color-savedHours)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <div className="grid gap-6 md:grid-rows-3">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium">Actividades Definidas</CardTitle>
                        <Activity className="h-6 w-6 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Actividades manuales y repetitivas identificadas.</p>
                    </CardContent>
                     <CardFooter>
                        <Button asChild size="sm" variant="outline">
                            <Link href="/toil/actividades">Ver Actividades <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium">Iniciativas Propuestas</CardTitle>
                        <FolderKanban className="h-6 w-6 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">8</div>
                        <p className="text-xs text-muted-foreground">Iniciativas de automatización en evaluación o aprobadas.</p>
                    </CardContent>
                    <CardFooter>
                       <Button asChild size="sm" variant="outline">
                            <Link href="/toil/iniciativas">Ver Iniciativas <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium">Proyectos en Ejecución</CardTitle>
                        <BarChartIcon className="h-6 w-6 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Proyectos de automatización activos.</p>
                    </CardContent>
                     <CardFooter>
                       <Button asChild size="sm" variant="outline">
                            <Link href="/toil/proyectos">Ver Proyectos <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </main>
    </>
  );
}

export default ToilPage;
