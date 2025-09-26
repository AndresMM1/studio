
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
import { Eye, ChevronsUpDown } from "lucide-react";
import type { ActividadDefinicion } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VerActividadDetalle from './ver-actividad-detalle';
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"

const impactoColors: { [key: string]: string } = {
    "Alto": "bg-red-100 text-red-800",
    "Medio": "bg-yellow-100 text-yellow-800",
    "Bajo": "bg-green-100 text-green-800",
}

const impactoOptions = ["Bajo", "Medio", "Alto"];

const mapImpactoToLabel = (value: number | string): "Bajo" | "Medio" | "Alto" => {
    const numValue = Number(value);
    if (numValue >= 7) return "Alto";
    if (numValue >= 4) return "Medio";
    return "Bajo";
};


const grupoCelulaMap: { [key: number]: string } = {
    1: "Chapter de Datos",
    2: "Chapter de Frontend",
    3: "Célula de Pagos"
};

interface ActividadesTableProps {
    actividades: ActividadDefinicion[];
    isLoading: boolean;
}

export default function ActividadesTable({ actividades, isLoading }: ActividadesTableProps) {
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [selectedActividad, setSelectedActividad] = useState<ActividadDefinicion | null>(null);
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const handleViewDetails = (actividad: ActividadDefinicion) => {
        setSelectedActividad(actividad);
        setIsViewDialogOpen(true);
    }
    
    const columns: ColumnDef<ActividadDefinicion>[] = [
        {
            accessorKey: "id_actividad",
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }) => <div className="font-medium">{row.getValue("id_actividad")}</div>,
        },
        {
            accessorKey: "actividad_detalle",
            header: "Actividad",
            cell: ({ row }) => <div className="max-w-xs truncate">{row.getValue("actividad_detalle")}</div>,
        },
        {
            accessorKey: "id_grupo_celula",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Grupo Célula" />,
            cell: ({ row }) => <div>{grupoCelulaMap[row.getValue("id_grupo_celula") as number] || 'N/A'}</div>,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: "impacto_operacion",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Impacto Operación" />,
            cell: ({ row }) => {
                const impactoLabel = mapImpactoToLabel(row.getValue("impacto_operacion"));
                return <Badge className={impactoColors[impactoLabel]}>{impactoLabel}</Badge>
            },
            filterFn: (row, id, value) => {
                const impactoLabel = mapImpactoToLabel(row.getValue("impacto_operacion"));
                return value.includes(impactoLabel);
            },
        },
        {
            accessorKey: "impacto_negocio",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Impacto Negocio" />,
            cell: ({ row }) => {
                const impactoLabel = mapImpactoToLabel(row.getValue("impacto_negocio"));
                return <Badge className={impactoColors[impactoLabel]}>{impactoLabel}</Badge>
            }
        },
        {
            accessorKey: "automatizable",
            header: "Automatizable",
            cell: ({ row }) => <div>{row.getValue("automatizable") ? "Sí" : "No"}</div>
        },
        {
            id: "actions",
            cell: ({ row }) => (
              <Button variant="outline" size="sm" onClick={() => handleViewDetails(row.original)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalles
              </Button>
            ),
        }
    ]

    const table = useReactTable({
        data: actividades,
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
    
    const grupoCelulaOptions = Object.entries(grupoCelulaMap).map(([id, label]) => ({
        value: Number(id),
        label,
    }));

    return (
        <>
        <div className="space-y-4">
            <div className="flex items-center justify-end">
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          Filtrar Grupo
                          <ChevronsUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {grupoCelulaOptions.map((option) => (
                          <DropdownMenuCheckboxItem
                            key={option.value}
                            checked={(table.getColumn("id_grupo_celula")?.getFilterValue() as number[] | undefined)?.includes(option.value)}
                            onCheckedChange={(checked) => {
                              const currentFilter = (table.getColumn("id_grupo_celula")?.getFilterValue() as number[] | undefined) || [];
                              const newFilter = checked
                                ? [...currentFilter, option.value]
                                : currentFilter.filter((v) => v !== option.value);
                              table.getColumn("id_grupo_celula")?.setFilterValue(newFilter.length ? newFilter : undefined);
                            }}
                          >
                            {option.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                         <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => table.getColumn("id_grupo_celula")?.setFilterValue(undefined)}>
                            Limpiar Filtro
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          Filtrar Impacto Op.
                          <ChevronsUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {impactoOptions.map((option) => (
                          <DropdownMenuCheckboxItem
                            key={option}
                            checked={(table.getColumn("impacto_operacion")?.getFilterValue() as string[] | undefined)?.includes(option)}
                            onCheckedChange={(checked) => {
                              const currentFilter = (table.getColumn("impacto_operacion")?.getFilterValue() as string[] | undefined) || [];
                              const newFilter = checked
                                ? [...currentFilter, option]
                                : currentFilter.filter((v) => v !== option);
                              table.getColumn("impacto_operacion")?.setFilterValue(newFilter.length ? newFilter : undefined);
                            }}
                          >
                            {option}
                          </DropdownMenuCheckboxItem>
                        ))}
                         <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => table.getColumn("impacto_operacion")?.setFilterValue(undefined)}>
                            Limpiar Filtro
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
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
            {selectedActividad && (
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Detalles de la Actividad</DialogTitle>
                            <DialogDescription>
                                Información completa de la actividad TOIL registrada.
                            </DialogDescription>
                        </DialogHeader>
                        <VerActividadDetalle actividad={selectedActividad} />
                    </DialogContent>
                </Dialog>
            )}
        </>
    )
}

    