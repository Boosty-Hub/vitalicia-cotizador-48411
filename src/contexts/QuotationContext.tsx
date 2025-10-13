import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { QuotationData, PersonalInfo, FamilyMember, CoverageOption, HealthDeclaration, DocumentUpload, InsurancePlan } from '@/types/quotation';

// Initial state
const initialState: QuotationData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    secondName: '',
    secondLastName: '',
    idType: 'cedula',
    idNumber: '',
    email: '',
    birthDate: '',
    gender: 'male',
    phone: '',
    hasInsuranceAdvisor: false,
    profession: '',
    occupation: '',
    company: '',
    country: 'Venezuela',
    state: '',
    city: '',
    zone: '',
    address: '',
    maritalStatus: '',
    annualIncome: '',
    averageAnnualPremium: '',
    economicActivity: ''
  },
  familyMembers: [],
  selectedPlan: undefined,
  additionalCoverages: [],
  healthDeclarations: {},
  documents: [],
  currentStep: 1,
  completed: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Action types
type QuotationAction =
  | { type: 'UPDATE_PERSONAL_INFO'; payload: Partial<PersonalInfo> }
  | { type: 'ADD_FAMILY_MEMBER'; payload: FamilyMember }
  | { type: 'UPDATE_FAMILY_MEMBER'; payload: { id: string; data: Partial<FamilyMember> } }
  | { type: 'REMOVE_FAMILY_MEMBER'; payload: string }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SELECT_PLAN'; payload: InsurancePlan }
  | { type: 'UPDATE_ADDITIONAL_COVERAGES'; payload: CoverageOption[] }
  | { type: 'UPDATE_HEALTH_DECLARATION'; payload: { personId: string; declaration: HealthDeclaration } }
  | { type: 'UPDATE_DOCUMENTS'; payload: DocumentUpload[] }
  | { type: 'RESET_QUOTATION' }
  | { type: 'LOAD_QUOTATION'; payload: QuotationData };

// Reducer
function quotationReducer(state: QuotationData, action: QuotationAction): QuotationData {
  switch (action.type) {
    case 'UPDATE_PERSONAL_INFO':
      return {
        ...state,
        personalInfo: { ...state.personalInfo, ...action.payload },
        updatedAt: new Date().toISOString()
      };

    case 'ADD_FAMILY_MEMBER':
      return {
        ...state,
        familyMembers: [...state.familyMembers, action.payload],
        updatedAt: new Date().toISOString()
      };

    case 'UPDATE_FAMILY_MEMBER':
      return {
        ...state,
        familyMembers: state.familyMembers.map(member =>
          member.id === action.payload.id
            ? { ...member, ...action.payload.data }
            : member
        ),
        updatedAt: new Date().toISOString()
      };

    case 'REMOVE_FAMILY_MEMBER':
      return {
        ...state,
        familyMembers: state.familyMembers.filter(member => member.id !== action.payload),
        updatedAt: new Date().toISOString()
      };

    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload,
        updatedAt: new Date().toISOString()
      };

    case 'SELECT_PLAN':
      return {
        ...state,
        selectedPlan: action.payload,
        updatedAt: new Date().toISOString()
      };

    case 'UPDATE_ADDITIONAL_COVERAGES':
      return {
        ...state,
        additionalCoverages: action.payload,
        updatedAt: new Date().toISOString()
      };

    case 'UPDATE_HEALTH_DECLARATION':
      return {
        ...state,
        healthDeclarations: {
          ...state.healthDeclarations,
          [action.payload.personId]: action.payload.declaration
        },
        updatedAt: new Date().toISOString()
      };

    case 'UPDATE_DOCUMENTS':
      return {
        ...state,
        documents: action.payload,
        updatedAt: new Date().toISOString()
      };

    case 'RESET_QUOTATION':
      return {
        ...initialState,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

    case 'LOAD_QUOTATION':
      return action.payload;

    default:
      return state;
  }
}

// Context
interface QuotationContextType {
  state: QuotationData;
  dispatch: React.Dispatch<QuotationAction>;
  // Helper functions
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  addFamilyMember: (member: FamilyMember) => void;
  updateFamilyMember: (id: string, data: Partial<FamilyMember>) => void;
  removeFamilyMember: (id: string) => void;
  setCurrentStep: (step: number) => void;
  selectPlan: (plan: InsurancePlan) => void;
  updateAdditionalCoverages: (coverages: CoverageOption[]) => void;
  updateHealthDeclaration: (personId: string, declaration: HealthDeclaration) => void;
  updateDocuments: (documents: DocumentUpload[]) => void;
  resetQuotation: () => void;
  // Validation helpers
  isStepValid: (step: number) => boolean;
  getStepErrors: (step: number) => string[];
}

