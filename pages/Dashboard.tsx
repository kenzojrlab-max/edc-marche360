// pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Clock, ArrowRight, DollarSign, Timer } from 'lucide-react';
import { formatFCFA, calculateDaysBetween } from '../services/mockData';
import { StatutGlobal, SourceFinancement } from '../types';
import { useMarkets } from '../contexts/MarketContext'; 
import { CustomBulleSelect } from '../components/CommonComponents';

const COLORS = ['#1e3a8a', '#10b981', '#f59e0b', '#ef4444'];
const BLUE_COLOR = '#1e3a8a';

// --- HELPERS ---
const todayISO = new Date().toISOString().split('T')[0];

const mean = (arr: number[]) => {
  const clean = arr.filter(n => Number.isFinite(n));
  if (clean.length === 0) return 0;
  return Math.round(clean.reduce((a, b) => a + b, 0) / clean.length);
};

// Jalons pour détection blocage
const JALONS: { key: string; label: string; isAno?: boolean }[] = [
  { key: 'saisine_cipm', label: 'Saisine CIPM' },
  { key: 'examen_dao_cipm', label: 'Examen DAO' },
  { key: 'ano_bailleur_dao', label: 'ANO Bailleur (DAO)', isAno: true },
  { key: 'lancement_ao', label: 'Lancement AO' },
  { key: 'depouillement', label: 'Dépouillement' },
  { key: 'prop_attrib_cipm', label: 'Prop. Attribution' },
  { key: 'avis_conforme_ca', label: 'Avis Conforme CA' },
  { key: 'ano_bailleur_attrib', label: 'ANO Bailleur (Attrib)', isAno: true },
  { key: 'publication', label: 'Publication' },
  { key: 'souscription_projet', label: 'Souscription' },
  { key: 'saisine_cipm_projet', label: 'Saisine Projet' },
  { key: 'examen_projet_cipm', label: 'Examen Projet' },
  { key: 'ano_bailleur_projet', label: 'ANO Bailleur (Projet)', isAno: true },
  { key: 'signature_marche', label: 'Signature' },
  { key: 'notification', label: 'Notification' },
];

const getBlockingPoint = (m: any) => {
  for (const j of JALONS) {
    if (j.isAno && m.source_financement === SourceFinancement.BUDGET_EDC) continue;
    const real = m?.dates_realisees?.[j.key];
    if (!real) return j;
  }
  return null;
};

const getDelayDays = (m: any, jalonKey: string) => {
  const prev = m?.dates_prevues?.[jalonKey];
  const real = m?.dates_realisees?.[jalonKey];
  if (!prev) return 0;
  if (!real) {
    const d = calculateDaysBetween(prev, todayISO);
    return d ? Math.max(0, d) : 0;
  }
  const d = calculateDaysBetween(prev, real);
  return d ? Math.max(0, d) : 0;
};

