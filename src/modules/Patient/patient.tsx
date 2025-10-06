import { DashboardHeader } from "@/components/headerPage";
import TablePatient from "./table/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, RotateCcw } from "lucide-react";
import { userPatientStore } from "./data/patient.store";
import type { Patient } from "./patient.interface";
import { useState } from "react";
import PatientFormModal from "./modal-form";

export default function PatientPage() {
  const [selectedUser, setSelectedUser] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { fetchFull } = userPatientStore();

  const openForCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const openForEdit = (user: Patient) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  return (
    <>
      <div className="space-y-6">
        <DashboardHeader
          title="Pacientes"
          description="Lista de pacientes"
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
        <TablePatient onEdit={openForEdit} />
      </div>

      <PatientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
      />
    </>
  );
}
