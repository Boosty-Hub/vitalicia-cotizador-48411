// Types for the health insurance quotation system

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  secondName?: string;
  secondLastName?: string;
  idType: 'cedula' | 'passport' | 'rif';
  idNumber: string;
  email: string;
  birthDate: string;
  gender: 'male' | 'female';
  phone: string;
  hasInsuranceAdvisor: boolean;
  profession?: string;
  occupation?: string;
  company?: string;
  country: string;
  state: string;
  city: string;
  zone?: string;
  address?: string;
  maritalStatus?: string;
  annualIncome?: string;
  averageAnnualPremium?: string;
  economicActivity?: string;
}

export interface FamilyMember {
  id: string;
  relationship: 'spouse' | 'child' | 'parent' | 'other';
  firstName: string;
  lastName: string;
  secondName?: string;
  secondLastName?: string;
  hasId: boolean;
  idType?: 'cedula' | 'passport';
  idNumber?: string;
  birthDate: string;
  gender: 'male' | 'female';
  height: number; // in cm
  weight: number; // in kg
  profession?: string;
  occupation?: string;
  hasGoodHealth: boolean;
}

export interface CoverageOption {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  price?: number;
}

export interface InsurancePlan {
  id: string;
  name: string;
  coverageAmount: number;
  monthlyPremium: number;
  totalAnnualPremium: number;
  installments: number;
  additionalCoverages: number;
  features: string[];
  recommended?: boolean;
}

export interface HealthCondition {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
  details?: string;
}

export interface HealthDeclaration {
  smoking: boolean;
  riskyActivities: boolean;
  conditions: HealthCondition[];
  hasCongenitalConditions: boolean;
  congenitalDetails?: string;
  hasImplants: boolean;
  implantDetails?: string;
  isPregnant: boolean;
  otherConditions?: string;
  noneOfTheAbove: boolean;
}

export interface DocumentUpload {
  personId: string; // 'titular' or family member id
  personName: string;
  idDocument?: File;
  additionalDocuments?: File[];
  required: boolean;
  uploaded: boolean;
}

export interface QuotationData {
  personalInfo: PersonalInfo;
  familyMembers: FamilyMember[];
  selectedPlan?: InsurancePlan;
  additionalCoverages: CoverageOption[];
  healthDeclarations: Record<string, HealthDeclaration>; // keyed by person id
  documents: DocumentUpload[];
  currentStep: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationStep {
  id: number;
  name: string;
  title: string;
  description: string;
  completed: boolean;
  valid: boolean;
}

// Validation schemas
export interface ValidationError {
  field: string;
  message: string;
}

export interface StepValidation {
  isValid: boolean;
  errors: ValidationError[];
}

// Venezuelan specific data
export const VENEZUELAN_STATES = [
  'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar',
  'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón',
  'Guárico', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta',
  'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Vargas', 'Yaracuy', 'Zulia'
];

export const PHONE_CODES = [
  { code: '0414', name: 'Movistar' },
  { code: '0424', name: 'Movistar' },
  { code: '0416', name: 'Movilnet' },
  { code: '0426', name: 'Movilnet' },
  { code: '0412', name: 'Digitel' },
  { code: '0212', name: 'CANTV Caracas' },
  { code: '0234', name: 'CANTV Miranda' },
  { code: '0235', name: 'CANTV Miranda' },
  { code: '0237', name: 'CANTV Miranda' },
  { code: '0238', name: 'CANTV Miranda' },
  { code: '0239', name: 'CANTV Miranda' },
  { code: '0240', name: 'CANTV Aragua' },
  { code: '0241', name: 'CANTV Aragua' },
  { code: '0242', name: 'CANTV Aragua' },
  { code: '0243', name: 'CANTV Aragua' },
  { code: '0244', name: 'CANTV Aragua' },
  { code: '0245', name: 'CANTV Aragua' },
  { code: '0246', name: 'CANTV Aragua' }
];

export const HEALTH_CONDITIONS = [
  { id: 'smoking', name: '¿Usted fuma o ha fumado?', category: 'lifestyle' },
  { id: 'risky_activities', name: '¿Practica algún deporte o actividad profesional que se puede considerar de riesgo?', category: 'lifestyle' },
  { id: 'hyperinsulinism', name: 'Hiperinsulinismo', category: 'endocrine' },
  { id: 'hypertension', name: 'Hipertensión', category: 'cardiovascular' },
  { id: 'hypothyroidism', name: 'Hipotiroidismo', category: 'endocrine' },
  { id: 'asthma', name: 'Asma', category: 'respiratory' },
  { id: 'cancer', name: 'Cáncer', category: 'oncology' },
  { id: 'neurological', name: 'Enfermedades Neurológicas y del Sistema Nervioso', category: 'neurological' },
  { id: 'cardiovascular', name: 'Enfermedades Cardiovasculares', category: 'cardiovascular' },
  { id: 'osteomuscular', name: 'Enfermedades Osteomusculares', category: 'osteomuscular' },
  { id: 'genitourinary', name: 'Enfermedades Genito-Urinarias', category: 'genitourinary' },
  { id: 'hematological', name: 'Enfermedades Hematológicas', category: 'hematological' },
  { id: 'digestive', name: 'Enfermedades Digestivas', category: 'digestive' },
  { id: 'endocrine', name: 'Enfermedades del Sistema Endocrino', category: 'endocrine' },
  { id: 'burns', name: 'Quemaduras de alto grado', category: 'trauma' },
  { id: 'respiratory', name: 'Enfermedades Respiratorias', category: 'respiratory' },
  { id: 'organ_transplant', name: 'Trasplante de Órganos', category: 'surgery' },
  { id: 'septic_process', name: 'Proceso Séptico Mayor', category: 'infectious' },
  { id: 'polytrauma', name: 'Politraumatismo', category: 'trauma' },
  { id: 'congenital', name: '¿Tienes alguna patología malformación o enfermedad o condición congénita o adquirida?', category: 'congenital' },
  { id: 'implants', name: '¿Tienes colocado algún material de osteosíntesis, prótesis, stent y/o Marcapasos?', category: 'implants' },
  { id: 'pregnancy', name: '¿Estas embarazada?', category: 'reproductive' },
  { id: 'ocular', name: 'Enfermedades Oculares', category: 'ocular' },
  { id: 'diabetes', name: 'Diabetes', category: 'endocrine' },
  { id: 'polycystic_ovary', name: 'Ovario poliquístico', category: 'reproductive' },
  { id: 'hysterectomy', name: 'Histerectomía', category: 'reproductive' },
  { id: 'cesarean', name: 'Cesárea o partos', category: 'reproductive' },
  { id: 'breast_implant', name: 'Implante de prótesis mamaria (Estética)', category: 'aesthetic' },
  { id: 'cholecystectomy', name: 'Colecsitectomía (Extracción de la vesícula)', category: 'surgery' },
  { id: 'adenoidectomy', name: 'Adenoidectomía (Extracción de adenoides)', category: 'surgery' },
  { id: 'appendectomy', name: 'Apendicectomía (Extracción del apéndice)', category: 'surgery' },
  { id: 'tonsillectomy', name: 'Amigdalectomía (Extracción de las amígdalas)', category: 'surgery' },
  { id: 'covid19', name: 'Covid 19', category: 'infectious' },
  { id: 'other', name: 'Otra Enfermedad o Condición de Salud no nombrada en los puntos anteriores / Especifique', category: 'other' },
  { id: 'none', name: 'Ninguna de las anteriores', category: 'none' }
];
