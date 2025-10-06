import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import type { Patient } from "../patient.interface";

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "user.fullname",
    header: () => "Nombre",
  },
  {
    accessorKey: "user.email",
    header: () => "Correo",
  },
  {
    accessorKey: "user.address",
    header: () => "Dirreción",
  },
  {
    accessorKey: "device.serialNumber",
    header: () => "Dispositivo vinculado",
  },
  {
    accessorKey: "user.createdAt",
    id: "createdAt",
    header: () => "Registrado",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
  },
  {
    accessorKey: "user.status",
    id: "status",
    header: () => "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <Badge variant={status === "ACTIVE" ? "default" : "destructive"}>
          {status === "ACTIVE" ? "Habilitado" : "Deshabilitado"}
        </Badge>
      );
    },
  },
];
