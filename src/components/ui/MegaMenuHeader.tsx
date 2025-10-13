import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, ChevronDown, User, Phone, Mail, Heart, Car, Plane, Home, Building, Users, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export const MegaMenuHeader = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuHover = (menu: string) => {
    setActiveMenu(menu);
  };

  const handleMenuLeave = () => {
    setActiveMenu(null);
  };

  const handleCotizaClick = () => {
    // Detectar si estamos en páginas empresariales
    const empresarialPages = ['/empresas', '/salud-colectiva'];
    const isEmpresarial = empresarialPages.some(page => location.pathname.includes(page));
    
    if (isEmpresarial) {
      navigate('/nueva-cotizacion-empresa');
    } else {
      navigate('/nueva-poliza');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Top Bar - Hidden on mobile */}
      <div className="bg-primary text-white py-2 hidden sm:block">
        <div className="container mx-auto px-3 sm:px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 text-xs sm:text-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center space-x-1">
              <Phone className="w-3 h-3 flex-shrink-0" />
              <span>0212-555-0123</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">info@seguroslavitalicia.com</span>
            </div>
          </div>
          <div className="flex items-center w-full sm:w-auto">
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-7 sm:h-8 text-xs w-full sm:w-auto"
              onClick={handleCotizaClick}
            >
              Cotiza aquí
            </Button>
          </div>
        </div>
      </div>

      {/* Main Header - Mobile Optimized */}
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo - Mobile Optimized */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img 
              src="https://lavitalicia.com.ve/wp-content/uploads/2024/04/Logo_Horizontal_Slogan_rif_4.jpg" 
              alt="Seguros La Vitalicia" 
              className="h-10 sm:h-12 lg:h-16 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="hidden items-center space-x-2 sm:space-x-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">Seguros La Vitalicia</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">25 años protegiendo familias</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Productos Megamenu */}
            <div 
              className="relative"
              onMouseEnter={() => handleMenuHover('productos')}
              onMouseLeave={handleMenuLeave}
            >
              <button className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors py-2">
                <span className="font-medium">Productos</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {activeMenu === 'productos' && (
                <div className="absolute top-full right-0 w-[800px] bg-white shadow-xl border border-gray-200 rounded-lg mt-1 p-6">
                  <div className="grid grid-cols-2 gap-8">
                    {/* Para ti y tu familia */}
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <Users className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg text-gray-900">Para ti y tu familia</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Tu bienestar es lo más importante. Protege lo que más valoras y asegura tu tranquilidad.</p>
                      
                      <div className="space-y-3">
                        <button 
                          onClick={() => navigate('/salud')}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                        >
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <Heart className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Salud</p>
                            <p className="text-sm text-gray-600">Desde $45/mes</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => navigate('/auto-individual')}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Car className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Auto</p>
                            <p className="text-sm text-gray-600">Desde $35/año</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => navigate('/viajes')}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                        >
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Plane className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Seguro de asistencia en viajes</p>
                            <p className="text-sm text-gray-600">Desde $45</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => navigate('/hogar')}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                        >
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Home className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Combinado Residencial</p>
                            <p className="text-sm text-gray-600">Desde $6.25/mes</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => navigate('/hogar-individual')}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                        >
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Home className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Hogar Individual</p>
                            <p className="text-sm text-gray-600">Protección integral</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => navigate('/vida')}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                        >
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Vida</p>
                            <p className="text-sm text-gray-600">Protección familiar</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Para tu empresa */}
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <Building className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg text-gray-900">Para tu empresa</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Protege tu negocio con nuestras soluciones empresariales especializadas.</p>
                      
                      <div className="space-y-3">
                        <button 
                          onClick={() => navigate('/salud-colectiva')}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                        >
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <Heart className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Salud Colectiva</p>
                            <p className="text-sm text-gray-600">Desde $25/empleado/mes</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => navigate('/empresas')}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                        >
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Building className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Empresas</p>
                            <p className="text-sm text-gray-600">Protección integral</p>
                          </div>
                        </button>

                        <a href="#responsabilidad" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Responsabilidad Civil Profesional</p>
                            <p className="text-sm text-gray-600">Visita para más información</p>
                          </div>
                        </a>
                      </div>

                      {/* CTA Section */}
                      <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                        <h4 className="font-semibold text-primary mb-2">¿Necesitas ayuda?</h4>
                        <p className="text-sm text-gray-600 mb-3">Nuestros asesores están listos para ayudarte</p>
                        <Button size="sm" className="w-full">
                          Contactar Asesor
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Nosotros Megamenu */}
            <div 
              className="relative"
              onMouseEnter={() => handleMenuHover('nosotros')}
              onMouseLeave={handleMenuLeave}
            >
              <button className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors py-2">
                <span className="font-medium">Nosotros</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {activeMenu === 'nosotros' && (
                <div className="absolute top-full right-0 w-80 bg-white shadow-xl border border-gray-200 rounded-lg mt-1 p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-3">Sobre Nosotros</h3>
                      <div className="space-y-3">
                        <a href="#proposito" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <p className="font-medium text-gray-900">Propósito</p>
                          <p className="text-sm text-gray-600">Descubre nuestra misión</p>
                        </a>
                        <a href="#junta" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <p className="font-medium text-gray-900">Junta directiva</p>
                          <p className="text-sm text-gray-600">Liderazgo que impulsa nuestra visión</p>
                        </a>
                        <a href="#reportes" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <p className="font-medium text-gray-900">Reportes financieros</p>
                          <p className="text-sm text-gray-600">Te enseñamos nuestro mundo</p>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Descubre La Vitalicia */}
            <div 
              className="relative"
              onMouseEnter={() => handleMenuHover('descubre')}
              onMouseLeave={handleMenuLeave}
            >
              <button className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors py-2">
                <span className="font-medium">Descubre La Vitalicia</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {activeMenu === 'descubre' && (
                <div className="absolute top-full right-0 w-80 bg-white shadow-xl border border-gray-200 rounded-lg mt-1 p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-3">Descubre La Vitalicia</h3>
                      <div className="space-y-3">
                        <a href="#carreras" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <p className="font-medium text-gray-900">Únete</p>
                          <p className="text-sm text-gray-600">Sé parte de nuestro mundo</p>
                        </a>
                        <a href="#blog" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <p className="font-medium text-gray-900">Nuestro mundo</p>
                          <p className="text-sm text-gray-600">Novedades e iniciativas</p>
                        </a>
                        <a href="#sostenibilidad" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <p className="font-medium text-gray-900">Sostenibilidad</p>
                          <p className="text-sm text-gray-600">Cómo cuidamos nuestro mundo</p>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enlaces directos */}
            <a href="#contacto" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Contacto
            </a>
            <button 
              onClick={() => navigate('/login')}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Iniciar Sesión
            </button>
          </nav>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] p-0">
              <SheetHeader className="px-4 py-3 border-b">
                <SheetTitle className="text-left flex items-center justify-between">
                  <span>Menú</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      handleCotizaClick();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs h-8"
                  >
                    Cotiza aquí
                  </Button>
                </SheetTitle>
              </SheetHeader>

              <div className="overflow-y-auto h-[calc(100vh-5rem)] px-4 py-4">
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {/* Productos */}
                  <AccordionItem value="productos" className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <span className="font-medium text-base">Productos</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <div className="space-y-4">
                        {/* Para ti y tu familia */}
                        <div>
                          <h4 className="font-semibold text-sm text-gray-500 mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Para ti y tu familia
                          </h4>
                          <div className="space-y-1">
                            <button
                              onClick={() => {
                                navigate('/salud');
                                setMobileMenuOpen(false);
                              }}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                            >
                              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Heart className="w-4 h-4 text-red-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-gray-900">Salud</p>
                                <p className="text-xs text-gray-600">Desde $45/mes</p>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                navigate('/auto-individual');
                                setMobileMenuOpen(false);
                              }}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                            >
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Car className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-gray-900">Auto</p>
                                <p className="text-xs text-gray-600">Desde $35/año</p>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                navigate('/viajes');
                                setMobileMenuOpen(false);
                              }}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                            >
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Plane className="w-4 h-4 text-green-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-gray-900 leading-tight">Asistencia en viajes</p>
                                <p className="text-xs text-gray-600">Desde $45</p>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                navigate('/hogar');
                                setMobileMenuOpen(false);
                              }}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                            >
                              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Home className="w-4 h-4 text-orange-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-gray-900 leading-tight">Combinado Residencial</p>
                                <p className="text-xs text-gray-600">Desde $6.25/mes</p>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                navigate('/vida');
                                setMobileMenuOpen(false);
                              }}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                            >
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Users className="w-4 h-4 text-purple-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-gray-900">Vida</p>
                                <p className="text-xs text-gray-600">Protección familiar</p>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Para tu empresa */}
                        <div className="pt-3 border-t">
                          <h4 className="font-semibold text-sm text-gray-500 mb-2 flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            Para tu empresa
                          </h4>
                          <div className="space-y-1">
                            <button
                              onClick={() => {
                                navigate('/salud-colectiva');
                                setMobileMenuOpen(false);
                              }}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                            >
                              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Heart className="w-4 h-4 text-red-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-gray-900">Salud Colectiva</p>
                                <p className="text-xs text-gray-600">Desde $25/empleado/mes</p>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                navigate('/empresas');
                                setMobileMenuOpen(false);
                              }}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                            >
                              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Building className="w-4 h-4 text-indigo-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-gray-900">Empresas</p>
                                <p className="text-xs text-gray-600">Protección integral</p>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Nosotros */}
                  <AccordionItem value="nosotros" className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <span className="font-medium text-base">Nosotros</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <div className="space-y-1">
                        <a href="#proposito" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <p className="font-medium text-sm text-gray-900">Propósito</p>
                          <p className="text-xs text-gray-600">Descubre nuestra misión</p>
                        </a>
                        <a href="#junta" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <p className="font-medium text-sm text-gray-900">Junta directiva</p>
                          <p className="text-xs text-gray-600">Liderazgo que impulsa</p>
                        </a>
                        <a href="#reportes" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <p className="font-medium text-sm text-gray-900">Reportes financieros</p>
                          <p className="text-xs text-gray-600">Transparencia total</p>
                        </a>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Descubre La Vitalicia */}
                  <AccordionItem value="descubre" className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <span className="font-medium text-base">Descubre La Vitalicia</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <div className="space-y-1">
                        <a href="#carreras" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <p className="font-medium text-sm text-gray-900">Únete</p>
                          <p className="text-xs text-gray-600">Sé parte de nuestro mundo</p>
                        </a>
                        <a href="#blog" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <p className="font-medium text-sm text-gray-900">Nuestro mundo</p>
                          <p className="text-xs text-gray-600">Novedades e iniciativas</p>
                        </a>
                        <a href="#sostenibilidad" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <p className="font-medium text-sm text-gray-900">Sostenibilidad</p>
                          <p className="text-xs text-gray-600">Cuidamos nuestro mundo</p>
                        </a>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Enlaces directos */}
                <div className="mt-4 space-y-2">
                  <a 
                    href="#contacto" 
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
                  >
                    Contacto
                  </a>
                  <Button
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Iniciar Sesión
                  </Button>
                </div>

                {/* Contact Info - Mobile Only */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>0212-555-0123</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">info@seguroslavitalicia.com</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
