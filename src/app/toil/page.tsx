
"use client"

import { useState, useEffect } from 'react';
import type { ActividadDefinicion, IniciativaAutomatizacion, ProyectoAutomatizacion } from '@/lib/types';
import { getActividadesDefinicion, getIniciativasAutomatizacion, getProyectosAutomatizacion } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActividadesTable from './_components/actividades-table';
import IniciativasTable from './_components/iniciativas-table';
import ProyectosTable from './_components/proyectos-table';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DefinirActividadForm from "./_components/definir-actividad-form";
import RegistrarIniciativaForm from "./_components/registrar-iniciativa-form";
import CrearProyectoForm from "./_components/crear-proyecto-form";

type ProyectoConNombre = ProyectoAutomatizacion & { nombre_iniciativa: string };

export default function ToilDashboardPage() {
    const [actividades, setActividades] = useState<ActividadDefinicion[]>([]);
    const [iniciativas, setIniciativas] = useState<IniciativaAutomatizacion[]>([]);
    const [proyectos, setProyectos] = useState<ProyectoConNombre[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isCreateActividadOpen, setIsCreateActividadOpen] = useState(false);
    const [isCreateIniciativaOpen, setIsCreateIniciativaOpen] = useState(false);
    const [isCreateProyectoOpen, setIsCreateProyectoOpen] = useState(false);

    async function loadData() {
        setIsLoading(true);
        try {
            const [actividadesData, iniciativasData, proyectosData] = await Promise.all([
                getActividadesDefinicion(),
                getIniciativasAutomatizacion(),
                getProyectosAutomatizacion()
            ]);
            setActividades(actividadesData);
            setIniciativas(iniciativasData);
            setProyectos(proyectosData);
        } catch (error) {
            console.error("Error al cargar los datos de TOIL:", error);
            // Optionally, show a toast notification for the error
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleSuccess = () => {
        setIsCreateActividadOpen(false);
        setIsCreateIniciativaOpen(false);
        setIsCreateProyectoOpen(false);
        loadData(); // Recargar los datos después de un registro exitoso
    };

    return (
        <div className="flex flex-col h-full">
            <header className="flex h-14 items-center justify-between border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                <h1 className="text-xl font-bold tracking-tight">Gestión de TOIL</h1>
                <div className="flex items-center gap-2">
                    <Dialog open={isCreateActividadOpen} onOpenChange={setIsCreateActividadOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Definir Actividad
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Definir Nueva Actividad TOIL</DialogTitle>
                                <DialogDescription>
                                    Registra una nueva actividad manual y repetitiva para su posterior análisis.
                                </DialogDescription>
                            </DialogHeader>
                            <DefinirActividadForm onSuccess={handleSuccess} />
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isCreateIniciativaOpen} onOpenChange={setIsCreateIniciativaOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Registrar Iniciativa
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Registrar Nueva Iniciativa</DialogTitle>
                                <DialogDescription>
                                    Propón una nueva iniciativa de automatización para una o más actividades TOIL.
                                </DialogDescription>
                            </DialogHeader>
                            <RegistrarIniciativaForm onSuccess={handleSuccess} />
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isCreateProyectoOpen} onOpenChange={setIsCreateProyectoOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Crear Proyecto
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Crear Nuevo Proyecto de Automatización</DialogTitle>
                                <DialogDescription>
                                    Convierte una iniciativa aprobada en un proyecto tangible.
                                </DialogDescription>
                            </DialogHeader>
                            <CrearProyectoForm onSuccess={handleSuccess} />
                        </DialogContent>
                    </Dialog>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                <Card>
                    <CardContent className="pt-6">
                        <Tabs defaultValue="actividades">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="actividades">Actividades</TabsTrigger>
                                <TabsTrigger value="iniciativas">Iniciativas</TabsTrigger>
                                <TabsTrigger value="proyectos">Proyectos</TabsTrigger>
                            </TabsList>
                            <TabsContent value="actividades">
                                <ActividadesTable actividades={actividades} isLoading={isLoading} />
                            </TabsContent>
                            <TabsContent value="iniciativas">
                                <IniciativasTable iniciativas={iniciativas} isLoading={isLoading} />
                            </TabsContent>
                            <TabsContent value="proyectos">
                                <ProyectosTable proyectos={proyectos} isLoading={isLoading} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
  