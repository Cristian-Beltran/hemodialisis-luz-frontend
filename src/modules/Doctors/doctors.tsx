import { DashboardHeader } from "@/components/headerPage";
import TableDoctor from "./table/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, RotateCcw } from "lucide-react";
import { userDoctorStore } from "./data/doctor.store";
import type { Doctor } from "./doctor.interface";
import { useState } from "react";
import DoctorFormModal from "./modal-form";

export default function DoctorPage() {
  const [selectedUser, setSelectedUser] = useState<Doctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { fetchFull } = userDoctorStore();

  const openForCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const openForEdit = (user: Doctor) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  return (
    <>
      <div className="space-y-6">
        <DashboardHeader
          title="Doctores"
          description="Lista de doctores"
          actions={
            <>
              <Button onClick={openForCreate}>
                <PlusCircle />
                Crear
              </Button>
              <Button
                size={"icon"}
                variant="outline"
                onClick={fetchFull}
                title="Recargar"
              >
                <RotateCcw />
              </Button>
            </>
          }
        ></DashboardHeader>
      </div>

      <div className="p-6 space-y-6">
        <TableDoctor onEdit={openForEdit} />
      </div>

      <DoctorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
      />
    </>
  );
}
