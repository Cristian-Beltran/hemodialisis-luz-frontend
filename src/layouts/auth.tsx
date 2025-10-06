import type React from "react";
import type { ReactNode } from "react";
import BaseLayout from "./base";
import { Activity, Shield } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <BaseLayout>
      <div className="min-h-screen flex">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/90" />
          <div className="relative z-10 flex flex-col justify-center items-center p-12 text-primary-foreground">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-primary-foreground/10 rounded-xl">
                <Activity className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-bold">MedDistrib</h1>
            </div>

            <div className="text-center max-w-md">
              <h2 className="text-2xl font-semibold mb-4 text-balance">
                Sistema de Distribución Médica
              </h2>
              <p className="text-primary-foreground/80 leading-relaxed">
                Plataforma profesional para la gestión eficiente de productos
                médicos y farmacéuticos
              </p>
            </div>

            <div className="mt-12 flex items-center gap-4 text-primary-foreground/60">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Seguro y confiable</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground">
                MedDistrib
              </span>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground text-balance">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-2 text-muted-foreground text-pretty">
                  {subtitle}
                </p>
              )}
            </div>

            {children}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default AuthLayout;
