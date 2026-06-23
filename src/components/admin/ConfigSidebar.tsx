import {
  Globe,
  MapPin,
  Building2,
  Map,
  Factory,
  Car,
  Palette,
  FileType,
  Bike,
  DollarSign,
  Users,
  Heart,
  Flag,
  Briefcase,
  Phone,
  Wrench,
  Plug,
  ArrowLeft,
} from "lucide-react";
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
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ubicacionItems = [
  { title: "Países", url: "/admin/configuraciones/paises", icon: Globe, table: "board_cod_pais" },
  { title: "Estados", url: "/admin/configuraciones/estados", icon: MapPin, table: "board_cod_estado" },
  { title: "Ciudades", url: "/admin/configuraciones/ciudades", icon: Building2, table: "board_cod_ciudad" },
  { title: "Municipios", url: "/admin/configuraciones/municipios", icon: Map, table: "board_cod_municipio" },
];

const vehiculosItems = [
  { title: "Marcas", url: "/admin/configuraciones/marcas", icon: Factory, table: "board_cod_marca" },
  { title: "Modelos", url: "/admin/configuraciones/modelos", icon: Car, table: "board_cod_modelo" },
  { title: "Colores", url: "/admin/configuraciones/colores", icon: Palette, table: "board_cod_color" },
  { title: "Tipos de Vehículo", url: "/admin/configuraciones/tipos-vehiculo", icon: FileType, table: "board_cod_tipo_veh" },
  { title: "Versiones Moto", url: "/admin/configuraciones/versiones-moto", icon: Bike, table: "board_cod_version_moto" },
  { title: "Precios EMPIRE", url: "/admin/configuraciones/precios-empire", icon: DollarSign, table: "precios_empire" },
];

const personasItems = [
  { title: "Sexos", url: "/admin/configuraciones/sexos", icon: Users, table: "board_cod_sexo" },
  { title: "Estados Civiles", url: "/admin/configuraciones/estados-civiles", icon: Heart, table: "board_cod_edo_civil" },
  { title: "Nacionalidades", url: "/admin/configuraciones/nacionalidades", icon: Flag, table: "codigo_nacionalidad" },
  { title: "Actividades Económicas", url: "/admin/configuraciones/actividades-economicas", icon: Briefcase, table: "cod_act_economica" },
];

const otrosItems = [
  { title: "Códigos Telefónicos", url: "/admin/configuraciones/codigos-telefonicos", icon: Phone, table: "board_cod_tlf" },
  { title: "Versiones API", url: "/admin/configuraciones/versiones-api", icon: Wrench, table: "board_cod_version_api" },
  { title: "Ajustes del Sistema", url: "/admin/configuraciones/ajustes", icon: Wrench, table: "admin_settings" },
];

const sistemaItems = [
  { title: "Conexiones", url: "/admin/configuraciones/conexiones", icon: Plug, table: "conexiones" },
  { title: "Usuarios", url: "/admin/configuraciones/usuarios", icon: Users, table: "user_roles" },
];

const menuGroups = [
  { label: "Ubicación", items: ubicacionItems },
  { label: "Vehículos", items: vehiculosItems },
  { label: "Personas", items: personasItems },
  { label: "Otros", items: otrosItems },
  { label: "Sistema", items: sistemaItems },
];

export function ConfigSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const isItemActive = (url: string) => pathname === url || pathname.startsWith(`${url}/`);

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/polizas")}
          className="flex items-center gap-2 text-sidebar-foreground hover:bg-sidebar-accent w-full justify-start"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al Admin</span>
        </Button>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isItemActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={cn(
                          "rounded-lg px-3 py-2 gap-3 text-sm transition-colors",
                          "data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:shadow-soft",
                          "data-[active=true]:border-l-2 data-[active=true]:border-primary"
                        )}
                      >
                        <Link to={item.url} aria-current={active ? "page" : undefined}>
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

export { menuGroups, ubicacionItems, vehiculosItems, personasItems, otrosItems, sistemaItems };
