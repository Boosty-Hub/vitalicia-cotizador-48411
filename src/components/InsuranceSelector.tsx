import { Heart, Car, Plane } from "lucide-react";
import { InsuranceCard } from "./InsuranceCard";
import { useNavigate } from "react-router-dom";

export const InsuranceSelector = () => {
  const navigate = useNavigate();

  const insuranceTypes = [
    {
      id: 'health' as const,
      title: "Seguro de Salud",
      description: "Protección médica integral para ti y tu familia",
      icon: Heart,
      route: '/cotizar-salud',
      features: [
        "Cobertura hospitalaria completa",
        "Consultas médicas especializadas", 
        "Medicamentos incluidos",
        "Red de clínicas a nivel nacional"
      ]
    },
    {
      id: 'vehicle' as const,
      title: "Seguro de Vehículo",
      description: "Protege tu inversión con la mejor cobertura automotriz",
      icon: Car,
      route: '/cotizar-vehiculo',
      features: [
        "Responsabilidad civil obligatoria",
        "Daños por colisión y robo",
        "Asistencia vial 24/7",
        "Grúa y servicios de emergencia"
      ]
    },
    {
      id: 'travel' as const,
      title: "Seguro de Viaje",
      description: "Viaja tranquilo con cobertura internacional completa",
      icon: Plane,
      route: '/cotizar-viajes',
      features: [
        "Asistencia médica en el extranjero",
        "Equipaje perdido o dañado",
        "Cancelación de viaje",
        "Repatriación sanitaria"
      ]
    }
  ];

  return (
    <section id="cotizador" className="py-10 sm:py-12 lg:py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-4">
            Cotiza tu seguro en línea
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Selecciona el tipo de seguro que quieres cotizar. Rápido, fácil y seguro.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {insuranceTypes.map((insurance) => (
            <InsuranceCard
              key={insurance.id}
              title={insurance.title}
              description={insurance.description}
              icon={insurance.icon}
              features={insurance.features}
              onQuote={() => navigate(insurance.route)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};