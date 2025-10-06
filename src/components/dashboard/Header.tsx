import type React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/auth/useAuth";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuthStore();

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-card-foreground">
              Bienvenido, {user?.fullname}
            </h1>
            <p className="text-sm text-muted-foreground">
              Sistema de Distribución Médica
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 ml-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {user?.fullname?.charAt(0) || "U"}
              </span>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-card-foreground">
                {user?.fullname}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
