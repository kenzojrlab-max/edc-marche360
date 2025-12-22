import React, { createContext, useContext, useState } from 'react';
import { MOCK_MARCHES } from '../services/mockData';
import { Marche } from '../types';

interface MarketContextType {
  marches: Marche[];
  updateMarche: (updatedMarche: Marche) => void;
  addMarche: (newMarche: Marche) => void; // <--- Nouvelle fonction ajoutée
  getMarcheById: (id: string) => Marche | undefined;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider = ({ children }: { children: React.ReactNode }) => {
  const [marches, setMarches] = useState<Marche[]>(MOCK_MARCHES);

  // Fonction pour modifier un marché existant (ex: upload document)
  const updateMarche = (updatedMarche: Marche) => {
    setMarches(prev => prev.map(m => m.id === updatedMarche.id ? updatedMarche : m));
  };

  // Fonction pour ajouter un NOUVEAU marché (Inscription PPM)
  const addMarche = (newMarche: Marche) => {
    setMarches(prev => [...prev, newMarche]);
  };

  const getMarcheById = (id: string) => marches.find(m => m.id === id);

  return (
    <MarketContext.Provider value={{ marches, updateMarche, addMarche, getMarcheById }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarkets = () => {
  const context = useContext(MarketContext);
  if (!context) throw new Error('useMarkets doit être utilisé dans un MarketProvider');
  return context;
};