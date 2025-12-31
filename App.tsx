// App.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
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
  FileText,
  AlertCircle,
  Clock
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

import { UserRole, JalonPassationKey, Marche } from './types';
import { useMarkets } from './contexts/MarketContext';
import { calculateDaysBetween } from './services/mockData';

// --- JALONS POUR ALERTES (Même liste que pour le tableau) ---
const JALONS_KEYS: { key: JalonPassationKey, label: string }[] = [
  { key: 'saisine_cipm', label: 'Saisine CIPM' }, { key: 'examen_dao_cipm', label: 'Examen DAO' },
  { key: 'ano_bailleur_dao', label: 'ANO Bailleur (DAO)' }, { key: 'lancement_ao', label: 'Lancement AO' },
  { key: 'depouillement', label: 'Dépouillement' }, { key: 'prop_attrib_cipm', label: 'Prop. Attribution' },
  { key: 'avis_conforme_ca', label: 'Avis CA' }, { key: 'ano_bailleur_attrib', label: 'ANO Bailleur (Attrib)' },
  { key: 'publication', label: 'Publication' }, { key: 'souscription_projet', label: 'Souscription' },
  { key: 'saisine_cipm_projet', label: 'Saisine Projet' }, { key: 'examen_projet_cipm', label: 'Examen Projet' },
  { key: 'ano_bailleur_projet', label: 'ANO Bailleur (Projet)' }, { key: 'signature_marche', label: 'Signature' },
  { key: 'notification', label: 'Notification' },
];

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
  const navigate = useNavigate();
  const { currentUser, logout, marches } = useMarkets(); 
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // --- GESTION NOTIFICATIONS ---
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fermer le menu notif si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- CALCUL DES ALERTES ---
  const alerts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const activeAlerts: { market: Marche, jalonLabel: string, delay: number }[] = [];

    marches.forEach(m => {
      // On ignore les marchés terminés ou annulés
      if (m.is_annule || m.dates_realisees.notification) return;

      JALONS_KEYS.forEach(jalon => {
        const prevue = m.dates_prevues[jalon.key];
        const realisee = m.dates_realisees[jalon.key];

        // Si pas réalisé ET date prévue dépassée
        if (prevue && !realisee && today > prevue) {
           const delay = calculateDaysBetween(prevue, today) || 0;
           activeAlerts.push({
             market: m,
             jalonLabel: jalon.label,
             delay: delay
           });
        }
      });
    });

    // Tri par délai le plus long
    return activeAlerts.sort((a, b) => b.delay - a.delay);
  }, [marches]);

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

  const showDocumentation = !isGuest; 
  const showOperationalManagement = isManager || isAdmin;
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
            <SidebarItem to="/" icon={LayoutDashboard} label="Tableau de Bord" active={location.pathname === '/'} />
            <SidebarItem to="/ppm-view" icon={ClipboardList} label="Plan de Passation" active={location.pathname === '/ppm-view'} />
            
            {showDocumentation && (
              <SidebarItem to="/documents" icon={BookOpen} label="Documentation" active={location.pathname === '/documents'} />
            )}
            
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
          </div>

          <div className="flex items-center space-x-4">
            {/* --- NOTIFICATION BELL --- */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 rounded-full transition-all ${showNotifications ? 'bg-blue-50 text-primary' : 'text-slate-400 hover:text-primary hover:bg-blue-50'}`}
              >
                <Bell size={20} />
                {alerts.length > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {/* DROPDOWN NOTIFICATIONS */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Alertes Délais</h3>
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[9px] font-bold">{alerts.length}</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {alerts.length > 0 ? (
                      <div className="divide-y divide-slate-50">
                        {alerts.slice(0, 5).map((alert, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => {
                              // --- CORRECTION MAJEURE ICI ---
                              // Redirection vers /ppm-view (Liste de consultation) au lieu de /markets (Détail)
                              // On passe l'ID en paramètre query string (?id=...)
                              navigate(`/ppm-view?id=${encodeURIComponent(alert.market.id)}`); 
                              setShowNotifications(false);
                            }}
                            className="p-4 hover:bg-slate-50 cursor-pointer group transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-1 p-1.5 bg-red-50 text-red-500 rounded-full flex-shrink-0">
                                <Clock size={14} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-slate-500 mb-0.5">{alert.market.id}</p>
                                <p className="text-xs font-black text-slate-800 leading-tight mb-1">{alert.jalonLabel}</p>
                                <p className="text-[10px] text-red-600 font-bold">Retard de {alert.delay} jours</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {alerts.length > 5 && (
                          <div className="p-3 text-center text-[10px] font-bold text-slate-400 bg-slate-50">
                            + {alerts.length - 5} autres alertes...
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-400">
                        <ShieldCheck size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-medium">Aucun retard détecté.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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