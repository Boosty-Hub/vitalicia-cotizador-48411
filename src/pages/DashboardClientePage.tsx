import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  FileText, 
  CreditCard, 
  Bell, 
  Settings,
  Plus,
  Eye,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Shield,
  Car,
  Heart,
  Home,
  Plane,
  LogOut,
  BarChart3,
  X,
  Menu
} from "lucide-react";

const DashboardClientePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Datos simulados del cliente
  const clienteData = {
    nombre: "María González",
    email: "maria.gonzalez@email.com",
    telefono: "+58 412-1234567",
    cedula: "V-12.345.678",
    fechaRegistro: "15 de Enero, 2024"
  };

  const polizasActivas = [
    {
      id: "POL-001",
      tipo: "Salud",
      plan: "Plan Premium",
      estado: "Activa",
      vigencia: "15/01/2025",
      prima: "$75/mes",
      icon: <Heart className="w-5 h-5 text-red-500" />,
      color: "bg-red-50 border-red-200",
      detalles: {
        fechaInicio: "15/01/2024",
        sumaAsegurada: "$50,000",
        deducible: "$100",
        coberturas: [
          "Hospitalización hasta $50,000",
          "Consultas médicas especializadas",
          "Medicamentos incluidos",
          "Emergencias 24/7",
          "Maternidad incluida"
        ],
        beneficiarios: ["Juan González (Esposo)", "Ana González (Hija)"],
        proximoPago: "15/11/2024"
      }
    },
    {
      id: "POL-002",
      tipo: "Auto",
      plan: "Cobertura Amplia",
      estado: "Activa",
      vigencia: "20/03/2025",
      prima: "$280/año",
      icon: <Car className="w-5 h-5 text-blue-500" />,
      color: "bg-blue-50 border-blue-200",
      detalles: {
        fechaInicio: "20/03/2024",
        vehiculo: "Toyota Corolla 2020",
        placa: "ABC-123",
        sumaAsegurada: "$25,000",
        coberturas: [
          "Responsabilidad Civil $10,000",
          "Daños Propios hasta $25,000",
          "Robo Total",
          "Asistencia Vial 24/7",
          "Grúa incluida"
        ],
        proximoPago: "20/03/2025"
      }
    },
    {
      id: "POL-003",
      tipo: "Hogar",
      plan: "Edificación + Contenido",
      estado: "Por Vencer",
      vigencia: "05/11/2024",
      prima: "$6.25/mes",
      icon: <Home className="w-5 h-5 text-orange-500" />,
      color: "bg-orange-50 border-orange-200",
      detalles: {
        fechaInicio: "05/11/2023",
        direccion: "Av. Principal #123, Caracas",
        sumaAsegurada: "$80,000",
        coberturas: [
          "Incendio y Explosión",
          "Daños por Agua",
          "Robo y Hurto",
          "Responsabilidad Civil",
          "Asistencia al Hogar 24/7"
        ],
        proximoPago: "05/11/2024"
      }
    }
  ];

  const cotizacionesRecientes = [
    {
      id: "COT-001",
      tipo: "Viajes",
      fecha: "28/09/2024",
      estado: "Pendiente",
      monto: "$95",
      icon: <Plane className="w-5 h-5 text-green-500" />,
      detalles: {
        destino: "Europa",
        duracion: "15 días",
        fechaViaje: "15/12/2024 - 30/12/2024",
        plan: "Premium 75",
        coberturas: [
          "Asistencia médica hasta USD 75,000",
          "Equipaje hasta USD 1,500",
          "Cancelación de viaje",
          "Repatriación sanitaria",
          "Acceso a salas VIP"
        ],
        validezCotizacion: "15/10/2024"
      }
    },
    {
      id: "COT-002",
      tipo: "Vida",
      fecha: "25/09/2024",
      estado: "Enviada",
      monto: "$120/mes",
      icon: <Shield className="w-5 h-5 text-purple-500" />,
      detalles: {
        tipoVida: "Vida Entera",
        sumaAsegurada: "$100,000",
        edad: "35 años",
        coberturas: [
          "Muerte natural $100,000",
          "Muerte accidental $200,000",
          "Gastos de entierro $5,000",
          "Servicio psicológico incluido"
        ],
        beneficiarios: ["Juan González", "Ana González"],
        validezCotizacion: "25/10/2024"
      }
    }
  ];

  const notificaciones = [
    {
      id: 1,
      tipo: "Vencimiento",
      mensaje: "Tu póliza de Hogar vence en 30 días",
      fecha: "Hoy",
      urgente: true
    },
    {
      id: 2,
      tipo: "Pago",
      mensaje: "Pago de póliza de Salud procesado exitosamente",
      fecha: "Ayer",
      urgente: false
    },
    {
      id: 3,
      tipo: "Cotización",
      mensaje: "Nueva cotización de Viajes disponible",
      fecha: "2 días",
      urgente: false
    }
  ];

  const renderOverview = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Resumen de Pólizas - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">3</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Pólizas Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">$361</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Prima Total/mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">1</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Por Vencer</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">2</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Cotizaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pólizas Activas - Mobile Optimized */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg sm:text-xl">Mis Pólizas Activas</CardTitle>
            <Button onClick={() => navigate('/nueva-poliza', { state: { from: '/dashboard-cliente' } })} size="sm" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Póliza
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="space-y-3 sm:space-y-4">
            {polizasActivas.map((poliza) => (
              <Card key={poliza.id} className={`${poliza.color} hover:shadow-md transition-shadow`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {poliza.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm sm:text-base font-semibold leading-tight">{poliza.tipo} - {poliza.plan}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">Póliza: {poliza.id}</p>
                        </div>
                      </div>
                      <Badge variant={poliza.estado === 'Activa' ? 'default' : 'destructive'} className="text-xs flex-shrink-0">
                        {poliza.estado}
                      </Badge>
                    </div>

                    {/* Details */}
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div>
                        <p className="text-muted-foreground">Vence: {poliza.vigencia}</p>
                        <p className="font-semibold text-sm sm:text-base">{poliza.prima}</p>
                      </div>
                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 px-2 sm:px-3">
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline ml-1">Ver</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
                                {poliza.icon}
                                <span>Detalles de Póliza {poliza.id}</span>
                              </DialogTitle>
                              <DialogDescription className="text-sm">
                                {poliza.tipo} - {poliza.plan}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 sm:space-y-6">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2 text-sm sm:text-base">Información General</h4>
                                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                                    <p><strong>Póliza:</strong> {poliza.id}</p>
                                    <p><strong>Estado:</strong> {poliza.estado}</p>
                                    <p><strong>Fecha Inicio:</strong> {poliza.detalles.fechaInicio}</p>
                                    <p><strong>Vigencia:</strong> {poliza.vigencia}</p>
                                    <p><strong>Prima:</strong> {poliza.prima}</p>
                                    <p><strong>Suma Asegurada:</strong> {poliza.detalles.sumaAsegurada}</p>
                                    {poliza.detalles.deducible && <p><strong>Deducible:</strong> {poliza.detalles.deducible}</p>}
                                    {poliza.detalles.vehiculo && <p><strong>Vehículo:</strong> {poliza.detalles.vehiculo}</p>}
                                    {poliza.detalles.placa && <p><strong>Placa:</strong> {poliza.detalles.placa}</p>}
                                    {poliza.detalles.direccion && <p><strong>Dirección:</strong> {poliza.detalles.direccion}</p>}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2 text-sm sm:text-base">Coberturas</h4>
                                  <ul className="space-y-1 text-xs sm:text-sm">
                                    {poliza.detalles.coberturas.map((cobertura, idx) => (
                                      <li key={idx} className="flex items-start space-x-2">
                                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="leading-tight">{cobertura}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              {poliza.detalles.beneficiarios && (
                                <div>
                                  <h4 className="font-semibold mb-2 text-sm sm:text-base">Beneficiarios</h4>
                                  <ul className="space-y-1 text-xs sm:text-sm">
                                    {poliza.detalles.beneficiarios.map((beneficiario, idx) => (
                                      <li key={idx} className="flex items-center space-x-2">
                                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                                        <span>{beneficiario}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                                <p className="text-xs sm:text-sm"><strong>Próximo Pago:</strong> {poliza.detalles.proximoPago}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="outline" className="h-8 px-2 sm:px-3">
                          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline ml-1">PDF</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones Recientes - Mobile Optimized */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Notificaciones Recientes</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="space-y-2 sm:space-y-3">
            {notificaciones.map((notif) => (
              <div key={notif.id} className={`p-3 rounded-lg border ${notif.urgente ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                    {notif.urgente ? (
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium leading-tight">{notif.mensaje}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.fecha}</p>
                    </div>
                  </div>
                  {notif.urgente && (
                    <Badge variant="destructive" className="text-xs flex-shrink-0">Urgente</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCotizaciones = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mis Cotizaciones</h2>
        <div className="flex space-x-2">
          <Button onClick={() => navigate('/nueva-poliza', { state: { from: '/dashboard-cliente' } })}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cotización
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {cotizacionesRecientes.map((cotizacion) => (
          <Card key={cotizacion.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {cotizacion.icon}
                  <div>
                    <h4 className="font-semibold">Seguro de {cotizacion.tipo}</h4>
                    <p className="text-sm text-muted-foreground">Cotización: {cotizacion.id}</p>
                    <p className="text-sm text-muted-foreground">Fecha: {cotizacion.fecha}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={cotizacion.estado === 'Pendiente' ? 'secondary' : 'default'}>
                    {cotizacion.estado}
                  </Badge>
                  <p className="font-semibold mt-1">{cotizacion.monto}</p>
                </div>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">Ver Detalles</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          {cotizacion.icon}
                          <span>Detalles de Cotización {cotizacion.id}</span>
                        </DialogTitle>
                        <DialogDescription>
                          Seguro de {cotizacion.tipo} - {cotizacion.fecha}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Información General</h4>
                            <div className="space-y-2 text-sm">
                              <p><strong>Cotización:</strong> {cotizacion.id}</p>
                              <p><strong>Estado:</strong> {cotizacion.estado}</p>
                              <p><strong>Fecha:</strong> {cotizacion.fecha}</p>
                              <p><strong>Monto:</strong> {cotizacion.monto}</p>
                              <p><strong>Válida hasta:</strong> {cotizacion.detalles.validezCotizacion}</p>
                              {cotizacion.detalles.destino && <p><strong>Destino:</strong> {cotizacion.detalles.destino}</p>}
                              {cotizacion.detalles.duracion && <p><strong>Duración:</strong> {cotizacion.detalles.duracion}</p>}
                              {cotizacion.detalles.fechaViaje && <p><strong>Fecha de Viaje:</strong> {cotizacion.detalles.fechaViaje}</p>}
                              {cotizacion.detalles.plan && <p><strong>Plan:</strong> {cotizacion.detalles.plan}</p>}
                              {cotizacion.detalles.tipoVida && <p><strong>Tipo:</strong> {cotizacion.detalles.tipoVida}</p>}
                              {cotizacion.detalles.sumaAsegurada && <p><strong>Suma Asegurada:</strong> {cotizacion.detalles.sumaAsegurada}</p>}
                              {cotizacion.detalles.edad && <p><strong>Edad:</strong> {cotizacion.detalles.edad}</p>}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Coberturas Incluidas</h4>
                            <ul className="space-y-1 text-sm">
                              {cotizacion.detalles.coberturas.map((cobertura, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span>{cobertura}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        {cotizacion.detalles.beneficiarios && (
                          <div>
                            <h4 className="font-semibold mb-2">Beneficiarios</h4>
                            <ul className="space-y-1 text-sm">
                              {cotizacion.detalles.beneficiarios.map((beneficiario, idx) => (
                                <li key={idx} className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-blue-600" />
                                  <span>{beneficiario}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>Nota:</strong> Esta cotización es válida hasta el {cotizacion.detalles.validezCotizacion}. 
                            Puedes contratarla directamente desde aquí.
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm">Contratar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitar Nueva Cotización</CardTitle>
          <CardDescription>Elige el tipo de seguro que deseas cotizar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => navigate('/nueva-poliza')}
            >
              <Shield className="w-6 h-6 text-primary" />
              <span>Ver Todas las Pólizas</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => navigate('/cotizar-salud')}
            >
              <Heart className="w-6 h-6 text-red-500" />
              <span>Salud</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => navigate('/cotizar-vehiculo')}
            >
              <Car className="w-6 h-6 text-blue-500" />
              <span>Vehículo</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerfil = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mi Perfil</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nombre Completo</label>
              <p className="text-lg">{clienteData.nombre}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Cédula</label>
              <p className="text-lg">{clienteData.cedula}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Correo Electrónico</label>
              <p className="text-lg">{clienteData.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Teléfono</label>
              <p className="text-lg">{clienteData.telefono}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Fecha de Registro</label>
              <p className="text-lg">{clienteData.fechaRegistro}</p>
            </div>
          </div>
          <Button className="mt-4">
            <Settings className="w-4 h-4 mr-2" />
            Editar Información
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const sidebarItems = [
    {
      id: 'overview',
      label: 'Resumen',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'cotizaciones',
      label: 'Cotizaciones',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: 'perfil',
      label: 'Mi Perfil',
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center space-x-2"
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-bold text-primary">La Vitalicia</h2>
          </div>
        </button>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="p-6 border-b">
              <SheetTitle className="text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">{clienteData.nombre}</h3>
                    <p className="text-xs text-gray-600">Cliente</p>
                  </div>
                </div>
              </SheetTitle>
            </SheetHeader>

            <nav className="p-4">
              <ul className="space-y-2">
                {sidebarItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === item.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="w-full justify-start text-gray-700 hover:text-gray-900 text-sm"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Cerrar Sesión
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 bg-white border-r border-gray-200 flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-primary">La Vitalicia</h2>
              <p className="text-xs text-muted-foreground">Panel Cliente</p>
            </div>
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{clienteData.nombre}</h3>
              <p className="text-sm text-gray-600">Cliente</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="w-full justify-start text-gray-700 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Desktop Only */}
        <div className="hidden lg:block bg-white border-b border-gray-200 px-6 sm:px-8 py-4 sm:py-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {activeTab === 'overview' && '¡Bienvenido, ' + clienteData.nombre + '!'}
              {activeTab === 'cotizaciones' && 'Mis Cotizaciones'}
              {activeTab === 'perfil' && 'Mi Perfil'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {activeTab === 'overview' && 'Gestiona tus pólizas y cotizaciones desde tu panel personal'}
              {activeTab === 'cotizaciones' && 'Revisa y gestiona todas tus cotizaciones'}
              {activeTab === 'perfil' && 'Actualiza tu información personal'}
            </p>
          </div>
        </div>

        {/* Mobile Title */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">
            {activeTab === 'overview' && 'Resumen'}
            {activeTab === 'cotizaciones' && 'Cotizaciones'}
            {activeTab === 'perfil' && 'Mi Perfil'}
          </h1>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'cotizaciones' && renderCotizaciones()}
          {activeTab === 'perfil' && renderPerfil()}
        </div>
      </div>
    </div>
  );
};

export default DashboardClientePage;
