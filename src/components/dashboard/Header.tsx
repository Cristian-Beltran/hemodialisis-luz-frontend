import React from "react";
import { Droplet, Menu, HeartPulse, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/auth/useAuth";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuthStore();

  const initials = React.useMemo(() => {
    const name = user?.fullname ?? "Usuario";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }, [user?.fullname]);

  return (
    <header className="sticky top-0 z-30 shadow-sm">
      {/* Banda superior sutil (diferente al header anterior) */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-primary/60" />

      {/* Contenido principal con layout centrado */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
          <div className="grid grid-cols-3 items-center">
            {/* Izquierda: botón menú (mobile) */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            {/* Centro: branding (totalmente distinto) */}
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg grid place-items-center bg-primary/10 text-primary">
                  <Droplet className="h-4 w-4" />
                </div>
                <h1 className="text-base sm:text-lg font-semibold tracking-tight">
                  HemoSense · Multisensor No Invasivo
                </h1>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Monitoreo integral de parámetros sanguíneos (SpO₂, Hb estimada,
                FC, PI, variabilidad)
              </p>
            </div>

            {/* Derecha: usuario compacto */}
            <div className="flex items-center justify-end gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="h-9 w-9 rounded-md bg-primary text-primary-foreground grid place-items-center">
                  <span className="text-sm font-semibold">{initials}</span>
                </div>
                <div className="leading-tight hidden md:block">
                  <p className="text-sm font-medium">
                    {user?.fullname ?? "Usuario"}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Sesión segura
                  </span>
                </div>
              </div>
              <div className="hidden md:inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                <HeartPulse className="h-3.5 w-3.5" />
                Live
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
