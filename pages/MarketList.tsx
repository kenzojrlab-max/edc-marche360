// pages/MarketList.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  Search, Download, Filter, Clock, Calendar, 
  Plus, FileSpreadsheet, X, FileText, FileUp, 
  ChevronDown, Building2, Landmark, ShieldCheck, Check, Layers, ArrowRight, FileCheck, AlertCircle,
  Activity, Save, Upload, Info, Eye, Briefcase, FileSignature, Lock, AlertOctagon, CheckCircle2
} from 'lucide-react';
import { formatFCFA, calculateDaysBetween } from '../services/mockData';
import { JalonPassationKey, SourceFinancement, StatutGlobal, Marche, Projet } from '../types';
import { useMarkets } from '../contexts/MarketContext'; 
import { CustomBulleSelect } from '../components/CommonComponents';

const today = new Date().toISOString().split('T')[0];

// --- COMPOSANT MODAL (CORRIGÉ : Autonome avec son propre accès au contexte) ---
const ExecutionViewModal = ({ type, market, onClose }: { type: 'DECOMPTES' | 'AVENANTS' | 'RESILIATION', market: Marche, onClose: () => void }) => {
  const { updateMarche } = useMarkets(); // Accès direct au contexte pour sauvegarder

  // Fonction de mise à jour locale à la modale
  const handleLocalDocUpload = (docField: string, file: File, isAvenantOrDecompteId?: string) => {
      const fakeUrl = URL.createObjectURL(file);
      const newDoc = { nom: file.name, url: fakeUrl, date_upload: new Date().toISOString().split('T')[0] };
      
      let updatedMarket = { ...market };

      // Logique spécifique selon le type
      if (type === 'DECOMPTES' && isAvenantOrDecompteId) {
          updatedMarket.execution.decomptes = updatedMarket.execution.decomptes.map(d => 
              d.id === isAvenantOrDecompteId ? { ...d, doc: newDoc } : d
          );
      } else if (type === 'AVENANTS' && isAvenantOrDecompteId) {
          updatedMarket.execution.avenants = updatedMarket.execution.avenants.map(a => 
              a.id === isAvenantOrDecompteId ? { ...a, [docField]: newDoc } : a
          );
      } else {
          // Résiliation ou champs directs
          updatedMarket.execution = { ...updatedMarket.execution, [docField]: newDoc };
      }
      
      updateMarche(updatedMarket);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
           <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg ${type === 'RESILIATION' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                {type === 'RESILIATION' ? <AlertOctagon size={20} /> : <Layers size={20} />}
             </div>
             <div>
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Détails {type}</h3>
               <p className="text-[10px] text-slate-500 font-bold">Marché : {market.id}</p>
             </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
           {type === 'DECOMPTES' && (
             <div className="space-y-4">
                {market.execution.decomptes.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 italic text-xs font-bold bg-slate-50 rounded-xl border border-dashed border-slate-200">Aucun décompte enregistré.</div>
                ) : (
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-slate-50 text-slate-500 font-black uppercase">
                        <tr><th className="px-4 py-3 border-b border-slate-100">N°</th><th className="px-4 py-3 border-b border-slate-100">Objet</th><th className="px-4 py-3 border-b border-slate-100 text-right">Montant</th><th className="px-4 py-3 border-b border-slate-100 text-center">Pièce</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {market.execution.decomptes.map((d) => (
                          <tr key={d.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-700">{d.numero}</td><td className="px-4 py-3 font-medium text-slate-600">{d.objet}</td><td className="px-4 py-3 text-right font-mono text-emerald-600 font-black">{formatFCFA(d.montant)}</td>
                            <td className="px-4 py-3 text-center"><DocCellInline doc={d.doc} label="Pièce" onUpload={(f:File) => handleLocalDocUpload('doc', f, d.id)} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
             </div>
           )}
           {type === 'AVENANTS' && (
             <div className="space-y-4">
                {!market.execution.has_avenant || market.execution.avenants.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 italic text-xs font-bold bg-slate-50 rounded-xl border border-dashed border-slate-200">Aucun avenant enregistré.</div>
                ) : (
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-slate-50 text-slate-500 font-black uppercase">
                        <tr><th className="px-4 py-3 border-b border-slate-100">Réf</th><th className="px-4 py-3 border-b border-slate-100">Objet</th><th className="px-4 py-3 border-b border-slate-100 text-right">Incidence (+/-)</th><th className="px-4 py-3 border-b border-slate-100 text-center">Notif.</th><th className="px-4 py-3 border-b border-slate-100 text-center">OS</th><th className="px-4 py-3 border-b border-slate-100 text-center">Enreg.</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {market.execution.avenants.map((a) => (
                          <tr key={a.id} className="hover:bg-orange-50/30 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-700">{a.ref}</td><td className="px-4 py-3 font-medium text-slate-600">{a.objet}</td><td className="px-4 py-3 text-right font-mono text-slate-700 font-black">{formatFCFA(a.montant_inc_dec)}</td>
                            <td className="px-4 py-3 text-center"><DocCellInline doc={a.doc_notification} label="Notif" onUpload={(f:File) => handleLocalDocUpload('doc_notification', f, a.id)} /></td>
                            <td className="px-4 py-3 text-center"><DocCellInline doc={a.doc_os} label="OS" onUpload={(f:File) => handleLocalDocUpload('doc_os', f, a.id)} /></td>
                            <td className="px-4 py-3 text-center"><DocCellInline doc={a.doc_enregistrement} label="Enreg." onUpload={(f:File) => handleLocalDocUpload('doc_enregistrement', f, a.id)} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
             </div>
           )}
           {type === 'RESILIATION' && (
             <div className="space-y-6">
               {!market.execution.is_resilie ? (
                 <div className="text-center py-12 bg-emerald-50 rounded-[1.5rem] border border-emerald-100"><CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" /><p className="text-emerald-800 font-black text-sm uppercase tracking-widest">Aucune procédure de résiliation en cours</p></div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center text-center group hover:border-red-200 transition-all"><div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black text-xs mb-4">1</div><h4 className="text-xs font-black uppercase text-slate-700 mb-4 tracking-wide">Mise en Demeure</h4><div className="w-full mt-2"><DocCellInline doc={market.execution.doc_mise_en_demeure} label="Preuve" onUpload={(f:File) => handleLocalDocUpload('doc_mise_en_demeure', f)} /></div></div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center text-center group hover:border-red-200 transition-all"><div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black text-xs mb-4">2</div><h4 className="text-xs font-black uppercase text-slate-700 mb-4 tracking-wide">Constat Carence</h4><div className="w-full mt-2"><DocCellInline doc={market.execution.doc_constat_carence} label="Constat" onUpload={(f:File) => handleLocalDocUpload('doc_constat_carence', f)} /></div></div>
                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col items-center text-center shadow-inner"><div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-black text-xs mb-4 shadow-lg shadow-red-200">3</div><h4 className="text-xs font-black uppercase text-red-800 mb-4 tracking-wide">Décision Résiliation</h4><div className="w-full mt-2"><DocCellInline doc={market.execution.doc_decision_resiliation} label="Décision" onUpload={(f:File) => handleLocalDocUpload('doc_decision_resiliation', f)} /></div></div>
                 </div>
               )}
             </div>
           )}
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
           <button onClick={onClose} className="px-8 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">Fermer</button>
        </div>
      </div>
    </div>
  );
};

// --- HELPERS UI ---
const DocCellInline = ({ doc, label, readOnly, onUpload, disabled }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleClick = (e: React.MouseEvent) => { e.stopPropagation(); if (!readOnly && !disabled) fileInputRef.current?.click(); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files.length > 0) { if (onUpload) onUpload(e.target.files[0]); e.target.value = ''; } };
  if (disabled) return (<div className="flex items-center ml-auto flex-shrink-0 opacity-20 pointer-events-none"><span className="w-4 h-4 flex items-center justify-center bg-slate-100 rounded text-[8px] text-slate-400">/</span></div>);
  return (
    <div className="flex items-center justify-center w-full">
      {doc && (<a href={doc.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} title={`Télécharger ${label}`} className="p-1 rounded border bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 shadow-sm flex items-center justify-center transition-all hover:scale-110"><Download size={10} /></a>)}
      {readOnly && !doc && (<div className="p-1 rounded border border-slate-300 flex items-center justify-center opacity-30"><Download size={10} /></div>)}
      {!readOnly && (<><input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.xlsx,.jpg,.png" /><button type="button" onClick={handleClick} title={doc ? `Remplacer ${label}` : `Téléverser ${label}`} className={`p-1 rounded border transition-all flex items-center justify-center group/btn ${doc ? 'bg-white text-slate-400 border-slate-200 hover:text-blue-600 hover:border-blue-300' : 'bg-slate-50 text-slate-400 border-dashed border-slate-300 hover:text-primary hover:border-primary hover:bg-blue-50'}`}><Upload size={10} className="group-hover/btn:scale-110 transition-transform" /></button></>)}
    </div>
  );
};

const InlineField = ({ label, number, children, disabled }: any) => (
  <div className={`flex flex-col space-y-0 p-1.5 rounded-md border transition-all min-w-0 ${disabled ? 'bg-slate-50 border-slate-100 opacity-40 grayscale' : 'bg-white border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:bg-slate-50/80'}`}>
    <div className="flex items-center gap-1 mb-0.5">{number && <span className="text-[7px] font-black text-slate-300 flex-shrink-0">{number}.</span>}<span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter truncate" title={label}>{label}</span></div>
    <div className="min-h-[14px] flex items-center gap-1 overflow-hidden relative">{disabled ? <span className="text-[7px] font-black text-slate-300 italic">N/A (EDC)</span> : children}</div>
  </div>
);

const ReadOnlyValue = ({ value, isDate = false, isAmount = false }: { value?: any, isDate?: boolean, isAmount?: boolean }) => (
  <span className={`text-[8px] font-black uppercase truncate flex-1 min-w-0 ${!value ? 'text-slate-300 italic' : 'text-slate-700'} ${isDate || isAmount ? 'font-mono' : ''}`}>{isAmount && value ? formatFCFA(value) : (value || '—')}</span>
);

const BulleInput = ({ label, type = "text", value, onChange, placeholder, options, required, disabled, textarea, icon: Icon }: any) => (
    <div className={`flex flex-col space-y-1 ${disabled ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
      <div className="flex items-center space-x-1.5 bg-slate-100 rounded-[2.5rem] p-1.5 border border-slate-200/40 transition-all focus-within:bg-slate-200 focus-within:border-primary/20 group relative">
        <span className="text-[9px] font-black text-slate-400 px-2.5 uppercase tracking-tighter truncate w-24 flex-shrink-0" title={label}>{label}</span>
        <div className="flex-1 min-w-0 bg-white text-xs font-black text-slate-700 rounded-[2rem] shadow-sm py-2 px-4 flex items-center min-h-[46px] group-focus-within:ring-2 group-focus-within:ring-primary/20 transition-all">
          {Icon && <Icon size={14} className="mr-2 text-slate-300 flex-shrink-0" />}
          {options ? (<CustomBulleSelect value={value} onChange={onChange} options={options} placeholder="Choisir..." disabled={disabled} />) : textarea ? (<textarea value={value} onChange={onChange} required={required} placeholder={placeholder} rows={1} className="w-full bg-transparent border-none outline-none resize-none py-1 scrollbar-hide font-black placeholder:text-slate-300 text-[11px] leading-tight" />) : (<input type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} className="w-full bg-transparent border-none outline-none font-black placeholder:text-slate-300 text-[11px] min-w-0" />)}
        </div>
      </div>
    </div>
);

// --- PAGE PRINCIPALE ---
interface MarketListProps {
  mode: 'PPM' | 'ALL';
  readOnly?: boolean;
}

const MarketList: React.FC<MarketListProps> = ({ mode, readOnly = false }) => {
  const { marches, updateMarche, addMarche, projets, addProjet, updateProjet, fonctions, selectedYear, setSelectedYear, selectedProjetId, setSelectedProjetId } = useMarkets();
  const [searchParams] = useSearchParams();
  const [expandedMarketId, setExpandedMarketId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'PASSATION' | 'EXECUTION'>('PASSATION');
  const [viewModal, setViewModal] = useState<{ type: 'DECOMPTES' | 'AVENANTS' | 'RESILIATION', market: Marche } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [projectFormData, setProjectFormData] = useState({ libelle: '', source_financement: SourceFinancement.BUDGET_EDC, bailleur_nom: '', exercice: 2024 });
  const [formData, setFormData] = useState<Partial<Marche>>({ id: '', objet: '', fonction_parente: '', activite_parente: '', type_ao: '', type_prestation: '', montant_prevu: 0, delai_global_passation: 0, source_financement: SourceFinancement.BUDGET_EDC, bailleur_nom: '', imputation_budgetaire: '', dates_prevues: {} as any, statut_global: StatutGlobal.PLANIFIE, hors_ppm: false, exercice: 2024 });

  useEffect(() => {
    const targetId = searchParams.get('id');
    if (targetId && marches.length > 0) {
       const targetMarket = marches.find(m => m.id === targetId);
       if (targetMarket) {
          setSelectedYear(targetMarket.exercice);
          setSelectedProjetId(targetMarket.projet_id);
          setExpandedMarketId(targetMarket.id);
       }
    }
  }, [searchParams, marches, setSelectedYear, setSelectedProjetId]);

  useEffect(() => { setActiveTab('PASSATION'); }, [expandedMarketId]);

  const projectsDeAnnee = projets.filter(p => p.exercice === selectedYear);
  const currentProjet = projets.find(p => p.id === selectedProjetId);
  const marketsOfProjet = marches.filter(m => m.projet_id === selectedProjetId);

  const handleDocUpload = (marketId: string, docKey: string, file?: File, isSpecialDoc?: boolean) => {
    const targetMarket = marches.find(m => m.id === marketId);
    if (!targetMarket || !file) return;
    const fakeUrl = URL.createObjectURL(file);
    const mockPiece = { nom: file.name, url: fakeUrl, date_upload: new Date().toISOString().split('T')[0] };
    let updatedMarket = { ...targetMarket };
    if (isSpecialDoc) updatedMarket = { ...updatedMarket, [docKey]: mockPiece };
    else updatedMarket = { ...updatedMarket, docs: { ...updatedMarket.docs, [docKey]: mockPiece } };
    updateMarche(updatedMarket);
  };

  const handleExecutionDocUpload = (marketId: string, field: string, file: File) => {
    const targetMarket = marches.find(m => m.id === marketId);
    if (!targetMarket) return;
    const fakeUrl = URL.createObjectURL(file);
    const mockPiece = { nom: file.name, url: fakeUrl, date_upload: new Date().toISOString().split('T')[0] };
    const updatedMarket = { ...targetMarket, execution: { ...targetMarket.execution, [field]: mockPiece } };
    updateMarche(updatedMarket);
  };

  const handlePpmUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && currentProjet) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      updateProjet({ ...currentProjet, ppm_pdf_url: url });
      alert("PPM signé chargé avec succès !");
      e.target.value = ''; 
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `PROJ_${Date.now()}`;
    const newProjet: Projet = { id: newId, libelle: projectFormData.libelle, source_financement: projectFormData.source_financement, bailleur_nom: projectFormData.source_financement === SourceFinancement.BAILLEUR ? projectFormData.bailleur_nom : undefined, exercice: projectFormData.exercice, date_creation: new Date().toISOString().split('T')[0] };
    addProjet(newProjet);
    setSelectedYear(projectFormData.exercice);
    setSelectedProjetId(newId);
    setIsProjectModalOpen(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjetId) return;
    const newMarket: Marche = { ...formData as Marche, id: formData.id || `M-${Date.now()}`, projet_id: selectedProjetId, exercice: selectedYear, source_financement: currentProjet?.source_financement || SourceFinancement.BUDGET_EDC, bailleur_nom: currentProjet?.bailleur_nom, statut_global: StatutGlobal.PLANIFIE, hors_ppm: false, docs: {}, is_infructueux: false, is_annule: false, recours: 'Néant', etat_avancement: 'Inscrit au PPM', dates_realisees: {} as any, execution: { decomptes: [], avenants: [], type_retenue_garantie: 'OPTION_A', has_avenant: false, is_resilie: false } };
    addMarche(newMarket);
    setIsModalOpen(false);
  };

  const downloadExcelTemplate = () => {
    const headers = ["N° Dossier", "Objet Marché", "Fonction", "Activité", "Type AO", "Prestation", "Imputation", "Budget FCFA", "Délai Global (jours)", ...jalonCols.map(j => j.label)];
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gabarit PPM");
    XLSX.writeFile(wb, `Modèle_PPM_${currentProjet?.libelle || 'Nouveau'}.xlsx`);
  };

  const handleExcelImport = () => {
    if (!excelFile || !selectedProjetId) { if(!selectedProjetId) alert("Veuillez sélectionner un projet avant d'importer."); return; }
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0]; 
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        let importedCount = 0;
        const formatExcelDate = (val: any) => {
            if (!val) return undefined;
            if (val instanceof Date) { const year = val.getFullYear(); const month = String(val.getMonth() + 1).padStart(2, '0'); const day = String(val.getDate()).padStart(2, '0'); return `${year}-${month}-${day}`; }
            if (typeof val === 'number') { const date = new Date(Math.round((val - 25569) * 86400 * 1000)); const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); return `${year}-${month}-${day}`; }
            return String(val); 
        };
        jsonData.forEach((row: any) => {
            const newMarket: Marche = {
                id: String(row["N° Dossier"] || `M-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`), objet: String(row["Objet Marché"] || "Objet non spécifié"), fonction_parente: String(row["Fonction"] || "Non définie"), activite_parente: String(row["Activité"] || ""), type_ao: String(row["Type AO"] || "AONO"), type_prestation: String(row["Prestation"] || "Services"), imputation_budgetaire: String(row["Imputation"] || "N/A"), montant_prevu: parseInt(row["Budget FCFA"]) || 0, delai_global_passation: parseInt(row["Délai Global (jours)"]) || 0, projet_id: selectedProjetId, exercice: selectedYear, source_financement: currentProjet?.source_financement || SourceFinancement.BUDGET_EDC, bailleur_nom: currentProjet?.bailleur_nom, statut_global: StatutGlobal.PLANIFIE, hors_ppm: false, docs: {}, is_infructueux: false, is_annule: false, recours: 'Néant', has_recours: false, etat_avancement: 'Inscrit au PPM',
                dates_prevues: { saisine_cipm: formatExcelDate(row["Saisine CIPM"]), examen_dao_cipm: formatExcelDate(row["Examen DAO"]), ano_bailleur_dao: formatExcelDate(row["ANO Bailleur (DAO)"]), lancement_ao: formatExcelDate(row["Lancement AO"]), depouillement: formatExcelDate(row["Dépouillement"]), prop_attrib_cipm: formatExcelDate(row["Prop. Attribution"]), avis_conforme_ca: formatExcelDate(row["Avis CA"]), ano_bailleur_attrib: formatExcelDate(row["ANO Bailleur (Attrib)"]), publication: formatExcelDate(row["Publication"]), souscription_projet: formatExcelDate(row["Souscription"]), saisine_cipm_projet: formatExcelDate(row["Saisine Projet"]), examen_projet_cipm: formatExcelDate(row["Examen Projet"]), ano_bailleur_projet: formatExcelDate(row["ANO Bailleur (Projet)"]), signature_marche: formatExcelDate(row["Signature"]), notification: formatExcelDate(row["Notification"]), saisine_cipm_prev: undefined, validation_dao: undefined, additif: undefined, validation_eval_offres: undefined, ano_bailleur_eval: undefined, ouverture_financiere: undefined, notification_attrib: undefined, validation_projet: undefined, },
                dates_realisees: { saisine_cipm_prev: undefined, saisine_cipm: undefined, examen_dao_cipm: undefined, validation_dao: undefined, ano_bailleur_dao: undefined, lancement_ao: undefined, additif: undefined, depouillement: undefined, validation_eval_offres: undefined, ano_bailleur_eval: undefined, ouverture_financiere: undefined, prop_attrib_cipm: undefined, avis_conforme_ca: undefined, ano_bailleur_attrib: undefined, publication: undefined, notification_attrib: undefined, souscription_projet: undefined, saisine_cipm_projet: undefined, examen_projet_cipm: undefined, validation_projet: undefined, ano_bailleur_projet: undefined, signature_marche: undefined, notification: undefined },
                execution: { decomptes: [], avenants: [], type_retenue_garantie: 'OPTION_A', has_avenant: false, is_resilie: false }
            };
            addMarche(newMarket);
            importedCount++;
        });
        alert(`${importedCount} ligne(s) importée(s) avec succès dans le projet ${currentProjet?.libelle} !`);
      } catch (error) { console.error("Erreur import Excel:", error); alert("Erreur lors de la lecture du fichier Excel. Vérifiez le format."); } finally { setIsImporting(false); setIsExcelModalOpen(false); setExcelFile(null); }
    };
    reader.readAsBinaryString(excelFile);
  };

  const jalonCols: { key: JalonPassationKey; label: string }[] = [ { key: 'saisine_cipm', label: 'Saisine CIPM' }, { key: 'examen_dao_cipm', label: 'Examen DAO' }, { key: 'ano_bailleur_dao', label: 'ANO Bailleur (DAO)' }, { key: 'lancement_ao', label: 'Lancement AO' }, { key: 'depouillement', label: 'Dépouillement' }, { key: 'prop_attrib_cipm', label: 'Prop. Attribution' }, { key: 'avis_conforme_ca', label: 'Avis CA' }, { key: 'ano_bailleur_attrib', label: 'ANO Bailleur (Attrib)' }, { key: 'publication', label: 'Publication' }, { key: 'souscription_projet', label: 'Souscription' }, { key: 'saisine_cipm_projet', label: 'Saisine Projet' }, { key: 'examen_projet_cipm', label: 'Examen Projet' }, { key: 'ano_bailleur_projet', label: 'ANO Bailleur (Projet)' }, { key: 'signature_marche', label: 'Signature' }, { key: 'notification', label: 'Notification' } ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
            {readOnly ? 'Plan de Passation des Marchés' : (mode === 'PPM' ? 'Gestion de la Programmation' : 'Suivi des Marchés')}
          </h1>
        </div>
        {!readOnly && (
          <button onClick={() => setIsProjectModalOpen(true)} className="flex items-center px-8 py-4 bg-slate-900 text-white rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-900/10 whitespace-nowrap">
            <Plus size={16} className="mr-2" /> Créer un nouveau Projet
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 flex-wrap bg-white p-3 rounded-[1.5rem] border border-slate-200 shadow-sm mt-2">
          <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/50 min-w-[120px]">
             <CustomBulleSelect value={selectedYear.toString()} onChange={(e: any) => setSelectedYear(parseInt(e.target.value))} options={[{ value: '2024', label: '2024' }, { value: '2025', label: '2025' }, { value: '2026', label: '2026' }]} placeholder="Année" />
          </div>
          <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/50 min-w-[200px] max-w-xs">
             <CustomBulleSelect value={selectedProjetId} onChange={(e: any) => setSelectedProjetId(e.target.value)} options={[{ value: '', label: 'Tous les Projets' }, ...projectsDeAnnee.map(p => ({ value: p.id, label: p.libelle }))]} placeholder="Tous les Projets" />
          </div>
          {readOnly && (<><div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2 animate-pulse"><Info size={14} className="text-primary" /> Double-cliquez pour accéder au téléchargement</p></>)}
      </div>

      {!selectedProjetId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsDeAnnee.length > 0 ? projectsDeAnnee.map(p => (
            <div key={p.id} onClick={() => setSelectedProjetId(p.id)} className={`cursor-pointer p-8 rounded-[3rem] border-2 transition-all flex flex-col justify-between h-48 shadow-sm hover:shadow-xl group ${selectedProjetId === p.id ? 'bg-primary border-primary text-white scale-105 shadow-primary/30' : 'bg-white border-slate-100 text-slate-700 hover:border-primary/20'}`}>
              <div><div className="flex items-center justify-between mb-2"><span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${selectedProjetId === p.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>{p.source_financement === SourceFinancement.BAILLEUR ? `BAILLEUR (${p.bailleur_nom})` : 'BUDGET EDC'}</span><Layers size={18} className={selectedProjetId === p.id ? 'text-white/40' : 'text-slate-200 group-hover:text-primary/40'} /></div><h3 className="text-base font-black uppercase leading-tight">{p.libelle}</h3></div>
              <div className="flex items-center justify-between pt-4"><span className="text-[9px] font-black uppercase tracking-tighter opacity-60">Projet #{p.id.split('_').pop()}</span><div className={`p-2 rounded-full ${selectedProjetId === p.id ? 'bg-white text-primary shadow-lg' : 'bg-slate-50 text-slate-300'}`}><ArrowRight size={14} /></div></div>
            </div>
          )) : (
            <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 text-center"><Layers size={48} className="mx-auto text-slate-200 mb-4" /><p className="text-slate-400 font-black uppercase tracking-widest text-xs">Aucun projet initialisé pour {selectedYear}</p></div>
          )}
        </div>
      )}

      {selectedProjetId && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-t-2 border-slate-100 pt-8 gap-4">
             <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/10 text-primary rounded-[1.5rem]"><FileText size={24} /></div>
                <div><h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{readOnly ? 'Plan de Passation' : 'Marchés Inscrits au PPM'} : {currentProjet?.libelle}</h2><div className="flex items-center gap-3 mt-1"><p className="text-slate-400 text-[10px] font-black uppercase">Source : {currentProjet?.source_financement} {currentProjet?.bailleur_nom ? `(${currentProjet.bailleur_nom})` : ''}</p>{currentProjet && (<><div className="h-3 w-px bg-slate-300"></div>{!readOnly ? (<div className="relative group"><input type="file" id="upload-ppm-signed" className="hidden" accept=".pdf" onChange={handlePpmUpload} /><label htmlFor="upload-ppm-signed" className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-[9px] font-black uppercase cursor-pointer transition-all ${currentProjet.ppm_pdf_url ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-white text-slate-400 border-dashed border-slate-300 hover:text-primary hover:border-primary'}`}><Upload size={12} />{currentProjet.ppm_pdf_url ? 'Remplacer PPM Signé' : 'Uploader PPM Signé'}</label></div>) : (currentProjet.ppm_pdf_url ? (<a href={currentProjet.ppm_pdf_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-600 text-white shadow-md shadow-emerald-200 hover:scale-105 transition-transform text-[9px] font-black uppercase"><Download size={12} /> Télécharger PPM Signé</a>) : (<span className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 text-slate-400 border border-slate-200 text-[9px] font-black uppercase"><FileText size={12} /> PPM non disponible</span>))}</>)}{!readOnly && currentProjet?.ppm_pdf_url && (<a href={currentProjet.ppm_pdf_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-100 text-emerald-600 border border-emerald-200 hover:bg-emerald-200 transition-all text-[9px] font-black uppercase"><Eye size={12} /> Voir</a>)}</div></div>
             </div>
             {!readOnly && (<div className="flex items-center gap-3"><button onClick={() => setIsExcelModalOpen(true)} className="px-8 py-4 bg-slate-800 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 shadow-xl shadow-slate-900/10 transition-all flex items-center"><FileSpreadsheet size={16} className="mr-2" /> Importer Excel</button><button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-primary text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-blue-900 shadow-xl shadow-primary/20 transition-all flex items-center"><Plus size={16} className="mr-2" /> Saisie Manuelle</button></div>)}
          </div>
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
             <div className="overflow-x-auto custom-scrollbar">
               <table className="w-full text-left text-[11px] whitespace-nowrap border-collapse">
                 <thead>
                    <tr className="bg-slate-50 text-slate-400 font-black uppercase tracking-wider border-b border-slate-100"><th colSpan={6} className="px-6 py-4 border-r border-slate-100 text-center">Informations Générales</th>{jalonCols.map(jalon => (<th key={`h-jalon-${jalon.key}`} colSpan={2} className="px-4 py-4 text-center border-r border-slate-100 bg-blue-50/20 text-blue-800 uppercase">{jalon.label}</th>))}<th colSpan={2} className="px-6 py-4 text-center bg-slate-100 text-primary uppercase font-black border-l border-slate-200">Synthèse Délais</th></tr>
                    <tr className="bg-white text-slate-500 font-black uppercase border-b border-slate-100"><th className="px-6 py-4 border-r border-slate-100 sticky left-0 bg-white z-10 shadow-sm">N°</th><th className="px-6 py-4 border-r border-slate-100">Désignation</th><th className="px-6 py-4 border-r border-slate-100">Analytique</th><th className="px-6 py-4 text-right border-r border-slate-100">Montant (FCFA)</th><th className="px-6 py-4 border-r border-slate-100">Imputation</th><th className="px-6 py-4 border-r border-slate-100 text-center">Statut</th>{jalonCols.map(jalon => (<React.Fragment key={`subh-${jalon.key}`}><th className="px-4 py-4 text-center border-r border-slate-50 bg-blue-50/10 text-[9px] text-blue-600">Prévue</th><th className="px-4 py-4 text-center border-r border-slate-100 bg-emerald-50/10 text-[9px] text-emerald-600">Réelle</th></React.Fragment>))}<th className="px-4 py-4 border-l border-slate-200 text-center bg-slate-50 font-black text-primary">Prévu</th><th className="px-4 py-4 border-l border-slate-50 text-center bg-emerald-50 font-black text-emerald-700">Réel</th></tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {marketsOfProjet.length > 0 ? marketsOfProjet.map(m => {
                     const isExpanded = expandedMarketId === m.id;
                     const delaiReel = calculateDaysBetween(m.dates_realisees.saisine_cipm, m.dates_realisees.signature_marche);
                     const isExecutionLocked = !m.dates_realisees.signature_marche;
                     return (
                       <React.Fragment key={m.id}>
                         <tr onDoubleClick={readOnly ? () => setExpandedMarketId(isExpanded ? null : m.id) : undefined} className={`hover:bg-blue-50/30 group transition-colors select-none ${isExpanded ? 'bg-primary/5' : ''} ${readOnly ? 'cursor-pointer' : ''}`}>
                            <td className={`px-6 py-4 font-black text-slate-900 underline underline-offset-4 decoration-slate-200 sticky left-0 z-10 shadow-sm ${isExpanded ? 'bg-slate-50' : 'bg-white group-hover:bg-slate-50'}`}><Link to={`/markets/${m.id}`}>{m.id}</Link></td>
                            <td className="px-6 py-4 font-bold text-slate-700 truncate max-w-xs">{m.objet}</td>
                            <td className="px-6 py-4 text-slate-400 font-bold italic truncate max-w-[150px]">{m.fonction_parente}</td>
                            <td className="px-6 py-4 text-right font-mono font-black text-slate-900 border-r border-slate-100">{formatFCFA(m.montant_prevu)}</td>
                            <td className="px-6 py-4 font-mono text-slate-400 border-r border-slate-100">{m.imputation_budgetaire}</td>
                            <td className="px-6 py-4 border-r border-slate-100 text-center"><span className="text-[9px] font-black px-2 py-0.5 bg-blue-50 text-primary rounded-full uppercase">{m.statut_global}</span></td>
                            {jalonCols.map(jalon => {
                              const isAno = jalon.key.toLowerCase().includes('ano');
                              const displayDisabled = isAno && m.source_financement === SourceFinancement.BUDGET_EDC;
                              const prevue = m.dates_prevues[jalon.key];
                              const realisee = m.dates_realisees[jalon.key];
                              let realClass = ''; let realContent = realisee || '—';
                              if (displayDisabled) { realClass = 'text-slate-200 bg-slate-50/50'; realContent = 'N/A'; } else if (realisee) { if (prevue && new Date(realisee) > new Date(prevue)) { realClass = 'text-red-500 bg-red-50/10'; } else { realClass = 'text-emerald-600 bg-emerald-50/10'; } } else { if (prevue && new Date(today) > new Date(prevue)) { realClass = 'text-red-600 bg-red-100 font-bold border border-red-200 animate-pulse'; realContent = 'EN RETARD'; } else { realClass = 'text-slate-200'; } }
                              return (<React.Fragment key={`val-${m.id}-${jalon.key}`}><td className={`px-4 py-4 text-center border-r border-slate-50 font-mono text-[10px] ${displayDisabled ? 'text-slate-200 bg-slate-50/50' : 'text-slate-400 bg-blue-50/5'}`}>{displayDisabled ? 'N/A' : (prevue || '—')}</td><td className={`px-4 py-4 text-center border-r border-slate-100 font-mono text-[10px] font-black ${realClass}`}>{realContent === 'EN RETARD' && <AlertCircle size={10} className="inline mr-1" />}{realContent}</td></React.Fragment>);
                            })}
                            <td className="px-4 py-4 text-center font-black text-primary bg-primary/5 border-l border-slate-200">{m.delai_global_passation || '—'}</td>
                            <td className="px-4 py-4 text-center font-black text-emerald-700 bg-emerald-50/10 border-l border-slate-50">{delaiReel !== null ? delaiReel : '—'}</td>
                         </tr>
                         {isExpanded && readOnly && (<tr className="bg-slate-50/60"><td colSpan={6 + (jalonCols.length * 2) + 2} className="px-2 py-1.5"><div className="bg-white rounded-lg border border-primary/10 shadow-lg overflow-hidden animate-in slide-in-from-top-1 duration-200"><div className="bg-primary/5 px-4 py-1 border-b border-primary/10 flex items-center justify-between"><div className="flex items-center gap-4"><div className="flex items-center gap-2 text-primary font-black uppercase text-[8px] tracking-widest"><Activity size={10} /> Registre de Pilotage (Téléchargement) : {m.id}</div><div className="flex gap-1 ml-4 bg-white/50 p-0.5 rounded-lg border border-primary/5"><button onClick={() => setActiveTab('PASSATION')} className={`px-3 py-1 rounded-md text-[8px] font-black uppercase transition-all ${activeTab === 'PASSATION' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-primary'}`}><div className="flex items-center gap-1"><Briefcase size={8} /> Phase Passation</div></button><button onClick={() => !isExecutionLocked && setActiveTab('EXECUTION')} disabled={isExecutionLocked} title={isExecutionLocked ? "Date de signature requise dans le Suivi" : ""} className={`px-3 py-1 rounded-md text-[8px] font-black uppercase transition-all flex items-center gap-1 ${activeTab === 'EXECUTION' ? 'bg-emerald-600 text-white shadow-sm' : isExecutionLocked ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-emerald-600'}`}>{isExecutionLocked ? <Lock size={8} /> : <FileSignature size={8} />} Phase Exécution</button></div></div><button onClick={() => setExpandedMarketId(null)} className="p-0.5 hover:bg-primary/10 rounded text-primary"><X size={10} /></button></div><div className="p-1.5 min-h-[150px]"><ExecutionViewModal type={activeTab === 'EXECUTION' ? 'DECOMPTES' : 'AVENANTS'} market={m} onClose={() => setViewModal(null)} /></div></div></td></tr>)}
                       </React.Fragment>
                     );
                   }) : (
                     <tr><td colSpan={6 + (jalonCols.length * 2) + 2} className="px-6 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs italic">Aucune ligne inscrite dans ce PPM.</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      )}
      
      {/* AUTRES MODALES (IMPORT EXCEL, CRÉATION PROJET, AJOUT MARCHÉ) */}
      {isExcelModalOpen && !readOnly && (<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-visible"><div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-xl overflow-visible animate-in fade-in zoom-in duration-300"><div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"><div className="flex items-center gap-4"><div className="p-3 bg-slate-800 text-white rounded-2xl"><FileSpreadsheet size={24} /></div><h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Importation Excel PPM</h2></div><button onClick={() => setIsExcelModalOpen(false)} className="p-3 text-slate-400 hover:text-slate-800 rounded-2xl transition-all"><X size={24} /></button></div><div className="p-10 space-y-8"><div className="bg-blue-50/50 border border-blue-100 p-6 rounded-[2rem] flex items-start gap-4"><AlertCircle className="text-blue-600 mt-1 flex-shrink-0" size={20} /><p className="text-[11px] text-blue-700 font-black leading-relaxed uppercase">Veuillez charger un fichier .xlsx respectant le gabarit standard du PPM.</p></div><div className="relative group"><input type="file" accept=".xlsx, .xls" className="hidden" id="excel-file-upload" onChange={(e) => setExcelFile(e.target.files?.[0] || null)} /><label htmlFor="excel-file-upload" className="flex flex-col items-center justify-center w-full py-12 px-6 bg-slate-50 border-4 border-dashed border-slate-200 rounded-[3rem] cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all">{excelFile ? (<div className="flex flex-col items-center text-center"><FileCheck size={48} className="text-emerald-500 mb-4 animate-bounce" /><span className="text-xs font-black text-slate-800 uppercase">{excelFile.name}</span></div>) : (<div className="flex flex-col items-center text-center"><FileUp size={48} className="text-slate-300 mb-4 group-hover:text-primary transition-colors" /><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Choisir le fichier Excel</span></div>)}</label></div><div className="pt-2 flex flex-col gap-4"><button onClick={handleExcelImport} disabled={!excelFile || isImporting} className={`w-full py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center ${!excelFile || isImporting ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:scale-[1.02]'}`}>{isImporting ? "Importation..." : "Démarrer l'importation"}</button><button onClick={downloadExcelTemplate} className="text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:underline">Modèle Excel</button></div></div></div></div>)}
      {isProjectModalOpen && !readOnly && (<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-visible"><div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-xl overflow-visible animate-in fade-in zoom-in duration-300"><div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"><h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Nouveau Projet / Financement</h2><button onClick={() => setIsProjectModalOpen(false)} className="p-3 text-slate-400 hover:text-slate-800 rounded-2xl transition-all"><X size={24} /></button></div><form onSubmit={handleCreateProject} className="p-10 space-y-6"><BulleInput label="Libellé Projet" placeholder="Ex: Programme BM (P-123)" value={projectFormData.libelle} onChange={(e:any) => setProjectFormData({...projectFormData, libelle: e.target.value})} required /><BulleInput label="Financement" options={[{ value: SourceFinancement.BUDGET_EDC, label: 'Budget Propre EDC' }, { value: SourceFinancement.BAILLEUR, label: 'Financement Bailleur (EXT)' }]} value={projectFormData.source_financement} onChange={(e:any) => setProjectFormData({...projectFormData, source_financement: e.target.value})} />{projectFormData.source_financement === SourceFinancement.BAILLEUR && (<div className="animate-in slide-in-from-top-2 duration-300"><BulleInput label="Nom Bailleur" options={[{ value: 'BM', label: 'Banque Mondiale' }, { value: 'BAD', label: 'BAD' }, { value: 'BDEAC', label: 'BDEAC' }, { value: 'BID', label: 'BID' }]} value={projectFormData.bailleur_nom} onChange={(e:any) => setProjectFormData({...projectFormData, bailleur_nom: e.target.value})} required /></div>)}<BulleInput label="Exercice" type="number" value={projectFormData.exercice} onChange={(e:any) => setProjectFormData({...projectFormData, exercice: parseInt(e.target.value)})} /><div className="pt-6"><button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:scale-[1.02] transition-all">Créer le projet</button></div></form></div></div>)}
      {isModalOpen && !readOnly && (<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-visible"><div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-6xl max-h-[94vh] flex flex-col overflow-visible animate-in fade-in zoom-in duration-300"><div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"><div className="flex items-center gap-5"><div className="p-4 bg-primary/10 text-primary rounded-[1.5rem]"><Plus size={32} /></div><div><h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight truncate max-w-lg">Inscription PPM : {currentProjet?.libelle}</h2><p className="text-slate-400 text-xs font-black uppercase tracking-widest">Maître d'Ouvrage : EDC S.A.</p></div></div><button onClick={() => setIsModalOpen(false)} className="p-4 text-slate-400 hover:text-slate-800 transition-all"><X size={24} /></button></div><div className="flex-1 overflow-y-auto p-12 custom-scrollbar overflow-x-hidden"><form onSubmit={handleManualSubmit} className="space-y-12 pb-16"><div className="space-y-8"><h3 className="text-xs font-black text-primary uppercase border-l-4 border-primary pl-5 tracking-[0.3em] flex items-center gap-3"><Building2 size={18} /> Identification</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"><BulleInput label="N° Dossier" placeholder="Ex: 001/EDC/2024" value={formData.id} onChange={(e: any) => setFormData({...formData, id: e.target.value})} required /><BulleInput label="Imputation" placeholder="EXP-2024-X01" value={formData.imputation_budgetaire} onChange={(e: any) => setFormData({...formData, imputation_budgetaire: e.target.value})} required /><div className="md:col-span-2"><BulleInput label="Objet Marché" textarea placeholder="Description complète..." value={formData.objet} onChange={(e: any) => setFormData({...formData, objet: e.target.value})} required /></div><BulleInput label="Fonction" options={fonctions.map(f => ({ value: f.libelle, label: f.libelle }))} value={formData.fonction_parente} onChange={(e: any) => setFormData({...formData, fonction_parente: e.target.value})} required /><BulleInput label="Activité" placeholder="Texte libre..." value={formData.activite_parente} onChange={(e: any) => setFormData({...formData, activite_parente: e.target.value})} required /><BulleInput label="Type AO" placeholder="AONO, AONI..." value={formData.type_ao} onChange={(e: any) => setFormData({...formData, type_ao: e.target.value})} required /><BulleInput label="Prestation" placeholder="Travaux, Services..." value={formData.type_prestation} onChange={(e: any) => setFormData({...formData, type_prestation: e.target.value})} required /></div></div><div className="space-y-8"><h3 className="text-xs font-black text-emerald-600 uppercase border-l-4 border-emerald-500 pl-5 tracking-[0.3em] flex items-center gap-3"><Landmark size={18} /> Budget & Délais</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-12 bg-emerald-50/30 rounded-[3.5rem] border border-emerald-100 shadow-inner"><BulleInput label="Budget FCFA" type="number" value={formData.montant_prevu} onChange={(e: any) => setFormData({...formData, montant_prevu: parseInt(e.target.value)})} required /><BulleInput label="Délai Global Prévu (j)" type="number" value={formData.delai_global_passation} onChange={(e: any) => setFormData({...formData, delai_global_passation: parseInt(e.target.value)})} required /><BulleInput label="Financement" value={currentProjet?.source_financement} disabled /></div></div><div className="space-y-8"><h3 className="text-xs font-black text-slate-800 uppercase border-l-4 border-slate-800 pl-5 tracking-[0.3em] flex items-center gap-3"><Clock size={18} /> Calendrier Prévu</h3><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-6 bg-slate-50/50 p-10 rounded-[4rem] border border-slate-100 shadow-inner">{jalonCols.map(jalon => (<BulleInput key={jalon.key} label={jalon.label} type="date" icon={Calendar} disabled={jalon.key.includes('ano') && currentProjet?.source_financement === SourceFinancement.BUDGET_EDC} value={formData.dates_prevues?.[jalon.key] || ''} onChange={(e: any) => setFormData({...formData, dates_prevues: {...formData.dates_prevues, [jalon.key]: e.target.value} as any})} />))}</div></div><div className="flex items-center justify-end gap-6 pt-12 border-t border-slate-100"><button type="button" onClick={() => setIsModalOpen(false)} className="px-12 py-5 bg-slate-100 text-slate-500 rounded-[2rem] font-black text-[10px] uppercase tracking-widest">Annuler</button><button type="submit" className="px-16 py-6 bg-primary text-white rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all">Enregistrer</button></div></form></div></div></div>)}
    </div>
  );
};

export default MarketList;