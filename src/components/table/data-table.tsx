import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type SortingState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Ban,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Fragment, useState } from "react";
import DataTableSkeleton from "./skeleton.table";
import { DataTableToolbar } from "./toolbar.table";

export interface DataTableProps<TData> {
  isLoading?: boolean;
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  toolbarContent?: React.ReactNode;
  rowActions?: (row: TData) => React.ReactNode;
  expandable?: (row: TData) => React.ReactNode;
  getRowId?: (originalRow: TData, index: number) => string;
  manualPagination?: boolean;
  pageIndex?: number;
  pageSize?: number;
  total?: number;
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  renderRowChildren?: (row: Row<TData>) => React.ReactNode;
  manualSorting?: boolean;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;

  /** --- NUEVOS KNOBS DE ESTILO (opcionales) --- */
  stickyHeader?: boolean; // default: true
  zebra?: boolean; // default: true
  dense?: boolean; // default: true
  card?: boolean; // default: true (card container con sombra)
  maxHeight?: number; // px; activa scroll interno si se define
}

export function DataTable<TData>({
  isLoading,
  columns,
  data,
  toolbarContent,
  expandable,
  rowActions,
  getRowId,
  manualPagination,
  pageIndex,
  pageSize,
  total,
  onPaginationChange,
  renderRowChildren,
  manualSorting,
  sorting,
  onSortingChange,

  // estilos
  stickyHeader = true,
  zebra = true,
  dense = true,
  card = true,
  maxHeight,
}: DataTableProps<TData>) {
  const [internalPageIndex, setInternalPageIndex] = useState(0);
  const [internalPageSize, setInternalPageSize] = useState(10);
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);

  const actualPageIndex = manualPagination
    ? (pageIndex ?? 0)
    : internalPageIndex;
  const actualPageSize = manualPagination ? (pageSize ?? 10) : internalPageSize;

  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: manualPagination ?? true,
    manualSorting: manualSorting ?? false,
    pageCount: manualPagination
      ? Math.ceil((total ?? 0) / (pageSize ?? 10))
      : undefined,
    state: {
      pagination: { pageIndex: actualPageIndex, pageSize: actualPageSize },
      sorting: manualSorting ? (sorting ?? []) : internalSorting,
    },
    onPaginationChange: manualPagination
      ? (updater) => {
          const next =
            typeof updater === "function"
              ? updater({ pageIndex: pageIndex ?? 0, pageSize: pageSize ?? 10 })
              : updater;
          onPaginationChange?.(next.pageIndex, next.pageSize);
        }
      : (updater) => {
          const next =
            typeof updater === "function"
              ? updater({
                  pageIndex: internalPageIndex,
                  pageSize: internalPageSize,
                })
              : updater;
          setInternalPageIndex(next.pageIndex);
          setInternalPageSize(next.pageSize);
        },
    onSortingChange: manualSorting
      ? (updaterOrValue) => {
          const next =
            typeof updaterOrValue === "function"
              ? updaterOrValue(sorting ?? [])
              : updaterOrValue;
          onSortingChange?.(next);
        }
      : setInternalSorting,
    ...(getRowId && { getRowId }),
  });

  const currentPageIndex = table.getState().pagination.pageIndex;
  const currentPageSize = table.getState().pagination.pageSize;
  const totalPages = table.getPageCount();

  // --- clases de estilo ---
  const cardClass = card
    ? "rounded-2xl border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50 shadow-sm ring-1 ring-border"
    : "";
  const headerCellBase =
    "text-xs font-semibold uppercase tracking-wide text-muted-foreground";
  const headerSticky = stickyHeader
    ? "sticky top-0 z-10 bg-gradient-to-b from-muted/70 to-muted/20 backdrop-blur"
    : "";
  const bodyCellBase = dense ? "py-2.5" : "py-4";
  const rowHover = "hover:bg-muted/40 transition-colors";
  const zebraClass = zebra ? "odd:bg-background even:bg-muted/20" : "";

  const tableWrapperClass = maxHeight
    ? "overflow-auto custom-scrollbar"
    : "overflow-hidden";

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} extraContent={toolbarContent} />

      {isLoading ? (
        <DataTableSkeleton columns={6} rows={8} />
      ) : (
        <>
          <div className={cardClass}>
            <div
              className={tableWrapperClass}
              style={maxHeight ? { maxHeight } : undefined}
            >
              <Table className="border-separate border-spacing-0 w-full">
                <TableHeader
                  className={`[&_tr]:border-0 ${headerSticky} ${stickyHeader ? "shadow-[inset_0_-1px_0_0_var(--border)]" : ""}`}
                >
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-0">
                      {expandable && (
                        <TableHead
                          className={`${headerCellBase} ${stickyHeader ? "bg-transparent" : ""} first:rounded-tl-2xl`}
                        />
                      )}
                      {headerGroup.headers.map((header, idx) => (
                        <TableHead
                          key={header.id}
                          className={`${headerCellBase} ${idx === headerGroup.headers.length - 1 && !rowActions ? "last:rounded-tr-2xl" : ""}`}
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              className={
                                header.column.getCanSort()
                                  ? "flex items-center gap-2 cursor-pointer select-none px-2 py-2 rounded-md hover:bg-muted/60"
                                  : "flex items-center gap-2 px-2 py-2"
                              }
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <span>
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                              </span>
                              {header.column.getCanSort() && (
                                <span className="ml-1 inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium">
                                  {header.column.getIsSorted() === "asc" ? (
                                    <span className="inline-flex items-center gap-1">
                                      ASC <ArrowUp className="h-3 w-3" />
                                    </span>
                                  ) : header.column.getIsSorted() === "desc" ? (
                                    <span className="inline-flex items-center gap-1">
                                      DESC <ArrowDown className="h-3 w-3" />
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 opacity-70">
                                      SORT <ArrowUpDown className="h-3 w-3" />
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                        </TableHead>
                      ))}
                      {rowActions && (
                        <TableHead
                          className={`${headerCellBase} last:rounded-tr-2xl`}
                        >
                          Acciones
                        </TableHead>
                      )}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => {
                      const mainRow = (
                        <TableRow
                          key={row.id}
                          className={`border-0 ${rowHover} ${zebraClass}`}
                        >
                          {expandable && (
                            <TableCell
                              className={`${bodyCellBase} w-24 pr-0 text-center align-middle`}
                            >
                              {expandable(row.original)}
                            </TableCell>
                          )}

                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className={`${bodyCellBase} align-middle`}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}

                          {rowActions && (
                            <TableCell
                              className={`${bodyCellBase} align-middle`}
                            >
                              {rowActions(row.original)}
                            </TableCell>
                          )}
                        </TableRow>
                      );

                      const childRow = renderRowChildren?.(row);

                      return (
                        <Fragment key={row.id}>
                          {mainRow}
                          {childRow && (
                            <TableRow className="border-0">
                              <TableCell
                                colSpan={
                                  columns.length +
                                  (expandable ? 1 : 0) +
                                  (rowActions ? 1 : 0)
                                }
                                className="bg-muted/30 py-3"
                              >
                                {childRow}
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })
                  ) : (
                    <TableRow className="border-0">
                      <TableCell
                        colSpan={
                          table.getAllColumns().length +
                          (rowActions ? 1 : 0) +
                          (expandable ? 1 : 0)
                        }
                        className="py-16 text-center"
                      >
                        <div className="mx-auto max-w-sm space-y-2 text-muted-foreground">
                          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border">
                            <Ban className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-medium">Sin resultados</p>
                          <p className="text-xs">
                            Ajusta filtros o crea un registro nuevo.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Footer / Paginación */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs">
              <span className="opacity-70">Página</span>
              <span className="font-semibold">{currentPageIndex + 1}</span>
              <span className="opacity-70">de</span>
              <span className="font-semibold">{totalPages || 1}</span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Items</p>
                <Select
                  value={`${currentPageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="h-8 w-[88px] rounded-full">
                    <SelectValue placeholder={currentPageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 50, 100].map((size) => (
                      <SelectItem key={size} value={`${size}`}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex rounded-full"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Primera página</span>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex rounded-full"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Última página</span>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* SUGERENCIA: añade este CSS utilitario a tu tailwind para scroll minimalista:
.custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
.custom-scrollbar::-webkit-scrollbar-thumb { border-radius: 9999px; background: hsl(var(--muted-foreground) / 0.35); }
.custom-scrollbar:hover::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground) / 0.55); }
*/
