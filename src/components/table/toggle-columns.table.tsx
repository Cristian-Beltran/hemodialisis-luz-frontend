import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { HeaderContext, Table } from "@tanstack/react-table";
import { Eye } from "lucide-react";

interface Props<TData> {
  table: Table<TData>;
}

export function DataTableColumnToggle<TData>({ table }: Props<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Eye className="mr-2 h-4 w-4" /> {"Columnas"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {table
          .getAllColumns()
          .filter((col) => col.getCanHide())
          .map((column) => {
            const header = column.columnDef.header;

            let label: string;

            if (typeof header === "function") {
              try {
                const partialContext = {} as Partial<
                  HeaderContext<TData, unknown>
                >;
                const result = header(
                  partialContext as HeaderContext<TData, unknown>,
                );
                label = String(result);
              } catch {
                label = column.id;
              }
            } else if (header) {
              label = String(header);
            } else {
              label = column.id;
            }

            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {label}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
