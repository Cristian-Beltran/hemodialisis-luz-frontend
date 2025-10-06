import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/data-table";
import type { DataTableProps } from "@/components/table/data-table";

interface DataTableExpandableProps<TData> extends DataTableProps<TData> {
    renderExpandedContent?: (row: TData) => React.ReactNode;
    getRowKey?: (row: TData) => string | number;
}

export function DataTableExpandable<TData>({
    renderExpandedContent,
    getRowKey = (row: TData) => {
        return (row as { id: string | number }).id;
    },
    ...props
}: DataTableExpandableProps<TData>) {
    const [expanded, setExpanded] = useState<Set<string | number>>(new Set());
    const toggleExpanded = (id: string | number) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <DataTable
            {...props}
            expandable={(row) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleExpanded(getRowKey(row))}
                    >
                        {expanded.has(getRowKey(row)) ? (
                            <ChevronDown className="h-3 w-3" />
                        ) : (
                            <ChevronRight className="h-3 w-3" />
                        )}
                    </Button>
                </div>
            )}
            renderRowChildren={(row) => {
                const id = getRowKey(row.original);
                if (!expanded.has(id)) return null;
                return renderExpandedContent?.(row.original) ?? null;
            }}
        />
    );
}
