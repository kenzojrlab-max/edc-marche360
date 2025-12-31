// services/mockData.ts
import { Marche, StatutGlobal, SourceFinancement, User, UserRole, Projet, ConfigFonction, LibraryDocument, DocumentCategory } from '../types';

export const CURRENT_USER: User = {
  id: 'u1',
  email: 'admin@edc.cm',
  nom_complet: 'Administrateur Principal',
  role: UserRole.ADMIN,
  projets_autorises: []
};

export const MOCK_USERS: User[] = [
  CURRENT_USER,
  {
    id: 'u2',
    email: 'chef.projet@edc.cm',
    nom_complet: 'Jean Dupont',
    role: UserRole.PROJECT_MANAGER,
    projets_autorises: ['PROJ_001']
  },
  {
    id: 'u3',
    email: 'invite@edc.cm',
    nom_complet: 'Visiteur Externe',
    role: UserRole.GUEST,
    projets_autorises: []
  }
];

export const CONFIG_FONCTIONS: ConfigFonction[] = [
  { libelle: 'Direction Générale' },
  { libelle: 'Direction Technique' },
  { libelle: 'Direction Financière' },
  { libelle: 'Division des Marchés' }
];

// --- AJOUT MANQUANT : DOCUMENTS DE LA BIBLIOTHEQUE ---
export const MOCK_LIBRARY_DOCUMENTS: LibraryDocument[] = [
  {
    id: 'doc-1',
    titre: 'Code des Marchés Publics 2024',
    categorie: DocumentCategory.REGLEMENTAIRE,
    format: 'PDF',
    date_upload: '2024-01-15',
    url: '#',
    description: 'Version consolidée du code des marchés en vigueur.',
    auteur: 'MINMAP',
    taille: '2.4 MB'
  },
  {
    id: 'doc-2',
    titre: 'Modèle de DAO - Travaux Routiers',
    categorie: DocumentCategory.MODELES,
    format: 'DOCX',
    date_upload: '2024-02-10',
    url: '#',
    description: 'Gabarit standard pour les appels d\'offres de travaux.',
    auteur: 'Cellule des Marchés',
    taille: '540 KB'
  },
  {
    id: 'doc-3',
    titre: 'Rapport Annuel Performance 2023',
    categorie: DocumentCategory.PERFORMANCE,
    format: 'PPTX',
    date_upload: '2024-03-05',
    url: '#',
    description: 'Présentation des indicateurs de performance de la passation.',
    auteur: 'Direction Générale',
    taille: '5.1 MB'
  }
];

export const MOCK_PROJETS: Projet[] = [
  {
    id: 'PROJ_001',
    libelle: 'Projet Lom Pangar',
    source_financement: SourceFinancement.BAILLEUR,
    bailleur_nom: 'Banque Mondiale',
    exercice: 2024,
    date_creation: '2023-12-01'
  },
  {
    id: 'PROJ_002',
    libelle: 'Budget de Fonctionnement 2024',
    source_financement: SourceFinancement.BUDGET_EDC,
    exercice: 2024,
    date_creation: '2024-01-01'
  },
  {
    id: 'PROJ_003',
    libelle: 'Projet Memve\'ele',
    source_financement: SourceFinancement.BAILLEUR,
    bailleur_nom: 'BAD',
    exercice: 2025,
    date_creation: '2024-06-15'
  }
];

