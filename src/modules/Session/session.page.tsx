// src/pages/sessions/SessionPage.tsx
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { RotateCcw } from "lucide-react";

import { DashboardHeader } from "@/components/headerPage";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { sessionStore } from "./data/session.store";
import { SessionsTable } from "./components/session-table";
import { SessionCharts } from "./components/session-charts"; // ojo: charts (no chars)

export default function SessionPage() {
  const { id: patientId } = useParams<{ id: string }>();

  const {
    isLoading, // boolean
    error, // string | null
    fetchByPatient, // (patientId: string) => Promise<void>
  } = sessionStore();

  useEffect(() => {
    if (patientId) fetchByPatient(patientId);
  }, [patientId, fetchByPatient]);

  const onReload = () => {
    if (patientId) fetchByPatient(patientId);
  };

  return (
    <>
      <div className="space-y-6">
        <DashboardHeader
          title="Sesiones del paciente"
          description="Registro de sesiones y métricas clínicas"
          actions={
            <Button
              size="icon"
              variant="outline"
              onClick={onReload}
              title="Recargar"
              disabled={isLoading}
            >
              <RotateCcw />
            </Button>
          }
        />
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        )}

        <Tabs defaultValue="charts" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="charts">Gráficas</TabsTrigger>
            <TabsTrigger value="table">Tabla de datos</TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-4">
            <SessionCharts />
          </TabsContent>

          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>Datos detallados de sesiones</CardTitle>
                <CardDescription>
                  Todas las sesiones y registros del paciente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SessionsTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
