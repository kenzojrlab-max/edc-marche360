
import React, { useState } from 'react';
import { 
  Search, FileText, Download, Filter, Folder, Calendar, User, File
} from 'lucide-react';
import { DocumentCategory } from '../types';
import { MOCK_LIBRARY_DOCUMENTS } from '../services/mockData';

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  [DocumentCategory.AUDITS]: 'Rapports d\'Audits',
  [DocumentCategory.PERFORMANCE]: 'Gestion & Performance',
  [DocumentCategory.REGLEMENTAIRE]: 'Réglementation & Manuels',
  [DocumentCategory.MODELES]: 'Modèles & Lettres Types'
};

const DocumentLibrary: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtering Logic
  const filteredDocs = MOCK_LIBRARY_DOCUMENTS.filter(doc => {
    const matchesCategory = activeCategory === 'ALL' || doc.categorie === activeCategory;
    const matchesSearch = doc.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center">
          <Folder className="mr-3 text-primary" size={28} />
          Bibliothèque Documentaire Transverse
        </h1>
        <p className="text-slate-500 mt-1">
          Base de connaissances centralisée : Réglementations, Modèles, Audits et Rapports de performance.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un document (titre, mot-clé...)" 
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
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
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeCategory === 'ALL' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Tous les documents
          </button>
          {/* Cast to DocumentCategory[] to avoid index type errors */}
          {(Object.values(DocumentCategory) as DocumentCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeCategory === cat 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow group flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                    doc.format === 'PDF' ? 'bg-red-50 text-red-600' : 
                    doc.format === 'DOCX' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                }`}>
                  <FileText size={24} />
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-500">
                  {doc.format}
                </span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-slate-800 font-bold text-sm mb-2 line-clamp-2" title={doc.titre}>
                  {doc.titre}
                </h3>
                {doc.description && (
                  <p className="text-slate-500 text-xs mb-4 line-clamp-2">
                    {doc.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                <div className="space-y-1">
                  <div className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {doc.date_upload}
                  </div>
                  <div className="flex items-center">
                    <User size={12} className="mr-1" />
                    {doc.auteur || 'N/A'}
                  </div>
                </div>
                <div className="text-right">
                   <p className="mb-1">{doc.taille}</p>
                   <button className="text-primary hover:text-blue-700 font-medium flex items-center">
                     <Download size={14} className="mr-1" /> Télécharger
                   </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-slate-200 mb-4">
               <File size={24} className="text-slate-400" />
            </div>
            <h3 className="text-slate-900 font-medium">Aucun document trouvé</h3>
            <p className="text-slate-500 text-sm mt-1">Essayez de modifier vos filtres de recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentLibrary;
