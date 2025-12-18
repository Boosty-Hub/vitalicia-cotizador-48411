import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SaludPage from "./pages/SaludPage";
import AutoPage from "./pages/AutoPage";
import ViajesPage from "./pages/ViajesPage";
import HogarPage from "./pages/HogarPage";
import VidaPage from "./pages/VidaPage";
import EmpresasPage from "./pages/EmpresasPage";
import SaludColectivaPage from "./pages/SaludColectivaPage";
import AutoIndividualPage from "./pages/AutoIndividualPage";
import CotizarSaludPage from "./pages/CotizarSaludPage";
import CotizarVehiculoPage from "./pages/CotizarVehiculoPage";
import CotizarViajesPage from "./pages/CotizarViajesPage";
import LoginPage from "./pages/LoginPage";
import DashboardClientePage from "./pages/DashboardClientePage";
import DashboardIntermediarioPage from "./pages/DashboardIntermediarioPage";
import HogarIndividualPage from "./pages/HogarIndividualPage";
import NuevaPolizaPage from "./pages/NuevaPolizaPage";
import NuevaCotizacionEmpresaPage from "./pages/NuevaCotizacionEmpresaPage";
import CotizarVehiculoMejoradoPage from "./pages/CotizarVehiculoMejoradoPage";
import CotizarViajesMejoradoPage from "./pages/CotizarViajesMejoradoPage";
import CotizarHogarPage from "./pages/CotizarHogarPage";
import CotizarVidaPage from "./pages/CotizarVidaPage";
import CotizarEmpresaPage from "./pages/CotizarEmpresaPage";
import ActivarPolizaRCVPage from "./pages/ActivarPolizaRCVPage";
import ActivarPolizaNaturalPage from "./pages/ActivarPolizaNaturalPage";
import ActivarPolizaJuridicaPage from "./pages/ActivarPolizaJuridicaPage";

// Admin imports
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { ProtectedAdminRoute } from "./components/admin/ProtectedAdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminPolizasPage from "./pages/admin/AdminPolizasPage";
import AdminConfiguracionesPage from "./pages/admin/AdminConfiguracionesPage";
import AdminUsuariosPage from "./pages/admin/AdminUsuariosPage";
import AdminPreciosEmpirePage from "./pages/admin/AdminPreciosEmpirePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/salud" element={<SaludPage />} />
            <Route path="/auto" element={<AutoPage />} />
            <Route path="/viajes" element={<ViajesPage />} />
            <Route path="/hogar" element={<HogarPage />} />
            <Route path="/vida" element={<VidaPage />} />
            <Route path="/empresas" element={<EmpresasPage />} />
            <Route path="/salud-colectiva" element={<SaludColectivaPage />} />
            <Route path="/auto-individual" element={<AutoIndividualPage />} />
            <Route path="/cotizar-salud" element={<CotizarSaludPage />} />
            <Route path="/cotizar-vehiculo" element={<CotizarVehiculoMejoradoPage />} />
            <Route path="/cotizar-viajes" element={<CotizarViajesMejoradoPage />} />
            <Route path="/cotizar-hogar" element={<CotizarHogarPage />} />
            <Route path="/cotizar-vida" element={<CotizarVidaPage />} />
            <Route path="/cotizar-empresa" element={<CotizarEmpresaPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard-cliente" element={<DashboardClientePage />} />
            <Route path="/dashboard-intermediario" element={<DashboardIntermediarioPage />} />
            <Route path="/hogar-individual" element={<HogarIndividualPage />} />
            <Route path="/nueva-poliza" element={<NuevaPolizaPage />} />
            <Route path="/nueva-cotizacion-empresa" element={<NuevaCotizacionEmpresaPage />} />
            <Route path="/cotizar-vehiculo-mejorado" element={<CotizarVehiculoMejoradoPage />} />
            <Route path="/activar-poliza-rcv" element={<ActivarPolizaRCVPage />} />
            <Route path="/activar-poliza-natural" element={<ActivarPolizaNaturalPage />} />
            <Route path="/activar-poliza-juridica" element={<ActivarPolizaJuridicaPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="polizas" element={<AdminPolizasPage />} />
              <Route path="configuraciones" element={<AdminConfiguracionesPage />} />
              <Route path="configuraciones/usuarios" element={<AdminUsuariosPage />} />
              <Route path="configuraciones/precios-empire" element={<AdminPreciosEmpirePage />} />
              <Route path="configuraciones/:tabla" element={<AdminConfiguracionesPage />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
