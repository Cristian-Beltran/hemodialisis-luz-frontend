import { useEffect, useState, type ReactNode } from "react";
import { ThemeContext, type Theme } from "@/contexts/ThemeContext";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("medicalTheme") as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("medicalTheme", theme);
  }, [theme]);

  const value = {
    theme,
    toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
