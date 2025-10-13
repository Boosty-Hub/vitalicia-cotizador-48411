import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import { QuotationProvider, useQuotation } from "@/contexts/QuotationContext";

// Import step components (we'll create these next)
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { FamilyMembersStep } from "./steps/FamilyMembersStep";
import { PlanSelectionStep } from "./steps/PlanSelectionStep";
import { AdditionalCoveragesStep } from "./steps/AdditionalCoveragesStep";
import { DocumentUploadStep } from "./steps/DocumentUploadStep";
import { HealthDeclarationStep } from "./steps/HealthDeclarationStep";
import { QuotationSummaryStep } from "./steps/QuotationSummaryStep";

const STEPS = [
  {
    id: 1,
    name: "personal-info",
    title: "Información Personal",
    description: "Datos básicos del titular"
  },
  {
    id: 2,
    name: "family-members",
    title: "Grupo Familiar",
    description: "Agregar familiares a asegurar"
  },
  {
    id: 3,
    name: "plan-selection",
    title: "Selección de Plan",
    description: "Elegir cobertura y suma asegurada"
  },
  {
    id: 4,
    name: "additional-coverages",
    title: "Coberturas Adicionales",
    description: "Servicios complementarios"
  },
  {
    id: 5,
    name: "documents",
    title: "Carga de Documentos",
    description: "Documentos de identidad"
  },
  {
    id: 6,
    name: "health-declaration",
    title: "Declaración de Salud",
    description: "Cuestionario médico"
  },
  {
    id: 7,
    name: "summary",
    title: "Resumen y Cotización",
    description: "Revisión final y cotización"
  }
];

const QuoterContent = () => {
  const { state, setCurrentStep, isStepValid, getStepErrors } = useQuotation();
  const currentStepData = STEPS.find(step => step.id === state.currentStep);
  const progress = (state.currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (state.currentStep < STEPS.length && isStepValid(state.currentStep)) {
      setCurrentStep(state.currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (state.currentStep > 1) {
      setCurrentStep(state.currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    // Allow navigation to previous steps or current step
    if (stepId <= state.currentStep) {
      setCurrentStep(stepId);
    }
  };

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 1:
        return <PersonalInfoStep />;
      case 2:
        return <FamilyMembersStep />;
      case 3:
        return <PlanSelectionStep />;
      case 4:
        return <AdditionalCoveragesStep />;
      case 5:
        return <DocumentUploadStep />;
      case 6:
        return <HealthDeclarationStep />;
      case 7:
        return <QuotationSummaryStep />;
      default:
        return <PersonalInfoStep />;
    }
  };

  const stepErrors = getStepErrors(state.currentStep);
  const canProceed = isStepValid(state.currentStep);

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Progress Bar - Mobile Optimized */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm font-medium">Progreso</span>
          <span className="text-xs sm:text-sm text-muted-foreground">
            {state.currentStep}/{STEPS.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation - Hidden on mobile, scrollable on tablet */}
      <div className="hidden lg:flex justify-between items-center space-x-2 overflow-x-auto pb-2">
        {STEPS.map((step, index) => {
          const isCompleted = step.id < state.currentStep;
          const isCurrent = step.id === state.currentStep;
          const isAccessible = step.id <= state.currentStep;
          
          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => handleStepClick(step.id)}
                disabled={!isAccessible}
                className={`
                  flex flex-col items-center p-2 lg:p-3 rounded-lg transition-all min-w-[100px] lg:min-w-[120px]
                  ${isCurrent 
                    ? 'bg-primary text-primary-foreground' 
                    : isCompleted 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-muted text-muted-foreground'
                  }
                  ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                `}
              >
                <div className="flex items-center space-x-1 mb-1">
                  {isCompleted ? (
                    <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                  ) : (
                    <span className="text-xs font-bold">{step.id}</span>
                  )}
                </div>
                <span className="text-xs font-medium text-center leading-tight">{step.title}</span>
              </button>
              {index < STEPS.length - 1 && (
                <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 text-muted-foreground mx-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Info - Mobile Optimized */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Badge variant="outline" className="text-xs">{state.currentStep}</Badge>
                <span className="text-sm sm:text-base">{currentStepData?.title}</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{currentStepData?.description}</CardDescription>
            </div>
            {stepErrors.length > 0 && (
              <div className="flex items-center space-x-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs sm:text-sm">{stepErrors.length} error(es)</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Step Content */}
          <div className="min-h-[300px] sm:min-h-[400px]">
            {renderStepContent()}
          </div>

          {/* Error Messages */}
          {stepErrors.length > 0 && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <h4 className="font-medium text-destructive mb-2">
                Por favor corrija los siguientes errores:
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {stepErrors.map((error, index) => (
                  <li key={index} className="text-sm text-destructive">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation Buttons - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-6 pt-4 sm:pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={state.currentStep === 1}
              className="flex items-center justify-center space-x-2 w-full sm:w-auto h-11 sm:h-10"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm sm:text-base">Anterior</span>
            </Button>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {state.currentStep < STEPS.length ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="flex items-center justify-center space-x-2 w-full h-11 sm:h-10"
                >
                  <span className="text-sm sm:text-base">Continuar</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => {/* Handle final submission */}}
                  disabled={!canProceed}
                  className="bg-green-600 hover:bg-green-700 w-full h-11 sm:h-10 text-sm sm:text-base"
                >
                  Finalizar Cotización
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const AdvancedHealthQuoter = () => {
  return (
    <QuotationProvider>
      <QuoterContent />
    </QuotationProvider>
  );
};
