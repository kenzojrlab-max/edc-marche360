// pages/ExecutionPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Lock, Unlock, AlertTriangle, FileText, Upload, Download, 
  Plus, Trash2, CheckCircle2, AlertOctagon, X, Save, Layers, Flag
} from 'lucide-react';
import { useMarkets } from '../contexts/MarketContext';
// CORRECTION : On retire MOCK_PROJETS des imports
import { formatFCFA } from '../services/mockData';
import { Marche, Decompte, Avenant } from '../types';

// --- Composant Bouton Upload Simple ---
const UploadBtn = ({ label, hasDoc, url, onUpload, color = "blue" }: any) => {
  const ref = useRef<HTMLInputElement>(null);
  const colorClass = color === "red" ? "red" : "blue";
  
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-[9px] font-black uppercase text-slate-400">{label}</span>}
      <input type="file" className="hidden" ref={ref} onChange={(e) => e.target.files && onUpload(e.target.files[0])} />
      {hasDoc ? (
        <a href={url} target="_blank" rel="noreferrer" className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-${colorClass}-200 bg-${colorClass}-50 text-${colorClass}-700 text-[10px] font-black uppercase hover:bg-${colorClass}-100 transition-all`}>
          <Download size={14} /> VOIR DOC
        </a>
      ) : (
        <button onClick={() => ref.current?.click()} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 text-[10px] font-black uppercase hover:border-primary hover:text-primary transition-all">
          <Upload size={14} /> Charger
        </button>
      )}
    </div>
  );
};

// --- MODAL DE GESTION EXÉCUTION ---
const ExecutionModal = ({ market, onClose }: { market: Marche, onClose: () => void }) => {
  const { updateMarche } = useMarkets();
  const [localMarket, setLocalMarket] = useState<Marche>(JSON.parse(JSON.stringify(market)));
  const [activeTab, setActiveTab] = useState<'CONTRACTUEL' | 'FINANCIER'>('CONTRACTUEL');

  // --- LOGIQUE CONDITION STRICTE ---
  // Pour l'accès, on vérifie si une date de signature existe OU si un document signé est présent
  const hasSignatureDate = !!localMarket.dates_realisees.signature_marche;
  const hasSignedContract = !!localMarket.docs.marche_signe;
  
  // Condition : Date renseignée OU Document uploadé
  const isAccessGranted = hasSignatureDate || hasSignedContract;

  // Mise à jour générique
  const updateExec = (field: string, value: any) => {
    setLocalMarket(prev => ({ ...prev, execution: { ...prev.execution, [field]: value } }));
  };

  // Mise à jour doc exécution (Champs simples)
  const handleUpload = (field: string, file: File) => {
    const url = URL.createObjectURL(file);
    updateExec(field, { nom: file.name, url, date_upload: new Date().toISOString().split('T')[0] });
  };

  // --- GESTION DECOMPTES ---
  const addDecompte = () => {
    const newDecompte: Decompte = { id: Date.now().toString(), numero: '', objet: '', montant: 0, date_validation: '' };
    updateExec('decomptes', [...localMarket.execution.decomptes, newDecompte]);
  };
  
  const updateDecompte = (id: string, field: string, value: any) => {
    const updated = localMarket.execution.decomptes.map(d => d.id === id ? { ...d, [field]: value } : d);
    updateExec('decomptes', updated);
  };
  
  const uploadDecompteDoc = (id: string, file: File) => {
    const url = URL.createObjectURL(file);
    const doc = { nom: file.name, url, date_upload: new Date().toISOString().split('T')[0] };
    const updated = localMarket.execution.decomptes.map(d => d.id === id ? { ...d, doc } : d);
    updateExec('decomptes', updated);
  };

  // --- GESTION AVENANTS (CORRIGÉ) ---
  const addAvenant = () => {
    const newAv: Avenant = { id: Date.now().toString(), ref: '', objet: '', montant_inc_dec: 0, date_signature: '' };
    updateExec('avenants', [...localMarket.execution.avenants, newAv]);
  };
  
  const updateAvenant = (id: string, field: string, value: any) => {
    const updated = localMarket.execution.avenants.map(a => a.id === id ? { ...a, [field]: value } : a);
    updateExec('avenants', updated);
  };

  // NOUVELLE FONCTION AJOUTÉE POUR LES DOCS AVENANTS
  const uploadAvenantDoc = (id: string, docField: string, file: File) => {
    const url = URL.createObjectURL(file);
    const doc = { nom: file.name, url, date_upload: new Date().toISOString().split('T')[0] };
    
    // On parcourt la liste des avenants pour trouver celui qui correspond à l'ID
    const updated = localMarket.execution.avenants.map(a => 
      a.id === id ? { ...a, [docField]: doc } : a
    );
    
    updateExec('avenants', updated);
  };

  const handleSave = () => {
    updateMarche(localMarket);
    alert('Données d\'exécution sauvegardées !');
  };

  if (!isAccessGranted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
        <div className="bg-white rounded-[2rem] w-full max-w-md p-8 text-center shadow-2xl animate-in zoom-in-95">
          <div className="mx-auto w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2 uppercase">Accès Refusé</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            L'onglet exécution est verrouillé. <br/>
            Veuillez remplir au moins une condition dans le <strong>Suivi des Marchés</strong> :
          </p>
          <div className="space-y-3 text-left bg-slate-50 p-4 rounded-xl mb-6">
            <div className={`flex items-center gap-3 text-xs font-bold ${hasSignatureDate ? 'text-emerald-600' : 'text-red-500'}`}>
              {hasSignatureDate ? <CheckCircle2 size={16} /> : <X size={16} />} Date de signature renseignée
            </div>
            <div className={`flex items-center gap-3 text-xs font-bold ${hasSignedContract ? 'text-emerald-600' : 'text-red-500'}`}>
              {hasSignedContract ? <CheckCircle2 size={16} /> : <X size={16} />} Marché Signé (PDF) téléversé
            </div>
          </div>
          <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest">Fermer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
      {/* Header Modal */}
      <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
              <Unlock size={12} /> Accès Autorisé
            </div>
            <span className="text-xs font-black text-slate-400">#{localMarket.id}</span>
          </div>
          <h2 className="text-xl font-black text-slate-800 mt-1 uppercase">{localMarket.objet}</h2>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleSave} className="bg-primary text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2">
            <Save size={16} /> Enregistrer
          </button>
          <button onClick={onClose} className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"><X size={20} /></button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-64 bg-slate-50 border-r border-slate-100 p-6 space-y-2">
          <button 
            onClick={() => setActiveTab('CONTRACTUEL')} 
            className={`w-full text-left px-4 py-4 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${activeTab === 'CONTRACTUEL' ? 'bg-white text-primary shadow-md border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Données Contractuelles
          </button>
          <button 
            onClick={() => setActiveTab('FINANCIER')} 
            className={`w-full text-left px-4 py-4 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${activeTab === 'FINANCIER' ? 'bg-white text-primary shadow-md border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Gestion Financière & Incidents
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-white">
          
          {/* TAB DONNEES CONTRACTUELLES */}
          {activeTab === 'CONTRACTUEL' && (
            <div className="space-y-10 max-w-5xl">
              <div className="grid grid-cols-2 gap-8">
                {/* COLONNE GAUCHE : INFO CLES */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 h-fit">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Informations Clés</h3>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Numéro Marché</label>
                    <div className="font-mono font-black text-slate-800">{localMarket.id}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Réf Contrat</label>
                    <input type="text" value={localMarket.execution.ref_contrat || ''} onChange={e => updateExec('ref_contrat', e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold outline-none" placeholder="Saisir Réf..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Attributaire</label>
                    <div className="font-bold text-slate-700">{localMarket.titulaire || 'Non défini'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Montant TTC</label>
                    <div className="font-mono font-black text-emerald-600">{formatFCFA(localMarket.montant_ttc_reel || 0)}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Délai (Mois)</label>
                    <input type="number" value={localMarket.execution.delai_execution || ''} onChange={e => updateExec('delai_execution', parseInt(e.target.value))} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold outline-none" placeholder="0" />
                  </div>
                </div>

                {/* COLONNE DROITE : DOCUMENTS */}
                <div className="space-y-8">
                  {/* Démarrage */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileText size={14} /> Démarrage & Administratif</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <UploadBtn label="Notification" hasDoc={!!localMarket.execution.doc_notification} url={localMarket.execution.doc_notification?.url} onUpload={(f:File) => handleUpload('doc_notification', f)} />
                      <UploadBtn label="OS de Démarrage" hasDoc={!!localMarket.execution.doc_os_demarrage} url={localMarket.execution.doc_os_demarrage?.url} onUpload={(f:File) => handleUpload('doc_os_demarrage', f)} />
                      <UploadBtn label="Cautionnement Définitif" hasDoc={!!localMarket.execution.doc_caution_def} url={localMarket.execution.doc_caution_def?.url} onUpload={(f:File) => handleUpload('doc_caution_def', f)} />
                      <UploadBtn label="Police d'Assurance" hasDoc={!!localMarket.execution.doc_assurance} url={localMarket.execution.doc_assurance?.url} onUpload={(f:File) => handleUpload('doc_assurance', f)} />
                      <UploadBtn label="Enregistrement (Impôts)" hasDoc={!!localMarket.execution.doc_enregistrement} url={localMarket.execution.doc_enregistrement?.url} onUpload={(f:File) => handleUpload('doc_enregistrement', f)} />
                      <UploadBtn label="Contrat Enregistré" hasDoc={!!localMarket.execution.doc_contrat_enregistre} url={localMarket.execution.doc_contrat_enregistre?.url} onUpload={(f:File) => handleUpload('doc_contrat_enregistre', f)} />
                    </div>
                  </div>

                  {/* Suivi */}
                  <div className="space-y-3">
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Layers size={14} /> Suivi d'Exécution</h3>
                     <div className="grid grid-cols-2 gap-3">
                        <UploadBtn label="Rapport d'Exécution" hasDoc={!!localMarket.execution.doc_rapport_execution} url={localMarket.execution.doc_rapport_execution?.url} onUpload={(f:File) => handleUpload('doc_rapport_execution', f)} />
                     </div>
                  </div>

                  {/* Clôture */}
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4">
                     <h3 className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2"><Flag size={14} /> Clôture du Marché</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <UploadBtn label="PV Réception Provisoire" hasDoc={!!localMarket.execution.doc_pv_reception_provisoire} url={localMarket.execution.doc_pv_reception_provisoire?.url} onUpload={(f:File) => handleUpload('doc_pv_reception_provisoire', f)} color="green" />
                        <div className="space-y-2">
                           <UploadBtn label="PV Réception Définitive" hasDoc={!!localMarket.execution.doc_pv_reception_definitive} url={localMarket.execution.doc_pv_reception_definitive?.url} onUpload={(f:File) => handleUpload('doc_pv_reception_definitive', f)} color="green" />
                           <div className="pt-1">
                              <label className="text-[8px] font-black uppercase text-emerald-600">Date Réception Déf.</label>
                              <input 
                                type="date" 
                                value={localMarket.execution.date_reception_definitive || ''} 
                                onChange={(e) => updateExec('date_reception_definitive', e.target.value)}
                                className="w-full bg-white border border-emerald-200 rounded px-2 py-1 text-[10px] font-black outline-none text-emerald-800"
                              />
                           </div>
                        </div>
                     </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB GESTION FINANCIERE & INCIDENTS */}
          {activeTab === 'FINANCIER' && (
            <div className="space-y-12 max-w-5xl">
              
              {/* RETENUE DE GARANTIE */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-primary uppercase tracking-widest border-b border-slate-100 pb-2">Retenue de Garantie</h3>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer p-4 border border-slate-200 rounded-xl hover:bg-slate-50">
                    <input type="radio" name="garantie" checked={localMarket.execution.type_retenue_garantie === 'OPTION_A'} onChange={() => updateExec('type_retenue_garantie', 'OPTION_A')} />
                    <span className="text-xs font-bold text-slate-700">Option A : Retenue sur décompte</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-4 border border-slate-200 rounded-xl hover:bg-slate-50">
                    <input type="radio" name="garantie" checked={localMarket.execution.type_retenue_garantie === 'OPTION_B'} onChange={() => updateExec('type_retenue_garantie', 'OPTION_B')} />
                    <span className="text-xs font-bold text-slate-700">Option B : Caution Bancaire</span>
                  </label>
                </div>
                {localMarket.execution.type_retenue_garantie === 'OPTION_B' && (
                   <div className="animate-in slide-in-from-top-2 p-4 bg-blue-50/50 rounded-xl border border-blue-100 w-fit">
                      <UploadBtn label="Scan Caution Bancaire" hasDoc={!!localMarket.execution.doc_caution_bancaire} url={localMarket.execution.doc_caution_bancaire?.url} onUpload={(f:File) => handleUpload('doc_caution_bancaire', f)} />
                   </div>
                )}
              </div>

              {/* DECOMPTES */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                   <h3 className="text-xs font-black text-primary uppercase tracking-widest">Tableau des Décomptes</h3>
                   <button onClick={addDecompte} className="flex items-center gap-1 text-[10px] font-black bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:scale-105 transition-transform"><Plus size={12}/> Ajouter</button>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-black uppercase">
                    <tr><th className="p-3">N°</th><th className="p-3">Objet</th><th className="p-3">Montant</th><th className="p-3">Fichier</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {localMarket.execution.decomptes.map((d) => (
                      <tr key={d.id}>
                        <td className="p-2"><input type="text" className="w-12 bg-slate-100 rounded px-1 py-1 font-bold" value={d.numero} onChange={e => updateDecompte(d.id, 'numero', e.target.value)} /></td>
                        <td className="p-2"><input type="text" className="w-full bg-slate-100 rounded px-1 py-1" value={d.objet} onChange={e => updateDecompte(d.id, 'objet', e.target.value)} /></td>
                        <td className="p-2"><input type="number" className="w-24 bg-slate-100 rounded px-1 py-1 font-mono" value={d.montant} onChange={e => updateDecompte(d.id, 'montant', parseInt(e.target.value))} /></td>
                        <td className="p-2"><UploadBtn label="" hasDoc={!!d.doc} url={d.doc?.url} onUpload={(f:File) => uploadDecompteDoc(d.id, f)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* AVENANTS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                   <div className="flex items-center gap-4">
                     <h3 className="text-xs font-black text-primary uppercase tracking-widest">Avenants</h3>
                     <div className="flex bg-slate-100 rounded-lg p-0.5">
                        <button onClick={() => updateExec('has_avenant', true)} className={`px-3 py-1 text-[9px] font-black rounded ${localMarket.execution.has_avenant ? 'bg-primary text-white' : 'text-slate-400'}`}>OUI</button>
                        <button onClick={() => updateExec('has_avenant', false)} className={`px-3 py-1 text-[9px] font-black rounded ${!localMarket.execution.has_avenant ? 'bg-white text-slate-600' : 'text-slate-400'}`}>NON</button>
                     </div>
                   </div>
                   {localMarket.execution.has_avenant && <button onClick={addAvenant} className="flex items-center gap-1 text-[10px] font-black bg-slate-900 text-white px-3 py-1.5 rounded-lg"><Plus size={12}/> Ajouter Avenant</button>}
                </div>
                {localMarket.execution.has_avenant && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[800px]">
                      <thead className="bg-slate-50 text-slate-400 font-black uppercase">
                        <tr><th className="p-3">Réf</th><th className="p-3">Objet</th><th className="p-3">Montant (+/-)</th><th className="p-3">Notification</th><th className="p-3">OS</th><th className="p-3">Enreg.</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {localMarket.execution.avenants.map((a) => (
                          <tr key={a.id}>
                            <td className="p-2"><input type="text" className="w-20 bg-slate-100 rounded px-1" value={a.ref} onChange={e => updateAvenant(a.id, 'ref', e.target.value)} /></td>
                            <td className="p-2"><input type="text" className="w-full bg-slate-100 rounded px-1" value={a.objet} onChange={e => updateAvenant(a.id, 'objet', e.target.value)} /></td>
                            <td className="p-2"><input type="number" className="w-24 bg-slate-100 rounded px-1 font-mono" value={a.montant_inc_dec} onChange={e => updateAvenant(a.id, 'montant_inc_dec', parseInt(e.target.value))} /></td>
                            
                            {/* ICI : UTILISATION DE LA NOUVELLE FONCTION POUR UPLOAD */}
                            <td className="p-2">
                                <UploadBtn 
                                  label="Notif" 
                                  hasDoc={!!a.doc_notification} 
                                  url={a.doc_notification?.url} 
                                  onUpload={(f:File) => uploadAvenantDoc(a.id, 'doc_notification', f)} 
                                />
                            </td>
                            <td className="p-2">
                                <UploadBtn 
                                  label="OS" 
                                  hasDoc={!!a.doc_os} 
                                  url={a.doc_os?.url} 
                                  onUpload={(f:File) => uploadAvenantDoc(a.id, 'doc_os', f)} 
                                />
                            </td>
                            <td className="p-2">
                                <UploadBtn 
                                  label="Enreg." 
                                  hasDoc={!!a.doc_enregistrement} 
                                  url={a.doc_enregistrement?.url} 
                                  onUpload={(f:File) => uploadAvenantDoc(a.id, 'doc_enregistrement', f)} 
                                />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* RESILIATION - WORKFLOW STRICT */}
              <div className="p-6 bg-red-50 rounded-3xl border border-red-100 space-y-6">
                 <div className="flex items-center gap-4">
                     <AlertOctagon className="text-red-500" size={24} />
                     <h3 className="text-sm font-black text-red-800 uppercase tracking-widest">Procédure de Résiliation</h3>
                     <div className="flex bg-white border border-red-200 rounded-lg p-0.5 ml-auto">
                        <button onClick={() => updateExec('is_resilie', true)} className={`px-4 py-1.5 text-[10px] font-black rounded ${localMarket.execution.is_resilie ? 'bg-red-500 text-white' : 'text-slate-400'}`}>OUI</button>
                        <button onClick={() => updateExec('is_resilie', false)} className={`px-4 py-1.5 text-[10px] font-black rounded ${!localMarket.execution.is_resilie ? 'bg-slate-100 text-slate-600' : 'text-slate-400'}`}>NON</button>
                     </div>
                 </div>

                 {localMarket.execution.is_resilie && (
                   <div className="grid grid-cols-3 gap-6 pt-4 animate-in slide-in-from-top-2 relative">
                      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-200 -z-10 transform -translate-y-1/2"></div>
                      
                      <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm text-center space-y-3">
                         <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-black mx-auto">1</div>
                         <p className="text-[10px] font-bold text-red-800 uppercase">Mise en Demeure</p>
                         <UploadBtn label="Preuve" hasDoc={!!localMarket.execution.doc_mise_en_demeure} url={localMarket.execution.doc_mise_en_demeure?.url} onUpload={(f:File) => handleUpload('doc_mise_en_demeure', f)} color="red" />
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm text-center space-y-3">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black mx-auto ${localMarket.execution.doc_mise_en_demeure ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>2</div>
                         <p className="text-[10px] font-bold text-slate-600 uppercase">Constat de Carence</p>
                         {localMarket.execution.doc_mise_en_demeure ? (
                            <UploadBtn label="PV Constat" hasDoc={!!localMarket.execution.doc_constat_carence} url={localMarket.execution.doc_constat_carence?.url} onUpload={(f:File) => handleUpload('doc_constat_carence', f)} color="red" />
                         ) : <span className="text-[9px] text-slate-300 italic">Etape 1 requise</span>}
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm text-center space-y-3">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black mx-auto ${localMarket.execution.doc_constat_carence ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>3</div>
                         <p className="text-[10px] font-bold text-slate-600 uppercase">Décision Résiliation</p>
                         {localMarket.execution.doc_constat_carence ? (
                            <UploadBtn label="Décision" hasDoc={!!localMarket.execution.doc_decision_resiliation} url={localMarket.execution.doc_decision_resiliation?.url} onUpload={(f:File) => handleUpload('doc_decision_resiliation', f)} color="red" />
                         ) : <span className="text-[9px] text-slate-300 italic">Etape 2 requise</span>}
                      </div>
                   </div>
                 )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- PAGE PRINCIPALE : LISTE DES MARCHÉS POUR EXÉCUTION ---
const ExecutionPage: React.FC = () => {
  // CORRECTION ICI : Récupération des 'projets' du contexte global
  const { marches, projets } = useMarkets();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<Marche | null>(null);

  // --- NOUVEAUX ÉTATS POUR LE FILTRAGE ---
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedProjetId, setSelectedProjetId] = useState<string>('');

  // CORRECTION ICI : Liste dynamique des projets disponibles pour l'année sélectionnée
  const availableProjects = projets.filter(p => p.exercice === selectedYear);

  // Reset du projet si l'année change
  useEffect(() => {
    setSelectedProjetId('');
  }, [selectedYear]);

  // Filtre
  const executionCandidates = marches.filter(m => 
    !m.is_annule && 
    !m.is_infructueux &&
    m.exercice === selectedYear &&
    (selectedProjetId ? m.projet_id === selectedProjetId : true) &&
    (m.id.toLowerCase().includes(searchTerm.toLowerCase()) || m.objet.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* HEADER AVEC FILTRES */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Exécution des Marchés</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
            Gestion Financière • Avenants • Contentieux
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
              placeholder="Rechercher un marché..."
              className="bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-black text-slate-700 outline-none w-full md:w-64 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {executionCandidates.length > 0 ? executionCandidates.map(m => (
          <div key={m.id} onClick={() => setSelectedMarket(m)} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:border-primary/30 hover:shadow-xl cursor-pointer group transition-all">
             <div className="flex items-center justify-between mb-4">
               <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase">{m.id}</span>
               {m.dates_realisees.signature_marche || m.docs.marche_signe ? (
                 <CheckCircle2 size={18} className="text-emerald-500" />
               ) : (
                 <Lock size={18} className="text-slate-300" />
               )}
             </div>
             <h3 className="text-sm font-black text-slate-800 uppercase leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">{m.objet}</h3>
             <div className="flex items-center justify-between pt-4 border-t border-slate-50">
               <div>
                 <p className="text-[8px] font-bold text-slate-400 uppercase">Titulaire</p>
                 <p className="text-[10px] font-black text-slate-700 truncate max-w-[120px]">{m.titulaire || '—'}</p>
               </div>
               <div className="text-right">
                 <p className="text-[8px] font-bold text-slate-400 uppercase">Montant TTC</p>
                 <p className="text-[10px] font-mono font-black text-emerald-600">{formatFCFA(m.montant_ttc_reel || m.montant_prevu)}</p>
               </div>
             </div>
          </div>
        )) : (
          <div className="col-span-full py-12 text-center text-slate-400 font-black uppercase text-xs">
            Aucun marché trouvé pour ces critères.
          </div>
        )}
      </div>

      {selectedMarket && <ExecutionModal market={selectedMarket} onClose={() => setSelectedMarket(null)} />}
    </div>
  );
};

export default ExecutionPage;