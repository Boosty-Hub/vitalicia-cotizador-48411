import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { 
  UserCheck, 
  Users, 
  DollarSign, 
  TrendingUp, 
  FileText,
  Plus,
  Eye,
  Edit,
  Phone,
  Mail,
  Calendar,
  BarChart3,
  Target,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  Settings,
  Shield,
  LogOut,
  User,
  Car,
  Heart,
  Home,
  Plane,
  Building,
  Menu
} from "lucide-react";

const DashboardIntermediarioPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Datos simulados del intermediario
  const intermediarioData = {
    nombre: "Carlos Rodríguez",
    codigo: "INT-001",
    email: "carlos.rodriguez@lavitalicia.com",
    telefono: "+58 414-9876543",
    fechaIngreso: "10 de Marzo, 2023",
    region: "Caracas - Zona Metropolitana"
  };

  const estadisticas = {
    clientesActivos: 45,
    polizasVigentes: 78,
    comisionesEstesMes: 2850,
    metaMensual: 4000,
    porcentajeMeta: 71
  };

  const clientesRecientes = [
    {
      id: "CLI-001",
      nombre: "María González",
      email: "maria.gonzalez@email.com",
      telefono: "+58 412-1234567",
      cedula: "V-12.345.678",
      fechaRegistro: "15/01/2024",
      polizas: 3,
      ultimaActividad: "Hoy",
      estado: "Activo",
      detalles: {
        direccion: "Av. Principal #123, Caracas",
        fechaNacimiento: "15/05/1985",
        profesion: "Ingeniera",
        polizasActivas: [
          { tipo: "Salud", plan: "Premium", prima: "$75/mes" },
          { tipo: "Auto", plan: "Cobertura Amplia", prima: "$280/año" },
          { tipo: "Hogar", plan: "Combinado", prima: "$6.25/mes" }
        ],
        totalPrimas: "$361.25/mes",
        comisionesGeneradas: "$1,250"
      }
    },
    {
      id: "CLI-002", 
      nombre: "José Martínez",
      email: "jose.martinez@email.com",
      telefono: "+58 424-7654321",
      cedula: "V-23.456.789",
      fechaRegistro: "20/02/2024",
      polizas: 2,
      ultimaActividad: "Ayer",
      estado: "Activo",
      detalles: {
        direccion: "Calle 5 #456, Valencia",
        fechaNacimiento: "10/08/1978",
        profesion: "Médico",
        polizasActivas: [
          { tipo: "Vida", plan: "Entera", prima: "$120/mes" },
          { tipo: "Viajes", plan: "Premium 75", prima: "$95" }
        ],
        totalPrimas: "$120/mes + $95 viaje",
        comisionesGeneradas: "$850"
      }
    },
    {
      id: "CLI-003",
      nombre: "Ana Pérez",
      email: "ana.perez@email.com", 
      telefono: "+58 416-5555555",
      cedula: "V-34.567.890",
      fechaRegistro: "05/03/2024",
      polizas: 1,
      ultimaActividad: "3 días",
      estado: "Pendiente",
      detalles: {
        direccion: "Urb. Los Palos Grandes, Caracas",
        fechaNacimiento: "22/12/1990",
        profesion: "Abogada",
        polizasActivas: [
          { tipo: "Auto", plan: "RCV Básica", prima: "$35/año" }
        ],
        totalPrimas: "$35/año",
        comisionesGeneradas: "$105"
      }
    }
  ];

  const ventasRecientes = [
    {
      id: "VEN-001",
      cliente: "María González",
      clienteId: "CLI-001",
      tipo: "Salud Premium",
      prima: "$75/mes",
      comision: "$225",
      fecha: "28/09/2024",
      estado: "Confirmada",
      detalles: {
        polizaId: "POL-001",
        sumaAsegurada: "$50,000",
        vigencia: "15/01/2025",
        formaPago: "Mensual",
        coberturas: [
          "Hospitalización hasta $50,000",
          "Consultas médicas especializadas",
          "Medicamentos incluidos",
          "Emergencias 24/7",
          "Maternidad incluida"
        ],
        comisionPorcentaje: "15%",
        proximoPago: "28/10/2024"
      }
    },
    {
      id: "VEN-002",
      cliente: "José Martínez", 
      clienteId: "CLI-002",
      tipo: "Auto Cobertura Amplia",
      prima: "$280/año",
      comision: "$420",
      fecha: "25/09/2024",
      estado: "Procesando",
      detalles: {
        polizaId: "POL-002",
        vehiculo: "Toyota Corolla 2020",
        placa: "DEF-456",
        sumaAsegurada: "$25,000",
        vigencia: "25/09/2025",
        formaPago: "Anual",
        coberturas: [
          "Responsabilidad Civil $10,000",
          "Daños Propios hasta $25,000",
          "Robo Total",
          "Asistencia Vial 24/7",
          "Grúa incluida"
        ],
        comisionPorcentaje: "12%",
        proximoPago: "25/09/2025"
      }
    },
    {
      id: "VEN-003",
      cliente: "Ana Pérez",
      clienteId: "CLI-003",
      tipo: "Hogar Combinado",
      prima: "$6.25/mes",
      comision: "$18.75",
      fecha: "22/09/2024",
      estado: "Confirmada",
      detalles: {
        polizaId: "POL-003",
        direccion: "Urb. Los Palos Grandes, Caracas",
        sumaAsegurada: "$80,000",
        vigencia: "22/09/2025",
        formaPago: "Mensual",
        coberturas: [
          "Incendio y Explosión",
          "Daños por Agua",
          "Robo y Hurto",
          "Responsabilidad Civil",
          "Asistencia al Hogar 24/7"
        ],
        comisionPorcentaje: "10%",
        proximoPago: "22/10/2024"
      }
    }
  ];

  const cotizacionesPendientes = [
    {
      id: "COT-001",
      cliente: "Roberto Silva",
      clienteId: "CLI-004",
      tipo: "Vida Temporal",
      monto: "$120/mes",
      fecha: "27/09/2024",
      vencimiento: "2 días",
      icon: <Shield className="w-5 h-5 text-purple-500" />,
      detalles: {
        tipoVida: "Temporal Nivelado",
        sumaAsegurada: "$100,000",
        edad: "42 años",
        telefono: "+58 414-1111111",
        email: "roberto.silva@email.com",
        coberturas: [
          "Muerte natural $100,000",
          "Muerte accidental $200,000",
          "Gastos de entierro $5,000",
          "Servicio psicológico incluido"
        ],
        beneficiarios: ["Carmen Silva", "Roberto Silva Jr."],
        validezCotizacion: "29/09/2024",
        comisionEstimada: "$360"
      }
    },
    {
      id: "COT-002",
      cliente: "Carmen López",
      clienteId: "CLI-005",
      tipo: "Viajes Elite",
      monto: "$125",
      fecha: "26/09/2024", 
      vencimiento: "3 días",
      icon: <Plane className="w-5 h-5 text-green-500" />,
      detalles: {
        destino: "Estados Unidos",
        duracion: "10 días",
        fechaViaje: "05/11/2024 - 15/11/2024",
        plan: "Elite 100",
        telefono: "+58 424-2222222",
        email: "carmen.lopez@email.com",
        coberturas: [
          "Asistencia médica hasta USD 100,000",
          "Equipaje hasta USD 2,000",
          "Cancelación de viaje",
          "Repatriación sanitaria",
          "Acceso a salas VIP",
          "Condiciones preexistentes cubiertas"
        ],
        validezCotizacion: "01/10/2024",
        comisionEstimada: "$37.50"
      }
    }
  ];

  const renderOverview = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Estadísticas Principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2 sm:mb-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{estadisticas.clientesActivos}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Clientes Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2 sm:mb-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{estadisticas.polizasVigentes}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Pólizas Vigentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-2 sm:mb-0">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">${estadisticas.comisionesEstesMes}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Comisiones Este Mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 sm:mb-0">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{estadisticas.porcentajeMeta}%</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Meta Mensual</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progreso de Meta */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Progreso de Meta Mensual</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Meta: ${estadisticas.metaMensual} | Actual: ${estadisticas.comisionesEstesMes}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 sm:h-4 rounded-full transition-all duration-300"
              style={{ width: `${estadisticas.porcentajeMeta}%` }}
            ></div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Faltan ${estadisticas.metaMensual - estadisticas.comisionesEstesMes} para alcanzar tu meta
          </p>
        </CardContent>
      </Card>

      {/* Ventas Recientes */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">Ventas Recientes</CardTitle>
            <Button size="sm" onClick={() => setActiveTab('ventas')} className="h-8 text-xs sm:text-sm">
              <span className="hidden sm:inline">Ver Todas</span>
              <span className="sm:hidden">Ver</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {ventasRecientes.slice(0, 3).map((venta) => (
              <div key={venta.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm sm:text-base">{venta.cliente}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{venta.tipo}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Prima: {venta.prima}</p>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:text-right gap-2">
                  <Badge variant={venta.estado === 'Confirmada' ? 'default' : 'secondary'} className="text-xs">
                    {venta.estado}
                  </Badge>
                  <div>
                    <p className="font-semibold text-green-600 text-sm sm:text-base">{venta.comision}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{venta.fecha}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cotizaciones Pendientes */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">Cotizaciones Pendientes</CardTitle>
            <Button size="sm" onClick={() => setActiveTab('cotizaciones')} className="h-8 text-xs sm:text-sm">
              <span className="hidden sm:inline">Ver Todas</span>
              <span className="sm:hidden">Ver</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {cotizacionesPendientes.map((cotizacion) => (
              <div key={cotizacion.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg bg-yellow-50 gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm sm:text-base">{cotizacion.cliente}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{cotizacion.tipo}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Fecha: {cotizacion.fecha}</p>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:text-right gap-2">
                  <Badge variant="secondary" className="text-xs">Vence en {cotizacion.vencimiento}</Badge>
                  <p className="font-semibold text-sm sm:text-base">{cotizacion.monto}</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="h-8 px-2">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" className="h-8 px-3 text-xs">
                    <span className="hidden sm:inline">Seguir</span>
                    <span className="sm:hidden">OK</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderClientes = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">Gestión de Clientes</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-9">
            <Search className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Buscar</span>
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none h-9">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Nuevo Cliente</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {clientesRecientes.map((cliente) => (
          <Card key={cliente.id}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm sm:text-base">{cliente.nombre}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{cliente.email}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{cliente.telefono}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between lg:justify-start gap-4 lg:gap-8">
                  <div className="text-center">
                    <p className="font-semibold text-sm sm:text-base">{cliente.polizas}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Pólizas</p>
                  </div>
                  <div className="text-center">
                    <Badge variant={cliente.estado === 'Activo' ? 'default' : 'secondary'} className="text-xs">
                      {cliente.estado}
                    </Badge>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 whitespace-nowrap">
                      <span className="hidden sm:inline">Últ. actividad: </span>{cliente.ultimaActividad}
                    </p>
                  </div>
                  <div className="flex space-x-1 sm:space-x-2">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
                            <User className="w-5 h-5 text-blue-600" />
                            <span>Detalles del Cliente - {cliente.nombre}</span>
                          </DialogTitle>
                          <DialogDescription className="text-xs sm:text-sm">
                            ID: {cliente.id} - {cliente.estado}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 sm:space-y-6">
                          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                              <h4 className="font-semibold mb-3 text-sm sm:text-base">Información Personal</h4>
                              <div className="space-y-2 text-xs sm:text-sm">
                                <p><strong>Nombre:</strong> {cliente.nombre}</p>
                                <p><strong>Cédula:</strong> {cliente.cedula}</p>
                                <p><strong>Email:</strong> {cliente.email}</p>
                                <p><strong>Teléfono:</strong> {cliente.telefono}</p>
                                <p><strong>Dirección:</strong> {cliente.detalles.direccion}</p>
                                <p><strong>Fecha Nacimiento:</strong> {cliente.detalles.fechaNacimiento}</p>
                                <p><strong>Profesión:</strong> {cliente.detalles.profesion}</p>
                                <p><strong>Fecha Registro:</strong> {cliente.fechaRegistro}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-3 text-sm sm:text-base">Información Comercial</h4>
                              <div className="space-y-2 text-xs sm:text-sm">
                                <p><strong>Estado:</strong> {cliente.estado}</p>
                                <p><strong>Pólizas Activas:</strong> {cliente.polizas}</p>
                                <p><strong>Total Primas:</strong> {cliente.detalles.totalPrimas}</p>
                                <p><strong>Comisiones Generadas:</strong> {cliente.detalles.comisionesGeneradas}</p>
                                <p><strong>Última Actividad:</strong> {cliente.ultimaActividad}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3 text-sm sm:text-base">Pólizas Activas</h4>
                            <div className="space-y-2">
                              {cliente.detalles.polizasActivas.map((poliza, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    {poliza.tipo === 'Salud' && <Heart className="w-4 h-4 text-red-500" />}
                                    {poliza.tipo === 'Auto' && <Car className="w-4 h-4 text-blue-500" />}
                                    {poliza.tipo === 'Hogar' && <Home className="w-4 h-4 text-orange-500" />}
                                    {poliza.tipo === 'Vida' && <Shield className="w-4 h-4 text-purple-500" />}
                                    {poliza.tipo === 'Viajes' && <Plane className="w-4 h-4 text-green-500" />}
                                    <div>
                                      <p className="font-medium text-xs sm:text-sm">{poliza.tipo} - {poliza.plan}</p>
                                      <p className="text-xs text-gray-600">Prima: {poliza.prima}</p>
                                    </div>
                                  </div>
                                  <Badge variant="default" className="text-xs">Activa</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
                            <Button size="sm" className="flex-1 h-9">
                              <Phone className="w-4 h-4 mr-2" />
                              Llamar Cliente
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 h-9">
                              <Mail className="w-4 h-4 mr-2" />
                              Enviar Email
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderVentas = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">Historial de Ventas</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-9">
            <Filter className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Filtrar</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-9">
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {ventasRecientes.map((venta) => (
          <Card key={venta.id}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm sm:text-base">{venta.cliente}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">Póliza: {venta.tipo}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">ID: {venta.id}</p>
                </div>
                <div className="flex items-center justify-between lg:justify-start gap-4 lg:gap-6">
                  <div className="text-center">
                    <p className="font-semibold text-sm sm:text-base">{venta.prima}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Prima</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-green-600 text-sm sm:text-base">{venta.comision}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Comisión</p>
                  </div>
                  <div className="text-center lg:text-right">
                    <Badge variant={venta.estado === 'Confirmada' ? 'default' : 'secondary'} className="text-xs">
                      {venta.estado}
                    </Badge>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{venta.fecha}</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span>Detalles de Venta {venta.id}</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                          {venta.cliente} - {venta.tipo}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 sm:space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2 text-sm sm:text-base">Información de la Venta</h4>
                            <div className="space-y-2 text-xs sm:text-sm">
                              <p><strong>ID Venta:</strong> {venta.id}</p>
                              <p><strong>Cliente:</strong> {venta.cliente}</p>
                              <p><strong>ID Cliente:</strong> {venta.clienteId}</p>
                              <p><strong>Tipo de Póliza:</strong> {venta.tipo}</p>
                              <p><strong>ID Póliza:</strong> {venta.detalles.polizaId}</p>
                              <p><strong>Fecha de Venta:</strong> {venta.fecha}</p>
                              <p><strong>Estado:</strong> {venta.estado}</p>
                              <p><strong>Vigencia:</strong> {venta.detalles.vigencia}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2 text-sm sm:text-base">Información Financiera</h4>
                            <div className="space-y-2 text-xs sm:text-sm">
                              <p><strong>Prima:</strong> {venta.prima}</p>
                              <p><strong>Forma de Pago:</strong> {venta.detalles.formaPago}</p>
                              <p><strong>Suma Asegurada:</strong> {venta.detalles.sumaAsegurada}</p>
                              <p><strong>Comisión:</strong> {venta.comision}</p>
                              <p><strong>% Comisión:</strong> {venta.detalles.comisionPorcentaje}</p>
                              <p><strong>Próximo Pago:</strong> {venta.detalles.proximoPago}</p>
                              {venta.detalles.vehiculo && <p><strong>Vehículo:</strong> {venta.detalles.vehiculo}</p>}
                              {venta.detalles.placa && <p><strong>Placa:</strong> {venta.detalles.placa}</p>}
                              {venta.detalles.direccion && <p><strong>Dirección:</strong> {venta.detalles.direccion}</p>}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2 text-sm sm:text-base">Coberturas de la Póliza</h4>
                          <ul className="space-y-1 text-xs sm:text-sm">
                            {venta.detalles.coberturas.map((cobertura, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>{cobertura}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                          <p className="text-xs sm:text-sm text-green-800">
                            <strong>Comisión ganada:</strong> {venta.comision} ({venta.detalles.comisionPorcentaje}) por esta venta.
                            {venta.estado === 'Procesando' && ' Pendiente de confirmación.'}
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderReportes = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Reportes y Comisiones</h2>
      
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Comisiones por Mes</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base">Septiembre 2024</span>
                <span className="font-semibold text-sm sm:text-base">$2,850</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base">Agosto 2024</span>
                <span className="font-semibold text-sm sm:text-base">$3,200</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base">Julio 2024</span>
                <span className="font-semibold text-sm sm:text-base">$2,950</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Tipos de Póliza Más Vendidas</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base">Salud</span>
                <span className="font-semibold text-sm sm:text-base">35%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base">Auto</span>
                <span className="font-semibold text-sm sm:text-base">28%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base">Hogar</span>
                <span className="font-semibold text-sm sm:text-base">22%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base">Vida</span>
                <span className="font-semibold text-sm sm:text-base">15%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCotizaciones = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">Gestión de Cotizaciones</h2>
        <Button 
          onClick={() => navigate('/nueva-poliza', { state: { from: '/dashboard-intermediario' } })}
          size="sm"
          className="w-full sm:w-auto h-10"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Nueva Cotización</span>
          <span className="sm:hidden">Nueva</span>
        </Button>
      </div>

      {/* Cotizaciones Pendientes */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Cotizaciones Pendientes</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Cotizaciones que requieren seguimiento</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {cotizacionesPendientes.map((cotizacion) => (
              <Card key={cotizacion.id} className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                    <div className="flex items-start sm:items-center space-x-3">
                      {cotizacion.icon}
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm sm:text-base">{cotizacion.cliente}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">Cotización: {cotizacion.id}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Tipo: {cotizacion.tipo}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between lg:justify-start gap-4 lg:gap-6">
                      <div className="text-center">
                        <Badge variant="secondary" className="text-xs mb-1">Vence en {cotizacion.vencimiento}</Badge>
                        <p className="font-semibold text-sm sm:text-base">{cotizacion.monto}</p>
                        <p className="text-xs sm:text-sm text-green-600">Comisión: {cotizacion.detalles.comisionEstimada}</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
                              {cotizacion.icon}
                              <span>Detalles de Cotización {cotizacion.id}</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs sm:text-sm">
                              {cotizacion.cliente} - {cotizacion.tipo}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 sm:space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2 text-sm sm:text-base">Información del Cliente</h4>
                                <div className="space-y-2 text-xs sm:text-sm">
                                  <p><strong>Cliente:</strong> {cotizacion.cliente}</p>
                                  <p><strong>ID Cliente:</strong> {cotizacion.clienteId}</p>
                                  <p><strong>Teléfono:</strong> {cotizacion.detalles.telefono}</p>
                                  <p><strong>Email:</strong> {cotizacion.detalles.email}</p>
                                  <p><strong>Fecha Cotización:</strong> {cotizacion.fecha}</p>
                                  <p><strong>Válida hasta:</strong> {cotizacion.detalles.validezCotizacion}</p>
                                  <p><strong>Monto:</strong> {cotizacion.monto}</p>
                                  <p><strong>Comisión Estimada:</strong> {cotizacion.detalles.comisionEstimada}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2 text-sm sm:text-base">Detalles del Seguro</h4>
                                <div className="space-y-2 text-xs sm:text-sm">
                                  {cotizacion.detalles.tipoVida && <p><strong>Tipo:</strong> {cotizacion.detalles.tipoVida}</p>}
                                  {cotizacion.detalles.sumaAsegurada && <p><strong>Suma Asegurada:</strong> {cotizacion.detalles.sumaAsegurada}</p>}
                                  {cotizacion.detalles.edad && <p><strong>Edad:</strong> {cotizacion.detalles.edad}</p>}
                                  {cotizacion.detalles.destino && <p><strong>Destino:</strong> {cotizacion.detalles.destino}</p>}
                                  {cotizacion.detalles.duracion && <p><strong>Duración:</strong> {cotizacion.detalles.duracion}</p>}
                                  {cotizacion.detalles.fechaViaje && <p><strong>Fecha Viaje:</strong> {cotizacion.detalles.fechaViaje}</p>}
                                  {cotizacion.detalles.plan && <p><strong>Plan:</strong> {cotizacion.detalles.plan}</p>}
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2 text-sm sm:text-base">Coberturas Incluidas</h4>
                              <ul className="space-y-1 text-xs sm:text-sm">
                                {cotizacion.detalles.coberturas.map((cobertura, idx) => (
                                  <li key={idx} className="flex items-start space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>{cobertura}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {cotizacion.detalles.beneficiarios && (
                              <div>
                                <h4 className="font-semibold mb-2 text-sm sm:text-base">Beneficiarios</h4>
                                <ul className="space-y-1 text-xs sm:text-sm">
                                  {cotizacion.detalles.beneficiarios.map((beneficiario, idx) => (
                                    <li key={idx} className="flex items-center space-x-2">
                                      <User className="w-4 h-4 text-blue-600" />
                                      <span>{beneficiario}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                              <p className="text-xs sm:text-sm text-green-800">
                                <strong>Acción requerida:</strong> Esta cotización vence en {cotizacion.vencimiento}. 
                                Contacta al cliente para cerrar la venta.
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="h-8 px-3 text-xs">
                          <span className="hidden sm:inline">Seguir</span>
                          <span className="sm:hidden">OK</span>
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

      {/* Generar Nueva Cotización */}
      <Card>
        <CardHeader>
          <CardTitle>Generar Nueva Cotización</CardTitle>
          <CardDescription>Crea cotizaciones para tus clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
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
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => navigate('/cotizar-viajes')}
            >
              <Plane className="w-6 h-6 text-green-500" />
              <span>Viajes</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => navigate('/hogar-individual')}
            >
              <Home className="w-6 h-6 text-orange-500" />
              <span>Hogar</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => navigate('/vida')}
            >
              <Shield className="w-6 h-6 text-purple-500" />
              <span>Vida</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => navigate('/empresas')}
            >
              <Building className="w-6 h-6 text-indigo-500" />
              <span>Empresas</span>
            </Button>
          </div>
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
      id: 'clientes',
      label: 'Clientes',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'cotizaciones',
      label: 'Cotizaciones',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: 'ventas',
      label: 'Ventas',
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: <Award className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-primary text-sm">La Vitalicia</span>
          </button>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="p-6 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <SheetTitle className="text-sm">{intermediarioData.nombre}</SheetTitle>
                    <p className="text-xs text-muted-foreground">{intermediarioData.codigo}</p>
                  </div>
                </div>
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
                        <span className="font-medium">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/')}
                  className="w-full justify-start text-gray-700"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Cerrar Sesión
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
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
              <p className="text-xs text-muted-foreground">Panel Intermediario</p>
            </div>
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{intermediarioData.nombre}</h3>
              <p className="text-sm text-gray-600">{intermediarioData.codigo}</p>
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
        {/* Desktop Header */}
        <div className="hidden lg:block bg-white border-b border-gray-200 px-4 sm:px-8 py-4 sm:py-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {activeTab === 'overview' && 'Panel de Intermediario'}
              {activeTab === 'clientes' && 'Gestión de Clientes'}
              {activeTab === 'cotizaciones' && 'Gestión de Cotizaciones'}
              {activeTab === 'ventas' && 'Historial de Ventas'}
              {activeTab === 'reportes' && 'Reportes y Comisiones'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {activeTab === 'overview' && `¡Bienvenido, ${intermediarioData.nombre}! Gestiona tu cartera desde tu panel profesional`}
              {activeTab === 'clientes' && 'Administra tu cartera de clientes y sus pólizas'}
              {activeTab === 'cotizaciones' && 'Gestiona cotizaciones pendientes y genera nuevas para tus clientes'}
              {activeTab === 'ventas' && 'Revisa tus ventas y comisiones generadas'}
              {activeTab === 'reportes' && 'Analiza tu rendimiento y objetivos'}
            </p>
          </div>
        </div>

        {/* Mobile Title */}
        <div className="lg:hidden bg-white border-b px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">
            {activeTab === 'overview' && 'Panel'}
            {activeTab === 'clientes' && 'Clientes'}
            {activeTab === 'cotizaciones' && 'Cotizaciones'}
            {activeTab === 'ventas' && 'Ventas'}
            {activeTab === 'reportes' && 'Reportes'}
          </h1>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'clientes' && renderClientes()}
          {activeTab === 'cotizaciones' && renderCotizaciones()}
          {activeTab === 'ventas' && renderVentas()}
          {activeTab === 'reportes' && renderReportes()}
        </div>
      </div>
    </div>
  );
};

export default DashboardIntermediarioPage;
