import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plane, Shield, Plus, Info } from "lucide-react";
import { useQuotation } from "@/contexts/QuotationContext";
import { CoverageOption } from "@/types/quotation";

const AVAILABLE_COVERAGES: CoverageOption[] = [
  {
    id: "travel_assistance",
    name: "Asistencia en viajes",
    description: "Cobertura médica y asistencia durante viajes al exterior",
    enabled: false,
    price: 0
  },
  {
    id: "dental_extended",
    name: "Cobertura Dental Extendida",
    description: "Tratamientos dentales especializados, ortodoncia y cirugía oral",
    enabled: false,
    price: 15.50
  },
  {
    id: "vision_care",
    name: "Cuidado Visual",
    description: "Consultas oftalmológicas, lentes y cirugías refractivas",
    enabled: false,
    price: 12.25
  },
  {
    id: "maternity_plus",
    name: "Maternidad Plus",
    description: "Cobertura ampliada para embarazo, parto y cuidados neonatales",
    enabled: false,
    price: 28.75
  },
  {
    id: "wellness_program",
    name: "Programa de Bienestar",
    description: "Chequeos preventivos, vacunas y programas de salud",
    enabled: false,
    price: 18.90
  },
  {
    id: "mental_health",
    name: "Salud Mental",
    description: "Consultas psicológicas y psiquiátricas, terapias especializadas",
    enabled: false,
    price: 22.40
  }
];

export const AdditionalCoveragesStep = () => {
  const { state, updateAdditionalCoverages } = useQuotation();
  const [selectedCoverages, setSelectedCoverages] = useState<CoverageOption[]>(
    state.additionalCoverages.length > 0 ? state.additionalCoverages : AVAILABLE_COVERAGES
  );

  const toggleCoverage = (coverageId: string) => {
    const updatedCoverages = selectedCoverages.map(coverage =>
      coverage.id === coverageId
        ? { ...coverage, enabled: !coverage.enabled }
        : coverage
    );
    setSelectedCoverages(updatedCoverages);
  };

  // Auto-save changes
  useEffect(() => {
    updateAdditionalCoverages(selectedCoverages);
  }, [selectedCoverages, updateAdditionalCoverages]);

  const totalAdditionalCost = selectedCoverages
    .filter(coverage => coverage.enabled)
    .reduce((total, coverage) => total + (coverage.price || 0), 0);

  const enabledCoveragesCount = selectedCoverages.filter(coverage => coverage.enabled).length;

  const currentPlan = state.selectedPlan;
  const totalMembers = 1 + state.familyMembers.length;
  const basePremium = currentPlan?.monthlyPremium || 0;
  const newTotalPremium = basePremium + (totalAdditionalCost * totalMembers);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-1 sm:space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold">Selecciona coberturas adicionales</h2>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Su monto actual es de ${basePremium.toFixed(2)}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground px-4">
          ¿Qué coberturas adicionales desearías sumar?
        </p>
      </div>

      {/* Current Plan Summary - Mobile Optimized */}
      {currentPlan && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-semibold">{currentPlan.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Suma Asegurada: ${currentPlan.coverageAmount.toLocaleString()}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {totalMembers} persona{totalMembers > 1 ? 's' : ''} cubierta{totalMembers > 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  ${basePremium.toFixed(2)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Prima mensual base</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Additional Coverages - Mobile Optimized */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-base sm:text-lg font-semibold">Coberturas Adicionales Disponibles</h3>
          {enabledCoveragesCount > 0 && (
            <Badge variant="secondary" className="w-fit text-xs sm:text-sm">
              {enabledCoveragesCount} seleccionada{enabledCoveragesCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="grid gap-3 sm:gap-4">
          {selectedCoverages.map((coverage) => (
            <Card 
              key={coverage.id} 
              className={`transition-all duration-200 ${
                coverage.enabled 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:shadow-md'
              }`}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-2 sm:space-x-3 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        {coverage.id === 'travel_assistance' && <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                        {coverage.id !== 'travel_assistance' && <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-semibold leading-tight">{coverage.name}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-snug">
                          {coverage.description}
                        </p>
                      </div>
                    </div>
                    
                    <Switch
                      checked={coverage.enabled}
                      onCheckedChange={() => toggleCoverage(coverage.id)}
                      className="flex-shrink-0"
                    />
                  </div>
                  
                  {/* Pricing */}
                  <div className="flex items-center justify-between pl-10 sm:pl-13">
                    {coverage.price && coverage.price > 0 ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <div className="text-left">
                          <p className="text-base sm:text-lg font-semibold">
                            ${coverage.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">por persona/mes</p>
                        </div>
                        {coverage.enabled && (
                          <div className="text-xs sm:text-sm text-green-600">
                            Total {totalMembers} persona{totalMembers > 1 ? 's' : ''}: ${(coverage.price * totalMembers).toFixed(2)}/mes
                          </div>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                        Gratis
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cost Summary */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>Resumen de Costos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Prima base ({currentPlan?.name || 'Plan seleccionado'})</span>
              <span className="font-medium">${basePremium.toFixed(2)}</span>
            </div>
            
            {selectedCoverages.filter(c => c.enabled && c.price && c.price > 0).map((coverage) => (
              <div key={coverage.id} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  + {coverage.name} ({totalMembers} persona{totalMembers > 1 ? 's' : ''})
                </span>
                <span className="text-green-600">
                  +${((coverage.price || 0) * totalMembers).toFixed(2)}
                </span>
              </div>
            ))}
            
            {selectedCoverages.filter(c => c.enabled && (!c.price || c.price === 0)).length > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  + Coberturas gratuitas ({selectedCoverages.filter(c => c.enabled && (!c.price || c.price === 0)).length})
                </span>
                <span className="text-green-600">$0.00</span>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total mensual</span>
            <span className="text-primary">${newTotalPremium.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Total anual</span>
            <span>${(newTotalPremium * 12).toFixed(2)}</span>
          </div>
          
          {totalAdditionalCost > 0 && (
            <div className="text-center p-3 bg-green-100 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Ahorro potencial:</strong> Las coberturas adicionales pueden ayudarte a ahorrar 
                hasta un 40% en gastos médicos no cubiertos por el plan base.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Note */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800">Información Importante</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Las coberturas adicionales se aplican a todos los miembros del grupo familiar</li>
                <li>• Puedes modificar estas coberturas durante la renovación anual de tu póliza</li>
                <li>• Algunas coberturas tienen períodos de carencia específicos</li>
                <li>• Los precios mostrados no incluyen impuestos aplicables</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
