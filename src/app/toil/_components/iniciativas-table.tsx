
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
import type { IniciativaAutomatizacion, ActividadDefinicion, GrupoCelula, ProyectoConNombre } from '@/lib/toil/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VerIniciativaDetalle from './ver-iniciativa-detalle';
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';


interface IniciativasTableProps {
    iniciativas: IniciativaAutomatizacion[];
    actividades: ActividadDefinicion[];
    gruposCelula: GrupoCelula[];
    proyectos: ProyectoConNombre[];
    isLoading: boolean;
    onEdit: (iniciativa: IniciativaAutomatizacion) => void;
    onDataChange: () => void;
}

export default function IniciativasTable({ iniciativas, actividades, gruposCelula, proyectos, isLoading, onEdit, onDataChange }: IniciativasTableProps) {
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [selectedIniciativa, setSelectedIniciativa] = useState<IniciativaAutomatizacion | null>(null);
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])


    const handleViewDetails = (iniciativa: IniciativaAutomatizacion) => {
        setSelectedIniciativa(iniciativa);
        setIsViewDialogOpen(true);
    }

    const prioridadColors: { [key: string]: string } = {
        "Crítica": "bg-red-100 text-red-800",
        "Alta": "bg-orange-100 text-orange-800",
        "Media": "bg-yellow-100 text-yellow-800",
        "Baja": "bg-blue-100 text-blue-800",
    }
    
    const estadoColors: { [key: string]: string } = {
        "Aprobada": "bg-green-100 text-green-800",
        "En progreso": "bg-blue-100 text-blue-800",
        "Propuesta": "bg-gray-100 text-gray-800",
        "Rechazada": "bg-red-100 text-red-800",
    }
    
    const columns: ColumnDef<IniciativaAutomatizacion>[] = [
        {
            accessorKey: "id_iniciativa",
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }) => <div className="font-medium">{row.getValue("id_iniciativa")}</div>,
        },
        {
            accessorKey: "nombre_iniciativa",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
            cell: ({ row }) => <div className="max-w-xs truncate">{row.getValue("nombre_iniciativa")}</div>,
        },
        {
            accessorKey: "id_actividades",
            header: "Actividades Vinculadas",
            cell: ({ row }) => {
                const actividades = row.getValue("id_actividades") as number[];
                return <div>{actividades.length}</div>
            },
        },
        {
            accessorKey: "prioridad",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Prioridad" />,
            cell: ({ row }) => <Badge className={prioridadColors[row.getValue("prioridad")]}>{row.getValue("prioridad")}</Badge>
        },
        {
            accessorKey: "estado",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
            cell: ({ row }) => <Badge className={estadoColors[row.getValue("estado")]}>{row.getValue("estado")}</Badge>
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
        data: iniciativas,
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
                 <div className="flex items-center justify-between">
                    <Input
                        placeholder="Filtrar por nombre..."
                        value={(table.getColumn("nombre_iniciativa")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("nombre_iniciativa")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                </div>
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

            {selectedIniciativa && (
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Detalles de la Iniciativa</DialogTitle>
                             <DialogDescription>
                                Información completa de la iniciativa de automatización.
                            </DialogDescription>
                        </DialogHeader>
                        <VerIniciativaDetalle iniciativa={selectedIniciativa} actividades={actividades} gruposCelula={gruposCelula} proyectos={proyectos} onDataChange={onDataChange} />
                    </DialogContent>
                </Dialog>
            )}
        </>
    )
}
