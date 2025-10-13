import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, ArrowLeft, User, AlertTriangle, CheckCircle } from "lucide-react";
import { useQuotation } from "@/contexts/QuotationContext";
import { HealthDeclaration, HEALTH_CONDITIONS } from "@/types/quotation";

export const HealthDeclarationStep = () => {
  const { state, updateHealthDeclaration } = useQuotation();
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
  
  // Create list of all persons (titular + family members)
  const allPersons = [
    {
      id: 'titular',
      name: `${state.personalInfo.firstName} ${state.personalInfo.lastName}`,
      role: 'Titular'
    },
    ...state.familyMembers.map(member => ({
      id: member.id,
      name: `${member.firstName} ${member.lastName}`,
      role: 'Familiar'
    }))
  ];

  const currentPerson = allPersons[currentPersonIndex];
  
  // Get current person's health declaration or create default
  const currentDeclaration = state.healthDeclarations[currentPerson.id] || {
    smoking: false,
    riskyActivities: false,
    conditions: HEALTH_CONDITIONS.map(condition => ({
      ...condition,
      enabled: false
    })),
    hasCongenitalConditions: false,
    congenitalDetails: '',
    hasImplants: false,
    implantDetails: '',
    isPregnant: false,
    otherConditions: '',
    noneOfTheAbove: true
  };

  const [declaration, setDeclaration] = useState<HealthDeclaration>(currentDeclaration);

  // Update declaration when person changes
  useEffect(() => {
    const personDeclaration = state.healthDeclarations[currentPerson.id] || {
      smoking: false,
      riskyActivities: false,
      conditions: HEALTH_CONDITIONS.map(condition => ({
        ...condition,
        enabled: false
      })),
      hasCongenitalConditions: false,
      congenitalDetails: '',
      hasImplants: false,
      implantDetails: '',
      isPregnant: false,
      otherConditions: '',
      noneOfTheAbove: true
    };
    setDeclaration(personDeclaration);
  }, [currentPersonIndex, state.healthDeclarations, currentPerson.id]);

  // Auto-save declaration changes
  useEffect(() => {
    updateHealthDeclaration(currentPerson.id, declaration);
  }, [declaration, currentPerson.id, updateHealthDeclaration]);

  const updateCondition = (conditionId: string, enabled: boolean) => {
    setDeclaration(prev => ({
      ...prev,
      conditions: prev.conditions.map(condition =>
        condition.id === conditionId ? { ...condition, enabled } : condition
      ),
      noneOfTheAbove: false // If any condition is selected, "none of the above" becomes false
    }));
  };

  const handleNoneOfTheAbove = (enabled: boolean) => {
    if (enabled) {
      // If "none of the above" is selected, disable all other conditions
      setDeclaration(prev => ({
        ...prev,
        smoking: false,
        riskyActivities: false,
        conditions: prev.conditions.map(condition => ({ ...condition, enabled: false })),
        hasCongenitalConditions: false,
        congenitalDetails: '',
        hasImplants: false,
        implantDetails: '',
        isPregnant: false,
        otherConditions: '',
        noneOfTheAbove: true
      }));
    } else {
      setDeclaration(prev => ({ ...prev, noneOfTheAbove: false }));
    }
  };

  const handleBasicCondition = (field: keyof HealthDeclaration, value: boolean) => {
    setDeclaration(prev => ({
      ...prev,
      [field]: value,
      noneOfTheAbove: false
    }));
  };

  const getCompletedPersonsCount = () => {
    return allPersons.filter(person => 
      state.healthDeclarations[person.id] !== undefined
    ).length;
  };

  const isCurrentDeclarationComplete = () => {
    // At least one option must be selected (either conditions or "none of the above")
    const hasConditions = declaration.smoking || 
                         declaration.riskyActivities || 
                         declaration.conditions.some(c => c.enabled) ||
                         declaration.hasCongenitalConditions ||
                         declaration.hasImplants ||
                         declaration.isPregnant ||
                         declaration.noneOfTheAbove;
    
    return hasConditions;
  };

  const nextPerson = () => {
    if (currentPersonIndex < allPersons.length - 1) {
      setCurrentPersonIndex(currentPersonIndex + 1);
    }
  };

  const previousPerson = () => {
    if (currentPersonIndex > 0) {
      setCurrentPersonIndex(currentPersonIndex - 1);
    }
  };

  const goToPerson = (index: number) => {
    setCurrentPersonIndex(index);
  };

  const hasAnyConditions = declaration.smoking || 
                          declaration.riskyActivities || 
                          declaration.conditions.some(c => c.enabled) ||
                          declaration.hasCongenitalConditions ||
                          declaration.hasImplants ||
                          declaration.isPregnant ||
                          (declaration.otherConditions && declaration.otherConditions.trim().length > 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-1 sm:space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold">Declaración de salud</h2>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground px-4">
          Responde las siguientes preguntas en base a los hábitos y estado de salud del asegurado.
        </p>
      </div>

      {/* Person Navigation - Mobile Optimized */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base font-semibold leading-tight">Selecciona a tus familiares e indícanos si padecen o han padecido de alguna enfermedad</h3>
            <Badge variant="outline" className="w-fit text-xs">
              {getCompletedPersonsCount()}/{allPersons.length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {allPersons.map((person, index) => {
              const isCompleted = state.healthDeclarations[person.id] !== undefined;
              const isCurrent = index === currentPersonIndex;
              
              return (
                <Button
                  key={person.id}
                  variant={isCurrent ? "default" : "outline"}
                  onClick={() => goToPerson(index)}
                  className={`
                    justify-start h-auto p-2 sm:p-3 text-left
                    ${isCompleted && !isCurrent ? 'border-green-500 bg-green-50 hover:bg-green-100' : ''}
                  `}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 w-full">
                    <div className={`
                      w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${isCurrent ? 'bg-primary-foreground' : isCompleted ? 'bg-green-100' : 'bg-muted'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      ) : (
                        <User className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium truncate">{person.name}</p>
                      <p className="text-xs opacity-70">{person.role}</p>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Person Declaration - Mobile Optimized */}
      <Card>
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
            <User className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="truncate">{currentPerson.name}</span>
            <Badge variant="secondary" className="text-xs">{currentPerson.role}</Badge>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">
            Responde las siguientes preguntas en base a los hábitos y estado de salud del asegurado.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
          {/* Basic Lifestyle Questions */}
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base font-medium">¿Usted fuma o ha fumado?</Label>
              <RadioGroup
                value={declaration.smoking ? "true" : "false"}
                onValueChange={(value) => handleBasicCondition('smoking', value === "true")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="smoking-yes" />
                  <Label htmlFor="smoking-yes">Sí</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="smoking-no" />
                  <Label htmlFor="smoking-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">
                ¿Practica algún deporte o actividad profesional que se puede considerar de riesgo?
              </Label>
              <RadioGroup
                value={declaration.riskyActivities ? "true" : "false"}
                onValueChange={(value) => handleBasicCondition('riskyActivities', value === "true")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="risky-yes" />
                  <Label htmlFor="risky-yes">Sí</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="risky-no" />
                  <Label htmlFor="risky-no">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Separator />

          {/* Medical Conditions */}
          <div className="space-y-4">
            <h4 className="font-semibold">Condiciones Médicas</h4>
            
            <div className="grid gap-3">
              {HEALTH_CONDITIONS.filter(condition => 
                !['congenital', 'implants', 'pregnancy', 'other', 'none'].includes(condition.category)
              ).map((condition) => {
                const isEnabled = declaration.conditions.find(c => c.id === condition.id)?.enabled || false;
                
                return (
                  <div key={condition.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor={condition.id} className="flex-1 cursor-pointer">
                      {condition.name}
                    </Label>
                    <Switch
                      id={condition.id}
                      checked={isEnabled}
                      onCheckedChange={(checked) => updateCondition(condition.id, checked)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Special Conditions */}
          <div className="space-y-4">
            <h4 className="font-semibold">Condiciones Especiales</h4>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  ¿Tienes alguna patología malformación o enfermedad o condición congénita o adquirida?
                </Label>
                <RadioGroup
                  value={declaration.hasCongenitalConditions ? "true" : "false"}
                  onValueChange={(value) => {
                    const hasConditions = value === "true";
                    setDeclaration(prev => ({
                      ...prev,
                      hasCongenitalConditions: hasConditions,
                      congenitalDetails: hasConditions ? prev.congenitalDetails : '',
                      noneOfTheAbove: false
                    }));
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="congenital-yes" />
                    <Label htmlFor="congenital-yes">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="congenital-no" />
                    <Label htmlFor="congenital-no">No</Label>
                  </div>
                </RadioGroup>
                
                {declaration.hasCongenitalConditions && (
                  <Textarea
                    placeholder="Especifique la condición..."
                    value={declaration.congenitalDetails}
                    onChange={(e) => setDeclaration(prev => ({ 
                      ...prev, 
                      congenitalDetails: e.target.value 
                    }))}
                  />
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">
                  ¿Tienes colocado algún material de osteosíntesis, prótesis, stent y/o Marcapasos?
                </Label>
                <RadioGroup
                  value={declaration.hasImplants ? "true" : "false"}
                  onValueChange={(value) => {
                    const hasImplants = value === "true";
                    setDeclaration(prev => ({
                      ...prev,
                      hasImplants: hasImplants,
                      implantDetails: hasImplants ? prev.implantDetails : '',
                      noneOfTheAbove: false
                    }));
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="implants-yes" />
                    <Label htmlFor="implants-yes">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="implants-no" />
                    <Label htmlFor="implants-no">No</Label>
                  </div>
                </RadioGroup>
                
                {declaration.hasImplants && (
                  <Textarea
                    placeholder="Especifique el tipo de implante o material..."
                    value={declaration.implantDetails}
                    onChange={(e) => setDeclaration(prev => ({ 
                      ...prev, 
                      implantDetails: e.target.value 
                    }))}
                  />
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">¿Estas embarazada?</Label>
                <RadioGroup
                  value={declaration.isPregnant ? "true" : "false"}
                  onValueChange={(value) => handleBasicCondition('isPregnant', value === "true")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="pregnant-yes" />
                    <Label htmlFor="pregnant-yes">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="pregnant-no" />
                    <Label htmlFor="pregnant-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <Separator />

          {/* Other Conditions */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Otra Enfermedad o Condición de Salud no nombrada en los puntos anteriores / Especifique
            </Label>
            <Textarea
              placeholder="Describa cualquier otra condición médica relevante..."
              value={declaration.otherConditions}
              onChange={(e) => setDeclaration(prev => ({ 
                ...prev, 
                otherConditions: e.target.value,
                noneOfTheAbove: false
              }))}
            />
          </div>

          <Separator />

          {/* None of the Above */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
              <Label htmlFor="none-above" className="flex-1 cursor-pointer font-medium">
                Ninguna de las anteriores
              </Label>
              <Switch
                id="none-above"
                checked={declaration.noneOfTheAbove}
                onCheckedChange={handleNoneOfTheAbove}
              />
            </div>
          </div>

          {/* Warning for conditions */}
          {hasAnyConditions && !declaration.noneOfTheAbove && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Importante:</strong> Las condiciones médicas declaradas pueden afectar la prima 
                o cobertura de su póliza. Nuestro equipo médico evaluará cada caso individualmente.
              </AlertDescription>
            </Alert>
          )}

          {/* Navigation Buttons - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={previousPerson}
              disabled={currentPersonIndex === 0}
              className="flex items-center justify-center space-x-2 w-full sm:w-auto h-11 sm:h-10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm sm:text-base">Anterior</span>
            </Button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              {!isCurrentDeclarationComplete() && (
                <span className="text-xs sm:text-sm text-muted-foreground text-center">
                  Seleccione al menos una opción
                </span>
              )}
              
              {currentPersonIndex < allPersons.length - 1 ? (
                <Button
                  onClick={nextPerson}
                  disabled={!isCurrentDeclarationComplete()}
                  className="flex items-center justify-center space-x-2 w-full sm:w-auto h-11 sm:h-10"
                >
                  <span className="text-sm sm:text-base">Siguiente</span>
                  <User className="w-4 h-4" />
                </Button>
              ) : (
                <Badge variant="outline" className="text-green-600 border-green-600 text-xs sm:text-sm py-2 justify-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Última Persona
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Status */}
      {getCompletedPersonsCount() === allPersons.length && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ¡Excelente! Has completado la declaración de salud para todas las personas. 
            Puedes continuar al siguiente paso.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
