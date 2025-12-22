// pages/MarketList.tsx
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  Search, Download, Filter, Clock, Calendar, 
  Plus, FileSpreadsheet, X, FileText, FileUp, 
  ChevronDown, Building2, Landmark, ShieldCheck, Check, Layers, ArrowRight, FileCheck, AlertCircle,
  Activity, Save, Upload, Info, Eye
} from 'lucide-react';
import { MOCK_PROJETS, formatFCFA, calculateDaysBetween, CONFIG_FONCTIONS } from '../services/mockData';
import { JalonPassationKey, SourceFinancement, StatutGlobal, Marche, Projet } from '../types';
import { useMarkets } from '../contexts/MarketContext'; // <--- Import du contexte

// --- COMPOSANT CELLULE DOCUMENT INTELLIGENT ---
const DocCellInline = ({ doc, label, readOnly, onUpload }: { doc?: any, label: string, readOnly?: boolean, onUpload?: () => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!readOnly) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (onUpload) onUpload();
      e.target.value = '';
    }
  };

  // MODE CONSULTATION (UTILISATEUR) : BOUTON TÉLÉCHARGER
  if (readOnly) {
    if (doc) {
      return (
        <a 
          href={doc.url} 
          target="_blank" 
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          title={`Télécharger ${label}`}
          className="ml-auto flex items-center justify-center p-1 rounded border bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 transition-all shadow-sm"
        >
          <Download size={10} />
        </a>
      );
    }
    return <div className="ml-auto w-4" />;
  }

  // MODE ADMIN : BOUTON TÉLÉVERSER
  return (
    <div className="flex items-center ml-auto flex-shrink-0">
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
        title={doc ? `Remplacer ${label}` : `Téléverser ${label}`}
        className={`p-1 rounded border transition-all flex items-center justify-center group/btn ${
          doc 
            ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' 
            : 'bg-slate-50 text-slate-400 border-dashed border-slate-300 hover:text-primary hover:border-primary hover:bg-blue-50'
        }`}
      >
        <Upload size={9} className="group-hover/btn:scale-110 transition-transform" />
      </button>
    </div>
  );
};

const InlineField = ({ label, number, children, disabled }: any) => (
  <div className={`flex flex-col space-y-0 p-1 rounded-md border transition-all min-w-0 ${disabled ? 'bg-slate-50 border-slate-100 opacity-40 grayscale' : 'bg-white border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:bg-slate-50/80'}`}>
    <div className="flex items-center gap-1 mb-0.5">
      <span className="text-[7px] font-black text-slate-300 flex-shrink-0">{number}.</span>
      <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter truncate" title={label}>{label}</span>
    </div>
    <div className="min-h-[12px] flex items-center gap-1 overflow-hidden">
      {disabled ? <span className="text-[7px] font-black text-slate-300 italic">N/A (EDC)</span> : children}
    </div>
  </div>
);

const ReadOnlyValue = ({ value, isDate = false, isAmount = false }: { value?: any, isDate?: boolean, isAmount?: boolean }) => (
  <span className={`text-[8px] font-black uppercase truncate flex-1 min-w-0 ${!value ? 'text-slate-300 italic' : 'text-slate-700'} ${isDate || isAmount ? 'font-mono' : ''}`}>
    {isAmount && value ? formatFCFA(value) : (value || '—')}
  </span>
);

