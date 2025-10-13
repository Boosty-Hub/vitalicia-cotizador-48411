import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MegaMenuHeader } from "@/components/ui/MegaMenuHeader";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  UserCheck, 
  Mail, 
  Lock, 
  ArrowRight,
  Shield,
  Eye,
  EyeOff
} from "lucide-react";

type UserType = 'cliente' | 'intermediario' | null;

const LoginPage = () => {
  const navigate = useNavigate();
  const [selectedUserType, setSelectedUserType] = useState<UserType>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulación de login - en producción aquí iría la lógica de autenticación
    if (formData.email && formData.password) {
      if (selectedUserType === 'cliente') {
        navigate('/dashboard-cliente');
      } else if (selectedUserType === 'intermediario') {
        navigate('/dashboard-intermediario');
      }
    }
  };

  const handleDemoAccess = (userType: 'cliente' | 'intermediario') => {
    // Acceso demo directo sin validación
    if (userType === 'cliente') {
      navigate('/dashboard-cliente');
    } else {
      navigate('/dashboard-intermediario');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!selectedUserType) {
    return (
      <div className="min-h-screen bg-background">
        <MegaMenuHeader />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <Shield className="w-16 h-16 text-primary mr-4" />
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  Iniciar Sesión
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Selecciona tu tipo de usuario para acceder a tu área personalizada
              </p>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
                <div className="flex items-center space-x-2 text-blue-700">
                  <Eye className="w-5 h-5" />
                  <span className="font-medium">Acceso Demo Disponible</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Prueba el sistema sin registro usando los botones de "Acceso Demo" con datos ficticios precargados.
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Cliente Card */}
              <Card 
                className="transition-all duration-300 hover:shadow-xl border-2 hover:border-primary"
              >
                <CardHeader className="text-center pb-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Soy Cliente</CardTitle>
                  <CardDescription className="text-base">
                    Accede a tu área personal para gestionar tus pólizas y cotizaciones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Ver mis pólizas activas</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Realizar nuevas cotizaciones</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Gestionar mis datos personales</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Reportar siniestros</span>
                    </div>
                  </div>
                  <div className="space-y-3 mt-6">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => setSelectedUserType('cliente')}
                    >
                      Continuar como Cliente
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                      onClick={() => handleDemoAccess('cliente')}
                    >
                      <Eye className="mr-2 w-4 h-4" />
                      Acceso Demo Cliente
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Intermediario Card */}
              <Card 
                className="transition-all duration-300 hover:shadow-xl border-2 hover:border-primary"
              >
                <CardHeader className="text-center pb-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                    <UserCheck className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Soy Intermediario</CardTitle>
                  <CardDescription className="text-base">
                    Accede a tu panel de gestión para administrar clientes y ventas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Gestionar cartera de clientes</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Generar cotizaciones para clientes</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Ver comisiones y reportes</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Administrar pólizas</span>
                    </div>
                  </div>
                  <div className="space-y-3 mt-6">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => setSelectedUserType('intermediario')}
                    >
                      Continuar como Intermediario
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-green-200 text-green-600 hover:bg-green-50"
                      onClick={() => handleDemoAccess('intermediario')}
                    >
                      <Eye className="mr-2 w-4 h-4" />
                      Acceso Demo Intermediario
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MegaMenuHeader />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                selectedUserType === 'cliente' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                  : 'bg-gradient-to-br from-green-500 to-green-600'
              }`}>
                {selectedUserType === 'cliente' ? (
                  <User className="w-8 h-8 text-white" />
                ) : (
                  <UserCheck className="w-8 h-8 text-white" />
                )}
              </div>
              <CardTitle className="text-2xl font-bold">
                Iniciar Sesión
              </CardTitle>
              <CardDescription>
                {selectedUserType === 'cliente' ? 'Área de Cliente' : 'Área de Intermediario'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setSelectedUserType(null)}
                  >
                    ← Cambiar tipo de usuario
                  </button>
                  <button
                    type="button"
                    className="text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                
                <Button 
                  type="submit" 
                  className={`w-full ${
                    selectedUserType === 'cliente' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Iniciar Sesión
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  ¿No tienes cuenta?{' '}
                  <button className="text-primary hover:underline">
                    Regístrate aquí
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
