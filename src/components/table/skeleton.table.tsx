import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface DataTableSkeletonProps {
    columns?: number;
    rows?: number;
}

const DataTableSkeleton: React.FC<DataTableSkeletonProps> = ({
    columns = 5,
    rows = 5,
}) => {
    return (
        <div className="w-full border rounded-md shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-12 bg-muted text-muted-foreground px-4 py-2 font-semibold text-sm border-b">
                {Array.from({ length: columns }).map((_, index) => (
                    <div
                        key={index}
                        className={`col-span-2 sm:col-span-${12 / columns} px-2 py-1`}
                    >
                        <Skeleton className="h-4 w-24" />
                    </div>
                ))}
            </div>

            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="grid grid-cols-1 sm:grid-cols-12 px-4 py-2 border-b"
                >
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <div
                            key={colIndex}
                            className={`col-span-2 sm:col-span-${12 / columns} px-2 py-1`}
                        >
                            <Skeleton className="h-4 w-full" />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default DataTableSkeleton;