const CustomBulleSelect = ({ value, onChange, options, placeholder, disabled }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Close on click outside logic removed for brevity but can be kept
  const selected = options.find((o: any) => o.value === value);

  return (
    <div className={`relative w-full ${disabled ? 'pointer-events-none' : ''}`} ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="w-full bg-transparent border-none outline-none flex items-center justify-between cursor-pointer">
        <span className={`truncate text-[11px] font-black ${!selected ? 'text-slate-300' : 'text-slate-700'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform flex-shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] z-[999] p-2">
          <div className="max-h-52 overflow-y-auto custom-scrollbar px-1">
            {options.map((opt: any) => (
              <div
                key={opt.value}
                onClick={() => { onChange({ target: { value: opt.value } }); setIsOpen(false); }}
                className={`group flex items-center justify-between px-4 py-3 my-0.5 text-[10px] font-black rounded-xl cursor-pointer transition-all ${value === opt.value ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`}
              >
                <span className="truncate pr-2 uppercase">{opt.label}</span>
                {value === opt.value && <Check size={12} className="flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const BulleInput = ({ label, type = "text", value, onChange, placeholder, options, required, disabled, textarea, icon: Icon }: any) => {
  return (
    <div className={`flex flex-col space-y-1 ${disabled ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
      <div className="flex items-center space-x-1.5 bg-slate-100 rounded-[2.5rem] p-1.5 border border-slate-200/40 transition-all focus-within:bg-slate-200 focus-within:border-primary/20 group relative">
        <span className="text-[9px] font-black text-slate-400 px-2.5 uppercase tracking-tighter truncate w-24 flex-shrink-0" title={label}>{label}</span>
        <div className="flex-1 min-w-0 bg-white text-xs font-black text-slate-700 rounded-[2rem] shadow-sm py-2 px-4 flex items-center min-h-[46px] group-focus-within:ring-2 group-focus-within:ring-primary/20 transition-all">
          {Icon && <Icon size={14} className="mr-2 text-slate-300 flex-shrink-0" />}
          {options ? (
             <CustomBulleSelect value={value} onChange={onChange} options={options} placeholder="Choisir..." disabled={disabled} />
          ) : textarea ? (
            <textarea value={value} onChange={onChange} required={required} placeholder={placeholder} rows={1} className="w-full bg-transparent border-none outline-none resize-none py-1 scrollbar-hide font-black placeholder:text-slate-300 text-[11px] leading-tight" />
          ) : (
            <input type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} className="w-full bg-transparent border-none outline-none font-black placeholder:text-slate-300 text-[11px] min-w-0" />
          )}
        </div>
      </div>
    </div>
  );
};

interface MarketListProps {
  mode: 'PPM' | 'ALL';
  readOnly?: boolean;
}

const MarketList: React.FC<MarketListProps> = ({ mode, readOnly = false }) => {
  const { marches, updateMarche } = useMarkets(); // Utilisation du contexte
  
  const [projets, setProjets] = useState<Projet[]>(MOCK_PROJETS);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedProjetId, setSelectedProjetId] = useState<string | null>(null);
  const [expandedMarketId, setExpandedMarketId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  
  const [projectFormData, setProjectFormData] = useState({
    libelle: '', source_financement: SourceFinancement.BUDGET_EDC, bailleur_nom: '', exercice: 2024
  });

  const [formData, setFormData] = useState<Partial<Marche>>({
    id: '', objet: '', fonction_parente: '', activite_parente: '', type_ao: '', type_prestation: '',
    montant_prevu: 0, delai_global_passation: 0, source_financement: SourceFinancement.BUDGET_EDC, bailleur_nom: '', imputation_budgetaire: '',
    dates_prevues: {} as any, statut_global: StatutGlobal.PLANIFIE, hors_ppm: false, exercice: 2024
  });

  const handleDocUpload = (marketId: string, docKey: string, isSpecialDoc?: boolean) => {
    const targetMarket = marches.find(m => m.id === marketId);
    if (!targetMarket) return;

    // Simulation d'URL
    const mockPiece = { 
        nom: 'Document_Upload_Admin.pdf', 
        url: '#', 
        date_upload: new Date().toISOString().split('T')[0] 
    };

    let updatedMarket = { ...targetMarket };
    if (isSpecialDoc) {
      updatedMarket = { ...updatedMarket, [docKey]: mockPiece };
    } else {
      updatedMarket = { ...updatedMarket, docs: { ...updatedMarket.docs, [docKey]: mockPiece } };
    }
    updateMarche(updatedMarket);
  };

  const jalonCols: { key: JalonPassationKey; label: string }[] = [
    { key: 'saisine_cipm', label: 'Saisine CIPM' }, { key: 'examen_dao_cipm', label: 'Examen DAO' },
    { key: 'ano_bailleur_dao', label: 'ANO Bailleur (DAO)' }, { key: 'lancement_ao', label: 'Lancement AO' },
    { key: 'depouillement', label: 'Dépouillement' }, { key: 'prop_attrib_cipm', label: 'Prop. Attribution' },
    { key: 'avis_conforme_ca', label: 'Avis CA' }, { key: 'ano_bailleur_attrib', label: 'ANO Bailleur (Attrib)' },
    { key: 'publication', label: 'Publication' }, { key: 'souscription_projet', label: 'Souscription' },
    { key: 'saisine_cipm_projet', label: 'Saisine Projet' }, { key: 'examen_projet_cipm', label: 'Examen Projet' },
    { key: 'ano_bailleur_projet', label: 'ANO Bailleur (Projet)' }, { key: 'signature_marche', label: 'Signature' },
    { key: 'notification', label: 'Notification' },
  ];

  const projetsDeAnnee = projets.filter(p => p.exercice === selectedYear);
  const currentProjet = projets.find(p => p.id === selectedProjetId);
  const marketsOfProjet = marches.filter(m => m.projet_id === selectedProjetId);

  const handleCreateProject = (e: React.FormEvent) => { e.preventDefault(); /* ... même logique ... */ setIsProjectModalOpen(false); };
  const handleManualSubmit = (e: React.FormEvent) => { e.preventDefault(); setIsModalOpen(false); };
  const downloadExcelTemplate = () => {};
  const handleExcelImport = () => { if (!excelFile) return; setIsImporting(true); setTimeout(() => { setIsImporting(false); setIsExcelModalOpen(false); }, 1500); };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
            {readOnly ? 'Plan de Passation des Marchés' : (mode === 'PPM' ? 'Gestion de la Programmation' : 'Suivi des Marchés')}
          </h1>
          {/* ... Header contenu ... */}
        </div>
        {!readOnly && (
          <button onClick={() => setIsProjectModalOpen(true)} className="flex items-center px-8 py-4 bg-slate-900 text-white rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-900/10">
            <Plus size={16} className="mr-2" /> Créer un nouveau Projet
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projetsDeAnnee.map(p => (
          <div key={p.id} onClick={() => setSelectedProjetId(p.id)} className={`cursor-pointer p-8 rounded-[3rem] border-2 transition-all flex flex-col justify-between h-48 shadow-sm hover:shadow-xl group ${selectedProjetId === p.id ? 'bg-primary border-primary text-white scale-105 shadow-primary/30' : 'bg-white border-slate-100 text-slate-700 hover:border-primary/20'}`}>
             <div><h3 className="text-base font-black uppercase leading-tight">{p.libelle}</h3></div>
             <div className="flex items-center justify-between pt-4"><ArrowRight size={14} /></div>
          </div>
        ))}
      </div>

      {selectedProjetId && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-t-2 border-slate-100 pt-8 gap-4">
             <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{currentProjet?.libelle}</h2>
             {!readOnly && (
               <div className="flex items-center gap-3">
                 <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-primary text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-blue-900 shadow-xl shadow-primary/20 transition-all flex items-center">
                    <Plus size={16} className="mr-2" /> Saisie Manuelle
                 </button>
               </div>
             )}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
             <div className="overflow-x-auto custom-scrollbar">
               <table className="w-full text-left text-[11px] whitespace-nowrap border-collapse">
                 <thead>
                    <tr className="bg-slate-50 text-slate-400 font-black uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-4">N°</th><th className="px-6 py-4">Objet</th><th className="px-6 py-4 text-center">Statut</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {marketsOfProjet.map(m => {
                     const isExpanded = expandedMarketId === m.id;
                     const isEDC = m.source_financement === SourceFinancement.BUDGET_EDC;
                     return (
                       <React.Fragment key={m.id}>
                         <tr onDoubleClick={() => setExpandedMarketId(isExpanded ? null : m.id)} className={`hover:bg-blue-50/30 group transition-colors cursor-pointer select-none ${isExpanded ? 'bg-primary/5' : ''}`}>
                            <td className="px-6 py-4 font-black text-slate-900">{m.id}</td>
                            <td className="px-6 py-4 font-bold text-slate-700 truncate max-w-xs">{m.objet}</td>
                            <td className="px-6 py-4 text-center"><span className="text-[9px] font-black px-2 py-0.5 bg-blue-50 text-primary rounded-full uppercase">{m.statut_global}</span></td>
                         </tr>
                         
                         {isExpanded && (
                           <tr className="bg-slate-50/60">
                             <td colSpan={20} className="px-2 py-1.5">
                               <div className="bg-white rounded-lg border border-primary/10 shadow-lg overflow-hidden animate-in slide-in-from-top-1 duration-200">
                                 <div className="bg-primary/5 px-4 py-1 border-b border-primary/10 flex items-center justify-between">
                                   <div className="flex items-center gap-2 text-primary font-black uppercase text-[8px] tracking-widest"><Activity size={10} /> Registre : {m.id}</div>
                                   <button onClick={() => setExpandedMarketId(null)} className="p-0.5 hover:bg-primary/10 rounded text-primary"><X size={10} /></button>
                                 </div>
                                 
                                 <div className="p-1.5 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-1.5">
                                   <InlineField number="1" label="N°"><ReadOnlyValue value={m.id} /></InlineField>
                                   
                                   <InlineField number="2" label="Intitulé projet (DAO)">
                                     <ReadOnlyValue value={m.objet} />
                                     <DocCellInline doc={m.docs?.dao} label="DAO" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'dao')} />
                                   </InlineField>
                                   
                                   <InlineField number="3" label="Source de financement"><ReadOnlyValue value={m.source_financement} /></InlineField>
                                   <InlineField number="4" label="Imputation (Attest. DF)"><ReadOnlyValue value={m.imputation_budgetaire} /></InlineField>
                                   <InlineField number="5" label="Saisine prévisionnelle CIPM"><ReadOnlyValue value={m.dates_realisees.saisine_cipm_prev} isDate /><DocCellInline doc={m.docs?.saisine_prev} label="Saisine Prév" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'saisine_prev')} /></InlineField>
                                   <InlineField number="6" label="Saisine CIPM* (Transmis.)"><ReadOnlyValue value={m.dates_realisees.saisine_cipm} isDate /><DocCellInline doc={m.docs?.saisine} label="Docs" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'saisine')} /></InlineField>
                                   <InlineField number="7" label="Examen DAO CIPM*"><ReadOnlyValue value={m.dates_realisees.examen_dao_cipm} isDate /><DocCellInline doc={m.docs?.examen_dao} label="Examen DAO" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'examen_dao')} /></InlineField>
                                   <InlineField number="8" label="Validation dossier (PV)"><ReadOnlyValue value={m.dates_realisees.validation_dao} isDate /><DocCellInline doc={m.docs?.validation_dao} label="PV" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'validation_dao')} /></InlineField>
                                   <InlineField number="9" label="ANO Bailleur* (ANO)" disabled={isEDC}><ReadOnlyValue value={m.dates_realisees.ano_bailleur_dao} isDate /><DocCellInline doc={m.docs?.ano_bailleur_dao} label="ANO" disabled={isEDC} readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'ano_bailleur_dao')} /></InlineField>
                                   <InlineField number="10" label="Lancement AO* (Avis)"><ReadOnlyValue value={m.dates_realisees.lancement_ao} isDate /><DocCellInline doc={m.docs?.lancement} label="Avis" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'lancement')} /></InlineField>
                                   <InlineField number="11" label="Additif (Doc)"><ReadOnlyValue value={m.dates_realisees.additif} isDate /><DocCellInline doc={m.docs?.additif} label="Additif" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'additif')} /></InlineField>
                                   <InlineField number="12" label="Dépouillement* (PV)"><ReadOnlyValue value={m.dates_realisees.depouillement} isDate /><DocCellInline doc={m.docs?.depouillement} label="PV" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'depouillement')} /></InlineField>
                                   <InlineField number="13" label="Valid. Évaluation (PV)"><ReadOnlyValue value={m.dates_realisees.validation_eval_offres} isDate /><DocCellInline doc={m.docs?.validation_eval_offres} label="PV" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'validation_eval_offres')} /></InlineField>
                                   <InlineField number="14" label="ANO bailleurs (ANO)" disabled={isEDC}><ReadOnlyValue value={m.dates_realisees.ano_bailleur_eval} isDate /><DocCellInline doc={m.docs?.ano_bailleur_eval} label="ANO" disabled={isEDC} readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'ano_bailleur_eval')} /></InlineField>
                                   <InlineField number="15" label="Ouvertures Fin. (PV)"><ReadOnlyValue value={m.dates_realisees.ouverture_financiere} isDate /><DocCellInline doc={m.docs?.ouverture_financiere} label="PV" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'ouverture_financiere')} /></InlineField>
                                   
                                   <InlineField number="16" label="Infructueux (Décision)">
                                      <span className={`text-[7px] font-black px-1 rounded ${m.is_infructueux ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>{m.is_infructueux ? 'OUI' : 'NON'}</span>
                                      <DocCellInline doc={m.doc_infructueux} label="Décision" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'doc_infructueux', true)} />
                                   </InlineField>
                                   
                                   <InlineField number="17" label="Prop. Attribution* (PV)"><ReadOnlyValue value={m.dates_realisees.prop_attrib_cipm} isDate /><DocCellInline doc={m.docs?.prop_attrib_cipm} label="PV" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'prop_attrib_cipm')} /></InlineField>
                                   <InlineField number="18" label="Avis conforme CA* (Avis)"><ReadOnlyValue value={m.dates_realisees.avis_conforme_ca} isDate /><DocCellInline doc={m.docs?.avis_conforme_ca} label="Avis" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'avis_conforme_ca')} /></InlineField>
                                   <InlineField number="19" label="ANO Bailleurs* (ANO)" disabled={isEDC}><ReadOnlyValue value={m.dates_realisees.ano_bailleur_attrib} isDate /><DocCellInline doc={m.docs?.ano_bailleur_attrib} label="ANO" disabled={isEDC} readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'ano_bailleur_attrib')} /></InlineField>
                                   <InlineField number="20" label="Publication* (Décis.)"><ReadOnlyValue value={m.dates_realisees.publication} isDate /><DocCellInline doc={m.docs?.publication} label="Décision" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'publication')} /></InlineField>
                                   <InlineField number="21" label="Notification Attrib. (Notif.)"><ReadOnlyValue value={m.dates_realisees.notification_attrib} isDate /><DocCellInline doc={m.docs?.notification_attrib} label="Notif." readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'notification_attrib')} /></InlineField>
                                   
                                   <InlineField number="22" label="Titulaire"><ReadOnlyValue value={m.titulaire} /></InlineField>
                                   <InlineField number="23" label="Montant TTC (FCFA)"><ReadOnlyValue value={m.montant_ttc_reel} isAmount /></InlineField>
                                   <InlineField number="24" label="Souscription Marché*"><ReadOnlyValue value={m.dates_realisees.souscription_projet} isDate /><DocCellInline doc={m.docs?.souscription} label="Souscription" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'souscription')} /></InlineField>
                                   <InlineField number="25" label="Saisine Projet* (Trans.)"><ReadOnlyValue value={m.dates_realisees.saisine_cipm_projet} isDate /><DocCellInline doc={m.docs?.saisine_projet} label="Docs" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'saisine_projet')} /></InlineField>
                                   <InlineField number="26" label="Examen Projet CIPM*"><ReadOnlyValue value={m.dates_realisees.examen_projet_cipm} isDate /><DocCellInline doc={m.docs?.examen_projet} label="Examen Projet" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'examen_projet')} /></InlineField>
                                   <InlineField number="27" label="Validation (PV)"><ReadOnlyValue value={m.dates_realisees.validation_projet} isDate /><DocCellInline doc={m.docs?.validation_projet} label="PV" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'validation_projet')} /></InlineField>
                                   <InlineField number="28" label="ANO bailleurs* (ANO)" disabled={isEDC}><ReadOnlyValue value={m.dates_realisees.ano_bailleur_projet} isDate /><DocCellInline doc={m.docs?.ano_bailleur_projet} label="ANO" disabled={isEDC} readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'ano_bailleur_projet')} /></InlineField>
                                   <InlineField number="29" label="Signature Marché (Doc)"><ReadOnlyValue value={m.dates_realisees.signature_marche} isDate /><DocCellInline doc={m.docs?.signature_marche} label="Marché" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'signature_marche')} /></InlineField>
                                   
                                   <InlineField number="30" label="Annulé (Accord CA)">
                                      <span className={`text-[7px] font-black px-1 rounded ${m.is_annule ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>{m.is_annule ? 'OUI' : 'NON'}</span>
                                      <DocCellInline doc={m.doc_annulation_ca} label="Accord CA" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'doc_annulation_ca', true)} />
                                   </InlineField>
                                   
                                   <InlineField number="31" label="Notification*"><ReadOnlyValue value={m.dates_realisees.notification} isDate /><DocCellInline doc={m.docs?.notification_cloture} label="Notif" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'notification_cloture')} /></InlineField>
                                   <InlineField number="32" label="Recours"><ReadOnlyValue value={m.recours} /><DocCellInline doc={m.docs?.recours} label="Recours" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'recours')} /></InlineField>
                                   <InlineField number="33" label="Etat d'avancement"><span className="text-[7px] font-black text-primary bg-primary/5 px-1 py-0.5 rounded uppercase">{m.etat_avancement}</span><DocCellInline doc={m.docs?.etat_avancement_doc} label="Etat" readOnly={readOnly} onUpload={() => handleDocUpload(m.id, 'etat_avancement_doc')} /></InlineField>
                                 </div>
                               </div>
                             </td>
                           </tr>
                         )}
                       </React.Fragment>
                     );
                   })}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketList;