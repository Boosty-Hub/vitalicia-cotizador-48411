import { Users, Shield, Star, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: Users,
    number: "50,000+",
    label: "Clientes Satisfechos",
    color: "text-blue-500"
  },
  {
    icon: Shield,
    number: "100,000+",
    label: "Pólizas Activas",
    color: "text-green-500"
  },
  {
    icon: Star,
    number: "4.9/5",
    label: "Calificación Promedio",
    color: "text-yellow-500"
  },
  {
    icon: TrendingUp,
    number: "25",
    label: "Años de Experiencia",
    color: "text-purple-500"
  }
];

export const StatsSection = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary via-primary to-primary-dark text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-secondary rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            Números que Hablan por Nosotros
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto px-4">
            La confianza de miles de venezolanos respalda nuestra trayectoria
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-4 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            >
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color}`} />
                </div>
              </div>
              
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
                {stat.number}
              </div>
              
              <div className="text-xs sm:text-sm lg:text-base text-white/80">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
