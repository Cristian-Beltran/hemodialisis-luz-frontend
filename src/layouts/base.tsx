import type React from "react";
import type { ReactNode } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BaseLayoutProps {
  children: ReactNode;
  showThemeToggle?: boolean;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  showThemeToggle = true,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showThemeToggle && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="bg-card border-border hover:bg-accent"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className="sr-only">Cambiar tema</span>
          </Button>
        </div>
      )}
      <main className="relative">{children}</main>
    </div>
  );
};

export default BaseLayout;
