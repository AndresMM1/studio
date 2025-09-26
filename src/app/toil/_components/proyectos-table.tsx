
"use client"

import { useState } from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnFiltersState,
    type SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Eye } from "lucide-react";
import type { ProyectoConNombre } from '@/lib/toil/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VerProyectoDetalle from './ver-proyecto-detalle';
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

interface ProyectosTableProps {
    proyectos: ProyectoConNombre[];
    isLoading: boolean;
}

export default function ProyectosTable({ proyectos, isLoading }: ProyectosTableProps) {
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [selectedProyecto, setSelectedProyecto] = useState<ProyectoConNombre | null>(null);
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const handleViewDetails = (proyecto: ProyectoConNombre) => {
        setSelectedProyecto(proyecto);
        setIsViewDialogOpen(true);
    }
    
    const estadoColors: { [key: string]: string } = {
        "Finalizado": "bg-green-100 text-green-800",
        "En Ejecución": "bg-blue-100 text-blue-800",
        "Planificado": "bg-gray-100 text-gray-800",
        "Cancelado": "bg-red-100 text-red-800",
        "En Pausa": "bg-yellow-100 text-yellow-800",
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
    
    const columns: ColumnDef<ProyectoConNombre>[] = [
        {
            accessorKey: "nombre_iniciativa",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre del Proyecto" />,
            cell: ({ row }) => <div className="font-medium max-w-xs truncate">{row.getValue("nombre_iniciativa")}</div>,
        },
        {
            accessorKey: "responsable_tecnico",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Responsable Técnico" />,
        },
        {
            accessorKey: "fecha_inicio",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha Inicio" />,
            cell: ({ row }) => formatDate(row.getValue("fecha_inicio")),
        },
         {
            accessorKey: "presupuesto_usd",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Presupuesto" />,
            cell: ({ row }) => formatCurrency(row.getValue("presupuesto_usd")),
        },
        {
            accessorKey: "estado_proyecto",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
            cell: ({ row }) => <Badge className={estadoColors[row.getValue("estado_proyecto")]}>{row.getValue("estado_proyecto")}</Badge>
        },
        {
            id: "actions",
            cell: ({ row }) => (
                 <Button variant="outline" size="sm" onClick={() => handleViewDetails(row.original)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalles
                </Button>
            ),
        },
    ]

    const table = useReactTable({
        data: proyectos,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    })
    
     if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                            )}
                                    </TableHead>
                                    )
                                })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                    ))}
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No se encontraron resultados.
                                </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <DataTablePagination table={table} />
            </div>
             {selectedProyecto && (
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Detalles del Proyecto</DialogTitle>
                             <DialogDescription>
                                Información completa del proyecto de automatización.
                            </DialogDescription>
                        </DialogHeader>
                        <VerProyectoDetalle proyecto={selectedProyecto} />
                    </DialogContent>
                </Dialog>
            )}
        </>
    )
}
