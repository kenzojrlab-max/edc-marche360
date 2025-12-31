// App.tsx
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
  Layers,
  FileText 
} from 'lucide-react';

// --- IMPORTS DES PAGES ---
import Dashboard from './pages/Dashboard';
import MarketList from './pages/MarketList';
import MarketDetail from './pages/MarketDetail';
import TrackingPage from './pages/TrackingPage';
import ExecutionPage from './pages/ExecutionPage';
import DocumentLibrary from './pages/DocumentLibrary';
import SettingsPage from './pages/Settings';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import { UserRole } from './types';
import { useMarkets } from './contexts/MarketContext';

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
  const { currentUser, logout } = useMarkets(); 
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2024');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isPublicPage = location.pathname === '/login' || location.pathname === '/register';
  
  if (isPublicPage) {
      return <div className="bg-slate-50 min-h-screen w-full">{children}</div>;
  }
  
  if (!currentUser) {
      return <>{children}</>;
  }

  // --- GESTION DES DROITS ---
  const role = currentUser.role;
  
  const isGuest = role === UserRole.GUEST;
  const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
  const isManager = role === UserRole.PROJECT_MANAGER;
  // Note: isUser est implicite si ce n'est aucun des autres, mais on peut le définir pour la clarté
  
  // Règles d'affichage
  // 1. Documentation : Visible pour Utilisateur, Gestionnaire, Admin (Pas Invité)
  const showDocumentation = !isGuest; 

  // 2. Gestion Opérationnelle (PPM Manage, Suivi, Exécution, Doc Manage) : Gestionnaire ou Admin
  const showOperationalManagement = isManager || isAdmin;

  // 3. Administration Système (Paramètres) : Admin uniquement
  const showSystemSettings = isAdmin;

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
                {currentUser.nom_complet.substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-slate-700 truncate">{currentUser.nom_complet}</p>
                <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                  {isGuest && <ShieldCheck size={10} className="text-amber-500" />}
                  {role}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {/* --- MENUS COMMUNS (Tous rôles) --- */}
            <SidebarItem to="/" icon={LayoutDashboard} label="Tableau de Bord" active={location.pathname === '/'} />
            <SidebarItem to="/ppm-view" icon={ClipboardList} label="Plan de Passation" active={location.pathname === '/ppm-view'} />
            
            {/* --- DOCUMENTATION (Pas pour Invité) --- */}
            {showDocumentation && (
              <SidebarItem to="/documents" icon={BookOpen} label="Documentation" active={location.pathname === '/documents'} />
            )}
            
            {/* --- GESTION OPERATIONNELLE (Gestionnaire & Admin) --- */}
            {showOperationalManagement && (
              <>
                <div className="pt-6 pb-2">
                  <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gestion</p>
                </div>
                
                <SidebarItem to="/ppm-manage" icon={ShieldCheck} label="Gestion PPM" active={location.pathname === '/ppm-manage'} />
                <SidebarItem to="/tracking" icon={Activity} label="Suivi des marchés" active={location.pathname === '/tracking'} />
                <SidebarItem to="/execution" icon={Layers} label="Exécution des marchés" active={location.pathname === '/execution'} />
                <SidebarItem to="/documents-manage" icon={FileText} label="Gestion Documentaire" active={location.pathname === '/documents-manage'} />
              </>
            )}

            {/* --- PARAMETRES SYSTEME (Admin uniquement) --- */}
            {showSystemSettings && (
              <>
                <div className="pt-6 pb-2">
                  <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Administration</p>
                </div>
                <SidebarItem to="/settings" icon={Settings} label="Paramètres" active={location.pathname === '/settings'} />
              </>
            )}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button onClick={logout} className="flex items-center space-x-3 w-full px-4 py-2 text-slate-500 hover:text-danger hover:bg-red-50 rounded-2xl transition-colors">
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

// --- PROTECTION DES ROUTES ---
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { currentUser } = useMarkets();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// --- APPLICATION ---
function App() {
  return (
    <Layout>
      <Routes>
        {/* Routes Publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Routes Protégées */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/ppm-view" element={<ProtectedRoute><MarketList mode="PPM" readOnly={true} /></ProtectedRoute>} />
        
        {/* Routes accessibles via URL mais protégées par la logique Sidebar (et idéalement par des Guards supplémentaires plus tard) */}
        <Route path="/ppm-manage" element={<ProtectedRoute><MarketList mode="PPM" readOnly={false} /></ProtectedRoute>} />
        <Route path="/tracking" element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
        <Route path="/execution" element={<ProtectedRoute><ExecutionPage /></ProtectedRoute>} />
        <Route path="/markets/:id" element={<ProtectedRoute><MarketDetail /></ProtectedRoute>} />
        
        <Route path="/documents" element={<ProtectedRoute><DocumentLibrary readOnly={true} /></ProtectedRoute>} />
        <Route path="/documents-manage" element={<ProtectedRoute><DocumentLibrary readOnly={false} /></ProtectedRoute>} />

        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;