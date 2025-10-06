
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
import { Eye, Loader2, MoreHorizontal, Pencil } from "lucide-react";
import type { ProyectoConNombre } from '@/lib/toil/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VerProyectoDetalle from './ver-proyecto-detalle';
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ProyectosTableProps {
    proyectos: ProyectoConNombre[];
    isLoading: boolean;
    onEdit: (proyecto: ProyectoConNombre) => void;
}

export default function ProyectosTable({ proyectos, isLoading, onEdit }: ProyectosTableProps) {
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
        if (!dateString) return 'N/A';
        try {
            // Check if it is a valid date string
            if (isNaN(new Date(dateString).getTime())) return 'N/A';
            return new Date(dateString).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch(e) {
            return 'N/A';
        }
    }

    const columns: ColumnDef<ProyectoConNombre>[] = [
        {
            accessorKey: "titulo",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Título del Proyecto" />,
            cell: ({ row }) => <div className="font-medium max-w-xs truncate">{row.getValue("titulo")}</div>,
        },
        {
            accessorKey: "tecnologia",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tecnología" />,
        },
        {
            accessorKey: "fecha_inicio",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha Inicio" />,
            cell: ({ row }) => formatDate(row.getValue("fecha_inicio")),
        },
        {
            accessorKey: "estado_proyecto",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
            cell: ({ row }) => <Badge className={estadoColors[row.getValue("estado_proyecto")]}>{row.getValue("estado_proyecto")}</Badge>
        },
        {
            id: "actions",
            cell: ({ row }) => (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(row.original)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(row.original)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
                <Loader2 className="h-24 w-24 animate-spin text-primary opacity-50" />
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
