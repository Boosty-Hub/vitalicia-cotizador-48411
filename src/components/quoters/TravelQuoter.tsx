import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Calendar, MapPin } from "lucide-react";

interface TravelFormData {
  destination: string;
  travelers: string;
  duration: string;
  startDate: string;
  coverage: string;
}

export const TravelQuoter = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<TravelFormData>({
    destination: "",
    travelers: "1",
    duration: "",
    startDate: "",
    coverage: ""
  });
  const [quotes, setQuotes] = useState<any[]>([]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      generateQuotes();
    }
  };

  const generateQuotes = () => {
    const mockQuotes = [
      {
        plan: "Básico",
        price: "$25",
        coverage: "$15,000",
        features: ["Asistencia médica básica", "Equipaje hasta $500", "Cancelación por enfermedad"]
      },
      {
        plan: "Estándar",
        price: "$45", 
        coverage: "$50,000",
        features: ["Todo lo del básico", "Deportes recreativos", "Equipaje hasta $1,500", "Repatriación"]
      },
      {
        plan: "Premium",
        price: "$75",
        coverage: "$100,000",
        features: ["Cobertura completa", "Deportes extremos", "Equipaje hasta $3,000", "Gastos por demora"]
      }
    ];
    setQuotes(mockQuotes);
    setStep(4);
  };

  if (step === 4) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2">Tus Cotizaciones de Viaje</h3>
          <p className="text-muted-foreground">Viaja con total tranquilidad y protección</p>
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
                <div className="text-3xl font-bold text-primary">{quote.price}<span className="text-sm text-muted-foreground">/viaje</span></div>
                <CardDescription>Cobertura hasta {quote.coverage}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {quote.features.map((feature: string, fIndex: number) => (
                    <li key={fIndex} className="flex items-center gap-2 text-sm">
                      <Plane className="w-4 h-4 text-secondary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="default" size="lg" className="w-full">
                  Contratar Seguro
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
          <h3 className="text-2xl font-bold text-foreground">Cotización de Seguro de Viaje</h3>
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
            {step === 1 && <MapPin className="w-5 h-5" />}
            {step === 2 && <Calendar className="w-5 h-5" />}
            {step === 3 && <Plane className="w-5 h-5" />}
            {step === 1 && "Destino y Viajeros"}
            {step === 2 && "Fechas del Viaje"}
            {step === 3 && "Tipo de Cobertura"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Destino</Label>
                <Select value={formData.destination} onValueChange={(value) => setFormData({...formData, destination: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu destino" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eeuu">Estados Unidos</SelectItem>
                    <SelectItem value="europa">Europa</SelectItem>
                    <SelectItem value="america">América Latina</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="mundial">Cobertura Mundial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Número de viajeros</Label>
                <Select value={formData.travelers} onValueChange={(value) => setFormData({...formData, travelers: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 persona</SelectItem>
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
            <>
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de salida</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duración del viaje (días)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="7"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label>Tipo de actividades</Label>
              <Select value={formData.coverage} onValueChange={(value) => setFormData({...formData, coverage: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de viaje" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="turismo">Turismo general</SelectItem>
                  <SelectItem value="negocios">Viaje de negocios</SelectItem>
                  <SelectItem value="deportes">Deportes y aventura</SelectItem>
                  <SelectItem value="crucero">Crucero</SelectItem>
                  <SelectItem value="estudio">Estudio en el extranjero</SelectItem>
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