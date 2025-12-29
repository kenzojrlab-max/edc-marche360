// pages/TrackingPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Activity, 
  Save, 
  Upload, 
  ShieldCheck, 
  Download,
  Filter,
  Layers,
  AlertTriangle
} from 'lucide-react';
// CORRECTION : On retire MOCK_PROJETS des imports car on va utiliser le contexte
import { CURRENT_USER } from '../services/mockData';
import { JalonPassationKey, SourceFinancement, UserRole } from '../types';
import { useMarkets } from '../contexts/MarketContext';

// --- 1. DocCell : Upload ou Download selon le rôle ---
const DocCell = ({ 
  doc, 
  label, 
  disabled, 
  onUpload 
}: { 
  doc?: any, 
  label: string, 
  disabled?: boolean, 
  onUpload?: (file: File) => void 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isAdmin = CURRENT_USER.role === UserRole.ADMIN || CURRENT_USER.role === UserRole.SUPER_ADMIN;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdmin && !disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (onUpload) onUpload(e.target.files[0]);
      e.target.value = '';
    }
  };

  // VUE UTILISATEUR : TÉLÉCHARGEMENT
  if (!isAdmin) {
    if (doc && !disabled) {
       return (
         <a 
           href={doc.url} 
           target="_blank" 
           rel="noreferrer"
           onClick={(e) => e.stopPropagation()}
           title={`Télécharger ${label}`}
           className="flex justify-center items-center p-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 hover:scale-110 transition-transform"
         >
           <Download size={10} />
         </a>
       );
    }
    return (
      <div className="flex justify-center items-center w-6 h-6 opacity-20">
        <div className="w-1 h-1 rounded-full bg-slate-400"></div>
      </div>
    );
  }

  // VUE ADMIN : UPLOAD
  return (
    <div className={`flex justify-center items-center gap-1 flex-shrink-0 ${disabled ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.doc,.docx,.xlsx,.jpg,.png"
      />
      <button 
        type="button"
        onClick={handleClick}
        title={disabled ? "Non applicable" : (doc ? `Remplacer ${label}` : `Téléverser ${label}`)}
        className={`p-1 rounded border transition-all flex items-center justify-center group/btn ${
          doc 
            ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
            : 'bg-slate-50 text-slate-400 border-dashed border-slate-300 hover:text-primary hover:border-primary hover:bg-blue-50'
        }`}
      >
        <Upload size={10} className="group-hover/btn:scale-110 transition-transform" />
      </button>
    </div>
  );
};

// --- Composant Input Date ---
const AdminDateInput = ({ value, onChange, disabled }: { value?: string, onChange: (v: string) => void, disabled?: boolean }) => (
  <input 
    type="date" 
    value={value || ''} 
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className={`bg-transparent text-[9px] font-mono font-black outline-none border-b border-transparent px-0.5 py-0.5 rounded transition-all w-24 text-center ${disabled ? 'text-slate-400 cursor-not-allowed italic bg-transparent border-none' : 'text-slate-700 hover:bg-slate-100 focus:border-primary'}`}
  />
);

const TrackingPage: React.FC = () => {
  // CORRECTION ICI : On récupère 'projets' du contexte global
  const { marches, updateMarche, projets } = useMarkets();
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- NOUVEAUX ETATS POUR LE FILTRAGE ---
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedProjetId, setSelectedProjetId] = useState<string>('');

  const isAdmin = CURRENT_USER.role === UserRole.ADMIN || CURRENT_USER.role === UserRole.SUPER_ADMIN;

  // CORRECTION ICI : On filtre sur la liste dynamique 'projets' et non MOCK_PROJETS
  const availableProjects = projets.filter(p => p.exercice === selectedYear);

  // Mise à jour auto du projet si l'année change
  useEffect(() => {
    setSelectedProjetId('');
  }, [selectedYear]);

  const handleUpdateDate = (marketId: string, key: JalonPassationKey, value: string) => {
    if (!isAdmin) return;
    const market = marches.find(m => m.id === marketId);
    if (market) {
      updateMarche({ ...market, dates_realisees: { ...market.dates_realisees, [key]: value } });
    }
  };

  const handleUpdateField = (marketId: string, field: string, value: any) => {
    if (!isAdmin) return;
    const market = marches.find(m => m.id === marketId);
    if (market) {
      updateMarche({ ...market, [field]: value });
    }
  };

  const handleDocUpload = (marketId: string, docKey: string, file: File, isSpecialDoc?: boolean) => {
    if (!isAdmin) return;

    const market = marches.find(m => m.id === marketId);
    if (market) {
        const fakeUrl = URL.createObjectURL(file);
        
        const newDoc = { 
            nom: file.name, 
            url: fakeUrl, 
            date_upload: new Date().toISOString().split('T')[0] 
        };
        
        let updatedMarket = { ...market };
        if (isSpecialDoc) {
          updatedMarket = { ...updatedMarket, [docKey]: newDoc };
        } else {
          updatedMarket = { ...updatedMarket, docs: { ...updatedMarket.docs, [docKey]: newDoc } };
        }
        
        updateMarche(updatedMarket);
    }
  };

  // --- FILTRAGE AVANCÉ ET SÉCURISÉ ---
  const filteredMarches = marches.filter(m => {
    try {
      // 1. Filtre par Année
      const matchYear = Number(m.exercice) === selectedYear;
      
      // 2. Filtre par Projet
      const matchProject = selectedProjetId ? m.projet_id === selectedProjetId : true;

      // 3. Filtre Recherche textuelle
      const safeId = String(m.id || '').toLowerCase();
      const safeObjet = String(m.objet || '').toLowerCase();
      const safeSearch = searchTerm.toLowerCase();

      const matchSearch = safeId.includes(safeSearch) || safeObjet.includes(safeSearch);
      
      return matchYear && matchProject && matchSearch;
    } catch (e) {
      return false; 
    }
  });

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <Activity className="text-primary" size={28} />
            Suivi des Marchés
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
            Registre de pilotage - {isAdmin ? 'Administration & Téléversement' : 'Consultation & Téléchargement'}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* SÉLECTEUR ANNÉE */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-sm">
             <span className="text-[9px] font-black text-slate-400 uppercase">Exercice</span>
             <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-transparent text-xs font-black text-slate-800 outline-none cursor-pointer"
             >
               <option value={2024}>2024</option>
               <option value={2025}>2025</option>
             </select>
          </div>

          {/* SÉLECTEUR PROJET */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-sm min-w-[200px]">
             <Layers size={14} className="text-slate-400" />
             <select 
                value={selectedProjetId} 
                onChange={(e) => setSelectedProjetId(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-800 outline-none cursor-pointer w-full truncate"
             >
               <option value="">Tous les Projets</option>
               {availableProjects.map(p => (
                 <option key={p.id} value={p.id}>{p.libelle}</option>
               ))}
             </select>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>

          {/* RECHERCHE */}
          <div className="relative group w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher..."
              className="bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-black text-slate-700 outline-none w-full md:w-64 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isAdmin && (
            <button className="bg-primary text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 transition-transform hover:scale-105 whitespace-nowrap">
              <Save size={16} /> Enregistrer
            </button>
          )}
        </div>
      </div>

      {/* Tableau Registre */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden relative">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-[9px] font-black border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-900 text-white uppercase tracking-widest text-[8px]">
                <th colSpan={4} className="px-4 py-2 border-r border-white/10 text-center bg-slate-800">1-4. Identification</th>
                <th colSpan={5} className="px-4 py-2 border-r border-white/10 text-center bg-blue-900/90">5-9. Préparation DAO</th>
                <th colSpan={6} className="px-4 py-2 border-r border-white/10 text-center bg-indigo-900/90">10-15. Consultation</th>
                <th className="px-4 py-2 border-r border-white/10 text-center bg-red-900/90">16. Inf.</th>
                <th colSpan={5} className="px-4 py-2 border-r border-white/10 text-center bg-emerald-900/90">17-21. Attribution</th>
                <th colSpan={2} className="px-4 py-2 border-r border-white/10 text-center bg-slate-800">22-23. Titulaire</th>
                <th colSpan={6} className="px-4 py-2 border-r border-white/10 text-center bg-teal-900/90">24-29. Contractualisation</th>
                <th className="px-4 py-2 border-r border-white/10 text-center bg-amber-900/90">30. Ann.</th>
                <th colSpan={3} className="px-4 py-2 text-center bg-slate-800">31-33. Clôture</th>
              </tr>
              <tr className="bg-slate-50 text-slate-400 border-b border-slate-200 uppercase text-[8px]">
                {/* En-têtes colonnes */}
                <th className="px-3 py-3 sticky left-0 bg-slate-50 z-20 border-r border-slate-200">1. N°</th>
                <th className="px-3 py-3 min-w-[160px] border-r border-slate-200">2. Intitulé projet (DAO)</th>
                <th className="px-3 py-3 border-r border-slate-200">3. Financement</th>
                <th className="px-3 py-3 border-r border-slate-200">4. Imputation (Attest. DF)</th>
                
                <th className="px-3 py-3 border-r border-slate-200 text-center">5. Saisine prév. CIPM</th>
                <th className="px-3 py-3 border-r border-slate-200 text-center">6. Saisine CIPM*</th>
                <th className="px-3 py-3 border-r border-slate-200 text-center">7. Examen DAO CIPM*</th>
                <th className="px-3 py-3 border-r border-slate-200 text-center">8. Validation dossier (PV)</th>
                <th className="px-3 py-3 border-r border-slate-200 text-center bg-slate-100/50">9. ANO Bailleur*</th>

                <th className="px-3 py-3 border-r border-slate-200 text-center">10. Lancement AO*</th>
                <th className="px-3 py-3 border-r border-slate-200 text-center">11. Additif (Doc)</th>
                <th className="px-3 py-3 border-r border-slate-200 text-center">12. Dépouillement* (PV)</th>
                <th className="px-3 py-3 border-r border-slate-200 text-center">13. Valid. Éval. (PV)</th>
                <th className="px-3 py-3 border-r border-slate-200 text-center bg-slate-100/50">14. ANO bailleurs</th>
                <th className="px-3 py-3 border-r border-slate-200 text-center">15. Ouvertures Fin. (PV)</th>

                <th className="px-3 py-3 border-r border-slate-200 text-center">16. Infructueux</th>

                <th className="px-3 py-3 border-r border-slate-200 text-center">17. Prop. Attrib.* (PV)</th>
                <th className="px-3 py-3 border-r border-slate-200 text-center">18. Avis conforme CA*</th>
                <th className="px-3 py-3 border-r border-slate-200 text-center bg-slate-100/50">19. ANO Bailleurs*</th>
                <th className="px-3 py-3 border-r border-slate-200 text-center">20. Publication*</th>
                <th className="px-3 py-3 border-r border-slate-200 text-center">21. Notification Attrib.</th>

                <th className="px-3 py-3 border-r border-slate-200 min-w-[120px]">22. Titulaire</th>
                <th className="px-3 py-3 border-r border-slate-200">23. Montant TTC</th>

                <th className="px-3 py-3 border-r border-slate-200 text-center">24. Souscription*</th>
                <th className="px-3 py-3 border-r border-slate-200 text-center">25. Saisine Projet*</th>
                <th className="px-3 py-3 border-r border-slate-200 text-center">26. Examen Projet*</th>
                <th className="px-3 py-3 border-r border-slate-200 text-center">27. Validation (PV)</th>
                <th className="px-3 py-3 border-r border-slate-200 text-center bg-slate-100/50">28. ANO bailleurs*</th>
                <th className="px-3 py-3 border-r border-slate-200 text-center">29. Signature Marché</th>

                <th className="px-3 py-3 border-r border-slate-200 text-center min-w-[180px]">30. Annulé</th>

                <th className="px-3 py-3 border-r border-slate-200 text-center">31. Notification*</th>
                <th className="px-3 py-3 border-r border-slate-200 min-w-[180px]">32. Recours (Contentieux)</th>
                <th className="px-3 py-3">33. Etat d'avancement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMarches.length > 0 ? filteredMarches.map(m => {
                const isEDC = m.source_financement === SourceFinancement.BUDGET_EDC;
                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-3 py-2.5 sticky left-0 bg-white group-hover:bg-slate-50 z-20 border-r border-slate-100 font-black text-primary">
                      <Link to={`/markets/${m.id}`}>{m.id}</Link>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="truncate max-w-[120px] text-slate-700" title={m.objet}>{m.objet}</span>
                        <DocCell doc={m.docs?.dao} label="DAO" onUpload={(f) => handleDocUpload(m.id, 'dao', f)} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-slate-400 text-[8px]">{m.source_financement}</td>
                    <td className="px-3 py-2.5 border-r border-slate-100">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="font-mono text-slate-500">{m.imputation_budgetaire}</span>
                        <DocCell doc={m.docs?.imputation} label="Attest. DF" onUpload={(f) => handleDocUpload(m.id, 'imputation', f)} />
                      </div>
                    </td>

                    {/* 5-9. Préparation DAO */}
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.saisine_cipm_prev} onChange={(v) => handleUpdateDate(m.id, 'saisine_cipm_prev', v)} />
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.saisine_cipm} onChange={(v) => handleUpdateDate(m.id, 'saisine_cipm', v)} />
                        <DocCell doc={m.docs?.saisine} label="Saisine" onUpload={(f) => handleDocUpload(m.id, 'saisine', f)} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.examen_dao_cipm} onChange={(v) => handleUpdateDate(m.id, 'examen_dao_cipm', v)} />
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.validation_dao} onChange={(v) => handleUpdateDate(m.id, 'validation_dao', v)} />
                        <DocCell doc={m.docs?.validation_dao} label="PV" onUpload={(f) => handleDocUpload(m.id, 'validation_dao', f)} />
                      </div>
                    </td>
                    <td className={`px-3 py-2.5 border-r border-slate-100 text-center ${isEDC ? 'bg-slate-50' : ''}`}>
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin || isEDC} value={m.dates_realisees.ano_bailleur_dao} onChange={(v) => handleUpdateDate(m.id, 'ano_bailleur_dao', v)} />
                        <DocCell disabled={isEDC} doc={m.docs?.ano_bailleur_dao} label="ANO" onUpload={(f) => handleDocUpload(m.id, 'ano_bailleur_dao', f)} />
                      </div>
                    </td>

                    {/* 10-15. Consultation */}
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.lancement_ao} onChange={(v) => handleUpdateDate(m.id, 'lancement_ao', v)} />
                        <DocCell doc={m.docs?.lancement} label="Avis" onUpload={(f) => handleDocUpload(m.id, 'lancement', f)} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.additif} onChange={(v) => handleUpdateDate(m.id, 'additif', v)} />
                        <DocCell doc={m.docs?.additif} label="Doc" onUpload={(f) => handleDocUpload(m.id, 'additif', f)} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.depouillement} onChange={(v) => handleUpdateDate(m.id, 'depouillement', v)} />
                        <DocCell doc={m.docs?.depouillement} label="PV" onUpload={(f) => handleDocUpload(m.id, 'depouillement', f)} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.validation_eval_offres} onChange={(v) => handleUpdateDate(m.id, 'validation_eval_offres', v)} />
                        <DocCell doc={m.docs?.validation_eval_offres} label="PV" onUpload={(f) => handleDocUpload(m.id, 'validation_eval_offres', f)} />
                      </div>
                    </td>
                    <td className={`px-3 py-2.5 border-r border-slate-100 text-center ${isEDC ? 'bg-slate-50' : ''}`}>
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin || isEDC} value={m.dates_realisees.ano_bailleur_eval} onChange={(v) => handleUpdateDate(m.id, 'ano_bailleur_eval', v)} />
                        <DocCell disabled={isEDC} doc={m.docs?.ano_bailleur_eval} label="ANO" onUpload={(f) => handleDocUpload(m.id, 'ano_bailleur_eval', f)} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.ouverture_financiere} onChange={(v) => handleUpdateDate(m.id, 'ouverture_financiere', v)} />
                        <DocCell doc={m.docs?.ouverture_financiere} label="PV" onUpload={(f) => handleDocUpload(m.id, 'ouverture_financiere', f)} />
                      </div>
                    </td>

                    {/* 16. Infructueux */}
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <select disabled={!isAdmin} value={m.is_infructueux ? 'Oui' : 'Non'} onChange={(e) => handleUpdateField(m.id, 'is_infructueux', e.target.value === 'Oui')} className={`bg-white border rounded text-[7px] font-black outline-none ${m.is_infructueux ? 'text-red-600 border-red-200' : 'text-slate-400 border-slate-200'}`}>
                          <option value="Non">NON</option>
                          <option value="Oui">OUI</option>
                        </select>
                        {m.is_infructueux && <DocCell doc={m.doc_infructueux} label="Décision" onUpload={(f) => handleDocUpload(m.id, 'doc_infructueux', f, true)} />}
                      </div>
                    </td>

                    {/* 17-21. Attribution */}
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.prop_attrib_cipm} onChange={(v) => handleUpdateDate(m.id, 'prop_attrib_cipm', v)} />
                        <DocCell doc={m.docs?.prop_attrib_cipm} label="PV" onUpload={(f) => handleDocUpload(m.id, 'prop_attrib_cipm', f)} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.avis_conforme_ca} onChange={(v) => handleUpdateDate(m.id, 'avis_conforme_ca', v)} />
                        <DocCell doc={m.docs?.avis_conforme_ca} label="Avis" onUpload={(f) => handleDocUpload(m.id, 'avis_conforme_ca', f)} />
                      </div>
                    </td>
                    <td className={`px-3 py-2.5 border-r border-slate-100 text-center ${isEDC ? 'bg-slate-50' : ''}`}>
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin || isEDC} value={m.dates_realisees.ano_bailleur_attrib} onChange={(v) => handleUpdateDate(m.id, 'ano_bailleur_attrib', v)} />
                        <DocCell disabled={isEDC} doc={m.docs?.ano_bailleur_attrib} label="ANO" onUpload={(f) => handleDocUpload(m.id, 'ano_bailleur_attrib', f)} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.publication} onChange={(v) => handleUpdateDate(m.id, 'publication', v)} />
                        <DocCell doc={m.docs?.publication} label="Décis." onUpload={(f) => handleDocUpload(m.id, 'publication', f)} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.notification_attrib} onChange={(v) => handleUpdateDate(m.id, 'notification_attrib', v)} />
                        <DocCell doc={m.docs?.notification_attrib} label="Notif." onUpload={(f) => handleDocUpload(m.id, 'notification_attrib', f)} />
                      </div>
                    </td>

                    {/* 22-23. Titulaire & Montant */}
                    <td className="px-3 py-2.5 border-r border-slate-100"><input type="text" disabled={!isAdmin} value={m.titulaire || ''} onChange={(e) => handleUpdateField(m.id, 'titulaire', e.target.value)} className="bg-transparent outline-none w-full hover:bg-slate-100 px-1 rounded uppercase text-[8px]" /></td>
                    <td className="px-3 py-2.5 border-r border-slate-100"><input type="number" disabled={!isAdmin} value={m.montant_ttc_reel || ''} onChange={(e) => handleUpdateField(m.id, 'montant_ttc_reel', parseInt(e.target.value))} className="bg-transparent outline-none w-16 hover:bg-slate-100 px-1 rounded font-mono text-[8px]" /></td>

                    {/* 24-29. Contractualisation */}
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center"><AdminDateInput disabled={!isAdmin} value={m.dates_realisees.souscription_projet} onChange={(v) => handleUpdateDate(m.id, 'souscription_projet', v)} /></td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.saisine_cipm_projet} onChange={(v) => handleUpdateDate(m.id, 'saisine_cipm_projet', v)} />
                        <DocCell doc={m.docs?.saisine_projet} label="Saisine" onUpload={(f) => handleDocUpload(m.id, 'saisine_projet', f)} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center"><AdminDateInput disabled={!isAdmin} value={m.dates_realisees.examen_projet_cipm} onChange={(v) => handleUpdateDate(m.id, 'examen_projet_cipm', v)} /></td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.validation_projet} onChange={(v) => handleUpdateDate(m.id, 'validation_projet', v)} />
                        <DocCell doc={m.docs?.validation_projet} label="PV" onUpload={(f) => handleDocUpload(m.id, 'validation_projet', f)} />
                      </div>
                    </td>
                    <td className={`px-3 py-2.5 border-r border-slate-100 text-center ${isEDC ? 'bg-slate-50' : ''}`}>
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin || isEDC} value={m.dates_realisees.ano_bailleur_projet} onChange={(v) => handleUpdateDate(m.id, 'ano_bailleur_projet', v)} />
                        <DocCell disabled={isEDC} doc={m.docs?.ano_bailleur_projet} label="ANO" onUpload={(f) => handleDocUpload(m.id, 'ano_bailleur_projet', f)} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.signature_marche} onChange={(v) => handleUpdateDate(m.id, 'signature_marche', v)} />
                        <DocCell doc={m.docs?.signature_marche} label="Marché" onUpload={(f) => handleDocUpload(m.id, 'signature_marche', f)} />
                      </div>
                    </td>

                    {/* 30. Annulé */}
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center min-w-[200px]">
                      <div className="flex flex-col gap-1.5">
                        <select 
                          disabled={!isAdmin} 
                          value={m.is_annule ? 'Oui' : 'Non'} 
                          onChange={(e) => handleUpdateField(m.id, 'is_annule', e.target.value === 'Oui')} 
                          className={`bg-white border rounded text-[7px] font-black outline-none w-full ${m.is_annule ? 'text-amber-600 border-amber-200' : 'text-slate-400 border-slate-200'}`}
                        >
                          <option value="Non">NON</option>
                          <option value="Oui">OUI (ANNULÉ)</option>
                        </select>
                        
                        {m.is_annule && (
                          <div className="animate-in slide-in-from-top-1 fade-in duration-200 space-y-1">
                             <input 
                               type="text" 
                               disabled={!isAdmin}
                               placeholder="Motif..." 
                               value={m.motif_annulation || ''} 
                               onChange={(e) => handleUpdateField(m.id, 'motif_annulation', e.target.value)}
                               className="w-full bg-amber-50 border-none rounded px-1.5 py-1 text-[8px] font-bold text-amber-800 placeholder:text-amber-300 outline-none"
                             />
                             <div className="flex justify-end">
                               <DocCell doc={m.doc_annulation_ca} label="Accord CA" onUpload={(f) => handleDocUpload(m.id, 'doc_annulation_ca', f, true)} />
                             </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 31. Notification */}
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center"><AdminDateInput disabled={!isAdmin} value={m.dates_realisees.notification} onChange={(v) => handleUpdateDate(m.id, 'notification', v)} /></td>
                    
                    {/* 32. RECOURS */}
                    <td className="px-3 py-2.5 border-r border-slate-100 min-w-[150px]">
                      <div className="flex flex-col gap-1.5">
                        <select 
                          disabled={!isAdmin} 
                          value={m.has_recours ? 'Oui' : 'Non'} 
                          onChange={(e) => handleUpdateField(m.id, 'has_recours', e.target.value === 'Oui')}
                          className={`bg-white border rounded text-[7px] font-black outline-none w-full ${m.has_recours ? 'text-orange-600 border-orange-200' : 'text-slate-400 border-slate-200'}`}
                        >
                          <option value="Non">NON</option>
                          <option value="Oui">CONTENTIEUX</option>
                        </select>
                        
                        {/* Si Recours = OUI, on affiche les champs détails */}
                        {m.has_recours && (
                          <div className="animate-in slide-in-from-top-1 fade-in duration-200 space-y-1">
                             <input 
                               type="text" 
                               disabled={!isAdmin}
                               placeholder="Issue/Verdict..." 
                               value={m.recours_issue || ''} 
                               onChange={(e) => handleUpdateField(m.id, 'recours_issue', e.target.value)}
                               className="w-full bg-orange-50 border-none rounded px-1.5 py-1 text-[8px] font-bold text-orange-800 placeholder:text-orange-300 outline-none"
                             />
                             <div className="flex justify-end">
                               <DocCell doc={m.doc_recours} label="Pièce" onUpload={(f) => handleDocUpload(m.id, 'doc_recours', f, true)} />
                             </div>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-2.5 bg-primary/5 text-primary text-[8px] uppercase">{m.etat_avancement}</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={33} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <Layers size={48} className="mb-4 opacity-50" />
                      <p className="text-xs font-black uppercase tracking-widest">Aucun marché trouvé pour ces critères</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-400">
           <div className="flex items-center gap-6">
             <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-primary" /> Mode {isAdmin ? 'Administrateur : Modification active' : 'Consultation : Lecture seule'}</span>
             <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-500" /> Registre Officiel EDC S.A.</span>
           </div>
           <p className="italic">Synchronisation PPM & Suivi temps réel active</p>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;