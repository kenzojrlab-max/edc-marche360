
import { Marche, SourceFinancement, StatutGlobal, User, UserRole, ConfigFonction, Projet, LibraryDocument, DocumentCategory } from '../types';

export const CURRENT_USER: User = {
  id: 'u1',
  email: 'admin@edc.cm',
  nom_complet: 'Administrateur Marchés',
  role: UserRole.ADMIN,
  projets_autorises: ['EDC_2024', 'BM_2024']
};

export const MOCK_USERS: User[] = [
  CURRENT_USER,
  {
    id: 'u2',
    email: 'j.douglas@edc.cm',
    nom_complet: 'Jean Douglas',
    role: UserRole.PROJECT_MANAGER,
    projets_autorises: ['EDC_2024']
  },
  {
    id: 'u3',
    email: 'm.ngono@edc.cm',
    nom_complet: 'Marie Ngono',
    role: UserRole.USER,
    projets_autorises: ['BM_2024']
  }
];

export const CONFIG_FONCTIONS: ConfigFonction[] = [
  { libelle: "Exploitation et maintenance" },
  { libelle: "Développement des projets" },
  { libelle: "EDC support" }
];

export const MOCK_PROJETS: Projet[] = [
  {
    id: 'EDC_2024',
    libelle: 'Budget Propre EDC S.A.',
    source_financement: SourceFinancement.BUDGET_EDC,
    exercice: 2024,
    date_creation: '2024-01-10'
  },
  {
    id: 'BM_2024',
    libelle: 'Programme Banque Mondiale (P-123)',
    source_financement: SourceFinancement.BAILLEUR,
    bailleur_nom: 'BM',
    exercice: 2024,
    date_creation: '2024-02-05'
  }
];

const mockDoc = { nom: 'Document.pdf', url: '#', date_upload: '2024-05-01' };

export const MOCK_MARCHES: Marche[] = [
  {
    id: '001/EDC/2024',
    objet: 'Maintenance turbines Memve\'ele',
    fonction_parente: "Exploitation et maintenance",
    activite_parente: 'Maintenance',
    type_ao: 'AONO',
    type_prestation: 'Services',
    montant_prevu: 125000000,
    source_financement: SourceFinancement.BUDGET_EDC,
    imputation_budgetaire: 'EXP-M01',
    hors_ppm: false,
    statut_global: StatutGlobal.EN_COURS,
    exercice: 2024,
    projet_id: 'EDC_2024',
    delai_global_passation: 120,
    dates_prevues: {
      saisine_cipm_prev: undefined,
      saisine_cipm: '2024-03-01',
      examen_dao_cipm: '2024-03-15',
      validation_dao: undefined,
      ano_bailleur_dao: undefined,
      lancement_ao: '2024-04-01',
      additif: undefined,
      depouillement: '2024-04-30',
      validation_eval_offres: undefined,
      ano_bailleur_eval: undefined,
      ouverture_financiere: undefined,
      prop_attrib_cipm: '2024-05-10',
      avis_conforme_ca: '2024-05-15',
      ano_bailleur_attrib: undefined,
      publication: '2024-05-20',
      notification_attrib: undefined,
      souscription_projet: '2024-06-01',
      saisine_cipm_projet: '2024-06-10',
      examen_projet_cipm: '2024-06-20',
      validation_projet: undefined,
      ano_bailleur_projet: undefined,
      signature_marche: '2024-07-01',
      notification: '2024-07-05'
    },
    dates_realisees: {
      saisine_cipm_prev: '2024-02-25',
      saisine_cipm: '2024-03-05',
      examen_dao_cipm: '2024-03-20',
      validation_dao: '2024-03-25',
      ano_bailleur_dao: undefined,
      lancement_ao: '2024-04-05',
      additif: undefined,
      depouillement: '2024-05-02',
      validation_eval_offres: undefined,
      ano_bailleur_eval: undefined,
      ouverture_financiere: undefined,
      prop_attrib_cipm: undefined,
      avis_conforme_ca: undefined,
      ano_bailleur_attrib: undefined,
      publication: undefined,
      notification_attrib: undefined,
      souscription_projet: undefined,
      saisine_cipm_projet: undefined,
      examen_projet_cipm: undefined,
      validation_projet: undefined,
      ano_bailleur_projet: undefined,
      signature_marche: undefined,
      notification: undefined
    },
    docs: {
      dao: mockDoc,
      imputation: mockDoc,
      saisine: mockDoc,
      validation_dao: mockDoc,
      lancement: mockDoc,
      depouillement: mockDoc
    }, 
    is_infructueux: false, 
    is_annule: false, 
    recours: 'Néant', 
    etat_avancement: 'Examen DAO'
  }
];

export const MOCK_LIBRARY_DOCUMENTS: LibraryDocument[] = [
  {
    id: '1',
    titre: 'Code des Marchés Publics Cameroun',
    categorie: DocumentCategory.REGLEMENTAIRE,
    format: 'PDF',
    date_upload: '2023-01-15',
    url: '#',
    description: 'Version consolidée du Code des Marchés Publics applicable aux entreprises publiques.',
    auteur: 'MINMAP',
    taille: '1.2 MB'
  },
  {
    id: '2',
    titre: 'Modèle de Dossier d\'Appel d\'Offres - Travaux',
    categorie: DocumentCategory.MODELES,
    format: 'DOCX',
    date_upload: '2023-06-10',
    url: '#',
    description: 'Template standard pour la rédaction des DAO de travaux.',
    auteur: 'EDC Passation',
    taille: '450 KB'
  },
  {
    id: '3',
    titre: 'Rapport d\'Audit de Performance 2023',
    categorie: DocumentCategory.AUDITS,
    format: 'PDF',
    date_upload: '2024-02-01',
    url: '#',
    description: 'Audit annuel de la performance des marchés et de la célérité des procédures.',
    auteur: 'KPMG',
    taille: '3.5 MB'
  }
];

export const formatFCFA = (amount: number) => {
  return new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(amount);
};

export const calculateDaysBetween = (start?: string, end?: string): number | null => {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
};
