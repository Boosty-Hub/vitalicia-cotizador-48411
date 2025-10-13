import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Heart, Car, Plane, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonAction: () => void;
  backgroundImage: string;
  backgroundColor: string;
  icon: React.ReactNode;
}

export const HeroSlider = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      id: 1,
      title: "Las pólizas de seguro que protegen lo que te inspira",
      subtitle: "Protección Familiar",
      description: "Seguros diseñados para cuidar a tu familia y garantizar su bienestar en cada momento de la vida.",
      buttonText: "Cotizar Seguro de Vida",
      buttonAction: () => navigate('/cotizar-vida'),
      backgroundImage: "linear-gradient(135deg, rgba(30, 58, 138, 0.9), rgba(59, 130, 246, 0.8))",
      backgroundColor: "from-blue-900 to-blue-600",
      icon: <Heart className="w-8 h-8" />
    },
    {
      id: 2,
      title: "Llega más lejos",
      subtitle: "Auto",
      description: "Cuenta con la póliza que te ayuda a proteger tu auto y sus ocupantes en cada viaje.",
      buttonText: "Cotizar Seguro de Auto",
      buttonAction: () => navigate('/cotizar-vehiculo'),
      backgroundImage: "linear-gradient(135deg, rgba(37, 99, 235, 0.9), rgba(59, 130, 246, 0.8))",
      backgroundColor: "from-blue-700 to-blue-500",
      icon: <Car className="w-8 h-8" />
    },
    {
      id: 3,
      title: "Viaja con tranquilidad",
      subtitle: "Seguros de Viaje",
      description: "Protección completa para tus aventuras. Cobertura médica internacional y asistencia 24/7.",
      buttonText: "Cotizar Seguro de Viaje",
      buttonAction: () => navigate('/cotizar-viajes'),
      backgroundImage: "linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(34, 197, 94, 0.8))",
      backgroundColor: "from-green-600 to-emerald-500",
      icon: <Plane className="w-8 h-8" />
    },
    {
      id: 4,
      title: "Tu hogar, tu refugio",
      subtitle: "Seguro de Hogar",
      description: "Protege tu patrimonio más valioso. Cobertura integral para tu hogar y bienes personales.",
      buttonText: "Cotizar Seguro de Hogar",
      buttonAction: () => navigate('/cotizar-hogar'),
      backgroundImage: "linear-gradient(135deg, rgba(234, 88, 12, 0.9), rgba(249, 115, 22, 0.8))",
      backgroundColor: "from-orange-600 to-orange-500",
      icon: <Home className="w-8 h-8" />
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden">
      {/* Slides */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="min-w-full h-full relative flex items-center"
            style={{ background: slide.backgroundImage }}
          >
            {/* Content - Mobile Optimized */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10">
              <div className="max-w-4xl">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="text-white mr-2 sm:mr-3">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex items-center justify-center">
                      {slide.icon}
                    </div>
                  </div>
                  <span className="text-white/90 text-sm sm:text-base lg:text-lg font-medium">
                    {slide.subtitle}
                  </span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-5 lg:mb-6 leading-tight">
                  {slide.title}
                </h1>
                
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-7 lg:mb-8 max-w-3xl leading-relaxed">
                  {slide.description}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    size="lg"
                    onClick={slide.buttonAction}
                    className="bg-white text-gray-900 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold w-full sm:w-auto"
                  >
                    {slide.buttonText}
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => navigate('/nueva-poliza')}
                    className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg bg-transparent backdrop-blur-sm transition-all duration-200 w-full sm:w-auto"
                  >
                    Ver Todos
                  </Button>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 hidden sm:block">
              <div className="w-full h-full bg-gradient-to-l from-white/20 to-transparent"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Mobile Optimized */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
        aria-label="Siguiente slide"
      >
        <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
              index === currentSlide
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter - Hidden on small mobile */}
      <div className="hidden sm:block absolute bottom-4 sm:bottom-6 right-4 sm:right-6 bg-black/30 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm backdrop-blur-sm">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
};
