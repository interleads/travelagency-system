
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Finance from "./pages/Finance";
import CRM from "./pages/CRM";
import Packages from "./pages/Packages";
import POS from "./pages/POS";
import Operacional from "./pages/Operacional";
import Configuracoes from "./pages/Configuracoes";
import Relatorios from "./pages/Relatorios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Auth guard component
const AuthGuard = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = localStorage.getItem("user") ? 
    JSON.parse(localStorage.getItem("user") as string).isAuthenticated : false;
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/operacional" element={<AuthGuard><Operacional /></AuthGuard>} />
          <Route path="/finance" element={<AuthGuard><Finance /></AuthGuard>} />
          <Route path="/crm" element={<AuthGuard><CRM /></AuthGuard>} />
          <Route path="/packages" element={<AuthGuard><Packages /></AuthGuard>} />
          <Route path="/pos" element={<AuthGuard><POS /></AuthGuard>} />
          <Route path="/relatorios" element={<AuthGuard><Relatorios /></AuthGuard>} />
          <Route path="/configuracoes" element={<AuthGuard><Configuracoes /></AuthGuard>} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
