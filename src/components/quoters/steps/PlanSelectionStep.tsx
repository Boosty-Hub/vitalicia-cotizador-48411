import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, DollarSign, Check, Star, Users, Calculator } from "lucide-react";
import { useQuotation } from "@/contexts/QuotationContext";
import { InsurancePlan } from "@/types/quotation";

const INSURANCE_PLANS: InsurancePlan[] = [
  {
    id: "plan_30k",
    name: "Plan Básico",
    coverageAmount: 30000,
    monthlyPremium: 65.33,
    totalAnnualPremium: 784.00,
    installments: 12,
    additionalCoverages: 2,
    features: [
      "Suma Asegurada $30.000",
      "Hospitalización y cirugía",
      "Consultas médicas",
      "Medicamentos básicos",
      "Emergencias 24/7",
      "Red nacional de clínicas"
    ]
  },
  {
    id: "plan_50k",
    name: "Plan Intermedio",
    coverageAmount: 50000,
    monthlyPremium: 114.67,
    totalAnnualPremium: 1376.00,
    installments: 12,
    additionalCoverages: 1,
    features: [
      "Suma Asegurada $50.000",
      "Todo lo del Plan Básico",
      "Especialistas sin referencia",
      "Exámenes diagnósticos",
      "Medicina preventiva",
      "Cobertura dental básica",
      "Maternidad (después de 10 meses)"
    ],
    recommended: true
  },
  {
    id: "plan_100k",
    name: "Plan Premium",
    coverageAmount: 100000,
    monthlyPremium: 185.50,
    totalAnnualPremium: 2226.00,
    installments: 12,
    additionalCoverages: 0,
    features: [
      "Suma Asegurada $100.000",
      "Todo lo del Plan Intermedio",
      "Cirugías complejas",
      "Tratamientos oncológicos",
      "Medicina estética reconstructiva",
      "Cobertura internacional de emergencia",
      "Habitación privada garantizada",
      "Segunda opinión médica"
    ]
  }
];

const PAYMENT_PLANS = [
  { id: "monthly", name: "Mensual", installments: 12, description: "12 cuotas mensuales" },
  { id: "quarterly", name: "Trimestral", installments: 4, description: "4 cuotas trimestrales", discount: 0.02 },
  { id: "biannual", name: "Semestral", installments: 2, description: "2 cuotas semestrales", discount: 0.05 },
  { id: "annual", name: "Anual", installments: 1, description: "1 pago anual", discount: 0.10 }
];