export const MOCK_MARCHES: Marche[] = [
  {
    id: '001/AONO/EDC/2024',
    objet: 'Fourniture de matériel informatique pour la Direction Générale',
    fonction_parente: 'Direction Générale',
    activite_parente: 'Renforcement des capacités',
    type_ao: 'AONO',
    type_prestation: 'Fournitures',
    montant_prevu: 50000000,
    source_financement: SourceFinancement.BUDGET_EDC,
    imputation_budgetaire: 'INV-2024-001',
    hors_ppm: false,
    statut_global: StatutGlobal.EN_COURS,
    exercice: 2024,
    projet_id: 'PROJ_002',
    delai_global_passation: 90,
    is_infructueux: false,
    is_annule: false,
    has_recours: false,
    etat_avancement: 'En cours de consultation',
    docs: {},
    dates_prevues: {
      saisine_cipm: '2024-01-15',
      examen_dao_cipm: '2024-01-25',
      lancement_ao: '2024-02-05',
      depouillement: '2024-03-05',
      prop_attrib_cipm: '2024-03-20',
      publication: '2024-04-01',
      notification: '2024-04-15',
      saisine_cipm_prev: undefined,
      validation_dao: undefined,
      ano_bailleur_dao: undefined,
      additif: undefined,
      validation_eval_offres: undefined,
      ano_bailleur_eval: undefined,
      ouverture_financiere: undefined,
      avis_conforme_ca: undefined,
      ano_bailleur_attrib: undefined,
      notification_attrib: undefined,
      souscription_projet: undefined,
      saisine_cipm_projet: undefined,
      examen_projet_cipm: undefined,
      validation_projet: undefined,
      ano_bailleur_projet: undefined,
      signature_marche: undefined
    },
    dates_realisees: {
      saisine_cipm: '2024-01-18',
      examen_dao_cipm: '2024-01-30',
      lancement_ao: '2024-02-10',
      depouillement: undefined,
      prop_attrib_cipm: undefined,
      publication: undefined,
      notification: undefined,
      saisine_cipm_prev: undefined,
      validation_dao: undefined,
      ano_bailleur_dao: undefined,
      additif: undefined,
      validation_eval_offres: undefined,
      ano_bailleur_eval: undefined,
      ouverture_financiere: undefined,
      avis_conforme_ca: undefined,
      ano_bailleur_attrib: undefined,
      notification_attrib: undefined,
      souscription_projet: undefined,
      saisine_cipm_projet: undefined,
      examen_projet_cipm: undefined,
      validation_projet: undefined,
      ano_bailleur_projet: undefined,
      signature_marche: undefined
    },
    execution: {
      decomptes: [],
      avenants: [],
      type_retenue_garantie: 'OPTION_A',
      has_avenant: false,
      is_resilie: false
    }
  },
  {
    id: '002/AONI/EDC/2024',
    objet: 'Travaux de réhabilitation de la route d\'accès au barrage',
    fonction_parente: 'Direction Technique',
    activite_parente: 'Maintenance Infrastructures',
    type_ao: 'AONI',
    type_prestation: 'Travaux',
    montant_prevu: 250000000,
    source_financement: SourceFinancement.BAILLEUR,
    bailleur_nom: 'Banque Mondiale',
    imputation_budgetaire: 'BM-LOM-2024-05',
    hors_ppm: false,
    statut_global: StatutGlobal.PLANIFIE,
    exercice: 2024,
    projet_id: 'PROJ_001',
    delai_global_passation: 120,
    is_infructueux: false,
    is_annule: false,
    has_recours: false,
    etat_avancement: 'Planifié',
    docs: {},
    dates_prevues: {
      saisine_cipm: '2024-03-01',
      examen_dao_cipm: '2024-03-15',
      ano_bailleur_dao: '2024-04-01',
      lancement_ao: '2024-04-15',
      depouillement: '2024-05-15',
      prop_attrib_cipm: '2024-06-01',
      ano_bailleur_attrib: '2024-06-15',
      publication: '2024-06-20',
      notification: '2024-07-01',
      saisine_cipm_prev: undefined,
      validation_dao: undefined,
      additif: undefined,
      validation_eval_offres: undefined,
      ano_bailleur_eval: undefined,
      ouverture_financiere: undefined,
      avis_conforme_ca: undefined,
      notification_attrib: undefined,
      souscription_projet: undefined,
      saisine_cipm_projet: undefined,
      examen_projet_cipm: undefined,
      validation_projet: undefined,
      ano_bailleur_projet: undefined,
      signature_marche: undefined
    },
    dates_realisees: {
      saisine_cipm_prev: undefined, saisine_cipm: undefined, examen_dao_cipm: undefined, validation_dao: undefined,
      ano_bailleur_dao: undefined, lancement_ao: undefined, additif: undefined, depouillement: undefined,
      validation_eval_offres: undefined, ano_bailleur_eval: undefined, ouverture_financiere: undefined,
      prop_attrib_cipm: undefined, avis_conforme_ca: undefined, ano_bailleur_attrib: undefined, publication: undefined,
      notification_attrib: undefined, souscription_projet: undefined, saisine_cipm_projet: undefined,
      examen_projet_cipm: undefined, validation_projet: undefined, ano_bailleur_projet: undefined,
      signature_marche: undefined, notification: undefined
    },
    execution: {
      decomptes: [],
      avenants: [],
      type_retenue_garantie: 'OPTION_A',
      has_avenant: false,
      is_resilie: false
    }
  }
];

export const formatFCFA = (amount?: number) => {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(amount);
};

export const calculateDaysBetween = (d1?: string, d2?: string) => {
  if (!d1 || !d2) return null;
  const start = new Date(d1);
  const end = new Date(d2);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};