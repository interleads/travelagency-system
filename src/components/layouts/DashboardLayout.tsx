
import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, CreditCard, Briefcase, 
  Menu, X, Settings, Plane, Package, LogOut, Users
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut, isAdmin } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActiveRoute = (path: string) => location.pathname === path;

  // Define navigation items based on user role
  const allNavigationItems = [
    { 
      path: "/dashboard", 
      icon: Home, 
      label: "Dashboard", 
      roles: ['administrador', 'vendedor'] 
    },
    { 
      path: "/vendas", 
      icon: Plane, 
      label: "Vendas", 
      roles: ['administrador', 'vendedor'] 
    },
    { 
      path: "/crm", 
      icon: Users, 
      label: "CRM", 
      roles: ['administrador', 'vendedor'] 
    },
    { 
      path: "/packages", 
      icon: Briefcase, 
      label: "Pacotes", 
      roles: ['administrador', 'vendedor'] 
    },
    { 
      path: "/miles", 
      icon: Package, 
      label: "Gestão de Milhas", 
      roles: ['administrador'] 
    },
    { 
      path: "/finance", 
      icon: CreditCard, 
      label: "Financeiro", 
      roles: ['administrador'] 
    },
    { 
      path: "/suppliers", 
      icon: Briefcase, 
      label: "Fornecedores", 
      roles: ['administrador'] 
    },
  ];

  // Filter navigation items based on user role
  const navigationItems = allNavigationItems.filter(item => 
    profile && item.roles.includes(profile.role)
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-sky-900 text-white transition-all duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-4 flex justify-between items-center border-b border-sky-800">
          {isSidebarOpen && (
            <div>
              <h1 className="text-xl font-bold">Connect Voos</h1>
              {profile && (
                <div className="mt-2">
                  <p className="text-sm text-sky-200">{profile.full_name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {profile.role === 'administrador' ? 'Administrador' : 'Vendedor'}
                  </Badge>
                </div>
              )}
            </div>
          )}
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
        {/* Configurações (apenas para administradores) */}
        {isAdmin && (
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
        )}
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut size={16} />
            Sair
          </Button>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
