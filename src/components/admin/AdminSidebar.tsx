import { FileText, Settings, LogOut, Shield, LayoutDashboard, Bike, FolderDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Pólizas",
    url: "/admin/polizas",
    icon: FileText,
  },
  {
    title: "Descarga de Documentos",
    url: "/admin/descargas",
    icon: FolderDown,
  },
  {
    title: "Inventario BERA",
    url: "/admin/inventario-bera",
    icon: Bike,
  },
  {
    title: "Inventario EMPIRE",
    url: "/admin/inventario-empire",
    icon: Bike,
  },
  {
    title: "Configuraciones",
    url: "/admin/configuraciones",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAdminAuth();

  const pathname = location.pathname;
  const isItemActive = (url: string) => {
    if (url === "/admin") return pathname === "/admin";
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">VITALICIA</span>
            <span className="text-xs text-sidebar-foreground/60">Panel Admin</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
            Módulos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const active = isItemActive(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={cn(
                        "rounded-lg px-3 py-2 gap-3 transition-colors",
                        "data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:shadow-soft",
                        "data-[active=true]:border-l-2 data-[active=true]:border-primary",
                      )}
                    >
                      <Link to={item.url} aria-current={active ? "page" : undefined}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Salir</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

