import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import AuthPage from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Finance from "./pages/Finance";
import CRM from "./pages/CRM";
import Packages from "./pages/Packages";
import Operacional from "./pages/Operacional";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import Vendas from "./pages/Vendas";
import { supabase } from "@/integrations/supabase/client";
import React, { useEffect, useState } from "react";

// Auth guard for Supabase sessions
const AuthGuard = ({ children }: { children: JSX.Element }) => {
  const [loading, setLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setIsAuthenticated(!!session);
      setLoading(false);
    });
    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redireciona raiz e /login para o dashboard, sem AuthGuard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          {/* Rotas principais */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Atualizando de Operacional para Vendas */}
          <Route path="/vendas" element={<Vendas />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/packages" element={<Packages />} />
          {/* <Route path="/vendas" element={<Vendas />} /> removido */}
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
