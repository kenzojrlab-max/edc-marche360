// contexts/MarketContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { MOCK_MARCHES } from '../services/mockData';
import { Marche } from '../types';

interface MarketContextType {
  marches: Marche[];
  updateMarche: (updatedMarche: Marche) => void;
  getMarcheById: (id: string) => Marche | undefined;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider = ({ children }: { children: React.ReactNode }) => {
  const [marches, setMarches] = useState<Marche[]>(MOCK_MARCHES);

  const updateMarche = (updatedMarche: Marche) => {
    setMarches(prev => prev.map(m => m.id === updatedMarche.id ? updatedMarche : m));
  };

  const getMarcheById = (id: string) => marches.find(m => m.id === id);

  return (
    <MarketContext.Provider value={{ marches, updateMarche, getMarcheById }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarkets = () => {
  const context = useContext(MarketContext);
  if (!context) throw new Error('useMarkets doit être utilisé dans un MarketProvider');
  return context;
};