export const PlanSelectionStep = () => {
  const { state, selectPlan } = useQuotation();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(state.selectedPlan?.id || "");
  const [paymentPlan, setPaymentPlan] = useState<string>("monthly");

  const totalMembers = 1 + state.familyMembers.length;
  const selectedPaymentPlan = PAYMENT_PLANS.find(p => p.id === paymentPlan);

  const calculatePremium = (basePremium: number, members: number, discount: number = 0) => {
    const memberMultiplier = members === 1 ? 1 : 1 + ((members - 1) * 0.4); // 40% additional per extra member
    const grossPremium = basePremium * memberMultiplier;
    return grossPremium * (1 - discount);
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = INSURANCE_PLANS.find(p => p.id === planId);
    if (plan && selectedPaymentPlan) {
      const adjustedPremium = calculatePremium(
        plan.monthlyPremium, 
        totalMembers, 
        selectedPaymentPlan.discount || 0
      );
      
      const updatedPlan: InsurancePlan = {
        ...plan,
        monthlyPremium: adjustedPremium,
        totalAnnualPremium: adjustedPremium * 12,
        installments: selectedPaymentPlan.installments
      };
      
      selectPlan(updatedPlan);
    }
  };

  const handlePaymentPlanChange = (newPaymentPlan: string) => {
    setPaymentPlan(newPaymentPlan);
    if (selectedPlanId) {
      handlePlanSelect(selectedPlanId);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-1 sm:space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold">Selecciona tu Suma Asegurada</h2>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground px-4">
          Elige el plan que mejor se adapte a tus necesidades y presupuesto
        </p>
      </div>

      {/* Coverage Summary - Mobile Optimized */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm sm:text-base font-medium">Personas a asegurar</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {totalMembers} persona{totalMembers > 1 ? 's' : ''} 
                  {totalMembers > 1 && ` (Titular + ${state.familyMembers.length} familiar${state.familyMembers.length > 1 ? 'es' : ''})`}
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <p className="text-sm sm:text-base font-medium mb-1 sm:text-right">Plan de pago</p>
              <Select value={paymentPlan} onValueChange={handlePaymentPlanChange}>
                <SelectTrigger className="w-full sm:w-40 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_PLANS.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      <div className="flex items-center space-x-2">
                        <span>{plan.name}</span>
                        {plan.discount && (
                          <Badge variant="secondary" className="text-xs">
                            -{(plan.discount * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Selection - Mobile Optimized */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-semibold">Planes Disponibles</h3>
        
        <RadioGroup value={selectedPlanId} onValueChange={handlePlanSelect}>
          <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {INSURANCE_PLANS.map((plan) => {
              const adjustedPremium = calculatePremium(
                plan.monthlyPremium, 
                totalMembers, 
                selectedPaymentPlan?.discount || 0
              );
              const installmentAmount = adjustedPremium / (selectedPaymentPlan?.installments || 1);
              
              return (
                <div key={plan.id} className="relative">
                  <RadioGroupItem
                    value={plan.id}
                    id={plan.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={plan.id}
                    className="cursor-pointer"
                  >
                    <Card className={`
                      relative transition-all duration-200 hover:shadow-lg
                      ${selectedPlanId === plan.id 
                        ? 'ring-2 ring-primary shadow-lg' 
                        : 'hover:shadow-md'
                      }
                      ${plan.recommended ? 'border-primary' : ''}
                    `}>
                      {plan.recommended && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-primary text-primary-foreground px-3 py-1">
                            <Star className="w-3 h-3 mr-1" />
                            Recomendado
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader className="text-center pb-4">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <div className="space-y-1">
                          <div className="text-3xl font-bold text-primary">
                            ${installmentAmount.toFixed(2)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {selectedPaymentPlan?.description}
                          </p>
                          {selectedPaymentPlan?.discount && (
                            <p className="text-xs text-green-600 font-medium">
                              Ahorro del {(selectedPaymentPlan.discount * 100).toFixed(0)}%
                            </p>
                          )}
                        </div>
                        <CardDescription className="font-medium">
                          Suma Asegurada: ${plan.coverageAmount.toLocaleString()}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="flex items-start space-x-2 text-sm">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        
                        {plan.additionalCoverages > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground">
                              + {plan.additionalCoverages} cobertura{plan.additionalCoverages > 1 ? 's' : ''} adicional{plan.additionalCoverages > 1 ? 'es' : ''}
                            </p>
                          </div>
                        )}
                        
                        <div className="pt-2 border-t space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Prima mensual:</span>
                            <span className="font-medium">${adjustedPremium.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Total anual:</span>
                            <span className="font-medium">${(adjustedPremium * 12).toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
                </div>
              );
            })}
          </div>
        </RadioGroup>
      </div>

      {/* Selected Plan Summary */}
      {selectedPlanId && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Calculator className="w-5 h-5" />
              <span>Resumen de tu Selección</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const selectedPlan = INSURANCE_PLANS.find(p => p.id === selectedPlanId);
              if (!selectedPlan) return null;
              
              const adjustedPremium = calculatePremium(
                selectedPlan.monthlyPremium, 
                totalMembers, 
                selectedPaymentPlan?.discount || 0
              );
              const installmentAmount = adjustedPremium / (selectedPaymentPlan?.installments || 1);
              
              return (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-800">Plan Seleccionado</h4>
                    <p className="text-sm">{selectedPlan.name}</p>
                    <p className="text-sm">Suma Asegurada: ${selectedPlan.coverageAmount.toLocaleString()}</p>
                    <p className="text-sm">Personas cubiertas: {totalMembers}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-800">Costo</h4>
                    <p className="text-sm">
                      {selectedPaymentPlan?.description}: 
                      <span className="font-medium ml-1">${installmentAmount.toFixed(2)}</span>
                    </p>
                    <p className="text-sm">
                      Prima mensual equivalente: 
                      <span className="font-medium ml-1">${adjustedPremium.toFixed(2)}</span>
                    </p>
                    <p className="text-sm">
                      Total anual: 
                      <span className="font-medium ml-1">${(adjustedPremium * 12).toFixed(2)}</span>
                    </p>
                    {selectedPaymentPlan?.discount && (
                      <p className="text-xs text-green-600 font-medium">
                        ¡Ahorras ${((selectedPlan.monthlyPremium * totalMembers * 12) * selectedPaymentPlan.discount).toFixed(2)} al año!
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Important Notes */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <h4 className="font-semibold text-amber-800 mb-2">Información Importante</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Los montos no incluyen IGTF (Impuesto a las Grandes Transacciones Financieras)</li>
            <li>• Las primas pueden variar según la edad y condiciones de salud de los asegurados</li>
            <li>• Período de carencia de 30 días para enfermedades y 10 meses para maternidad</li>
            <li>• Cobertura válida en toda la red nacional de proveedores</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
