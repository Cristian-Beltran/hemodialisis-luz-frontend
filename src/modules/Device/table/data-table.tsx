import { DataTable } from "@/components/table/data-table";
import { columns } from "./columns";
import { useEffect } from "react";
import type { Patient } from "../patient.interface";
import { userPatientStore } from "../data/patient.store";
import { PatientRowActions } from "./row-actions";
import PatientFilter from "./filters";

interface Props {
  onEdit: (patient: Patient) => void;
}
export default function TablePatient({ onEdit }: Props) {
  const { fetchFull, filteredData, isLoading } = userPatientStore();
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
            <PatientRowActions item={row.original} onEditUser={onEdit} />
          ),
        },
      ]}
      manualPagination={false}
      data={filteredData}
      isLoading={isLoading}
      toolbarContent={<PatientFilter />}
    />
  );
}
