// pages/Settings.tsx
import React, { useState } from 'react';
import { 
  Users, Settings as SettingsIcon, Shield, Layers, Plus, Trash2, Edit2, Save
} from 'lucide-react';
import { User, UserRole } from '../types';
import { useMarkets } from '../contexts/MarketContext'; // <--- Import Context

const Settings: React.FC = () => {
  const { users, fonctions, addUser, deleteUser, addFonction, deleteFonction } = useMarkets(); // <--- Hooks
  const [activeTab, setActiveTab] = useState<'USERS' | 'CONFIG'>('USERS');
  
  const [newFonction, setNewFonction] = useState('');

  // Pour démo ajout user simplifié
  const handleAddUserMock = () => {
      const u: User = {
          id: `u${Date.now()}`,
          nom_complet: "Nouvel Utilisateur",
          email: "user@edc.cm",
          role: UserRole.USER,
          projets_autorises: []
      }
      addUser(u);
  }

  const handleAddFonction = () => {
    if (newFonction.trim()) {
      addFonction(newFonction.toUpperCase());
      setNewFonction('');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center">
          <SettingsIcon className="mr-3 text-slate-700" size={28} />
          Administration
        </h1>
        <p className="text-slate-500 mt-1">
          Gestion des utilisateurs, des rôles et des référentiels système.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('USERS')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center ${
              activeTab === 'USERS' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users size={18} className="mr-2" />
            Gestion des Utilisateurs
          </button>
          <button
            onClick={() => setActiveTab('CONFIG')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center ${
              activeTab === 'CONFIG' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers size={18} className="mr-2" />
            Référentiels & Fonctions
          </button>
        </div>
      </div>

      {/* --- USERS TAB --- */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <h3 className="text-lg font-bold text-slate-800">Liste des Utilisateurs</h3>
             <button onClick={handleAddUserMock} className="flex items-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-800 shadow-sm transition-colors">
                <Plus size={16} className="mr-2" />
                Nouvel Utilisateur
             </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nom Complet</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Rôle</th>
                  <th className="px-6 py-4">Périmètre Projets</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">{u.nom_complet}</td>
                    <td className="px-6 py-4 text-slate-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        u.role === UserRole.ADMIN || u.role === UserRole.SUPER_ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {u.projets_autorises.join(', ')}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-slate-400 hover:text-blue-600 mr-3">
                         <Edit2 size={16} />
                       </button>
                       <button onClick={() => deleteUser(u.id)} className="text-slate-400 hover:text-red-600">
                         <Trash2 size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- CONFIG TAB --- */}
      {activeTab === 'CONFIG' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fonctions Parente Management */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <Layers size={20} className="mr-2 text-slate-400" />
                Fonctions Analytiques
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Liste des fonctions parentes disponibles pour la classification des marchés.
            </p>
            
            <ul className="space-y-2 mb-6">
              {fonctions.map((f) => (
                <li key={f.libelle} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-medium text-slate-700 text-xs">{f.libelle}</span>
                  <button 
                    onClick={() => deleteFonction(f.libelle)}
                    className="text-slate-400 hover:text-red-500 transition-colors ml-4 flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex space-x-2 mt-4 pt-4 border-t border-slate-100">
              <input 
                type="text" 
                placeholder="Nouvelle fonction..." 
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={newFonction}
                onChange={(e) => setNewFonction(e.target.value)}
              />
              <button 
                onClick={handleAddFonction}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 flex items-center"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;