const QuotationContext = createContext<QuotationContextType | undefined>(undefined);

// Provider component
interface QuotationProviderProps {
  children: ReactNode;
}

export const QuotationProvider: React.FC<QuotationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(quotationReducer, initialState);

  // Helper functions
  const updatePersonalInfo = (info: Partial<PersonalInfo>) => {
    dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: info });
  };

  const addFamilyMember = (member: FamilyMember) => {
    dispatch({ type: 'ADD_FAMILY_MEMBER', payload: member });
  };

  const updateFamilyMember = (id: string, data: Partial<FamilyMember>) => {
    dispatch({ type: 'UPDATE_FAMILY_MEMBER', payload: { id, data } });
  };

  const removeFamilyMember = (id: string) => {
    dispatch({ type: 'REMOVE_FAMILY_MEMBER', payload: id });
  };

  const setCurrentStep = (step: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  };

  const selectPlan = (plan: InsurancePlan) => {
    dispatch({ type: 'SELECT_PLAN', payload: plan });
  };

  const updateAdditionalCoverages = (coverages: CoverageOption[]) => {
    dispatch({ type: 'UPDATE_ADDITIONAL_COVERAGES', payload: coverages });
  };

  const updateHealthDeclaration = (personId: string, declaration: HealthDeclaration) => {
    dispatch({ type: 'UPDATE_HEALTH_DECLARATION', payload: { personId, declaration } });
  };

  const updateDocuments = (documents: DocumentUpload[]) => {
    dispatch({ type: 'UPDATE_DOCUMENTS', payload: documents });
  };

  const resetQuotation = () => {
    dispatch({ type: 'RESET_QUOTATION' });
  };

  // Validation helpers
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: // Personal Info
        return !!(
          state.personalInfo.firstName &&
          state.personalInfo.lastName &&
          state.personalInfo.idNumber &&
          state.personalInfo.email &&
          state.personalInfo.birthDate &&
          state.personalInfo.phone
        );
      case 2: // Family Members
        return true; // Family members are optional
      case 3: // Plan Selection
        return !!state.selectedPlan;
      case 4: // Additional Coverages
        return true; // Additional coverages are optional
      case 5: // Documents
        return state.documents.every(doc => doc.uploaded || !doc.required);
      case 6: // Health Declaration
        const requiredPersons = ['titular', ...state.familyMembers.map(m => m.id)];
        return requiredPersons.every(personId => 
          state.healthDeclarations[personId] !== undefined
        );
      default:
        return false;
    }
  };

  const getStepErrors = (step: number): string[] => {
    const errors: string[] = [];
    
    switch (step) {
      case 1:
        if (!state.personalInfo.firstName) errors.push('Nombre es requerido');
        if (!state.personalInfo.lastName) errors.push('Apellido es requerido');
        if (!state.personalInfo.idNumber) errors.push('Número de identificación es requerido');
        if (!state.personalInfo.email) errors.push('Email es requerido');
        if (!state.personalInfo.birthDate) errors.push('Fecha de nacimiento es requerida');
        if (!state.personalInfo.phone) errors.push('Teléfono es requerido');
        break;
      case 3:
        if (!state.selectedPlan) errors.push('Debe seleccionar un plan');
        break;
      case 5:
        state.documents.forEach(doc => {
          if (doc.required && !doc.uploaded) {
            errors.push(`Documento requerido para ${doc.personName}`);
          }
        });
        break;
      case 6:
        const requiredPersons = ['titular', ...state.familyMembers.map(m => m.id)];
        requiredPersons.forEach(personId => {
          if (!state.healthDeclarations[personId]) {
            const personName = personId === 'titular' ? 'Titular' : 
              state.familyMembers.find(m => m.id === personId)?.firstName || 'Familiar';
            errors.push(`Declaración de salud requerida para ${personName}`);
          }
        });
        break;
    }
    
    return errors;
  };

  const value: QuotationContextType = {
    state,
    dispatch,
    updatePersonalInfo,
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
    setCurrentStep,
    selectPlan,
    updateAdditionalCoverages,
    updateHealthDeclaration,
    updateDocuments,
    resetQuotation,
    isStepValid,
    getStepErrors
  };

  return (
    <QuotationContext.Provider value={value}>
      {children}
    </QuotationContext.Provider>
  );
};

// Hook to use the context
export const useQuotation = (): QuotationContextType => {
  const context = useContext(QuotationContext);
  if (context === undefined) {
    throw new Error('useQuotation must be used within a QuotationProvider');
  }
  return context;
};
