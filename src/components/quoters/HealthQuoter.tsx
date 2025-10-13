import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, DollarSign, Shield } from "lucide-react";

interface HealthFormData {
  age: string;
  familyMembers: string;
  coverage: string;
  city: string;
}

export const HealthQuoter = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<HealthFormData>({
    age: "",
    familyMembers: "1",
    coverage: "",
    city: ""
  });
  const [quotes, setQuotes] = useState<any[]>([]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Generate quotes
      generateQuotes();
    }
  };

  const generateQuotes = () => {
    // Simulate quote generation
    const mockQuotes = [
      {
        plan: "Plan Básico",
        price: "$45",
        deductible: "$500",
        features: ["Consultas médicas", "Hospitalización", "Medicamentos básicos"]
      },
      {
        plan: "Plan Intermedio", 
        price: "$75",
        deductible: "$300",
        features: ["Todo lo del básico", "Especialistas", "Exámenes diagnósticos"]
      },
      {
        plan: "Plan Premium",
        price: "$120",
        deductible: "$100", 
        features: ["Todo lo anterior", "Cirugías", "Medicina preventiva", "Dental básico"]
      }
    ];
    setQuotes(mockQuotes);
    setStep(4);
  };

  if (step === 4) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2">Tus Cotizaciones de Salud</h3>
          <p className="text-muted-foreground">Selecciona el plan que mejor se adapte a tus necesidades</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {quotes.map((quote, index) => (
            <Card key={index} className="relative overflow-hidden">
              {index === 1 && (
                <div className="absolute top-0 right-0 bg-secondary text-white px-3 py-1 text-xs font-medium">
                  Recomendado
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{quote.plan}</CardTitle>
                <div className="text-3xl font-bold text-primary">{quote.price}<span className="text-sm text-muted-foreground">/mes</span></div>
                <CardDescription>Deducible: {quote.deductible}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {quote.features.map((feature: string, fIndex: number) => (
                    <li key={fIndex} className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-secondary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="default" size="lg" className="w-full">
                  Contratar Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-foreground">Cotización de Seguro de Salud</h3>
          <span className="text-sm text-muted-foreground">Paso {step} de 3</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {step === 1 && <Users className="w-5 h-5" />}
            {step === 2 && <DollarSign className="w-5 h-5" />}
            {step === 3 && <Shield className="w-5 h-5" />}
            {step === 1 && "Información Personal"}
            {step === 2 && "Cobertura Deseada"}
            {step === 3 && "Ubicación"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="age">Edad del titular</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Ingresa tu edad"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="family">Miembros de la familia</Label>
                <Select value={formData.familyMembers} onValueChange={(value) => setFormData({...formData, familyMembers: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Solo yo</SelectItem>
                    <SelectItem value="2">2 personas</SelectItem>
                    <SelectItem value="3">3 personas</SelectItem>
                    <SelectItem value="4">4 personas</SelectItem>
                    <SelectItem value="5">5+ personas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label>Tipo de cobertura</Label>
              <Select value={formData.coverage} onValueChange={(value) => setFormData({...formData, coverage: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básica ($10,000 - $25,000)</SelectItem>
                  <SelectItem value="intermediate">Intermedia ($25,000 - $50,000)</SelectItem>
                  <SelectItem value="premium">Premium ($50,000+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label>Ciudad de residencia</Label>
              <Select value={formData.city} onValueChange={(value) => setFormData({...formData, city: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu ciudad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="caracas">Caracas</SelectItem>
                  <SelectItem value="valencia">Valencia</SelectItem>
                  <SelectItem value="maracaibo">Maracaibo</SelectItem>
                  <SelectItem value="barquisimeto">Barquisimeto</SelectItem>
                  <SelectItem value="otras">Otras ciudades</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button onClick={handleNext} variant="default" size="lg" className="w-full">
            {step < 3 ? "Continuar" : "Ver Cotizaciones"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};