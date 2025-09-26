import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Finance from "./pages/Finance";
import CRM from "./pages/CRM";
import Packages from "./pages/Packages";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import Vendas from "./pages/Vendas";
import MilesManagement from "./pages/MilesManagement";
import Fornecedores from "./pages/Fornecedores";
import DashboardLayout from "./components/layouts/DashboardLayout";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardLayout><Dashboard /></DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vendas" 
              element={
                <ProtectedRoute>
                  <DashboardLayout><Vendas /></DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/miles" 
              element={
                <ProtectedRoute adminOnly>
                  <DashboardLayout><MilesManagement /></DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/finance" 
              element={
                <ProtectedRoute adminOnly>
                  <DashboardLayout><Finance /></DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/suppliers" 
              element={
                <ProtectedRoute adminOnly>
                  <DashboardLayout><Fornecedores /></DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/crm" 
              element={
                <ProtectedRoute>
                  <DashboardLayout><CRM /></DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/packages" 
              element={
                <ProtectedRoute>
                  <DashboardLayout><Packages /></DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/configuracoes" 
              element={
                <ProtectedRoute adminOnly>
                  <DashboardLayout><Configuracoes /></DashboardLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect old routes */}
            <Route path="/milhas" element={<Navigate to="/miles" replace />} />
            <Route path="/fornecedores" element={<Navigate to="/suppliers" replace />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
