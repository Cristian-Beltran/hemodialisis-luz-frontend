import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./App.css";
import { router } from "./app.router";
import { ThemeProvider } from "./providers/ThemeProvider";
import { Toaster } from "./components/ui/sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
    <Toaster />
  </StrictMode>,
);
