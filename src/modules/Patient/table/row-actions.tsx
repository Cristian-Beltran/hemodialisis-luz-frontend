import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pen,
  RefreshCwIcon,
  View,
  XCircle,
} from "lucide-react";
import type { Patient } from "../patient.interface";
import { userPatientStore } from "../data/patient.store";
import { useNavigate } from "react-router-dom";

interface Props {
  item: Patient;
  onEditUser: (user: Patient) => void;
}

export const PatientRowActions = ({ item, onEditUser }: Props) => {
  const { changeStatus, remove } = userPatientStore();
  const navigate = useNavigate();

  const handleUpdate = () => {
    onEditUser(item); // Abre el modal de edición
  };

  const handleHistory = () => {
    navigate("/session/" + item.id);
  };

  const handleDelete = () => {
    remove(item.user.id);
  };

  const handleStatus = () => {
    const status = item.user.status;
    changeStatus(item.user.id, status === "ACTIVE" ? "INACTIVE" : "ACTIVE");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDelete}>
            <XCircle /> Eliminar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleStatus}>
            <RefreshCwIcon /> Cambiar estado
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleUpdate}>
            <Pen /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleHistory}>
            <View /> Ver historial
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
