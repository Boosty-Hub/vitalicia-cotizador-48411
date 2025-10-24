import logoVitalicia from "@/assets/logo-vitalicia.png";

export const SimpleHeader = () => {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <div className="container mx-auto px-4 py-4 flex justify-center items-center">
        <img 
          src={logoVitalicia} 
          alt="Seguros La Vitalicia" 
          className="h-12 sm:h-16 w-auto object-contain"
        />
      </div>
    </header>
  );
};
