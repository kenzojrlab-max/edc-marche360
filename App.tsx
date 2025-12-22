import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Bell, 
  Menu,
  X,
  FolderOpen,
  PieChart,
  BookOpen,
  ClipboardList,
  ShieldCheck,
  Activity,
  Layers // Ajout de l'icône Layers pour l'exécution
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import MarketList from './pages/MarketList';
import MarketDetail from './pages/MarketDetail';
import TrackingPage from './pages/TrackingPage';
import ExecutionPage from './pages/ExecutionPage.tsx'; // <--- Import de la nouvelle page
import DocumentLibrary from './pages/DocumentLibrary';
import SettingsPage from './pages/Settings';
import { CURRENT_USER } from './services/mockData';
import { UserRole } from './types';

// --- Components ---

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors ${
      active 
        ? 'bg-primary text-white shadow-md' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2024');

  const isAdmin = CURRENT_USER.role === UserRole.ADMIN || CURRENT_USER.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center mr-3">
              <FolderOpen className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">ProCure<span className="text-primary">CM</span></span>
            <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Utilisateur</p>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs mr-2">
                {CURRENT_USER.nom_complet.substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-slate-700 truncate">{CURRENT_USER.nom_complet}</p>
                <p className="text-xs text-slate-500 truncate">{CURRENT_USER.role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {/* 1. Dashboard */}
            <SidebarItem to="/" icon={LayoutDashboard} label="Tableau de Bord" active={location.pathname === '/'} />
            
            {/* 2. Plan de Passation */}
            <SidebarItem to="/ppm-view" icon={ClipboardList} label="Plan de Passation" active={location.pathname === '/ppm-view'} />
            
            {/* 3. Documentation */}
            <SidebarItem to="/documents" icon={BookOpen} label="Documentation" active={location.pathname === '/documents'} />
            
            {/* SECTION ADMINISTRATION */}
            <div className="pt-6 pb-2">
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Administration</p>
            </div>
            
            {/* 4a. Gestion PPM */}
            {isAdmin && (
              <SidebarItem to="/ppm-manage" icon={ShieldCheck} label="Gestion PPM" active={location.pathname === '/ppm-manage'} />
            )}

            {/* 4b. Suivi des marchés */}
            <SidebarItem to="/tracking" icon={Activity} label="Suivi des marchés" active={location.pathname === '/tracking'} />

            {/* 4c. Exécution des marchés */}
            <SidebarItem to="/execution" icon={Layers} label="Exécution des marchés" active={location.pathname === '/execution'} />
            
            {/* 4d. Paramètres */}
            <SidebarItem to="/settings" icon={Settings} label="Paramètres" active={location.pathname === '/settings'} />
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button className="flex items-center space-x-3 w-full px-4 py-2 text-slate-500 hover:text-danger hover:bg-red-50 rounded-2xl transition-colors">
              <LogOut size={18} />
              <span className="text-sm font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 z-10">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="mr-4 lg:hidden text-slate-500">
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-100 rounded-[2rem] p-1.5 border border-slate-200/50">
                <span className="text-[10px] font-black text-slate-400 px-2 uppercase tracking-tighter">EXERCICE</span>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-white text-xs font-black text-slate-700 border-none rounded-2xl shadow-sm py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2.5 text-slate-400 hover:text-primary bg-slate-50 hover:bg-blue-50 rounded-full transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 p-6 lg:p-8">
           {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ppm-view" element={<MarketList mode="PPM" readOnly={true} />} />
        <Route path="/ppm-manage" element={<MarketList mode="PPM" readOnly={false} />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/execution" element={<ExecutionPage />} /> {/* Route vers la nouvelle page */}
        <Route path="/markets/:id" element={<MarketDetail />} />
        <Route path="/documents" element={<DocumentLibrary />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/analytics" element={<Dashboard />} /> {/* Fallback pour Analytics */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;