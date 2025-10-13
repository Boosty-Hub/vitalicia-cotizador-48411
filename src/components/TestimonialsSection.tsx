import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "María González",
    role: "Cliente desde 2020",
    content: "Excelente servicio. Me ayudaron a conseguir la mejor póliza de salud para mi familia. El proceso fue rápido y el equipo muy profesional.",
    rating: 5,
    initials: "MG"
  },
  {
    name: "Carlos Rodríguez",
    role: "Cliente desde 2018",
    content: "La cotización fue super rápida y clara. Sin complicaciones ni letra pequeña. Recomiendo La Vitalicia al 100%.",
    rating: 5,
    initials: "CR"
  },
  {
    name: "Ana Martínez",
    role: "Cliente desde 2021",
    content: "Tuve un accidente y el proceso de reclamo fue muy eficiente. El soporte 24/7 es real y me ayudaron en todo momento.",
    rating: 5,
    initials: "AM"
  },
  {
    name: "Roberto Pérez",
    role: "Cliente desde 2019",
    content: "La mejor decisión fue contratar mi seguro de auto con La Vitalicia. Precios justos y cobertura completa.",
    rating: 5,
    initials: "RP"
  },
  {
    name: "Luisa Fernández",
    role: "Cliente desde 2022",
    content: "Proceso 100% digital y muy fácil de usar. Pude cotizar y contratar mi seguro desde mi teléfono en minutos.",
    rating: 5,
    initials: "LF"
  },
  {
    name: "Diego Silva",
    role: "Cliente desde 2017",
    content: "Llevo años con ellos y nunca me han fallado. Excelente atención al cliente y transparencia en todo momento.",
    rating: 5,
    initials: "DS"
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Lo que Dicen Nuestros Clientes
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Miles de venezolanos confían en nosotros día a día
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30 bg-card relative overflow-hidden"
            >
              <CardContent className="p-5 sm:p-6">
                {/* Quote icon */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Quote className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-6 leading-relaxed relative z-10 italic">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold text-sm">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm sm:text-base text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
