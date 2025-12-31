// contexts/MarketContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { MOCK_MARCHES, MOCK_PROJETS, MOCK_USERS, CONFIG_FONCTIONS, MOCK_LIBRARY_DOCUMENTS } from '../services/mockData';
import { Marche, Projet, User, ConfigFonction, LibraryDocument } from '../types';

interface MarketContextType {
  // Données
  marches: Marche[];
  projets: Projet[];
  users: User[];
  fonctions: ConfigFonction[];
  documents: LibraryDocument[]; // <--- AJOUT

  // Actions
  updateMarche: (updatedMarche: Marche) => void;
  addMarche: (newMarche: Marche) => void;
  
  addProjet: (newProjet: Projet) => void;
  updateProjet: (updatedProjet: Projet) => void;
  
  addUser: (newUser: User) => void;
  deleteUser: (userId: string) => void;

  addFonction: (libelle: string) => void;
  deleteFonction: (libelle: string) => void;

  // Actions Documents
  addDocument: (doc: LibraryDocument) => void; // <--- AJOUT
  deleteDocument: (id: string) => void;        // <--- AJOUT

  getMarcheById: (id: string) => Marche | undefined;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialisation avec les données Mock
  const [marches, setMarches] = useState<Marche[]>(MOCK_MARCHES);
  const [projets, setProjets] = useState<Projet[]>(MOCK_PROJETS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [fonctions, setFonctions] = useState<ConfigFonction[]>(CONFIG_FONCTIONS);
  const [documents, setDocuments] = useState<LibraryDocument[]>(MOCK_LIBRARY_DOCUMENTS); // <--- AJOUT

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

  // --- DOCUMENTS BIBLIOTHEQUE (NOUVEAU) ---
  const addDocument = (doc: LibraryDocument) => {
    setDocuments(prev => [doc, ...prev]);
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  return (
    <MarketContext.Provider value={{ 
        marches, 
        projets, 
        users,
        fonctions,
        documents, // <--- EXPORT
        updateMarche, 
        addMarche, 
        addProjet,
        updateProjet, 
        addUser,
        deleteUser,
        addFonction,
        deleteFonction,
        addDocument,    // <--- EXPORT
        deleteDocument, // <--- EXPORT
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