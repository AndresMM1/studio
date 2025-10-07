"use client"

import { useState } from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type SortingState,
    getFilteredRowModel,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ActividadMedicion, ActividadDefinicion } from '@/lib/toil/types';
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';

interface MedicionesTableProps {
    mediciones: ActividadMedicion[];
    actividades: ActividadDefinicion[];
    isLoading: boolean;
}

const tipoMedicionColors: { [key: string]: string } = {
    "Real": "bg-blue-100 text-blue-800",
    "Proyectada": "bg-purple-100 text-purple-800",
}

export default function MedicionesTable({ mediciones, actividades, isLoading }: MedicionesTableProps) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = useState('');

     const formatDate = (dateString: string) => {
        if (!dateString || isNaN(new Date(dateString).getTime())) return "N/A";
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    const actividadMap = new Map(actividades.map(act => [act.id_actividad, act.actividad_detalle]));

    const columns: ColumnDef<ActividadMedicion>[] = [
        {
            accessorKey: "id_medicion",
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID Medición" />,
        },
        {
            accessorKey: "id_actividad",
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID Actividad" />,
            cell: ({ row }) => {
                const idActividad = row.getValue("id_actividad") as number;
                const descripcion = actividadMap.get(idActividad) || "Descripción no encontrada";
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="cursor-help">
                                <span className="underline decoration-dotted">{idActividad}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs">{descripcion}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            }
        },
        {
            accessorKey: "Tipo Medicion",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />,
            cell: ({ row }) => <Badge className={tipoMedicionColors[row.getValue("Tipo Medicion")]}>{row.getValue("Tipo Medicion")}</Badge>
        },
        {
            accessorKey: "Fecha Medicion",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha" />,
            cell: ({ row }) => formatDate(row.getValue("Fecha Medicion")),
        },
        {
            accessorKey: "Señority Tecnico",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Seniority Técnico" />,
        },
        {
            accessorKey: "Señority Operativo",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Seniority Operativo" />,
        },
        {
            accessorKey: "Tiempo Minutos",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tiempo (Min)" />,
        },
        {
            accessorKey: "Involucrados",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Involucrados" />,
        },
         {
            accessorKey: "Cantidad x Mes",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Cantidad/Mes" />,
        },
        {
            accessorKey: "Tiempo Hrs x Mes",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Hrs/Mes" />,
             cell: ({ row }) => (row.getValue("Tiempo Hrs x Mes") as number).toFixed(2),
        },
    ]

    const table = useReactTable({
        data: mediciones,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: (row, columnId, filterValue) => {
            const search = filterValue.toLowerCase();
            const idActividad = row.getValue('id_actividad') as number;
            const descripcion = actividadMap.get(idActividad)?.toLowerCase() || '';

            return idActividad.toString().includes(search) || descripcion.includes(search);
        }
    })

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-24 w-24 animate-spin text-primary opacity-50" />
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Input
                    placeholder="Filtrar por ID o descripción de actividad..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
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
    )
}
