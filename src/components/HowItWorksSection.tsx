import { FileText, Search, CreditCard, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "1. Completa el formulario",
    description: "Ingresa tus datos básicos en nuestro formulario rápido y seguro. Solo te tomará 2 minutos.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Search,
    title: "2. Compara opciones",
    description: "Revisa las mejores opciones de pólizas adaptadas a tus necesidades y presupuesto.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: CreditCard,
    title: "3. Selecciona y paga",
    description: "Elige tu plan ideal y realiza el pago de forma segura con múltiples opciones.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: CheckCircle2,
    title: "4. ¡Listo! Estás protegido",
    description: "Recibe tu póliza al instante y comienza a disfrutar de tu cobertura de inmediato.",
    color: "from-green-500 to-emerald-500"
  }
];

export const HowItWorksSection = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            ¿Cómo Funciona?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Obtener tu seguro nunca fue tan fácil. Sigue estos simples pasos
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Connector line - hidden on mobile, visible on md+ */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/20 to-primary/5 z-0" />
                )}

                <div className="relative z-10 text-center">
                  {/* Icon */}
                  <div className="flex justify-center mb-4 sm:mb-5">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3 px-2">
                    {step.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed px-2">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
