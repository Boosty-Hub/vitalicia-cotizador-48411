import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ConfigSidebar } from "@/components/admin/ConfigSidebar";

export default function AdminLayout() {
  const location = useLocation();
  const isConfiguraciones = location.pathname.includes("/admin/configuraciones");
  const isDashboard = location.pathname === "/admin";

  const getTitle = () => {
    if (isConfiguraciones) return "Configuraciones";
    if (isDashboard) return "Dashboard";
    return "Panel de Administración";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {isConfiguraciones ? <ConfigSidebar /> : <AdminSidebar />}
        
        <main className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center px-4 bg-card">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-lg font-semibold text-foreground">
              {getTitle()}
            </h1>
          </header>
          
          <div className="flex-1 p-6 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
