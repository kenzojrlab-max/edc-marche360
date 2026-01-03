// contexts/MarketContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_MARCHES, MOCK_PROJETS, MOCK_USERS, CONFIG_FONCTIONS, MOCK_LIBRARY_DOCUMENTS } from '../services/mockData';
import { Marche, Projet, User, ConfigFonction, LibraryDocument, UserRole } from '../types';

interface MarketContextType {
  // Données
  marches: Marche[];
  projets: Projet[];
  users: User[];
  fonctions: ConfigFonction[];
  documents: LibraryDocument[];
  
  // --- SESSION ---
  currentUser: User | null; // L'utilisateur connecté
  login: (email: string, pass: string) => boolean;
  logout: () => void;

  // --- ETAT GLOBAL DE L'APPLICATION (NOUVEAU POUR LA LIAISON) ---
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedProjetId: string;
  setSelectedProjetId: (id: string) => void;

  // Actions
  updateMarche: (updatedMarche: Marche) => void;
  addMarche: (newMarche: Marche) => void;
  
  addProjet: (newProjet: Projet) => void;
  updateProjet: (updatedProjet: Projet) => void;
  
  addUser: (newUser: User) => void;
  updateUser: (updatedUser: User) => void;
  deleteUser: (userId: string) => void;

  addFonction: (libelle: string) => void;
  deleteFonction: (libelle: string) => void;

  // Actions Documents
  addDocument: (doc: LibraryDocument) => void;
  deleteDocument: (id: string) => void;

  getMarcheById: (id: string) => Marche | undefined;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

// 🔒 VERSION AVEC VERSIONING DU STATE (Pour éviter les conflits de cache)
const STATE_VERSION = "1.0.0";

export const MarketProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialisation avec les données Mock
  const [marches, setMarches] = useState<Marche[]>(MOCK_MARCHES);
  const [projets, setProjets] = useState<Projet[]>(MOCK_PROJETS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [fonctions, setFonctions] = useState<ConfigFonction[]>(CONFIG_FONCTIONS);
  const [documents, setDocuments] = useState<LibraryDocument[]>(MOCK_LIBRARY_DOCUMENTS);
  
  // --- GESTION SESSION ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // --- ETAT GLOBAL (PERSISTANCE NAVIGATION) ---
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedProjetId, setSelectedProjetId] = useState<string>('');

