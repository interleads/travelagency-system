
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, CreditCard, Users, Briefcase, 
  LogOut, Menu, X, BarChart2
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Get current user from localStorage
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  
  if (!user?.isAuthenticated) {
    // Redirect to login if not authenticated
    navigate("/login");
    return null;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
            <li>
              <Link
                to="/dashboard"
                className="flex items-center p-3 text-white rounded-lg hover:bg-sky-800"
              >
                <Home size={20} />
                {isSidebarOpen && <span className="ml-3">Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/finance"
                className="flex items-center p-3 text-white rounded-lg hover:bg-sky-800"
              >
                <CreditCard size={20} />
                {isSidebarOpen && <span className="ml-3">Financeiro</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/crm"
                className="flex items-center p-3 text-white rounded-lg hover:bg-sky-800"
              >
                <Users size={20} />
                {isSidebarOpen && <span className="ml-3">CRM</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/packages"
                className="flex items-center p-3 text-white rounded-lg hover:bg-sky-800"
              >
                <Briefcase size={20} />
                {isSidebarOpen && <span className="ml-3">Pacotes</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/pos"
                className="flex items-center p-3 text-white rounded-lg hover:bg-sky-800"
              >
                <BarChart2 size={20} />
                {isSidebarOpen && <span className="ml-3">PDV</span>}
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 mt-auto">
          <Button
            variant="outline"
            className="w-full bg-white text-sky-900 hover:bg-gray-100 flex items-center justify-center"
            onClick={handleLogout}
          >
            <LogOut size={20} className="mr-2" />
            {isSidebarOpen && "Sair"}
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Sistema de Gestão</h1>
            <div className="text-sm text-gray-600">
              {user?.email} | {user?.role === 'admin' ? 'Administrador' : 'Vendedor'}
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
