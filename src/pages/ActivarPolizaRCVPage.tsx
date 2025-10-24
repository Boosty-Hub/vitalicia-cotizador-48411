import { SimpleHeader } from "@/components/ui/SimpleHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ActivarPolizaRCVPage = () => {
  const navigate = useNavigate();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5
      }
    }),
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader />
      
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Activación de Póliza RCV
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Selecciona el tipo de póliza que deseas activar
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              variants={cardVariants}
            >
              <Card 
                className="cursor-pointer border-2 hover:border-primary transition-all duration-300 h-full"
                onClick={() => navigate('/activar-poliza-natural')}
              >
                <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center h-full justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                    Persona Natural
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Activa tu póliza RCV como persona natural
                  </p>
                  <Button variant="hero" size="lg" className="w-full">
                    Continuar
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              custom={1}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              variants={cardVariants}
            >
              <Card 
                className="cursor-pointer border-2 hover:border-primary transition-all duration-300 h-full"
                onClick={() => navigate('/activar-poliza-juridica')}
              >
                <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center h-full justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary/10 flex items-center justify-center mb-4 sm:mb-6">
                    <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-secondary" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                    Persona Jurídica
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Activa tu póliza RCV como empresa
                  </p>
                  <Button variant="quote" size="lg" className="w-full">
                    Continuar
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivarPolizaRCVPage;
