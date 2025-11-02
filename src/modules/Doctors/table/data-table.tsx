import { DataTable } from "@/components/table/data-table";
import { columns } from "./columns";
import { useEffect } from "react";
import type { Doctor } from "../doctor.interface";
import { userDoctorStore } from "../data/doctor.store";
import { DoctorRowActions } from "./row-actions";
import DoctorFilter from "./filters";

interface Props {
  onEdit: (doctor: Doctor) => void;
}
export default function TableDoctor({ onEdit }: Props) {
  const { fetchFull, filteredData, isLoading } = userDoctorStore();
  useEffect(() => {
    fetchFull();
  }, [fetchFull]);
  return (
    <DataTable
      columns={[
        ...columns,
        {
          accessorKey: "actions",
          header: "Opciones",
          enableSorting: false,
          enableColumnFilter: false,
          cell: ({ row }) => (
            <DoctorRowActions item={row.original} onEditUser={onEdit} />
          ),
        },
      ]}
      manualPagination={false}
      data={filteredData}
      isLoading={isLoading}
      toolbarContent={<DoctorFilter />}
    />
  );
}
