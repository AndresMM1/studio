
"use client"

import { useState, useEffect } from 'react';
import type { ActividadDefinicion, IniciativaAutomatizacion, ProyectoConNombre, GrupoCelula } from '@/lib/toil/types';
import { getActividadesDefinicion, getIniciativasAutomatizacion, getProyectosAutomatizacion, getGruposCelula } from '@/lib/toil/data';
import { Card, CardContent } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ToilDashboardPage() {
    const [actividades, setActividades] = useState<ActividadDefinicion[]>([]);
    const [iniciativas, setIniciativas] = useState<IniciativaAutomatizacion[]>([]);
    const [proyectos, setProyectos] = useState<ProyectoConNombre[]>([]);
    const [gruposCelula, setGruposCelula] = useState<GrupoCelula[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isActividadDialogOpen, setIsActividadDialogOpen] = useState(false);
    const [isCreateIniciativaOpen, setIsCreateIniciativaOpen] = useState(false);
    const [isProyectoDialogOpen, setIsProyectoDialogOpen] = useState(false);
    
    const [actividadToEdit, setActividadToEdit] = useState<ActividadDefinicion | null>(null);
    const [iniciativaToEdit, setIniciativaToEdit] = useState<IniciativaAutomatizacion | null>(null);
    const [proyectoToEdit, setProyectoToEdit] = useState<ProyectoConNombre | null>(null);

    const isEditModeActividad = !!actividadToEdit;
    const isEditModeIniciativa = !!iniciativaToEdit;
    const isEditModeProyecto = !!proyectoToEdit;


    async function loadData() {
        setIsLoading(true);
        try {
            const [actividadesData, iniciativasData, proyectosData, gruposData] = await Promise.all([
                getActividadesDefinicion(),
                getIniciativasAutomatizacion(),
                getProyectosAutomatizacion(),
                getGruposCelula()
            ]);
            setActividades(actividadesData);
            setIniciativas(iniciativasData);
            setProyectos(proyectosData);
            setGruposCelula(gruposData);
        } catch (error) {
            console.error("Error al cargar los datos de TOIL:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleSuccess = () => {
        setIsActividadDialogOpen(false);
        setIsCreateIniciativaOpen(false);
        setIsProyectoDialogOpen(false);
        setActividadToEdit(null);
        setIniciativaToEdit(null);
        setProyectoToEdit(null);
        loadData(); 
    };
    
    const handleEditActividad = (actividad: ActividadDefinicion) => {
        setActividadToEdit(actividad);
        setIsActividadDialogOpen(true);
    };

    const handleEditIniciativa = (iniciativa: IniciativaAutomatizacion) => {
        setIniciativaToEdit(iniciativa);
        setIsCreateIniciativaOpen(true);
    };

    const handleEditProyecto = (proyecto: ProyectoConNombre) => {
        setProyectoToEdit(proyecto);
        setIsProyectoDialogOpen(true);
    };

    const handleOpenDialog = (dialogSetter: (isOpen: boolean) => void, editSetter: (item: any) => void) => {
        editSetter(null);
        dialogSetter(true);
    }
    
    useEffect(() => {
        if (!isActividadDialogOpen) setActividadToEdit(null);
        if (!isCreateIniciativaOpen) setIniciativaToEdit(null);
        if (!isProyectoDialogOpen) setProyectoToEdit(null);
    }, [isActividadDialogOpen, isCreateIniciativaOpen, isProyectoDialogOpen]);

    return (
        <div className="flex flex-col h-full">
            <header className="flex h-14 items-center justify-between  px-4 lg:h-[60px] lg:px-6">
                <h1 className="text-xl font-bold tracking-tight">Gestión de TOIL</h1>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nuevo
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(setIsActividadDialogOpen, setActividadToEdit)}>
                            Definir Actividad
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDialog(setIsCreateIniciativaOpen, setIniciativaToEdit)}>
                            Registrar Iniciativa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDialog(setIsProyectoDialogOpen, setProyectoToEdit)}>
                            Crear Proyecto
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
                                <ActividadesTable 
                                    actividades={actividades} 
                                    gruposCelula={gruposCelula} 
                                    isLoading={isLoading} 
                                    onEdit={handleEditActividad}
                                />
                            </TabsContent>
                            <TabsContent value="iniciativas">
                                <IniciativasTable 
                                    iniciativas={iniciativas}
                                    actividades={actividades}
                                    gruposCelula={gruposCelula}
                                    proyectos={proyectos}
                                    isLoading={isLoading}
                                    onEdit={handleEditIniciativa}
                                />
                            </TabsContent>
                            <TabsContent value="proyectos">
                                <ProyectosTable 
                                    proyectos={proyectos} 
                                    isLoading={isLoading} 
                                    onEdit={handleEditProyecto}
                                />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </main>

             {/* Diálogo para Actividades */}
            <Dialog open={isActividadDialogOpen} onOpenChange={setIsActividadDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{isEditModeActividad ? "Editar Actividad TOIL" : "Definir Nueva Actividad TOIL"}</DialogTitle>
                        <DialogDescription>
                            {isEditModeActividad ? "Modifica los detalles de la actividad." : "Registra una nueva actividad manual y repetitiva para su posterior análisis."}
                        </DialogDescription>
                    </DialogHeader>
                    <DefinirActividadForm 
                        onSuccess={handleSuccess} 
                        gruposCelula={gruposCelula} 
                        actividadToEdit={actividadToEdit}
                        isEditMode={isEditModeActividad}
                    />
                </DialogContent>
            </Dialog>

            {/* Diálogo para Iniciativas */}
            <Dialog open={isCreateIniciativaOpen} onOpenChange={setIsCreateIniciativaOpen}>
                 <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{isEditModeIniciativa ? "Editar Iniciativa" : "Registrar Nueva Iniciativa"}</DialogTitle>
                        <DialogDescription>
                           {isEditModeIniciativa ? "Modifica los detalles de la iniciativa." : "Propón una nueva iniciativa de automatización para una o más actividades TOIL."}
                        </DialogDescription>
                    </DialogHeader>
                    <RegistrarIniciativaForm 
                        onSuccess={handleSuccess} 
                        actividades={actividades} 
                        proyectos={proyectos}
                        iniciativaToEdit={iniciativaToEdit}
                        isEditMode={isEditModeIniciativa}
                    />
                </DialogContent>
            </Dialog>

            {/* Diálogo para Proyectos */}
            <Dialog open={isProyectoDialogOpen} onOpenChange={setIsProyectoDialogOpen}>
                <DialogContent className="sm:max-w-5xl">
                    <DialogHeader>
                         <DialogTitle>{isEditModeProyecto ? "Editar Proyecto" : "Crear Nuevo Proyecto de Automatización"}</DialogTitle>
                        <DialogDescription>
                           {isEditModeProyecto ? "Actualiza la información del proyecto." : "Convierte una iniciativa aprobada en un proyecto tangible."}
                        </DialogDescription>
                    </DialogHeader>
                    <CrearProyectoForm 
                        onSuccess={handleSuccess}
                        proyectoToEdit={proyectoToEdit}
                        isEditMode={isEditModeProyecto}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
