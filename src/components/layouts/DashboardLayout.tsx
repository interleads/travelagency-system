
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, CreditCard, Briefcase, 
  Menu, X, Settings, Plane, Package, LogOut
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Close sidebar when clicking on a link in mobile
  const handleNavClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const isActiveRoute = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/vendas", icon: Plane, label: "Vendas" },
    { path: "/milhas", icon: Package, label: "Gestão de Milhas" },
    { path: "/finance", icon: CreditCard, label: "Financeiro" },
    { path: "/packages", icon: Briefcase, label: "Pacotes" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Mobile Overlay/Backdrop */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          ${isMobile ? 'fixed' : 'relative'} 
          ${isSidebarOpen ? 'w-64' : 'w-20'} 
          ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          ${isMobile ? 'z-50' : 'z-auto'}
          bg-sky-900 text-white transition-all duration-300 ease-in-out flex flex-col h-full
        `}
      >
        <div className="p-4 flex justify-between items-center">
          {isSidebarOpen && (
            <h1 className={`text-xl font-bold ${isMobile ? 'text-lg' : ''}`}>
              {isMobile ? 'Agência' : 'Agência Viagens'}
            </h1>
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
                    onClick={handleNavClick}
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
        
        {/* Configurações e Sair no Rodapé */}
        <div className="p-4 mt-auto border-t border-sky-800">
          <div className="flex flex-col gap-2">
            <Link
              to="/configuracoes"
              onClick={handleNavClick}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActiveRoute("/configuracoes")
                  ? "bg-sky-700 text-white"
                  : "text-white hover:bg-sky-800"
              }`}
            >
              <Settings size={20} />
              {isSidebarOpen && <span className="ml-3">Configurações</span>}
            </Link>
            <Button 
              variant="ghost" 
              size={isSidebarOpen ? "default" : "icon"}
              onClick={handleLogout}
              className="text-white hover:bg-sky-800 rounded-lg transition-colors justify-start"
            >
              <LogOut size={20} />
              {isSidebarOpen && <span className="ml-3">Sair</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 overflow-auto flex flex-col ${isMobile ? 'w-full' : ''}`}>
        {/* Mobile Header with Menu Button */}
        <header className={`bg-white border-b border-gray-200 ${isMobile ? 'px-4 py-3' : 'px-6 py-2'} flex items-center justify-between`}>
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleSidebar}
              className="text-sky-900 hover:bg-sky-50 lg:hidden"
            >
              <Menu size={20} />
            </Button>
          )}
          
          {isMobile && (
            <h1 className="text-lg font-semibold text-sky-900">
              {navigationItems.find(item => isActiveRoute(item.path))?.label || 'Dashboard'}
            </h1>
          )}
          
          <div className="flex-1" />
        </header>
        
        <main className={`flex-1 ${isMobile ? 'p-4' : 'p-6'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
