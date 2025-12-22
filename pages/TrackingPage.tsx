// pages/TrackingPage.tsx
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Activity, 
  Save, 
  Upload, 
  ShieldCheck,
  Download // <--- Nouvel import
} from 'lucide-react';
import { CURRENT_USER } from '../services/mockData';
import { JalonPassationKey, SourceFinancement, UserRole } from '../types'; // Ajout UserRole
import { useMarkets } from '../contexts/MarketContext'; // <--- Import du Context

// --- Composant Cellule Document (Intelligent : Admin=Upload / User=Download) ---
const DocCell = ({ doc, label, disabled, onUpload }: { doc?: any, label: string, disabled?: boolean, onUpload?: () => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Vérification des permissions
  const isAdmin = CURRENT_USER.role === UserRole.ADMIN || CURRENT_USER.role === UserRole.SUPER_ADMIN;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdmin && !disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (onUpload) onUpload();
      // Reset input for next same-file selection
      e.target.value = '';
    }
  };

  // 1. CAS UTILISATEUR SIMPLE : TÉLÉCHARGEMENT
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
    // Si pas de doc ou désactivé, on affiche une petite puce vide
    return (
      <div className="flex justify-center items-center w-6 h-6 opacity-20">
        <div className="w-1 h-1 rounded-full bg-slate-400"></div>
      </div>
    );
  }

  // 2. CAS ADMIN : UPLOAD
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
            ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' // Bleu pour Admin = Fichier présent
            : 'bg-slate-50 text-slate-400 border-dashed border-slate-300 hover:text-primary hover:border-primary hover:bg-blue-50'
        }`}
      >
        <Upload size={10} className="group-hover/btn:scale-110 transition-transform" />
      </button>
    </div>
  );
};

// --- Composant Input Date Administrateur ---
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
  const { marches, updateMarche } = useMarkets(); // <--- Utilisation du State Global
  const [searchTerm, setSearchTerm] = useState('');

  // Vérification Admin pour toute la page
  const isAdmin = CURRENT_USER.role === UserRole.ADMIN || CURRENT_USER.role === UserRole.SUPER_ADMIN;

  const handleUpdateDate = (marketId: string, key: JalonPassationKey, value: string) => {
    if (!isAdmin) return; // Sécurité
    const market = marches.find(m => m.id === marketId);
    if (market) {
      updateMarche({ ...market, dates_realisees: { ...market.dates_realisees, [key]: value } });
    }
  };

  const handleUpdateField = (marketId: string, field: string, value: any) => {
    if (!isAdmin) return; // Sécurité
    const market = marches.find(m => m.id === marketId);
    if (market) {
      updateMarche({ ...market, [field]: value });
    }
  };

  // Simuler le téléversement en mettant à jour le CONTEXTE
  const handleDocUpload = (marketId: string, docKey: string, isSpecialDoc?: boolean) => {
    if (!isAdmin) return; // Sécurité

    const market = marches.find(m => m.id === marketId);
    if (market) {
        const mockPiece = { nom: 'Document_Suivi_Upload.pdf', url: '#', date_upload: new Date().toISOString().split('T')[0] };
        
        let updatedMarket = { ...market };
        if (isSpecialDoc) {
          updatedMarket = { ...updatedMarket, [docKey]: mockPiece };
        } else {
          updatedMarket = { ...updatedMarket, docs: { ...updatedMarket.docs, [docKey]: mockPiece } };
        }
        
        updateMarche(updatedMarket);
    }
  };

  const filteredMarches = marches.filter(m => 
    m.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.objet.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <Activity className="text-primary" size={28} />
            Suivi des Marchés
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
            Registre de pilotage - {isAdmin ? 'Administration & Téléversement' : 'Consultation & Téléchargement'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher..."
              className="bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-black text-slate-700 outline-none w-64 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isAdmin && (
            <button className="bg-primary text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 transition-transform hover:scale-105">
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
                {/* En-têtes colonnes identiques */}
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

                <th className="px-3 py-3 border-r border-slate-200 text-center">30. Annulé</th>

                <th className="px-3 py-3 border-r border-slate-200 text-center">31. Notification*</th>
                <th className="px-3 py-3 border-r border-slate-200">32. Recours</th>
                <th className="px-3 py-3">33. Etat d'avancement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMarches.map(m => {
                const isEDC = m.source_financement === SourceFinancement.BUDGET_EDC;
                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-3 py-2.5 sticky left-0 bg-white group-hover:bg-slate-50 z-20 border-r border-slate-100 font-black text-primary">
                      <Link to={`/markets/${m.id}`}>{m.id}</Link>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="truncate max-w-[120px] text-slate-700" title={m.objet}>{m.objet}</span>
                        <DocCell doc={m.docs?.dao} label="DAO" onUpload={() => handleDocUpload(m.id, 'dao')} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-slate-400 text-[8px]">{m.source_financement}</td>
                    <td className="px-3 py-2.5 border-r border-slate-100">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="font-mono text-slate-500">{m.imputation_budgetaire}</span>
                        <DocCell doc={m.docs?.imputation} label="Attest. DF" onUpload={() => handleDocUpload(m.id, 'imputation')} />
                      </div>
                    </td>

                    {/* 5-9. Préparation DAO */}
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.saisine_cipm_prev} onChange={(v) => handleUpdateDate(m.id, 'saisine_cipm_prev', v)} />
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.saisine_cipm} onChange={(v) => handleUpdateDate(m.id, 'saisine_cipm', v)} />
                        <DocCell doc={m.docs?.saisine} label="Saisine" onUpload={() => handleDocUpload(m.id, 'saisine')} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.examen_dao_cipm} onChange={(v) => handleUpdateDate(m.id, 'examen_dao_cipm', v)} />
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.validation_dao} onChange={(v) => handleUpdateDate(m.id, 'validation_dao', v)} />
                        <DocCell doc={m.docs?.validation_dao} label="PV" onUpload={() => handleDocUpload(m.id, 'validation_dao')} />
                      </div>
                    </td>
                    <td className={`px-3 py-2.5 border-r border-slate-100 text-center ${isEDC ? 'bg-slate-50' : ''}`}>
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin || isEDC} value={m.dates_realisees.ano_bailleur_dao} onChange={(v) => handleUpdateDate(m.id, 'ano_bailleur_dao', v)} />
                        <DocCell disabled={isEDC} doc={m.docs?.ano_bailleur_dao} label="ANO" onUpload={() => handleDocUpload(m.id, 'ano_bailleur_dao')} />
                      </div>
                    </td>

                    {/* 10-15. Consultation */}
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.lancement_ao} onChange={(v) => handleUpdateDate(m.id, 'lancement_ao', v)} />
                        <DocCell doc={m.docs?.lancement} label="Avis" onUpload={() => handleDocUpload(m.id, 'lancement')} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.additif} onChange={(v) => handleUpdateDate(m.id, 'additif', v)} />
                        <DocCell doc={m.docs?.additif} label="Doc" onUpload={() => handleDocUpload(m.id, 'additif')} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.depouillement} onChange={(v) => handleUpdateDate(m.id, 'depouillement', v)} />
                        <DocCell doc={m.docs?.depouillement} label="PV" onUpload={() => handleDocUpload(m.id, 'depouillement')} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.validation_eval_offres} onChange={(v) => handleUpdateDate(m.id, 'validation_eval_offres', v)} />
                        <DocCell doc={m.docs?.validation_eval_offres} label="PV" onUpload={() => handleDocUpload(m.id, 'validation_eval_offres')} />
                      </div>
                    </td>
                    <td className={`px-3 py-2.5 border-r border-slate-100 text-center ${isEDC ? 'bg-slate-50' : ''}`}>
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin || isEDC} value={m.dates_realisees.ano_bailleur_eval} onChange={(v) => handleUpdateDate(m.id, 'ano_bailleur_eval', v)} />
                        <DocCell disabled={isEDC} doc={m.docs?.ano_bailleur_eval} label="ANO" onUpload={() => handleDocUpload(m.id, 'ano_bailleur_eval')} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.ouverture_financiere} onChange={(v) => handleUpdateDate(m.id, 'ouverture_financiere', v)} />
                        <DocCell doc={m.docs?.ouverture_financiere} label="PV" onUpload={() => handleDocUpload(m.id, 'ouverture_financiere')} />
                      </div>
                    </td>

                    {/* 16. Infructueux */}
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <select disabled={!isAdmin} value={m.is_infructueux ? 'Oui' : 'Non'} onChange={(e) => handleUpdateField(m.id, 'is_infructueux', e.target.value === 'Oui')} className={`bg-white border rounded text-[7px] font-black outline-none ${m.is_infructueux ? 'text-red-600 border-red-200' : 'text-slate-400 border-slate-200'}`}>
                          <option value="Non">NON</option>
                          <option value="Oui">OUI</option>
                        </select>
                        {m.is_infructueux && <DocCell doc={m.doc_infructueux} label="Décision" onUpload={() => handleDocUpload(m.id, 'doc_infructueux', true)} />}
                      </div>
                    </td>

                    {/* 17-21. Attribution */}
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.prop_attrib_cipm} onChange={(v) => handleUpdateDate(m.id, 'prop_attrib_cipm', v)} />
                        <DocCell doc={m.docs?.prop_attrib_cipm} label="PV" onUpload={() => handleDocUpload(m.id, 'prop_attrib_cipm')} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.avis_conforme_ca} onChange={(v) => handleUpdateDate(m.id, 'avis_conforme_ca', v)} />
                        <DocCell doc={m.docs?.avis_conforme_ca} label="Avis" onUpload={() => handleDocUpload(m.id, 'avis_conforme_ca')} />
                      </div>
                    </td>
                    <td className={`px-3 py-2.5 border-r border-slate-100 text-center ${isEDC ? 'bg-slate-50' : ''}`}>
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin || isEDC} value={m.dates_realisees.ano_bailleur_attrib} onChange={(v) => handleUpdateDate(m.id, 'ano_bailleur_attrib', v)} />
                        <DocCell disabled={isEDC} doc={m.docs?.ano_bailleur_attrib} label="ANO" onUpload={() => handleDocUpload(m.id, 'ano_bailleur_attrib')} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.publication} onChange={(v) => handleUpdateDate(m.id, 'publication', v)} />
                        <DocCell doc={m.docs?.publication} label="Décis." onUpload={() => handleDocUpload(m.id, 'publication')} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.notification_attrib} onChange={(v) => handleUpdateDate(m.id, 'notification_attrib', v)} />
                        <DocCell doc={m.docs?.notification_attrib} label="Notif." onUpload={() => handleDocUpload(m.id, 'notification_attrib')} />
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
                        <DocCell doc={m.docs?.saisine_projet} label="Saisine" onUpload={() => handleDocUpload(m.id, 'saisine_projet')} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center"><AdminDateInput disabled={!isAdmin} value={m.dates_realisees.examen_projet_cipm} onChange={(v) => handleUpdateDate(m.id, 'examen_projet_cipm', v)} /></td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.validation_projet} onChange={(v) => handleUpdateDate(m.id, 'validation_projet', v)} />
                        <DocCell doc={m.docs?.validation_projet} label="PV" onUpload={() => handleDocUpload(m.id, 'validation_projet')} />
                      </div>
                    </td>
                    <td className={`px-3 py-2.5 border-r border-slate-100 text-center ${isEDC ? 'bg-slate-50' : ''}`}>
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin || isEDC} value={m.dates_realisees.ano_bailleur_projet} onChange={(v) => handleUpdateDate(m.id, 'ano_bailleur_projet', v)} />
                        <DocCell disabled={isEDC} doc={m.docs?.ano_bailleur_projet} label="ANO" onUpload={() => handleDocUpload(m.id, 'ano_bailleur_projet')} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <AdminDateInput disabled={!isAdmin} value={m.dates_realisees.signature_marche} onChange={(v) => handleUpdateDate(m.id, 'signature_marche', v)} />
                        <DocCell doc={m.docs?.signature_marche} label="Marché" onUpload={() => handleDocUpload(m.id, 'signature_marche')} />
                      </div>
                    </td>

                    {/* 30. Annulé */}
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <select disabled={!isAdmin} value={m.is_annule ? 'Oui' : 'Non'} onChange={(e) => handleUpdateField(m.id, 'is_annule', e.target.value === 'Oui')} className={`bg-white border rounded text-[7px] font-black outline-none ${m.is_annule ? 'text-amber-600 border-amber-200' : 'text-slate-400 border-slate-200'}`}>
                          <option value="Non">NON</option>
                          <option value="Oui">OUI</option>
                        </select>
                        {m.is_annule && <DocCell doc={m.doc_annulation_ca} label="Accord CA" onUpload={() => handleDocUpload(m.id, 'doc_annulation_ca', true)} />}
                      </div>
                    </td>

                    {/* 31-33. Clôture */}
                    <td className="px-3 py-2.5 border-r border-slate-100 text-center"><AdminDateInput disabled={!isAdmin} value={m.dates_realisees.notification} onChange={(v) => handleUpdateDate(m.id, 'notification', v)} /></td>
                    <td className="px-3 py-2.5 border-r border-slate-100 text-[8px] italic text-slate-400 uppercase">{m.recours || 'Néant'}</td>
                    <td className="px-3 py-2.5 bg-primary/5 text-primary text-[8px] uppercase">{m.etat_avancement}</td>
                  </tr>
                );
              })}
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