// --- CORRECTION ICI : StatCard optimisée pour tenir sur une seule ligne ---
const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow h-full">
    <div className="flex-1 min-w-0 mr-3">
      <p className="text-sm font-medium text-slate-500 mb-1 truncate">{title}</p>
      <h3 
        className="text-base sm:text-lg font-black text-slate-800 tracking-tighter whitespace-nowrap truncate leading-tight"
        title={value}
      >
        {value}
      </h3>
      {subtext && <p className={`text-xs mt-1 ${colorClass} truncate`}>{subtext}</p>}
    </div>
    <div className={`p-3 rounded-2xl flex-shrink-0 ${colorClass.replace('text-', 'bg-').replace('600', '100')} ${colorClass}`}>
      <Icon size={24} />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { marches, projets, fonctions } = useMarkets();
  
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedProjetId, setSelectedProjetId] = useState<string>('');
  const [filterFonction, setFilterFonction] = useState<string>('');

  const availableProjects = projets.filter(p => p.exercice === selectedYear);

  useEffect(() => {
    setSelectedProjetId('');
  }, [selectedYear]);
  
  let data = marches.filter(m => {
    const matchYear = m.exercice === selectedYear;
    const matchProject = selectedProjetId ? m.projet_id === selectedProjetId : true;
    const matchFonction = filterFonction ? m.fonction_parente === filterFonction : true;
    return matchYear && matchProject && matchFonction;
  });

  // --- CALCUL DES KPIS ---
  const totalMarkets = data.length;
  const strictlySigned = data.filter(m => m.statut_global === StatutGlobal.SIGNE || m.statut_global === StatutGlobal.CLOTURE).length;
  
  const totalAmountPrevu = data.reduce((acc, curr) => acc + curr.montant_prevu, 0);
  const totalAmountEngage = data.filter(m => m.statut_global === StatutGlobal.SIGNE || m.statut_global === StatutGlobal.CLOTURE).reduce((acc, curr) => acc + (curr.montant_ttc_reel || curr.montant_prevu), 0);
  
  const tauxContractualisation = totalMarkets > 0 ? Math.round((strictlySigned / totalMarkets) * 100) : 0;
  const resteAEngager = totalAmountPrevu - totalAmountEngage;

  // --- CÉLÉRITÉ ---
  const delaiPrevuMoy = mean(data.map(m => Number(m.delai_global_passation || 0)).filter(v => v > 0));
  const delaisReels = data
    .filter(m => m.statut_global === StatutGlobal.SIGNE || m.statut_global === StatutGlobal.CLOTURE)
    .map(m => calculateDaysBetween(m?.dates_realisees?.saisine_cipm, m?.dates_realisees?.signature_marche))
    .filter((v): v is number => typeof v === 'number' && v > 0);
  const delaiReelMoy = mean(delaisReels);
  const celeriteValue = delaiPrevuMoy && delaiReelMoy ? Math.round((delaiPrevuMoy / delaiReelMoy) * 100) : null;
  
  const totalRecours = data.filter(m => m.has_recours).length;
  const tauxContentieux = totalMarkets > 0 ? ((totalRecours / totalMarkets) * 100).toFixed(1) : "0";

  // --- ALERTES ---
  const alerts = data
    .filter(m => m.statut_global === StatutGlobal.EN_COURS || m.statut_global === StatutGlobal.PLANIFIE)
    .map(m => {
      const blocking = getBlockingPoint(m);
      if (!blocking) return null;
      const delayDays = getDelayDays(m, blocking.key);
      return {
        id: m.id,
        objet: m.objet,
        blockingLabel: blocking.label,
        delayDays,
        impactText: delayDays > 0 ? `+ ${delayDays} j` : "À jour",
        impactClass: delayDays > 0 ? "text-red-600 bg-red-50" : "text-emerald-600 bg-emerald-50",
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.delayDays - a.delayDays)
    .slice(0, 5);

  // --- DATA VISUALISATION ---
  const statusData = [
    { name: 'Planifié', value: data.filter(m => m.statut_global === StatutGlobal.PLANIFIE).length },
    { name: 'En Procédure', value: data.filter(m => m.statut_global === StatutGlobal.EN_COURS).length },
    { name: 'Signé', value: strictlySigned },
    { name: 'Clôturé', value: data.filter(m => m.statut_global === StatutGlobal.CLOTURE).length },
  ];

  const functionDataMap: Record<string, number> = {};
  data.forEach(m => {
    functionDataMap[m.fonction_parente] = (functionDataMap[m.fonction_parente] || 0) + m.montant_prevu;
  });
  const functionData = Object.keys(functionDataMap).map(key => ({
    name: key,
    amount: functionDataMap[key]
  }));

  const budgetComparisonData = [
    { name: 'Budget Prévu', montant: totalAmountPrevu },
    { name: 'Montant Engagé', montant: totalAmountEngage }
  ];

  const delayComparisonData = [
    { name: 'Délai Moyen', prevu: delaiPrevuMoy, reel: delaiReelMoy }
  ];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Pilotage de la Performance</h1>
          <p className="text-slate-500 font-medium text-xs uppercase tracking-widest mt-1">
             Exercice {selectedYear} • {selectedProjetId ? availableProjects.find(p => p.id === selectedProjetId)?.libelle : "Tous les Projets"}
          </p>
        </div>
        
        {/* CORRECTION ICI : Remplacement de overflow-x-auto par flex-wrap pour éviter de couper les dropdowns */}
        <div className="flex flex-col md:flex-row items-center gap-3 flex-wrap">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap min-w-[120px]">
             <CustomBulleSelect 
               value={selectedYear.toString()} 
               onChange={(e: any) => setSelectedYear(parseInt(e.target.value))} 
               options={[
                 { value: '2024', label: '2024' },
                 { value: '2025', label: '2025' }
               ]}
               placeholder="Année"
             />
          </div>

          <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm min-w-[200px] max-w-xs">
             <CustomBulleSelect 
               value={selectedProjetId} 
               onChange={(e: any) => setSelectedProjetId(e.target.value)} 
               options={[
                 { value: '', label: 'Tous les Projets' },
                 ...availableProjects.map(p => ({ value: p.id, label: p.libelle }))
               ]}
               placeholder="Sélectionner un projet"
             />
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>

          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm min-w-[200px]">
            <CustomBulleSelect 
              value={filterFonction} 
              onChange={(e: any) => setFilterFonction(e.target.value)} 
              options={[
                { value: '', label: 'Toutes les Fonctions' },
                ...fonctions.map(f => ({ value: f.libelle, label: f.libelle }))
              ]}
              placeholder="Filtrer par fonction"
            />
          </div>

          <button className="bg-primary text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 shadow-xl shadow-blue-200 transition-all whitespace-nowrap ml-auto md:ml-0">
            Export Rapport
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
        <StatCard 
          title="Taux de Contractualisation" 
          value={`${tauxContractualisation}%`} 
          subtext={`${strictlySigned} / ${totalMarkets} marchés signés`} 
          icon={TrendingUp} 
          colorClass="text-blue-600" 
        />
        <StatCard 
          title="Reste à Engager" 
          value={formatFCFA(resteAEngager)} 
          subtext={`${formatFCFA(totalAmountEngage)} déjà engagés`} 
          icon={CheckCircle} 
          colorClass="text-emerald-600" 
        />
        <StatCard 
          title="Indice de Célérité" 
          value={celeriteValue ? `${celeriteValue}%` : "N/A"} 
          subtext="Ratio Prévu / Réalisé" 
          icon={Clock} 
          colorClass={!celeriteValue ? "text-slate-400" : (celeriteValue < 90 ? "text-amber-600" : "text-green-600")} 
        />
        <StatCard 
          title="Taux de Contentieux" 
          value={`${tauxContentieux}%`} 
          subtext={`${totalRecours} Recours enregistré(s)`} 
          icon={AlertCircle} 
          colorClass={totalRecours > 0 ? "text-red-600" : "text-slate-600"} 
        />
      </div>

      {/* Charts Row 1: Status & Budget Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. STATUS (Pie) */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 lg:col-span-1">
          <h3 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-widest">État d'avancement (Volume)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. BUDGET PREVU VS ENGAGE (Bar) */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 lg:col-span-1">
          <h3 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-widest flex items-center gap-2">
            <DollarSign size={16} /> Performance Financière
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetComparisonData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${(val/1000000).toFixed(0)}M`} tick={{fontSize: 10, fontWeight: 700}} />
                <Tooltip formatter={(value) => formatFCFA(value as number)} />
                <Bar dataKey="montant" fill={BLUE_COLOR} radius={[10, 10, 0, 0]} barSize={50}>
                   {budgetComparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#94a3b8' : '#10b981'} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. DELAIS PREVU VS REEL (Bar Grouped) */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 lg:col-span-1">
          <h3 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-widest flex items-center gap-2">
            <Timer size={16} /> Performance Délais (Jours)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={delayComparisonData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 0}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
                <Bar name="Délai Prévu Moy." dataKey="prevu" fill="#94a3b8" radius={[10, 10, 0, 0]} barSize={40} />
                <Bar name="Délai Réel Moy." dataKey="reel" fill="#f59e0b" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 : Breakdown by Function */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-widest">Répartition budgétaire par Fonction</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={functionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${(val/1000000).toFixed(0)}M`} tick={{fontSize: 10, fontWeight: 700}} />
                <Tooltip formatter={(value) => formatFCFA(value as number)} />
                <Bar dataKey="amount" fill={BLUE_COLOR} radius={[6, 6, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
      </div>

      {/* Alert Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Alertes & Points de blocage</h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Réf Marché</th>
              <th className="px-6 py-4">Objet</th>
              <th className="px-6 py-4">Point de blocage</th>
              <th className="px-6 py-4">Impact</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {alerts && alerts.length > 0 ? (
               alerts.map((a: any) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-black text-slate-900">#{a.id}</td>
                  <td className="px-6 py-4 truncate max-w-xs font-medium">{a.objet}</td>
                  <td className="px-6 py-4 text-slate-500 font-bold">{a.blockingLabel}</td>
                  <td className="px-6 py-4 font-black italic">
                    <span className={`px-2 py-1 rounded-lg text-[9px] ${a.impactClass}`}>{a.impactText}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/markets/${a.id}`} className="bg-slate-100 text-primary px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-wide hover:bg-primary hover:text-white transition-all flex items-center w-fit gap-1">
                      Voir <ArrowRight size={10} />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                   <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle size={32} className="text-emerald-200" />
                      <span>Aucune alerte critique. Tout est à jour !</span>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;