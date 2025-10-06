import type React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Activity,
  LogOut,
  X,
  Moon,
  Sun,
  Home,
  Users,
  UsersRound,
  User,
  Microchip,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "../../lib/utils";
import { useAuthStore } from "@/auth/useAuth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Doctores", href: "/doctor", icon: UsersRound },
  { name: "Pacientes", href: "/patients", icon: User },
  { name: "Familiares", href: "/family", icon: Users },
  { name: "Datos en tiempo Real", href: "/monitoring", icon: Wifi },
  { name: "Dispositivos", href: "/devices", icon: Microchip },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-sidebar-primary/10 rounded-lg">
                <Activity className="h-6 w-6 text-sidebar-primary" />
              </div>
              <span className="text-lg font-bold text-sidebar-foreground">
                MedDistrib
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border space-y-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              onClick={toggleTheme}
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              {theme === "light" ? "Modo Oscuro" : "Modo Claro"}
            </Button>

            {/* User Info */}
            {user && (
              <div className="px-3 py-2 bg-sidebar-accent/50 rounded-lg">
                <p className="text-sm font-medium text-sidebar-foreground">
                  {user.fullname}
                </p>
                <p className="text-xs text-sidebar-foreground/60">
                  {
                    //user.email
                  }
                </p>
              </div>
            )}

            {/* Logout */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
