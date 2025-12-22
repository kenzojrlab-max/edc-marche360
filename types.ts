
export enum UserRole {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  USER = 'USER',
  PROJECT_MANAGER = 'PROJECT_MANAGER'
}

export interface User {
  id: string;
  email: string;
  nom_complet: string;
  role: UserRole;
  projets_autorises: string[];
}

export enum SourceFinancement {
  BAILLEUR = 'BAILLEUR',
  BUDGET_EDC = 'BUDGET_EDC'
}

export enum StatutGlobal {
  PLANIFIE = 'PLANIFIE',
  EN_COURS = 'EN_COURS',
  ATTRIBUE = 'ATTRIBUE',
  SIGNE = 'SIGNE',
  CLOTURE = 'CLOTURE',
  ANNULE = 'ANNULE',
  INFRUCTUEUX = 'INFRUCTUEUX'
}

export interface PieceJointe {
  nom: string;
  url: string;
  date_upload: string;
}

export type JalonPassationKey = 
  | 'saisine_cipm_prev'
  | 'saisine_cipm' 
  | 'examen_dao_cipm' 
  | 'validation_dao'
  | 'ano_bailleur_dao' 
  | 'lancement_ao'
  | 'additif'
  | 'depouillement' 
  | 'validation_eval_offres'
  | 'ano_bailleur_eval'
  | 'ouverture_financiere'
  | 'prop_attrib_cipm'
  | 'avis_conforme_ca' 
  | 'ano_bailleur_attrib' 
  | 'publication' 
  | 'notification_attrib'
  | 'souscription_projet' 
  | 'saisine_cipm_projet' 
  | 'examen_projet_cipm' 
  | 'validation_projet'
  | 'ano_bailleur_projet' 
  | 'signature_marche'
  | 'notification';

export interface Projet {
  id: string;
  libelle: string;
  source_financement: SourceFinancement;
  bailleur_nom?: string;
  exercice: number;
  ppm_pdf_url?: string;
  date_creation: string;
}

export interface Marche {
  id: string; 
  objet: string; 
  fonction_parente: string;
  activite_parente: string;
  type_ao: string;
  type_prestation: string;
  montant_prevu: number;
  source_financement: SourceFinancement;
  bailleur_nom?: string; 
  imputation_budgetaire: string;
  hors_ppm: boolean;
  statut_global: StatutGlobal;
  exercice: number;
  projet_id: string;
  delai_global_passation: number;

  dates_prevues: Record<JalonPassationKey, string | undefined>;
  dates_realisees: Record<JalonPassationKey, string | undefined>;

  docs: Partial<Record<string, PieceJointe>>;
  is_infructueux: boolean;
  doc_infructueux?: PieceJointe;
  is_annule: boolean;
  motif_annulation?: string;
  doc_annulation_ca?: PieceJointe;
  
  recours: string; 
  etat_avancement: string;
  titulaire?: string;
  montant_ttc_reel?: number;
}

export interface ConfigFonction {
  libelle: string;
}

export enum DocumentCategory {
  AUDITS = 'AUDITS',
  PERFORMANCE = 'PERFORMANCE',
  REGLEMENTAIRE = 'REGLEMENTAIRE',
  MODELES = 'MODELES'
}

export interface LibraryDocument {
  id: string;
  titre: string;
  categorie: DocumentCategory;
  format: 'PDF' | 'DOCX' | 'XLSX';
  date_upload: string;
  url: string;
  description?: string;
  auteur?: string;
  taille?: string;
}
