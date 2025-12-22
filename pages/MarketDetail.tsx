import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Calendar, Upload, Download, XCircle, 
  Save, Landmark, History, CheckCircle2, AlertCircle, 
  FileCheck, FileWarning, ClipboardList, User, DollarSign,
  Gavel, ShieldCheck, BellRing, Info, ListOrdered
} from 'lucide-react';
// On remplace les MOCK_MARCHES par le contexte
import { useMarkets } from '../contexts/MarketContext'; 

// --- Composant Ligne de Registre ---
const RegistryRow = ({ 
  label, 
  value, 
  type = "text", 
  onChange, 
  hasDoc = false, 
  doc, 
  required = false,
  placeholder = "Saisir...",
  disabled = false,
  number
}: any) => (
  <div className={`group flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50/50 transition-all ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <div className="flex-1 pr-6">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black text-primary/40 min-w-[20px]">{number}.</span>
        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight leading-tight">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      </div>
    </div>
    
    <div className="flex items-center gap-3 mt-2 md:mt-0">
      {type === "date" ? (
        <input 
          type="date" 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)}
          className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-black text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 w-40"
        />
      ) : type === "number" ? (
        <input 
          type="number" 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)}
          className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-black text-slate-700 outline-none w-40"
          placeholder="0"
        />
      ) : (
        <input 
          type="text" 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)}
          className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-black text-slate-700 outline-none min-w-[240px]"
          placeholder={placeholder}
        />
      )}

      {hasDoc && (
        <div className="flex items-center gap-2">
          {doc ? (
            /* Modification ici : Utilisation d'un lien <a> pour permettre le téléchargement */
            <a 
              href={doc.url} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all text-[9px] font-black uppercase decoration-0"
              title="Télécharger le document"
            >
              <Download size={14} /> Doc
            </a>
          ) : (
            <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-400 rounded-xl border border-dashed border-slate-300 hover:text-primary hover:border-primary transition-all text-[9px] font-black uppercase">
              <Upload size={14} /> Charger
            </button>
          )}
        </div>
      )}
    </div>
  </div>
);

const MarketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // 1. On récupère les fonctions du Contexte
  const { getMarcheById, updateMarche } = useMarkets();
  
  // 2. On charge le marché depuis le contexte au lieu du fichier Mock directement
  // On utilise un state local pour gérer le formulaire, initialisé avec les données du contexte
  const contextMarket = getMarcheById(id || '');
  const [market, setMarket] = useState(contextMarket);
  const [activeTab, setActiveTab] = useState<'SUIVI'>('SUIVI');

  // Si le marché n'est pas trouvé (ou id invalide)
  if (!contextMarket) return <Navigate to="/ppm-view" />;
  
  // Si le state local n'est pas encore initialisé (cas rare de refresh), on le set
  if (!market) {
      setMarket(contextMarket);
      return null;
  }

  const handleUpdate = (field: string, val: any) => {
    setMarket({ ...market, [field]: val });
  };

  const handleUpdateDate = (key: string, val: string) => {
    setMarket({
      ...market,
      dates_realisees: { ...market.dates_realisees, [key]: val }
    } as any);
  };

  // Fonction pour sauvegarder les modifications dans le contexte global
  const handleSave = () => {
    if (market) {
        updateMarche(market);
        alert("Modifications enregistrées !");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* HEADER SIMPLIFIÉ */}
      <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 hover:text-primary transition-all">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-primary uppercase bg-primary/5 px-2 py-0.5 rounded-full">{market.id}</span>
              <h1 className="text-lg font-black text-slate-800 uppercase truncate max-w-md">{market.objet}</h1>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registre de Passation - EDC S.A.</p>
          </div>
        </div>
        <button onClick={handleSave} className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-transform">
          <Save size={16} /> Enregistrer
        </button>
      </div>

      {/* TABS (Seul Suivi est conservé) */}
      <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/50 max-w-xs mx-auto">
        <button className="flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest bg-white text-primary shadow-sm">Suivi</button>
      </div>

      {/* REGISTRE DES 33 POINTS */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-primary text-white rounded-xl shadow-md"><ListOrdered size={20} /></div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Suivi détaillé de passation</h2>
           </div>
           <div className="text-[9px] font-black text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100 uppercase">33 points de contrôle</div>
        </div>

        <div className="divide-y divide-slate-50">
          <RegistryRow number="1" label="N°" value={market.id} disabled />
          <RegistryRow number="2" label="Intitulé du projet (DAO téléchargeable)" value={market.objet} hasDoc doc={market.docs?.dao} onChange={(v:any) => handleUpdate('objet', v)} />
          <RegistryRow number="3" label="Source de financement" value={market.source_financement} onChange={(v:any) => handleUpdate('source_financement', v)} />
          <RegistryRow number="4" label="Imputation budgétaire (Attestation de DF téléchargeable)" value={market.imputation_budgetaire} hasDoc doc={market.docs?.imputation} onChange={(v:any) => handleUpdate('imputation_budgetaire', v)} />
          <RegistryRow number="5" label="Saisine prévisionnelle de la CIPM" type="date" value={market.dates_realisees.saisine_cipm_prev} onChange={(v:any) => handleUpdateDate('saisine_cipm_prev', v)} />
          <RegistryRow number="6" label="Saisine CIPM* (Documents de transmission téléchargeables)" type="date" value={market.dates_realisees.saisine_cipm} hasDoc doc={market.docs?.saisine} required onChange={(v:any) => handleUpdateDate('saisine_cipm', v)} />
          <RegistryRow number="7" label="Examen DAO CIPM*" type="date" value={market.dates_realisees.examen_dao_cipm} required onChange={(v:any) => handleUpdateDate('examen_dao_cipm', v)} />
          <RegistryRow number="8" label="Validation du dossier (PV de validation téléchargeable)" hasDoc doc={market.docs?.validation_dao} onChange={() => {}} />
          <RegistryRow number="9" label="ANO Bailleur* (ANO téléchargeable)" hasDoc doc={market.docs?.ano_bailleur_dao} required onChange={() => {}} />
          <RegistryRow number="10" label="Lancement AO* (Avis signé et publié téléchargeables)" type="date" value={market.dates_realisees.lancement_ao} hasDoc doc={market.docs?.lancement} required onChange={(v:any) => handleUpdateDate('lancement_ao', v)} />
          <RegistryRow number="11" label="Additif (Document téléchargeable)" hasDoc doc={market.docs?.additif} onChange={() => {}} />
          <RegistryRow number="12" label="Dépouillement des offres* (PV téléchargeable)" type="date" value={market.dates_realisees.depouillement} hasDoc doc={market.docs?.depouillement} required onChange={(v:any) => handleUpdateDate('depouillement', v)} />
          <RegistryRow number="13" label="Validation du rapport d’évaluation (PV téléchargeable)" hasDoc doc={market.docs?.validation_eval} onChange={() => {}} />
          <RegistryRow number="14" label="ANO bailleurs (ANO téléchargeable)" hasDoc doc={market.docs?.ano_eval} onChange={() => {}} />
          <RegistryRow number="15" label="Ouvertures des offres financières (PV téléchargeable)" hasDoc doc={market.docs?.ouverture_fin} onChange={() => {}} />

          {/* 16. INFRUCTUEUX */}
          <div className="p-6 bg-red-50/20 border-y border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-red-400">16.</span>
              <span className="text-[11px] font-black text-red-900 uppercase">Infructueux ?</span>
            </div>
            <div className="flex items-center gap-4">
              <select 
                value={market.is_infructueux ? 'Oui' : 'Non'} 
                onChange={(e) => handleUpdate('is_infructueux', e.target.value === 'Oui')}
                className="bg-white border border-red-200 rounded-xl px-4 py-2 text-[11px] font-black text-red-900 outline-none"
              >
                <option value="Non">Non</option>
                <option value="Oui">Oui</option>
              </select>
              {market.is_infructueux && (
                <a href={market.doc_infructueux?.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-red-200 decoration-0">
                  <Download size={14} /> Décision
                </a>
              )}
            </div>
          </div>

          <RegistryRow number="17" label="Proposition d’attribution CIPM* (PV téléchargeable)" hasDoc doc={market.docs?.prop_attrib} required onChange={() => {}} />
          <RegistryRow number="18" label="Avis conforme CA* (Avis téléchargeable)" hasDoc doc={market.docs?.avis_ca} required onChange={() => {}} />
          <RegistryRow number="19" label="ANO Bailleurs* (ANO téléchargeable)" hasDoc doc={market.docs?.ano_attrib} required onChange={() => {}} />
          <RegistryRow number="20" label="Publication* (décision/communiqué téléchargeables)" hasDoc doc={market.docs?.publication} required onChange={() => {}} />
          <RegistryRow number="21" label="Notification attribution (Notification téléchargeable)" hasDoc doc={market.docs?.notif_attrib} onChange={() => {}} />
          <RegistryRow number="22" label="Titulaire" value={market.titulaire} onChange={(v:any) => handleUpdate('titulaire', v)} />
          <RegistryRow number="23" label="Montant TTC en FCFA" type="number" value={market.montant_ttc_reel} onChange={(v:any) => handleUpdate('montant_ttc_reel', v)} />
          <RegistryRow number="24" label="Souscription du projet de marché*" type="date" value={market.dates_realisees.souscription_projet} required onChange={(v:any) => handleUpdateDate('souscription_projet', v)} />
          <RegistryRow number="25" label="Saisine CIPM projet* (Documents de transmission téléchargeables)" type="date" value={market.dates_realisees.saisine_cipm_projet} hasDoc doc={market.docs?.saisine_projet} required onChange={(v:any) => handleUpdateDate('saisine_cipm_projet', v)} />
          <RegistryRow number="26" label="Examen projet marché CIPM*" type="date" value={market.dates_realisees.examen_projet_cipm} required onChange={(v:any) => handleUpdateDate('examen_projet_cipm', v)} />
          <RegistryRow number="27" label="Validation (PV de validation téléchargeable)" hasDoc doc={market.docs?.validation_projet} onChange={() => {}} />
          <RegistryRow number="28" label="ANO bailleurs* (ANO téléchargeable)" hasDoc doc={market.docs?.ano_projet} required onChange={() => {}} />
          <RegistryRow number="29" label="Signature marché (marché signée téléchargeable)" hasDoc doc={market.docs?.marche_signe} onChange={() => {}} />

          {/* 30. ANNULE */}
          <div className="p-8 bg-slate-900 text-white space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-500">30.</span>
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">Annulé ?</span>
              </div>
              <div className="flex bg-white/10 rounded-xl p-1 border border-white/20">
                <button onClick={() => handleUpdate('is_annule', true)} className={`px-5 py-2 text-[9px] font-black rounded-lg transition-all ${market.is_annule ? 'bg-amber-500 text-slate-900' : 'text-slate-400'}`}>OUI</button>
                <button onClick={() => handleUpdate('is_annule', false)} className={`px-5 py-2 text-[9px] font-black rounded-lg transition-all ${!market.is_annule ? 'bg-white/20 text-white' : 'text-slate-400'}`}>NON</button>
              </div>
            </div>
            {market.is_annule && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-300">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Motif d'annulation</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/10 border-none rounded-xl p-4 text-xs font-bold outline-none placeholder:text-slate-600"
                    placeholder="Préciser le motif..."
                    value={market.motif_annulation}
                    onChange={(e) => handleUpdate('motif_annulation', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Accord du Conseil d'Administration</label>
                  <a href={market.doc_annulation_ca?.url} target="_blank" rel="noreferrer" className="w-full h-[52px] bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-slate-100 transition-all decoration-0">
                    <Download size={14} /> Télécharger Accord CA
                  </a>
                </div>
              </div>
            )}
          </div>

          <RegistryRow number="31" label="Notification*" type="date" value={market.dates_realisees.notification} required onChange={(v:any) => handleUpdateDate('notification', v)} />
          <RegistryRow number="32" label="Recours" value={market.recours} onChange={(v:any) => handleUpdate('recours', v)} />
          
          <div className="p-6 bg-slate-50 border-t border-slate-100">
             <div className="flex flex-col space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400">33.</span>
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Etat d’avancement du dossier</span>
                </div>
                <select 
                  value={market.etat_avancement}
                  onChange={(e) => handleUpdate('etat_avancement', e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-xs font-black text-slate-800 outline-none appearance-none cursor-pointer focus:border-primary transition-all shadow-sm"
                >
                  <option>En préparation DAO</option>
                  <option>En cours de consultation</option>
                  <option>En évaluation</option>
                  <option>En cours de signature</option>
                  <option>Notifié</option>
                  <option>Clôturé</option>
                </select>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetail;