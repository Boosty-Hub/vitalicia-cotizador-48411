import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, User, Car, MapPin, FileText } from "lucide-react";

interface PolicyData {
  id: string;
  numero_poliza_monday: string | null;
  estado_principal_monday: string | null;
  fecha_de_vencimiento_monday: string | null;
  nombre_titular_monday: string | null;
  apellidos_titular_monday: string | null;
  nro_documento_natural_monday: string | null;
  email_monday: string | null;
  numero_telefonico_titular_monday: string | null;
  direccion_monday: string | null;
  ciudad_monday: string | null;
  estado_principal_monday_loc?: string | null;
  placa_monday: string | null;
  serial_carroceria_monday: string | null;
  serial_motor_monday: string | null;
  año_monday: string | null;
  cod_modelo_monday: string | null;
  version_modelo_monday: string | null;
  precio_venta_tienda_monday: string | null;
  cedula_identidad_url: string | null;
  licencia_conducir_url: string | null;
  certificado_medico_url: string | null;
  certificado_origen_vehiculo_url: string | null;
  factura_compra_vehiculo_url: string | null;
  created_at: string;
  formulario: string | null;
}

interface PolicyDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: PolicyData | null;
}

export function PolicyDetailsDialog({ open, onOpenChange, policy }: PolicyDetailsDialogProps) {
  if (!policy) return null;

  const isActive = policy.estado_principal_monday !== "Vencida" && 
                   policy.estado_principal_monday !== "Cancelada";

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-VE");
  };

  const renderDocumentLink = (url: string | null, label: string) => {
    if (!url) return <span className="text-muted-foreground">No disponible</span>;
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary hover:underline flex items-center gap-1"
      >
        Ver documento <ExternalLink className="h-3 w-3" />
      </a>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Póliza #{policy.numero_poliza_monday || "Sin número"}
            <Badge className={isActive ? "bg-emerald-500" : "bg-red-500"}>
              {policy.estado_principal_monday || "Sin estado"}
            </Badge>
            <Badge variant="outline">
              {policy.formulario === "natural" ? "Persona Natural" : "Persona Jurídica"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="titular" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="titular" className="gap-1">
              <User className="h-4 w-4" />
              Titular
            </TabsTrigger>
            <TabsTrigger value="vehiculo" className="gap-1">
              <Car className="h-4 w-4" />
              Vehículo
            </TabsTrigger>
            <TabsTrigger value="ubicacion" className="gap-1">
              <MapPin className="h-4 w-4" />
              Ubicación
            </TabsTrigger>
            <TabsTrigger value="documentos" className="gap-1">
              <FileText className="h-4 w-4" />
              Documentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="titular" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Información del Titular</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Nombre:</span>
                  <p className="font-medium">{policy.nombre_titular_monday} {policy.apellidos_titular_monday}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Documento:</span>
                  <p className="font-medium">{policy.nro_documento_natural_monday || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{policy.email_monday || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Teléfono:</span>
                  <p className="font-medium">{policy.numero_telefonico_titular_monday || "-"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Información de la Póliza</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Fecha de creación:</span>
                  <p className="font-medium">{formatDate(policy.created_at)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Fecha de vencimiento:</span>
                  <p className="font-medium">{policy.fecha_de_vencimiento_monday || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Estado:</span>
                  <p className="font-medium">{policy.estado_principal_monday || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Precio:</span>
                  <p className="font-medium">${policy.precio_venta_tienda_monday || "-"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehiculo" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Información del Vehículo</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Placa:</span>
                  <p className="font-medium font-mono">{policy.placa_monday || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Año:</span>
                  <p className="font-medium">{policy.año_monday || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Modelo:</span>
                  <p className="font-medium">{policy.cod_modelo_monday || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Versión:</span>
                  <p className="font-medium">{policy.version_modelo_monday || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Serial Carrocería:</span>
                  <p className="font-medium font-mono text-xs">{policy.serial_carroceria_monday || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Serial Motor:</span>
                  <p className="font-medium font-mono text-xs">{policy.serial_motor_monday || "-"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ubicacion" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Dirección</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2">
                  <span className="text-muted-foreground">Dirección:</span>
                  <p className="font-medium">{policy.direccion_monday || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ciudad:</span>
                  <p className="font-medium">{policy.ciudad_monday || "-"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentos" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Documentos Adjuntos</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Cédula de Identidad:</span>
                  <p>{renderDocumentLink(policy.cedula_identidad_url, "Cédula")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Licencia de Conducir:</span>
                  <p>{renderDocumentLink(policy.licencia_conducir_url, "Licencia")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Certificado Médico:</span>
                  <p>{renderDocumentLink(policy.certificado_medico_url, "Certificado")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Certificado de Origen:</span>
                  <p>{renderDocumentLink(policy.certificado_origen_vehiculo_url, "Origen")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Factura de Compra:</span>
                  <p>{renderDocumentLink(policy.factura_compra_vehiculo_url, "Factura")}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
