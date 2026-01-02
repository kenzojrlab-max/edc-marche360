// pages/Settings.tsx
import React, { useState } from 'react';
import { 
  Users, Settings as SettingsIcon, Shield, Layers, Plus, Trash2, Edit2, Save, UserCheck, Check, X
} from 'lucide-react';
import { User, UserRole } from '../types';
import { useMarkets } from '../contexts/MarketContext'; 
// IMPORT DU COMPOSANT CUSTOM
import { CustomBulleSelect } from '../components/CommonComponents';

const Settings: React.FC = () => {
  const { 
    users, 
    fonctions, 
    addUser, 
    updateUser, 
    deleteUser, 
    addFonction, 
    deleteFonction, 
    currentUser 
  } = useMarkets();

  const [activeTab, setActiveTab] = useState<'USERS' | 'CONFIG'>('USERS');
  const [newFonction, setNewFonction] = useState('');

  // État pour stocker les rôles en cours de modification avant validation
  const [pendingRoles, setPendingRoles] = useState<Record<string, UserRole>>({});

  // Vérification dynamique des droits d'administration
  const isAdmin = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SUPER_ADMIN;

  // Gestion de la sélection temporaire (sans sauvegarde immédiate)
  const handleRoleSelect = (userId: string, newRole: UserRole) => {
    setPendingRoles(prev => ({ ...prev, [userId]: newRole }));
  };

  // Validation finale du changement
  const saveRole = (userId: string) => {
    const newRole = pendingRoles[userId];
    const userToUpdate = users.find(u => u.id === userId);
    
    if (userToUpdate && newRole) {
       updateUser({ ...userToUpdate, role: newRole });
       
       // On nettoie l'état temporaire après validation
       const nextPending = { ...pendingRoles };
       delete nextPending[userId];
       setPendingRoles(nextPending);
    }
  };

  // Annulation du changement
  const cancelRole = (userId: string) => {
       const nextPending = { ...pendingRoles };
       delete nextPending[userId];
       setPendingRoles(nextPending);
  };

  const handleAddUserMock = () => {
      const u: User = {
          id: `u${Date.now()}`,
          nom_complet: "Nouvel Utilisateur",
          email: "user@edc.cm",
          role: UserRole.GUEST,
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

  // Options pour le sélecteur de rôle
  const roleOptions = [
    { value: UserRole.GUEST, label: 'INVITÉ (Restreint)' },
    { value: UserRole.USER, label: 'UTILISATEUR (Complet)' },
    { value: UserRole.PROJECT_MANAGER, label: 'CHEF PROJET' },
    { value: UserRole.ADMIN, label: 'ADMINISTRATEUR' }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center uppercase tracking-tight">
            <SettingsIcon className="mr-3 text-slate-700" size={32} />
            Administration
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
            Gestion des utilisateurs • Rôles • Référentiels
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('USERS')}
            className={`pb-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors flex items-center ${
              activeTab === 'USERS' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Users size={16} className="mr-2" />
            Gestion des Utilisateurs
          </button>
          <button
            onClick={() => setActiveTab('CONFIG')}
            className={`pb-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors flex items-center ${
              activeTab === 'CONFIG' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Layers size={16} className="mr-2" />
            Référentiels & Fonctions
          </button>
        </div>
      </div>

      {/* --- USERS TAB --- */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-visible animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[2rem]">
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Liste des Utilisateurs</h3>
             {isAdmin && (
               <button onClick={handleAddUserMock} className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-slate-900/10">
                  <Plus size={14} className="mr-2" />
                  Simuler Ajout
               </button>
             )}
          </div>
          
          <div className="overflow-visible">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nom Complet</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Rôle & Droits</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u, index) => {
                   const isGuest = u.role === UserRole.GUEST;
                   const isMe = u.id === currentUser?.id;
                   
                   // Détermine le rôle à afficher (celui en cours de modif OU le réel)
                   const displayedRole = pendingRoles[u.id] || u.role;
                   const hasPendingChange = pendingRoles[u.id] && pendingRoles[u.id] !== u.role;

                   // CORRECTION ICI : Détection des derniers éléments de la liste
                   // Si c'est l'un des 2 derniers utilisateurs, on ouvre le menu vers le HAUT ('top')
                   const isLastItems = index >= users.length - 2;

                   return (
                    <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${isMe ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-6 py-4 font-black text-slate-800">
                        {u.nom_complet}
                        {isMe && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-[8px] uppercase">Vous</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{u.email}</td>
                      <td className="px-6 py-4">
                        {/* UTILISATION DU CUSTOM BULLE SELECT */}
                        {isAdmin && !isMe ? (
                          <div className="flex items-center gap-3">
                            <div className="w-48 bg-white border border-slate-200 rounded-2xl shadow-sm">
                               <CustomBulleSelect 
                                  value={displayedRole}
                                  onChange={(e: any) => handleRoleSelect(u.id, e.target.value as UserRole)}
                                  options={roleOptions}
                                  placeholder="Sélectionner un rôle"
                                  // CORRECTION : On passe la position calculée
                                  position={isLastItems ? 'top' : 'bottom'}
                               />
                            </div>

                            {/* BOUTONS DE VALIDATION INSTANTANÉE */}
                            {hasPendingChange && (
                               <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                                  <button 
                                    onClick={() => saveRole(u.id)} 
                                    className="p-1.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 shadow-md hover:scale-110 transition-transform" 
                                    title="Valider le changement"
                                  >
                                    <Check size={12} />
                                  </button>
                                  <button 
                                    onClick={() => cancelRole(u.id)} 
                                    className="p-1.5 bg-slate-200 text-slate-500 rounded-full hover:bg-slate-300 hover:text-slate-700 transition-colors" 
                                    title="Annuler"
                                  >
                                    <X size={12} />
                                  </button>
                               </div>
                            )}
                          </div>
                        ) : (
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                            u.role === UserRole.GUEST ? 'bg-amber-100 text-amber-700' :
                            u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {u.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isGuest ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-[9px] font-black uppercase"><Shield size={10} /> Accès limité</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-black uppercase"><UserCheck size={10} /> Validé</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                         {!isMe && isAdmin && (
                           <button onClick={() => deleteUser(u.id)} className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors">
                             <Trash2 size={16} />
                           </button>
                         )}
                      </td>
                    </tr>
                   );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- CONFIG TAB --- */}
      {activeTab === 'CONFIG' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Fonctions Parente Management */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center">
                <Layers size={18} className="mr-2 text-primary" />
                Fonctions Analytiques
              </h3>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
              Ces fonctions sont utilisées pour classifier les marchés lors de leur création (ex: Direction Technique, Support, etc.).
            </p>
            
            <ul className="space-y-2 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {fonctions.map((f) => (
                <li key={f.libelle} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-primary/20 transition-colors">
                  <span className="font-black text-slate-700 text-xs uppercase">{f.libelle}</span>
                  {isAdmin && (
                    <button 
                      onClick={() => deleteFonction(f.libelle)}
                      className="text-slate-300 hover:text-red-500 transition-colors ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {isAdmin && (
              <div className="flex gap-2 pt-6 border-t border-slate-100">
                <input 
                  type="text" 
                  placeholder="Nouvelle fonction..." 
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                  value={newFonction}
                  onChange={(e) => setNewFonction(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFonction()}
                />
                <button 
                  onClick={handleAddFonction}
                  className="px-4 py-3 bg-slate-900 text-white rounded-xl hover:scale-105 transition-transform shadow-lg shadow-slate-900/10"
                >
                  <Plus size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;