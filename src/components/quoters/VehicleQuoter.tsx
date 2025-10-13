import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Shield, Wrench } from "lucide-react";

interface VehicleFormData {
  brand: string;
  model: string;
  year: string;
  value: string;
  usage: string;
}

export const VehicleQuoter = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<VehicleFormData>({
    brand: "",
    model: "",
    year: "",
    value: "",
    usage: ""
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
        plan: "RCV Obligatorio",
        price: "$35",
        period: "/año",
        features: ["Responsabilidad civil", "Lesiones a terceros", "Daños a terceros", "Requerido por ley"]
      },
      {
        plan: "Cobertura Amplia",
        price: "$180",
        period: "/año", 
        features: ["Todo lo del RCV", "Daños propios", "Robo total", "Cristales", "Asistencia vial"]
      },
      {
        plan: "Todo Riesgo Premium",
        price: "$320",
        period: "/año",
        features: ["Cobertura completa", "Vehículo de reemplazo", "Accesorios", "Gastos médicos", "Grúa ilimitada"]
      }
    ];
    setQuotes(mockQuotes);
    setStep(4);
  };

  if (step === 4) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2">Tus Cotizaciones de Vehículo</h3>
          <p className="text-muted-foreground">Protege tu inversión con la cobertura adecuada</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {quotes.map((quote, index) => (
            <Card key={index} className="relative overflow-hidden">
              {index === 1 && (
                <div className="absolute top-0 right-0 bg-secondary text-white px-3 py-1 text-xs font-medium">
                  Más Popular
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{quote.plan}</CardTitle>
                <div className="text-3xl font-bold text-primary">{quote.price}<span className="text-sm text-muted-foreground">{quote.period}</span></div>
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
                  {index === 0 ? "Contratar RCV" : "Contratar Seguro"}
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
          <h3 className="text-2xl font-bold text-foreground">Cotización de Seguro de Vehículo</h3>
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
            {step === 1 && <Car className="w-5 h-5" />}
            {step === 2 && <Wrench className="w-5 h-5" />}
            {step === 3 && <Shield className="w-5 h-5" />}
            {step === 1 && "Datos del Vehículo"}
            {step === 2 && "Valor y Uso"}
            {step === 3 && "Tipo de Cobertura"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Marca del vehículo</Label>
                <Select value={formData.brand} onValueChange={(value) => setFormData({...formData, brand: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la marca" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="toyota">Toyota</SelectItem>
                    <SelectItem value="chevrolet">Chevrolet</SelectItem>
                    <SelectItem value="ford">Ford</SelectItem>
                    <SelectItem value="hyundai">Hyundai</SelectItem>
                    <SelectItem value="kia">Kia</SelectItem>
                    <SelectItem value="otra">Otra marca</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  placeholder="Ej: Corolla, Aveo, Fiesta"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Año</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="2020"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="value">Valor del vehículo (USD)</Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="15000"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Uso del vehículo</Label>
                <Select value={formData.usage} onValueChange={(value) => setFormData({...formData, usage: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el uso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Uso personal</SelectItem>
                    <SelectItem value="trabajo">Trabajo/Comercial</SelectItem>
                    <SelectItem value="taxi">Taxi/Uber</SelectItem>
                    <SelectItem value="carga">Transporte de carga</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label>¿Qué tipo de cobertura necesitas?</Label>
              <div className="grid gap-3">
                <div className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <h4 className="font-medium">Solo RCV (Obligatorio)</h4>
                  <p className="text-sm text-muted-foreground">Responsabilidad civil mínima requerida</p>
                </div>
                <div className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 bg-primary/5 border-primary">
                  <h4 className="font-medium">Cobertura Amplia (Recomendado)</h4>
                  <p className="text-sm text-muted-foreground">RCV + daños propios + robo</p>
                </div>
                <div className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <h4 className="font-medium">Todo Riesgo</h4>
                  <p className="text-sm text-muted-foreground">Protección completa para tu vehículo</p>
                </div>
              </div>
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