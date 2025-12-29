// contexts/MarketContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { MOCK_MARCHES, MOCK_PROJETS, MOCK_USERS, CONFIG_FONCTIONS } from '../services/mockData';
import { Marche, Projet, User, ConfigFonction } from '../types';

interface MarketContextType {
  // Données
  marches: Marche[];
  projets: Projet[];
  users: User[];
  fonctions: ConfigFonction[];

  // Actions
  updateMarche: (updatedMarche: Marche) => void;
  addMarche: (newMarche: Marche) => void;
  
  addProjet: (newProjet: Projet) => void;
  updateProjet: (updatedProjet: Projet) => void; // <--- C'est vital que ceci soit présent
  
  addUser: (newUser: User) => void;
  deleteUser: (userId: string) => void;

  addFonction: (libelle: string) => void;
  deleteFonction: (libelle: string) => void;

  getMarcheById: (id: string) => Marche | undefined;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialisation avec les données Mock
  const [marches, setMarches] = useState<Marche[]>(MOCK_MARCHES);
  const [projets, setProjets] = useState<Projet[]>(MOCK_PROJETS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [fonctions, setFonctions] = useState<ConfigFonction[]>(CONFIG_FONCTIONS);

  // --- MARCHÉS ---
  const updateMarche = (updatedMarche: Marche) => {
    setMarches(prev => prev.map(m => m.id === updatedMarche.id ? updatedMarche : m));
  };

  const addMarche = (newMarche: Marche) => {
    setMarches(prev => [...prev, newMarche]);
  };

  const getMarcheById = (id: string) => marches.find(m => m.id === id);

  // --- PROJETS ---
  const addProjet = (newProjet: Projet) => {
    setProjets(prev => [...prev, newProjet]);
  };

  // MISE A JOUR PROJET (Vital pour le PPM Signé)
  const updateProjet = (updatedProjet: Projet) => {
    setProjets(prev => prev.map(p => p.id === updatedProjet.id ? updatedProjet : p));
  };

  // --- UTILISATEURS ---
  const addUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // --- FONCTIONS / REFERENTIELS ---
  const addFonction = (libelle: string) => {
    setFonctions(prev => [...prev, { libelle }]);
  };

  const deleteFonction = (libelle: string) => {
    setFonctions(prev => prev.filter(f => f.libelle !== libelle));
  };

  return (
    <MarketContext.Provider value={{ 
        marches, 
        projets, 
        users,
        fonctions,
        updateMarche, 
        addMarche, 
        addProjet,
        updateProjet, // <--- Exporté ici
        addUser,
        deleteUser,
        addFonction,
        deleteFonction,
        getMarcheById 
    }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarkets = () => {
  const context = useContext(MarketContext);
  if (!context) throw new Error('useMarkets doit être utilisé dans un MarketProvider');
  return context;
};