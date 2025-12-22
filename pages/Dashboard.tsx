
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';
import { MOCK_MARCHES, formatFCFA, CONFIG_FONCTIONS } from '../services/mockData';
import { StatutGlobal } from '../types';

const COLORS = ['#1e3a8a', '#10b981', '#f59e0b', '#ef4444'];

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {subtext && <p className={`text-xs mt-2 ${colorClass}`}>{subtext}</p>}
    </div>
    <div className={`p-3 rounded-2xl ${colorClass.replace('text-', 'bg-').replace('600', '100')} ${colorClass}`}>
      <Icon size={24} />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [filterFonction, setFilterFonction] = useState<string>('');
  
  // Data Filtering
  let data = MOCK_MARCHES.filter(m => m.exercice === 2024);
  
  if (filterFonction) {
    data = data.filter(m => m.fonction_parente === filterFonction);
  }

  // KPIs Calculations
  const totalMarkets = data.length;
  const strictlySigned = data.filter(m => m.statut_global === StatutGlobal.SIGNE || m.statut_global === StatutGlobal.CLOTURE).length;
  
  const totalAmountPrevu = data.reduce((acc, curr) => acc + curr.montant_prevu, 0);
  const totalAmountEngage = data.filter(m => m.statut_global === StatutGlobal.SIGNE || m.statut_global === StatutGlobal.CLOTURE).reduce((acc, curr) => acc + (curr.montant_ttc_reel || curr.montant_prevu), 0);
  
  const tauxContractualisation = totalMarkets > 0 ? Math.round((strictlySigned / totalMarkets) * 100) : 0;
  
  const celerite = "92%"; // Mock value

  // Chart Data
  const statusData = [
    { name: 'Planifié', value: data.filter(m => m.statut_global === StatutGlobal.PLANIFIE).length },
    { name: 'En Procédure', value: data.filter(m => m.statut_global === StatutGlobal.EN_COURS).length },
    { name: 'Signé/Exécution', value: data.filter(m => m.statut_global === StatutGlobal.SIGNE).length },
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Pilotage de la Performance</h1>
          <p className="text-slate-500 font-medium">Exercice 2024 - Indicateurs Clés</p>
        </div>
        
        {/* Rounded Filters Area */}
        <div className="mt-4 md:mt-0 flex items-center space-x-3 max-w-full overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm min-w-[250px] md:min-w-0 transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5">
            <Filter size={16} className="text-slate-400 flex-shrink-0" />
            <select 
              className="text-xs border-none focus:ring-0 text-slate-700 font-black bg-transparent outline-none truncate w-full cursor-pointer appearance-none"
              value={filterFonction}
              onChange={(e) => setFilterFonction(e.target.value)}
            >
              <option value="">Toutes les Fonctions</option>
              {CONFIG_FONCTIONS.map(f => (
                <option key={f.libelle} value={f.libelle}>{f.libelle}</option>
              ))}
            </select>
          </div>
          <button className="bg-primary text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 shadow-xl shadow-blue-200 transition-all whitespace-nowrap">
            Export Rapport PDF
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Taux de Contractualisation" 
          value={`${tauxContractualisation}%`} 
          subtext={`${strictlySigned} / ${totalMarkets} marchés signés`} 
          icon={TrendingUp} 
          colorClass="text-blue-600" 
        />
        <StatCard 
          title="Montant Engagé" 
          value={formatFCFA(totalAmountEngage)} 
          subtext={`Sur ${formatFCFA(totalAmountPrevu)} prévus`} 
          icon={CheckCircle} 
          colorClass="text-emerald-600" 
        />
        <StatCard 
          title="Indice de Célérité" 
          value={celerite} 
          subtext="Ratio Prévu / Réalisé" 
          icon={Clock} 
          colorClass={parseInt(celerite) < 90 ? "text-amber-600" : "text-green-600"} 
        />
        <StatCard 
          title="Taux de Contentieux" 
          value="0%" 
          subtext="0 Recours enregistrés" 
          icon={AlertCircle} 
          colorClass="text-slate-600" 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 lg:col-span-1">
          <h3 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-widest">État d'avancement (Volume)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
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

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-widest">Programmation par Fonction (FCFA)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={functionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000000}M`} tick={{fontSize: 10, fontWeight: 700}} />
                <Tooltip formatter={(value) => formatFCFA(value as number)} />
                <Bar dataKey="amount" fill="#1e3a8a" radius={[12, 12, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
            {data.filter(m => m.statut_global === StatutGlobal.EN_COURS).slice(0, 3).map((m) => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-black text-slate-900">#{m.id.toUpperCase()}</td>
                <td className="px-6 py-4 truncate max-w-xs font-medium">{m.objet}</td>
                <td className="px-6 py-4 text-slate-500 font-bold">Attente ANO Bailleur</td>
                <td className="px-6 py-4 text-red-600 font-black italic">+ 5 jours</td>
                <td className="px-6 py-4">
                  <button className="bg-slate-100 text-primary px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-wide hover:bg-primary hover:text-white transition-all">
                    Résoudre
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
