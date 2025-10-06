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
  expandable?: (row: TData) => React.ReactNode; // ✅ NUEVO
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
      pagination: {
        pageIndex: actualPageIndex,
        pageSize: actualPageSize,
      },
      sorting: manualSorting ? (sorting ?? []) : internalSorting,
    },

    onPaginationChange: manualPagination
      ? (updater) => {
          const next =
            typeof updater === "function"
              ? updater({
                  pageIndex: pageIndex ?? 0,
                  pageSize: pageSize ?? 10,
                })
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

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} extraContent={toolbarContent} />
      {isLoading ? (
        <DataTableSkeleton columns={6} rows={8} />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {expandable && <TableHead />}
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              header.column.getCanSort()
                                ? "flex items-center space-x-2 cursor-pointer select-none hover:bg-muted/50 rounded p-1 -m-1"
                                : "flex items-center space-x-2"
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
                              <span className="ml-2">
                                {header.column.getIsSorted() === "asc" ? (
                                  <ArrowUp className="h-4 w-4" />
                                ) : header.column.getIsSorted() === "desc" ? (
                                  <ArrowDown className="h-4 w-4" />
                                ) : (
                                  <ArrowUpDown className="h-4 w-4 opacity-50" />
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </TableHead>
                    ))}
                    {rowActions && <TableHead>acciones</TableHead>}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    const mainRow = (
                      <TableRow key={row.id}>
                        {expandable && (
                          <TableCell className="w-24 py-4 pr-0 text-center">
                            {expandable(row.original)}
                          </TableCell>
                        )}
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                        {rowActions && (
                          <TableCell>{rowActions(row.original)}</TableCell>
                        )}
                      </TableRow>
                    );

                    const childRow = renderRowChildren?.(row);

                    return (
                      <Fragment key={row.id}>
                        {mainRow}
                        {childRow && (
                          <TableRow>
                            <TableCell
                              colSpan={columns.length + (expandable ? 1 : 0)}
                              className="bg-muted/50"
                            >
                              {childRow}
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={
                        table.getAllColumns().length + (rowActions ? 1 : 0)
                      }
                      className="h-24 text-center"
                    >
                      <div className="w-full py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                        <Ban className="w-10 h-10 mb-2 text-muted" />
                        <p className="text-sm">{"Sin datos"}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-y-2 flex-wrap gap-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">{"Items"}</p>
                <Select
                  value={`${currentPageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="h-8 w-[80px]">
                    <SelectValue placeholder={pageSize} />
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

              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                {"Pagina" + (currentPageIndex + 1) + " de" + totalPages}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Ir a la primera página</span>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Ir a la página anterior</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Ir a la página siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Ir a la última página</span>
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
