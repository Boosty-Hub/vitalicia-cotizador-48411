import { Shield, Clock, Award, HeadphonesIcon, CheckCircle, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: Clock,
    title: "Cotización en 2 minutos",
    description: "Proceso rápido y sin complicaciones. Obtén tu cotización al instante.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Shield,
    title: "100% Seguro y Confiable",
    description: "Protección de datos con encriptación de última generación.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Award,
    title: "25 Años de Experiencia",
    description: "Líderes en el mercado asegurador venezolano desde 1999.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: HeadphonesIcon,
    title: "Soporte 24/7",
    description: "Atención personalizada cuando lo necesites, todos los días del año.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: CheckCircle,
    title: "Sin Letra Pequeña",
    description: "Términos claros y transparentes. Sin sorpresas desagradables.",
    color: "from-indigo-500 to-blue-500"
  },
  {
    icon: Sparkles,
    title: "Proceso Digital",
    description: "Todo 100% online. Gestiona tus pólizas desde cualquier lugar.",
    color: "from-yellow-500 to-orange-500"
  }
];

export const BenefitsSection = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            ¿Por qué elegir <span className="text-primary">La Vitalicia</span>?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Más de 50,000 clientes confían en nosotros para proteger lo que más aman
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card 
              key={index}
              className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30 bg-card/50 backdrop-blur-sm overflow-hidden"
            >
              <CardContent className="p-5 sm:p-6">
                <div className="relative">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 mb-4 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <benefit.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