  const login = (email: string, pass: string): boolean => {
    // 1. CODE GENERIQUE ADMIN (Backdoor pour admin)
    if (pass === "EDC2025") {
       const adminUser: User = {
         id: 'admin-master',
         email: email, // On garde l'email saisi
         nom_complet: 'Administrateur (Master)',
         role: UserRole.ADMIN,
         projets_autorises: []
       };
       setCurrentUser(adminUser);
       return true;
    }

    // 2. Vérification classique
    const userFound = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Simplification : si l'user existe et (pas de mdp défini OU mdp correspond)
    if (userFound) {
        if (!userFound.password || userFound.password === pass) {
            setCurrentUser(userFound);
            return true;
        }
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // --- MARCHÉS ---
  // 🔒 VERSION SÉCURISÉE avec VALIDATION STRICTE
  const updateMarche = (updatedMarche: Marche) => {
    // ✅ VALIDATION STRICTE : Vérifier que l'objet est complet
    const requiredKeys = ['id', 'exercice', 'projet_id', 'dates_realisees', 'dates_prevues', 'execution'];
    const missingKeys = requiredKeys.filter(key => !(key in updatedMarche));
    
    if (missingKeys.length > 0) {
      console.error('❌ ERREUR : Tentative de mise à jour d\'un marché INCOMPLET !');
      console.error('Clés manquantes :', missingKeys);
      console.error('Objet reçu :', updatedMarche);
      
      // 🚨 En production, on REFUSE la mise à jour pour éviter les bugs
      alert('Erreur système : Impossible de mettre à jour le marché (données incomplètes). Contactez l\'administrateur.');
      return;
    }
    
    // ✅ Vérification supplémentaire : dates_realisees doit avoir toutes les clés
    const requiredDateKeys = [
      'saisine_cipm_prev', 'saisine_cipm', 'examen_dao_cipm', 'validation_dao',
      'ano_bailleur_dao', 'lancement_ao', 'additif', 'depouillement',
      'validation_eval_offres', 'ano_bailleur_eval', 'ouverture_financiere',
      'prop_attrib_cipm', 'avis_conforme_ca', 'ano_bailleur_attrib', 'publication',
      'notification_attrib', 'souscription_projet', 'saisine_cipm_projet',
      'examen_projet_cipm', 'validation_projet', 'ano_bailleur_projet',
      'signature_marche', 'notification'
    ];
    
    const missingDateKeys = requiredDateKeys.filter(key => !(key in updatedMarche.dates_realisees));
    
    if (missingDateKeys.length > 0) {
      console.error('❌ ERREUR : dates_realisees INCOMPLET !');
      console.error('Clés de dates manquantes :', missingDateKeys);
      console.error('dates_realisees reçu :', updatedMarche.dates_realisees);
      
      alert('Erreur système : Structure de dates incomplète. Contactez l\'administrateur.');
      return;
    }
    
    // ✅ Validation OK → Mise à jour
    console.log('✅ Validation OK : Mise à jour du marché', updatedMarche.id);
    
    setMarches(prev => {
      const result = prev.map(m => m.id === updatedMarche.id ? updatedMarche : m);
      console.log('🔵 État après mise à jour :', {
        totalMarches: result.length,
        marcheUpdated: updatedMarche.id,
        hasAllProps: !!updatedMarche.exercice && !!updatedMarche.projet_id
      });
      return result;
    });
  };

  const addMarche = (newMarche: Marche) => {
    // ✅ VALIDATION avant ajout
    const requiredKeys = ['id', 'exercice', 'projet_id', 'dates_realisees', 'dates_prevues', 'execution'];
    const missingKeys = requiredKeys.filter(key => !(key in newMarche));
    
    if (missingKeys.length > 0) {
      console.error('❌ ERREUR : Tentative d\'ajout d\'un marché INCOMPLET !');
      console.error('Clés manquantes :', missingKeys);
      console.error('Objet reçu :', newMarche);
      
      alert('Erreur système : Impossible d\'ajouter le marché (données incomplètes). Vérifiez l\'import Excel.');
      return;
    }
    
    console.log('✅ Validation OK : Ajout du marché', newMarche.id);
    
    setMarches(prev => {
      const result = [...prev, newMarche];
      console.log('🟢 Marché ajouté :', {
        totalMarches: result.length,
        nouveauMarche: newMarche.id,
        exercice: newMarche.exercice,
        projet_id: newMarche.projet_id
      });
      return result;
    });
  };

  const getMarcheById = (id: string) => marches.find(m => m.id === id);

  // --- PROJETS ---
  const addProjet = (newProjet: Projet) => {
    setProjets(prev => [...prev, newProjet]);
  };

  const updateProjet = (updatedProjet: Projet) => {
    setProjets(prev => prev.map(p => p.id === updatedProjet.id ? updatedProjet : p));
  };

  // --- UTILISATEURS ---
  const addUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    // Connexion automatique après inscription
    setCurrentUser(newUser);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
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

  // --- DOCUMENTS BIBLIOTHEQUE ---
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
        documents,
        currentUser,
        login,
        logout,
        selectedYear,        // <--- EXPORTÉ
        setSelectedYear,     // <--- EXPORTÉ
        selectedProjetId,    // <--- EXPORTÉ
        setSelectedProjetId, // <--- EXPORTÉ
        updateMarche, 
        addMarche, 
        addProjet,
        updateProjet, 
        addUser,
        updateUser,
        deleteUser,
        addFonction,
        deleteFonction,
        addDocument,
        deleteDocument,
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