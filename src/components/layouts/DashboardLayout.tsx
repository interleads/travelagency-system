
import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, CreditCard, Users, Briefcase, 
  Menu, X, BarChart2, Settings,
  Plane, FileText, Building2
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const userEmail = "Usuário de Desenvolvimento";

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const isActiveRoute = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/vendas", icon: Plane, label: "Vendas" }, // Alterado Operacional para Vendas
    { path: "/finance", icon: CreditCard, label: "Financeiro" },
    { path: "/crm", icon: Users, label: "CRM" },
    { path: "/packages", icon: Briefcase, label: "Pacotes" },
    { path: "/fornecedores", icon: Building2, label: "Fornecedores" },
    // Retirado Vendas do menu lateral, pois agora está em uma tab de Vendas
    // { path: "/vendas", icon: BarChart2, label: "Vendas" },
    // { path: "/relatorios", icon: FileText, label: "Relatórios" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-sky-900 text-white transition-all duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-4 flex justify-between items-center">
          {isSidebarOpen && <h1 className="text-xl font-bold">Agência Viagens</h1>}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="text-white hover:bg-sky-800"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
        
        <nav className="flex-1 pt-5">
          <ul className="space-y-2 px-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isActiveRoute(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-sky-700 text-white' 
                        : 'text-white hover:bg-sky-800'
                    }`}
                  >
                    <IconComponent size={20} />
                    {isSidebarOpen && <span className="ml-3">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {/* Configurações Fixa no Rodapé */}
        <div className="p-4 mt-auto border-t border-sky-800">
          <Link
            to="/configuracoes"
            className={`flex items-center p-3 rounded-lg transition-colors ${
              isActiveRoute("/configuracoes")
                ? "bg-sky-700 text-white"
                : "text-white hover:bg-sky-800"
            }`}
          >
            <Settings size={20} />
            {isSidebarOpen && <span className="ml-3">Configurações</span>}
          </Link>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Sistema de Gestão</h1>
            <div className="text-sm text-gray-600">{userEmail}</div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
