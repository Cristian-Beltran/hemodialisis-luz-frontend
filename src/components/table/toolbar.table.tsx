import type { Table } from "@tanstack/react-table";
import { DataTableColumnToggle } from "./toggle-columns.table";
interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    extraContent?: React.ReactNode;
}

export function DataTableToolbar<TData>({
    extraContent,
    table,
}: DataTableToolbarProps<TData>) {
    return (
        <div className="flex items-center justify-between">
            {extraContent}
            <DataTableColumnToggle table={table} />
        </div>
    );
}
