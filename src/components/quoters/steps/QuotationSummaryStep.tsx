import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  User, 
  Shield, 
  DollarSign, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin,
  Download,
  Send,
  CheckCircle,
  Heart,
  Users,
  Plus
} from "lucide-react";
import { useQuotation } from "@/contexts/QuotationContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const QuotationSummaryStep = () => {
  const { state } = useQuotation();

  const totalMembers = 1 + state.familyMembers.length;
  const selectedPlan = state.selectedPlan;
  const enabledCoverages = state.additionalCoverages.filter(c => c.enabled);
  const totalAdditionalCost = enabledCoverages.reduce((total, coverage) => total + (coverage.price || 0), 0);
  const finalMonthlyPremium = (selectedPlan?.monthlyPremium || 0) + (totalAdditionalCost * totalMembers);
  const finalAnnualPremium = finalMonthlyPremium * 12;

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const hasHealthConditions = (personId: string) => {
    const declaration = state.healthDeclarations[personId];
    if (!declaration) return false;
    
    return declaration.smoking || 
           declaration.riskyActivities || 
           declaration.conditions.some(c => c.enabled) ||
           declaration.hasCongenitalConditions ||
           declaration.hasImplants ||
           declaration.isPregnant ||
           (declaration.otherConditions && declaration.otherConditions.trim().length > 0);
  };

  const handleDownloadQuote = () => {
    // Implementation for downloading PDF quote
    console.log('Downloading quote...');
  };

  const handleSendQuote = () => {
    // Implementation for sending quote via email
    console.log('Sending quote...');
  };

  const handleContractPolicy = () => {
    // Implementation for contracting the policy
    console.log('Contracting policy...');
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <FileText className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Resumen y Cotización Final</h2>
        </div>
        <p className="text-muted-foreground">
          Revisa todos los detalles de tu cotización antes de proceder
        </p>
      </div>

      {/* Personal Information Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Información del Titular</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nombre Completo</p>
              <p className="font-medium">
                {state.personalInfo.firstName} {state.personalInfo.secondName} {state.personalInfo.lastName} {state.personalInfo.secondLastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Documento de Identidad</p>
              <p className="font-medium">
                {state.personalInfo.idType === 'cedula' ? 'C.I.' : 
                 state.personalInfo.idType === 'passport' ? 'Pasaporte' : 'RIF'}: {state.personalInfo.idNumber}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
              <p className="font-medium">
                {state.personalInfo.birthDate && format(new Date(state.personalInfo.birthDate), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                {state.personalInfo.birthDate && ` (${calculateAge(state.personalInfo.birthDate)} años)`}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Género</p>
              <p className="font-medium">{state.personalInfo.gender === 'male' ? 'Masculino' : 'Femenino'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>{state.personalInfo.email}</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Teléfono</p>
              <p className="font-medium flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>{state.personalInfo.phone}</span>
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Ubicación</p>
              <p className="font-medium flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{state.personalInfo.city}, {state.personalInfo.state}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family Members Summary */}
      {state.familyMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Grupo Familiar ({state.familyMembers.length} familiar{state.familyMembers.length > 1 ? 'es' : ''})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.familyMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{member.firstName} {member.lastName}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.relationship === 'spouse' ? 'Cónyuge' :
                         member.relationship === 'child' ? 'Hijo/a' :
                         member.relationship === 'parent' ? 'Padre/Madre' : 'Otro'} • 
                        {calculateAge(member.birthDate)} años • 
                        {member.gender === 'male' ? 'Masculino' : 'Femenino'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p>{member.height} cm • {member.weight} kg</p>
                    {hasHealthConditions(member.id) && (
                      <Badge variant="outline" className="text-amber-600 border-amber-600">
                        <Heart className="w-3 h-3 mr-1" />
                        Condiciones médicas
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Plan Summary */}
      {selectedPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Plan Seleccionado</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selectedPlan.name}</h3>
                <p className="text-muted-foreground">
                  Suma Asegurada: ${selectedPlan.coverageAmount.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  ${selectedPlan.monthlyPremium.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Prima mensual base</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Características principales:</p>
                <ul className="text-sm space-y-1">
                  {selectedPlan.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Detalles del plan:</p>
                <div className="text-sm space-y-1">
                  <p>Personas cubiertas: {totalMembers}</p>
                  <p>Cuotas: {selectedPlan.installments} pagos</p>
                  <p>Prima anual: ${(selectedPlan.monthlyPremium * 12).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Coverages */}
      {enabledCoverages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Coberturas Adicionales ({enabledCoverages.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enabledCoverages.map((coverage) => (
                <div key={coverage.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="font-medium">{coverage.name}</p>
                    <p className="text-sm text-muted-foreground">{coverage.description}</p>
                  </div>
                  <div className="text-right">
                    {coverage.price && coverage.price > 0 ? (
                      <>
                        <p className="font-medium">${((coverage.price || 0) * totalMembers).toFixed(2)}/mes</p>
                        <p className="text-xs text-muted-foreground">
                          ${coverage.price.toFixed(2)} × {totalMembers} persona{totalMembers > 1 ? 's' : ''}
                        </p>
                      </>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Incluido
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Final Cost Summary */}
      <Card className="border-primary bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Resumen de Costos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Prima base del plan ({selectedPlan?.name})</span>
              <span className="font-medium">${selectedPlan?.monthlyPremium.toFixed(2)}</span>
            </div>
            
            {enabledCoverages.filter(c => c.price && c.price > 0).map((coverage) => (
              <div key={coverage.id} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">+ {coverage.name}</span>
                <span className="text-green-600">+${((coverage.price || 0) * totalMembers).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Mensual</span>
              <span className="text-primary">${finalMonthlyPremium.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Anual</span>
              <span className="font-medium">${finalAnnualPremium.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Personas cubiertas</span>
              <span>{totalMembers}</span>
            </div>
          </div>
          
          <Alert className="border-amber-200 bg-amber-50">
            <Calendar className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Importante:</strong> Los montos no incluyen IGTF. La póliza tendrá vigencia 
              desde la fecha de pago de la primera prima.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Health Conditions Alert */}
      {Object.keys(state.healthDeclarations).some(personId => hasHealthConditions(personId)) && (
        <Alert className="border-blue-200 bg-blue-50">
          <Heart className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Evaluación médica requerida:</strong> Algunas personas del grupo familiar han 
            declarado condiciones médicas. Nuestro equipo médico evaluará estos casos y se comunicará 
            con usted para confirmar la cobertura y prima final.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="grid md:grid-cols-3 gap-4">
        <Button variant="outline" onClick={handleDownloadQuote} className="flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Descargar Cotización</span>
        </Button>
        
        <Button variant="outline" onClick={handleSendQuote} className="flex items-center space-x-2">
          <Send className="w-4 h-4" />
          <span>Enviar por Email</span>
        </Button>
        
        <Button onClick={handleContractPolicy} className="flex items-center space-x-2 bg-green-600 hover:bg-green-700">
          <CheckCircle className="w-4 h-4" />
          <span>Contratar Póliza</span>
        </Button>
      </div>

      {/* Contact Information */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <h4 className="font-semibold">¿Necesitas ayuda?</h4>
            <p className="text-sm text-muted-foreground">
              Nuestro equipo de asesores está disponible para ayudarte
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>0212-555-0123</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>cotizaciones@seguroslavitalicia.com</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
