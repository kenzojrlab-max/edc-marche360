// contexts/MarketContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { MOCK_MARCHES, MOCK_PROJETS } from '../services/mockData';
import { Marche, Projet } from '../types';

interface MarketContextType {
  marches: Marche[];
  projets: Projet[]; // <--- AJOUT
  updateMarche: (updatedMarche: Marche) => void;
  addMarche: (newMarche: Marche) => void;
  addProjet: (newProjet: Projet) => void; // <--- AJOUT
  getMarcheById: (id: string) => Marche | undefined;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider = ({ children }: { children: React.ReactNode }) => {
  const [marches, setMarches] = useState<Marche[]>(MOCK_MARCHES);
  const [projets, setProjets] = useState<Projet[]>(MOCK_PROJETS); // <--- AJOUT ETAT GLOBAL

  // Fonction pour modifier un marché existant
  const updateMarche = (updatedMarche: Marche) => {
    setMarches(prev => prev.map(m => m.id === updatedMarche.id ? updatedMarche : m));
  };

  // Fonction pour ajouter un marché
  const addMarche = (newMarche: Marche) => {
    setMarches(prev => [...prev, newMarche]);
  };

  // Fonction pour ajouter un projet
  const addProjet = (newProjet: Projet) => {
    setProjets(prev => [...prev, newProjet]);
  };

  const getMarcheById = (id: string) => marches.find(m => m.id === id);

  return (
    <MarketContext.Provider value={{ 
        marches, 
        projets, // <--- EXPOSITION
        updateMarche, 
        addMarche, 
        addProjet, // <--- EXPOSITION
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