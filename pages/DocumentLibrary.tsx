// pages/DocumentLibrary.tsx
import React, { useState } from 'react';
import { 
  Search, FileText, Download, Folder, Calendar, User, File, 
  Trash2, Plus, X, FileSpreadsheet, Presentation, FileCode,
  FileCheck, Upload, Lock
} from 'lucide-react';
import { DocumentCategory, LibraryDocument, UserRole } from '../types';
import { useMarkets } from '../contexts/MarketContext';
import { CURRENT_USER } from '../services/mockData';

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  [DocumentCategory.AUDITS]: 'Rapports d\'Audits',
  [DocumentCategory.PERFORMANCE]: 'Gestion & Performance',
  [DocumentCategory.REGLEMENTAIRE]: 'Réglementation & Manuels',
  [DocumentCategory.MODELES]: 'Modèles & Lettres Types'
};

// Fonction utilitaire pour choisir l'icône et la couleur selon l'extension
const getFileIcon = (format: string) => {
  const ext = format.toUpperCase();
  if (ext.includes('PDF')) return { icon: FileCode, color: 'text-red-600', bg: 'bg-red-50' };
  if (ext.includes('XLS') || ext.includes('SHEET')) return { icon: FileSpreadsheet, color: 'text-emerald-600', bg: 'bg-emerald-50' };
  if (ext.includes('DOC') || ext.includes('WORD')) return { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' };
  if (ext.includes('PPT') || ext.includes('POWER')) return { icon: Presentation, color: 'text-orange-600', bg: 'bg-orange-50' };
  return { icon: File, color: 'text-slate-500', bg: 'bg-slate-100' };
};

interface DocumentLibraryProps {
  readOnly?: boolean;
}

const DocumentLibrary: React.FC<DocumentLibraryProps> = ({ readOnly = true }) => {
  const { documents, addDocument, deleteDocument } = useMarkets();
  
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State pour le formulaire d'ajout
  const [newDocData, setNewDocData] = useState({
    titre: '',
    categorie: DocumentCategory.REGLEMENTAIRE,
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isAdmin = CURRENT_USER.role === UserRole.ADMIN || CURRENT_USER.role === UserRole.SUPER_ADMIN;
  // VERIFICATION DU ROLE GUEST
  const isGuest = CURRENT_USER.role === UserRole.GUEST;

  // Filtering Logic
  const filteredDocs = documents.filter(doc => {
    const matchesCategory = activeCategory === 'ALL' || doc.categorie === activeCategory;
    const matchesSearch = doc.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Gestion de l'ajout
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Veuillez sélectionner un fichier.");
      return;
    }

    const fileExtension = selectedFile.name.split('.').pop()?.toUpperCase() || 'FILE';
    const fakeUrl = URL.createObjectURL(selectedFile);
    
    // Calcul taille approximative (pour la démo)
    const sizeInKb = Math.round(selectedFile.size / 1024);
    const sizeDisplay = sizeInKb > 1024 ? `${(sizeInKb/1024).toFixed(1)} MB` : `${sizeInKb} KB`;

    const newDoc: LibraryDocument = {
      id: `DOC-${Date.now()}`,
      titre: newDocData.titre,
      categorie: newDocData.categorie,
      description: newDocData.description,
      format: fileExtension,
      date_upload: new Date().toISOString().split('T')[0],
      url: fakeUrl,
      auteur: CURRENT_USER.nom_complet,
      taille: sizeDisplay
    };

    addDocument(newDoc);
    setIsModalOpen(false);
    
    // Reset form
    setNewDocData({ titre: '', categorie: DocumentCategory.REGLEMENTAIRE, description: '' });
    setSelectedFile(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      deleteDocument(id);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center uppercase tracking-tight">
            <Folder className="mr-3 text-primary" size={28} />
            {readOnly ? 'Bibliothèque Documentaire' : 'Gestion Documentaire'}
          </h1>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">
            {readOnly ? 'Consultation & Téléchargement' : 'Administration : Ajout & Suppression'}
          </p>
        </div>
        
        {/* BOUTON AJOUTER VISIBLE SEULEMENT SI PAS READONLY ET ADMIN */}
        {!readOnly && isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-slate-900/20"
          >
            <Plus size={16} /> Ajouter un document
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un document (titre, mot-clé...)" 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <div className="flex space-x-6 min-w-max">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-colors ${
              activeCategory === 'ALL' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Tous les documents
          </button>
          {(Object.values(DocumentCategory) as DocumentCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-colors ${
                activeCategory === cat 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => {
            const { icon: Icon, color, bg } = getFileIcon(doc.format);
            return (
              <div key={doc.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 hover:shadow-lg transition-shadow group flex flex-col relative">
                
                {/* Bouton Supprimer VISIBLE SEULEMENT SI PAS READONLY ET ADMIN */}
                {!readOnly && isAdmin && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                    className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Supprimer le document"
                  >
                    <Trash2 size={14} />
                  </button>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className={`p-4 rounded-2xl ${bg} ${color}`}>
                    <Icon size={24} />
                  </div>
                  <span className="text-[9px] font-black px-2 py-1 rounded bg-slate-100 text-slate-500 uppercase tracking-widest mt-2">
                    {doc.format}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-slate-800 font-black text-sm mb-2 line-clamp-2 uppercase" title={doc.titre}>
                    {doc.titre}
                  </h3>
                  {doc.description && (
                    <p className="text-slate-500 text-[10px] font-medium mb-4 line-clamp-3 leading-relaxed">
                      {doc.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1.5" />
                      {doc.date_upload}
                    </div>
                    <div className="flex items-center">
                      <User size={12} className="mr-1.5" />
                      {doc.auteur || 'EDC'}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                     <span className="text-slate-300">{doc.taille}</span>
                     
                     {/* LOGIQUE RESTRICTION INVITE */}
                     {isGuest ? (
                       <span className="text-slate-400 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg cursor-not-allowed opacity-60" title="Téléchargement restreint">
                         <Lock size={12} /> Accès restreint
                       </span>
                     ) : (
                       <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-primary hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                       >
                         <Download size={12} /> Télécharger
                       </a>
                     )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-slate-200 mb-6">
               <File size={32} className="text-slate-400" />
            </div>
            <h3 className="text-slate-900 font-black uppercase tracking-widest">Aucun document trouvé</h3>
            <p className="text-slate-500 text-xs font-bold mt-2">Essayez de modifier vos filtres ou ajoutez un nouveau document.</p>
          </div>
        )}
      </div>

      {/* MODAL AJOUT DOCUMENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
               <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Ajouter un document</h2>
               <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-8 space-y-6">
                
                {/* Titre */}
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Titre du document</label>
                   <input 
                     type="text" 
                     required
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                     placeholder="Ex: Code des marchés publics 2024"
                     value={newDocData.titre}
                     onChange={(e) => setNewDocData({...newDocData, titre: e.target.value})}
                   />
                </div>

                {/* Catégorie */}
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Catégorie</label>
                   <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-primary cursor-pointer appearance-none"
                      value={newDocData.categorie}
                      onChange={(e) => setNewDocData({...newDocData, categorie: e.target.value as DocumentCategory})}
                   >
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                   </select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Description (Optionnel)</label>
                   <textarea 
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none h-24"
                     placeholder="Brève description du contenu..."
                     value={newDocData.description}
                     onChange={(e) => setNewDocData({...newDocData, description: e.target.value})}
                   />
                </div>

                {/* Fichier */}
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Fichier joint</label>
                   <div className="relative group">
                     <input 
                       type="file" 
                       id="doc-upload" 
                       className="hidden" 
                       onChange={handleFileSelect}
                       accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.png" // Accepte Office + Images
                     />
                     <label htmlFor="doc-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-primary transition-all">
                        {selectedFile ? (
                          <div className="text-center">
                            <FileCheck size={32} className="text-emerald-500 mx-auto mb-2" />
                            <span className="text-xs font-black text-slate-700">{selectedFile.name}</span>
                          </div>
                        ) : (
                          <div className="text-center text-slate-400 group-hover:text-primary transition-colors">
                            <Upload size={32} className="mx-auto mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Cliquez pour choisir un fichier</span>
                            <p className="text-[8px] mt-1 opacity-60">PDF, Word, Excel, PPT...</p>
                          </div>
                        )}
                     </label>
                   </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                    Confirmer l'ajout
                  </button>
                </div>

             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentLibrary;