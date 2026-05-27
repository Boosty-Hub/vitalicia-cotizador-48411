import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { formatPriceToTwoDecimals } from "@/lib/priceUtils";
import { 
  ExternalLink, 
  Download, 
  FileText, 
  FileCheck, 
  FileX, 
  Image,
  Pencil,
  Save,
  X,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { PolicyStatusBadge, getPolizaStatus } from "@/components/admin/PolicyStatusBadge";
import { refreshPolizaConfig } from "@/utils/refreshPolizaConfig";

type Poliza = Database["public"]["Tables"]["polizas_activas"]["Row"];

interface PolicyDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: Poliza | null;
  allowEdit?: boolean;
  onPolicyUpdated?: () => void;
}

export function PolicyDetailsDialog({ 
  open, 
  onOpenChange, 
  policy: initialPolicy,
  allowEdit = false,
  onPolicyUpdated
}: PolicyDetailsDialogProps) {
  const [selectedPoliza, setSelectedPoliza] = useState<Poliza | null>(initialPolicy);
  const [editedPoliza, setEditedPoliza] = useState<Poliza | null>(initialPolicy);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [processingPolizaId, setProcessingPolizaId] = useState<string | null>(null);
  const [isGeneratingFactura, setIsGeneratingFactura] = useState(false);
  const [isGeneratingCarnet, setIsGeneratingCarnet] = useState(false);

  const handleGenerateFactura = async () => {
    if (!selectedPoliza?.id) return;
    setIsGeneratingFactura(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-factura-poliza", {
        body: { polizaId: selectedPoliza.id },
      });
      if (error) throw error;
      const url = (data as any)?.url;
      toast({ title: "Factura generada", description: "La factura se generó correctamente." });
      if (url) {
        setSelectedPoliza((prev) => (prev ? ({ ...prev, factura_poliza_url: url } as Poliza) : prev));
        setEditedPoliza((prev) => (prev ? ({ ...prev, factura_poliza_url: url } as Poliza) : prev));
      }
      onPolicyUpdated?.();
    } catch (e: any) {
      console.error("Error generating factura:", e);
      toast({ title: "Error", description: e?.message || "No se pudo generar la factura", variant: "destructive" });
    } finally {
      setIsGeneratingFactura(false);
    }
  };

  const handleGenerateCarnet = async () => {
    if (!selectedPoliza?.id) return;
    setIsGeneratingCarnet(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-carnet-poliza", {
        body: { polizaId: selectedPoliza.id },
      });
      if (error) throw error;
      const url = (data as any)?.url;
      toast({ title: "Carnet generado", description: "El carnet se generó correctamente." });
      if (url) {
        setSelectedPoliza((prev) => (prev ? ({ ...prev, carnet_poliza_url: url } as Poliza) : prev));
        setEditedPoliza((prev) => (prev ? ({ ...prev, carnet_poliza_url: url } as Poliza) : prev));
      }
      onPolicyUpdated?.();
    } catch (e: any) {
      console.error("Error generating carnet:", e);
      toast({ title: "Error", description: e?.message || "No se pudo generar el carnet", variant: "destructive" });
    } finally {
      setIsGeneratingCarnet(false);
    }
  };

  // Update local state when prop changes
  useEffect(() => {
    setSelectedPoliza(initialPolicy);
    setEditedPoliza(initialPolicy);
    setIsEditing(false);
  }, [initialPolicy]);

  // Real-time subscription for policy updates
  useEffect(() => {
    if (!selectedPoliza?.id || !open) return;

    const channel = supabase
      .channel(`poliza-details-${selectedPoliza.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'polizas_activas',
          filter: `id=eq.${selectedPoliza.id}`
        },
        (payload) => {
          console.log('📡 Póliza actualizada en tiempo real:', payload.new);
          const updatedPoliza = payload.new as Poliza;
          setSelectedPoliza(updatedPoliza);
          if (!isEditing) {
            setEditedPoliza(updatedPoliza);
          }
          toast({
            title: "Datos actualizados",
            description: "Los detalles de la póliza se han actualizado automáticamente",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedPoliza?.id, open, isEditing]);

  if (!selectedPoliza) return null;

  const handleFieldChange = (field: keyof Poliza, value: string | null) => {
    if (!editedPoliza) return;
    setEditedPoliza({ ...editedPoliza, [field]: value });
  };

  const handleSave = async () => {
    if (!editedPoliza) return;
    setIsSaving(true);

    try {
      // Format price fields to 2 decimals before saving
      const polizaToSave = {
        ...editedPoliza,
        n_suma: editedPoliza.n_suma ? formatPriceToTwoDecimals(editedPoliza.n_suma) : editedPoliza.n_suma,
        precio_venta_tienda_monday: editedPoliza.precio_venta_tienda_monday 
          ? formatPriceToTwoDecimals(editedPoliza.precio_venta_tienda_monday) 
          : editedPoliza.precio_venta_tienda_monday,
      };

      const { error } = await supabase
        .from("polizas_activas")
        .update(polizaToSave)
        .eq("id", polizaToSave.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Póliza actualizada correctamente",
      });
      
      setSelectedPoliza(polizaToSave);
      setIsEditing(false);
      onPolicyUpdated?.();
    } catch (error) {
      console.error("Error updating poliza:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la póliza",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReprocess = async () => {
    if (!selectedPoliza || processingPolizaId) return;
    
    setProcessingPolizaId(selectedPoliza.id);
    
    try {
      toast({
        title: "Actualizando configuración...",
        description: "Obteniendo datos actualizados de las tablas de configuración",
      });
      
      const refreshResult = await refreshPolizaConfig({
        id: selectedPoliza.id,
        s_marca: selectedPoliza.s_marca,
        s_modelo: selectedPoliza.s_modelo,
        s_color: selectedPoliza.s_color,
        año_monday: selectedPoliza.año_monday,
        formulario: selectedPoliza.formulario,
        placa_monday: selectedPoliza.placa_monday,
      });

      if (!refreshResult.success) {
        toast({
          title: "Error al actualizar configuración",
          description: refreshResult.error,
          variant: "destructive",
        });
        return;
      }

      if (Object.keys(refreshResult.updatedFields).length > 0) {
        toast({
          title: "Configuración actualizada",
          description: `Se actualizaron ${Object.keys(refreshResult.updatedFields).length} campos`,
        });
      }

      const { data: updatedPoliza, error: fetchError } = await supabase
        .from('polizas_activas')
        .select('*')
        .eq('id', selectedPoliza.id)
        .single();

      if (fetchError || !updatedPoliza) {
        throw new Error('No se pudo obtener la póliza actualizada');
      }

      toast({
        title: "Procesando con RMS...",
        description: "Enviando datos para obtener número de póliza",
      });

      const { data: rmsResult, error: rmsError } = await supabase.functions.invoke('rms-create-policy', {
        body: {
          polizaId: selectedPoliza.id,
          formData: {
            ...updatedPoliza,
            n_suma: updatedPoliza.n_suma,
            c_cd_marca: updatedPoliza.c_cd_marca,
            c_cd_modelo: updatedPoliza.c_cd_modelo,
            c_cd_version: updatedPoliza.c_cd_version,
            c_cd_color: updatedPoliza.c_cd_color,
            n_nu_centuria: updatedPoliza.n_nu_centuria,
            c_cd_versionseguro: updatedPoliza.c_cd_versionseguro,
            c_cd_subversionseguro: updatedPoliza.c_cd_subversionseguro,
          },
          tipoFormulario: selectedPoliza.formulario || 'natural'
        }
      });

      if (rmsError) {
        console.error('Error llamando a RMS:', rmsError);
        
        await supabase
          .from('polizas_activas')
          .update({
            api_status: 'error',
            api_message: rmsError.message || 'Error al procesar con RMS',
          })
          .eq('id', selectedPoliza.id);
        
        toast({
          title: "Error al procesar",
          description: rmsError.message || 'Error al comunicarse con RMS',
          variant: "destructive",
        });
        return;
      }

      if (!rmsResult?.success) {
        toast({
          title: "Error de RMS",
          description: rmsResult?.error || 'La API de RMS retornó un error',
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "¡Póliza procesada exitosamente!",
        description: `Número de póliza: ${rmsResult.numeroPoliza}`,
      });

      onPolicyUpdated?.();
      
    } catch (error) {
      console.error('Error en handleReprocess:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive",
      });
    } finally {
      setProcessingPolizaId(null);
      // Always re-fetch to update modal with latest status
      const { data: latestPoliza } = await supabase
        .from('polizas_activas')
        .select('*')
        .eq('id', selectedPoliza.id)
        .single();
      if (latestPoliza) {
        setSelectedPoliza(latestPoliza);
        setEditedPoliza(latestPoliza);
      }
    }
  };

  const renderField = (label: string, field: keyof Poliza, type: "text" | "date" = "text") => {
    const value = isEditing ? editedPoliza?.[field] : selectedPoliza?.[field];
    
    if (isEditing) {
      return (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">{label}</Label>
          <Input
            type={type}
            value={value?.toString() || ""}
            onChange={(e) => handleFieldChange(field, e.target.value || null)}
            className="h-8 text-sm"
          />
        </div>
      );
    }

    const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
    return (
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{displayValue || "-"}</p>
      </div>
    );
  };

  const handleDownloadDocument = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error descargando documento:', error);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const renderDocumentLink = (label: string, url: string | null) => {
    const filename = url?.split('/').pop() || 'documento';
    const isPDF = filename.toLowerCase().endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
    
    const getFileIcon = () => {
      if (isPDF) return <FileText className="h-5 w-5" />;
      if (isImage) return <Image className="h-5 w-5" />;
      return <FileText className="h-5 w-5" />;
    };

    if (!url) {
      return (
        <div className="group relative flex items-center gap-3 p-3 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 transition-all duration-200">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
            <FileX className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-xs text-muted-foreground/60 italic">No cargado</p>
          </div>
        </div>
      );
    }

    return (
      <div className="group relative flex items-center gap-3 p-3 rounded-xl border border-border bg-gradient-to-br from-background to-muted/20 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-300">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{label}</p>
          <p className="text-xs text-muted-foreground truncate">{filename}</p>
        </div>
        <div className="flex items-center gap-1">
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
            title="Ver documento"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            onClick={() => handleDownloadDocument(url, filename)}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted hover:bg-emerald-500 hover:text-white transition-all duration-200"
            title="Descargar documento"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const { status, message } = getPolizaStatus(selectedPoliza);
  const isProcessing = processingPolizaId === selectedPoliza.id;
  const showReprocess = allowEdit && (status === 'error' || status === 'pending');

  // Status badge styling based on policy status
  const statusStyles = {
    active: {
      bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      border: 'border-emerald-400',
      text: 'text-white',
      glow: 'shadow-lg shadow-emerald-500/30',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      border: 'border-red-400',
      text: 'text-white',
      glow: 'shadow-lg shadow-red-500/30',
    },
    pending: {
      bg: 'bg-gradient-to-r from-amber-500 to-amber-600',
      border: 'border-amber-400',
      text: 'text-white',
      glow: 'shadow-lg shadow-amber-500/30',
    },
    processing: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      border: 'border-blue-400',
      text: 'text-white',
      glow: 'shadow-lg shadow-blue-500/30',
    },
  };

  const currentStatusStyle = statusStyles[status];

  return (
    <Dialog open={open} onOpenChange={(openState) => {
      if (!openState) {
        setIsEditing(false);
      }
      onOpenChange(openState);
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        {/* Status Banner */}
        <div className={`-mx-6 -mt-6 mb-4 px-6 py-3 rounded-t-lg ${currentStatusStyle.bg} ${currentStatusStyle.glow}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PolicyStatusBadge 
                status={status} 
                message={message}
                showTooltip={false}
              />
              <span className={`text-sm font-medium ${currentStatusStyle.text}`}>
                {message}
              </span>
            </div>
            {showReprocess && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleReprocess}
                disabled={isProcessing}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Reprocesar
              </Button>
            )}
          </div>
        </div>

        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {isEditing ? "Editar Póliza" : "Detalle de Póliza"}
              </DialogTitle>
              <DialogDescription>
                {selectedPoliza?.numero_poliza_monday || "Sin número de póliza"}
              </DialogDescription>
            </div>
            {allowEdit && (
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditedPoliza(selectedPoliza);
                        setIsEditing(false);
                      }}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="gap-2"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Guardar
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] pr-4">
          <Tabs defaultValue="titular" className="w-full">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="titular">Titular</TabsTrigger>
              <TabsTrigger value="beneficiario">Beneficiario</TabsTrigger>
              <TabsTrigger value="vehiculo">Vehículo</TabsTrigger>
              <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
              <TabsTrigger value="factura">Factura</TabsTrigger>
              <TabsTrigger value="carnet">Carnet</TabsTrigger>
              <TabsTrigger value="tecnico">Técnico</TabsTrigger>
            </TabsList>

            {/* Datos del Titular */}
            <TabsContent value="titular" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  {renderField("Nombre", "nombre_titular_monday")}
                  {renderField("Apellidos", "apellidos_titular_monday")}
                  {renderField("Tipo Identificación", "tipo_id_titular_monday")}
                  {renderField("Nro. Documento (Natural)", "nro_documento_natural_monday")}
                  {renderField("Nro. Documento (Jurídico)", "nro_documento_juridico_monday")}
                  {renderField("Razón Social", "razon_social_juridico_monday")}
                  {renderField("Sexo", "cd_sexo")}
                  {renderField("Sexo (Descripción)", "s_sexo")}
                  {renderField("Fecha Nacimiento", "fecha_nacimiento_titular_monday", "date")}
                  {renderField("Estado Civil", "cd_edocivil")}
                  {renderField("Estado Civil (Descripción)", "s_edocivil")}
                  {renderField("Nacionalidad", "c_cd_nacionalidad")}
                  {renderField("Nacionalidad (Descripción)", "s_nacionalidad")}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  {renderField("Código Telefónico", "codigo_telefonico_titular_monday")}
                  {renderField("Número Telefónico", "numero_telefonico_titular_monday")}
                  {renderField("Email Principal", "email_monday")}
                  {renderField("Email Alternativo", "email_alternativo_monday")}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Datos API</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  {renderField("c_nombre", "c_nombre")}
                  {renderField("c_apellido", "c_apellido")}
                  {renderField("n_cedrif", "n_cedrif")}
                  {renderField("f_fecnac", "f_fecnac", "date")}
                  {renderField("c_razonsocial", "c_razonsocial")}
                  {renderField("n_correlativo", "n_correlativo")}
                  {renderField("n_ingresoanualnac", "n_ingresoanualnac")}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Datos del Beneficiario/Apoderado */}
            <TabsContent value="beneficiario" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Datos del Apoderado</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  {renderField("Nombre", "nombre_apoderado_monday")}
                  {renderField("Apellido", "apellido_apoderado_monday")}
                  {renderField("Nro. Documento", "numero_documento_apoderado_monday")}
                  {renderField("Fecha Nacimiento", "fecha_nacimiento_apoderado_monday", "date")}
                  {renderField("Estado Civil", "estado_civil_apoderado_monday")}
                  {renderField("Sexo", "sexo_apoderado_monday")}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Datos API - Apoderado (AP)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  {renderField("c_nombreap", "c_nombreap")}
                  {renderField("c_apellidoap", "c_apellidoap")}
                  {renderField("n_cedrifap", "n_cedrifap")}
                  {renderField("f_fecnacap", "f_fecnacap", "date")}
                  {renderField("cd_sexoap", "cd_sexoap")}
                  {renderField("s_sexoap", "s_sexoap")}
                  {renderField("cd_edocivilap", "cd_edocivilap")}
                  {renderField("s_edocivilap", "s_edocivilap")}
                  {renderField("c_cd_nacionalidadap", "c_cd_nacionalidadap")}
                  {renderField("s_nacionalidadap", "s_nacionalidadap")}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Datos API - Chofer (CH)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  {renderField("c_nombrech", "c_nombrech")}
                  {renderField("c_apellidoch", "c_apellidoch")}
                  {renderField("n_cedrifch", "n_cedrifch")}
                  {renderField("f_fecnacch", "f_fecnacch", "date")}
                  {renderField("cd_sexoch", "cd_sexoch")}
                  {renderField("s_sexoch", "s_sexoch")}
                  {renderField("cd_edocivilch", "cd_edocivilch")}
                  {renderField("s_edocivilch", "s_edocivilch")}
                  {renderField("c_cd_nacionalidadch", "c_cd_nacionalidadch")}
                  {renderField("s_nacionalidadch", "s_nacionalidadch")}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Datos del Vehículo */}
            <TabsContent value="vehiculo" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Información del Vehículo</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  {renderField("Placa", "placa_monday")}
                  {renderField("Marca", "s_marca")}
                  {renderField("Código Marca", "c_cd_marca")}
                  {renderField("Modelo", "s_modelo")}
                  {renderField("Código Modelo", "c_cd_modelo")}
                  {renderField("Versión", "s_version")}
                  {renderField("Código Versión", "c_cd_version")}
                  {renderField("Año", "año_monday")}
                  {renderField("n_anio", "n_anio")}
                  {renderField("Color", "s_color")}
                  {renderField("Código Color", "c_cd_color")}
                  {renderField("Color BERA", "color_bera_monday")}
                  {renderField("Código Color Empire", "cod_color_empire_monday")}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Datos Técnicos del Vehículo</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  {renderField("Serial Carrocería", "serial_carroceria_monday")}
                  {renderField("c_carroceria", "c_carroceria")}
                  {renderField("c_placa", "c_placa")}
                  {renderField("Serial Motor", "serial_motor_monday")}
                  {renderField("c_motor", "c_motor")}
                  {renderField("Transmisión Empire", "transmision_empire_monday")}
                  {renderField("Versión Modelo", "version_modelo_monday")}
                  {renderField("Código Modelo Monday", "cod_modelo_monday")}
                  {renderField("n_nu_centuria", "n_nu_centuria")}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Datos de Compra</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  {renderField("Fecha Compra", "fecha_compra_monday", "date")}
                  {renderField("f_fechacompra", "f_fechacompra", "date")}
                  {renderField("Precio Venta Tienda", "precio_venta_tienda_monday")}
                  {renderField("n_suma", "n_suma")}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Datos de Ubicación */}
            <TabsContent value="ubicacion" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Dirección</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  {renderField("País", "pais_monday")}
                  {renderField("Código País", "c_cd_pais")}
                  {renderField("s_pais", "s_pais")}
                  {renderField("Estado", "c_cd_estado")}
                  {renderField("s_estado", "s_estado")}
                  {renderField("Ciudad", "ciudad_monday")}
                  {renderField("Código Ciudad", "c_cd_ciudad")}
                  {renderField("s_ciudad", "s_ciudad")}
                  {renderField("Municipio", "municipio_monday")}
                  {renderField("Código Municipio", "c_cd_municipio")}
                  {renderField("s_municipio", "s_municipio")}
                  {renderField("Dirección", "direccion_monday")}
                  {renderField("c_direccion", "c_direccion")}
                  {renderField("Código Postal", "codigo_postal_monday")}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Datos de Contacto API</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  {renderField("c_cd_telef1", "c_cd_telef1")}
                  {renderField("s_telef1", "s_telef1")}
                  {renderField("c_numtelef1", "c_numtelef1")}
                  {renderField("c_email1", "c_email1")}
                  {renderField("c_email2", "c_email2")}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documentos */}
            <TabsContent value="documentos" className="space-y-6 mt-4">
              {(() => {
                const isJuridico = selectedPoliza.formulario === 'juridico';
                const splitMulti = (val: string | null | undefined): string[] => {
                  if (!val) return [];
                  return String(val)
                    .split(/\r?\n/)
                    .map(s => s.trim())
                    .filter(s => s.length > 0 && /^https?:\/\//i.test(s));
                };
                const cedulasAcc = splitMulti((selectedPoliza as any).cedula_accionistas_url);
                const rifsAcc = splitMulti((selectedPoliza as any).rif_accionistas_url);
                const totalAccionistas = Math.max(cedulasAcc.length, rifsAcc.length);

                return (
                  <>
                    {/* TITULAR — solo Natural/RCV */}
                    {!isJuridico && (
                      <Card className="overflow-hidden">
                        <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent border-b">
                          <CardTitle className="text-base flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-primary" />
                            Documentos del Titular
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {renderDocumentLink("Cédula de Identidad", selectedPoliza.cedula_identidad_url)}
                            {renderDocumentLink("Licencia de Conducir", selectedPoliza.licencia_conducir_url)}
                            {renderDocumentLink("Certificado Médico", selectedPoliza.certificado_medico_url)}
                            {renderDocumentLink("RIF", selectedPoliza.rif_url)}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* EMPRESA — solo Jurídico */}
                    {isJuridico && (
                      <Card className="overflow-hidden">
                        <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent border-b">
                          <CardTitle className="text-base flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-primary" />
                            Documentos de la Empresa
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {renderDocumentLink("RIF de la Empresa", (selectedPoliza as any).rif_empresa_url)}
                            {renderDocumentLink("Acta Constitutiva", (selectedPoliza as any).acta_constitutiva_url)}
                            {renderDocumentLink("Acta de Asamblea", (selectedPoliza as any).acta_asamblea_url)}
                            {renderDocumentLink("Declaración ISLR", (selectedPoliza as any).declaracion_islr_url)}
                            {renderDocumentLink("Referencia Bancaria", (selectedPoliza as any).referencia_bancaria_url)}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* ACCIONISTAS — solo Jurídico, un bloque por accionista */}
                    {isJuridico && totalAccionistas > 0 && (
                      <Card className="overflow-hidden">
                        <CardHeader className="pb-4 bg-gradient-to-r from-amber-500/5 to-transparent border-b">
                          <CardTitle className="text-base flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-amber-600" />
                            Documentos de Accionistas ({totalAccionistas})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                          {Array.from({ length: totalAccionistas }).map((_, i) => (
                            <div key={i} className="rounded-lg border bg-muted/30 p-3 space-y-2">
                              <p className="text-sm font-semibold text-foreground">
                                Accionista #{i + 1}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {renderDocumentLink(
                                  `Cédula del Accionista #${i + 1}`,
                                  cedulasAcc[i] || null,
                                )}
                                {renderDocumentLink(
                                  `RIF del Accionista #${i + 1}`,
                                  rifsAcc[i] || null,
                                )}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* VEHÍCULO */}
                    <Card className="overflow-hidden">
                      <CardHeader className="pb-4 bg-gradient-to-r from-emerald-500/5 to-transparent border-b">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-5 w-5 text-emerald-600" />
                          Documentos del Vehículo
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {renderDocumentLink("Factura de Compra", selectedPoliza.factura_compra_vehiculo_url)}
                          {renderDocumentLink("Certificado de Origen", selectedPoliza.certificado_origen_vehiculo_url)}
                          {renderDocumentLink("Título de Propiedad", (selectedPoliza as any).titulo_propiedad_url)}
                        </div>
                      </CardContent>
                    </Card>

                    {/* PÓLIZA */}
                    <Card className="overflow-hidden">
                      <CardHeader className="pb-4 bg-gradient-to-r from-blue-500/5 to-transparent border-b">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Documentos de Póliza
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {renderDocumentLink("Póliza Emitida", selectedPoliza.url_poliza_monday)}
                          {renderDocumentLink("Carnet de Asegurado", selectedPoliza.url_carnet_monday)}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                );
              })()}

              {isEditing && (
                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Pencil className="h-4 w-4" />
                      Editar URLs de Documentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    {renderField("URL Cédula Identidad", "cedula_identidad_url")}
                    {renderField("URL Licencia Conducir", "licencia_conducir_url")}
                    {renderField("URL Certificado Médico", "certificado_medico_url")}
                    {renderField("URL Cert. Origen Vehículo", "certificado_origen_vehiculo_url")}
                    {renderField("URL Factura Compra", "factura_compra_vehiculo_url")}
                    {renderField("URL Título de Propiedad", "titulo_propiedad_url" as keyof Poliza)}
                    {renderField("URL RIF", "rif_url")}
                    {renderField("URL Póliza", "url_poliza_monday")}
                    {renderField("URL Carnet", "url_carnet_monday")}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Factura */}
            <TabsContent value="factura" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Factura de la Póliza
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isGeneratingFactura || !selectedPoliza?.id}
                      onClick={handleGenerateFactura}
                    >
                      {isGeneratingFactura ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Generando...</>
                      ) : (
                        <><RefreshCw className="h-4 w-4" /> {(selectedPoliza as any)?.factura_poliza_url ? "Regenerar factura" : "Generar factura"}</>
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {renderDocumentLink("Factura (link público)", (selectedPoliza as any).factura_poliza_url)}
                  </div>
                  {isEditing && (
                    <div className="pt-2 border-t">
                      {renderField("URL pública de la Factura", "factura_poliza_url" as any)}
                    </div>
                  )}
                  {(selectedPoliza as any).factura_poliza_url && (
                    <div className="rounded-lg border bg-card overflow-hidden">
                      <iframe
                        src={(selectedPoliza as any).factura_poliza_url}
                        title="Factura"
                        className="w-full"
                        style={{ height: 600, border: 0 }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Carnet */}
            <TabsContent value="carnet" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    Carnet del Asegurado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {renderDocumentLink("Carnet generado (link público)", (selectedPoliza as any).carnet_poliza_url)}
                    {renderDocumentLink("Carnet Monday", selectedPoliza.url_carnet_monday)}
                  </div>
                  {isEditing && (
                    <div className="pt-2 border-t space-y-3">
                      {renderField("URL pública del Carnet generado", "carnet_poliza_url" as any)}
                      {renderField("URL Carnet Monday", "url_carnet_monday")}
                    </div>
                  )}
                  {(selectedPoliza as any).carnet_poliza_url && (
                    <div className="rounded-lg border bg-card overflow-hidden">
                      <iframe
                        src={(selectedPoliza as any).carnet_poliza_url}
                        title="Carnet"
                        className="w-full"
                        style={{ height: 800, border: 0 }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Datos Técnicos */}
            <TabsContent value="tecnico" className="space-y-4 mt-4">
              {/* Estado API y Reprocesar */}
              <Card className={status === 'error' ? 'border-red-300 bg-red-50/50' : status === 'pending' ? 'border-amber-300 bg-amber-50/50' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Estado de Procesamiento</CardTitle>
                    <PolicyStatusBadge status={isProcessing ? 'processing' : status} message={message} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {renderField("API Status", "api_status")}
                    {renderField("API Message", "api_message")}
                    {renderField("n_serialcontrato", "n_serialcontrato")}
                    {renderField("n_serialcertif", "n_serialcertif")}
                  </div>
                  
                  {showReprocess && (
                    <div className="pt-2 border-t">
                      <Button
                        onClick={handleReprocess}
                        disabled={isProcessing}
                        className="gap-2"
                      >
                        <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
                        {isProcessing ? 'Procesando...' : 'Reprocesar Póliza'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Esto actualizará los datos de configuración (precio, códigos de marca/modelo/versión) y volverá a enviar a RMS.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Información de Póliza</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  {renderField("Número de Póliza", "numero_poliza_monday")}
                  {renderField("Póliza Monday", "poliza_monday")}
                  {renderField("Fecha Inicio", "f_fchdesde", "date")}
                  {renderField("Fecha Vencimiento", "fecha_de_vencimiento_monday", "date")}
                  {renderField("Recordatorio Vencimiento", "recordatorio_de_vencimiento_monday")}
                  {renderField("Estado Principal", "estado_principal_monday")}
                  {renderField("Formulario", "formulario")}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Configuración API</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  {renderField("API Monday", "api_monday")}
                  {renderField("Version API Monday", "version_api_monday")}
                  {renderField("Monday ID", "mondayid")}
                  {renderField("c_cd_versionseguro", "c_cd_versionseguro")}
                  {renderField("c_cd_subversionseguro", "c_cd_subversionseguro")}
                  {renderField("c_cd_actividad", "c_cd_actividad")}
                  {renderField("c_cd_ocupacion", "c_cd_ocupacion")}
                  {renderField("cd_moneda", "cd_moneda")}
                  {renderField("s_moneda", "s_moneda")}
                  {renderField("desde", "desde")}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Metadatos</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">ID</p>
                    <p className="text-sm font-mono">{selectedPoliza.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Creado</p>
                    <p className="text-sm">{new Date(selectedPoliza.created_at).toLocaleString("es-VE")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Actualizado</p>
                    <p className="text-sm">{new Date(selectedPoliza.updated_at).toLocaleString("es-VE")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">User ID</p>
                    <p className="text-sm font-mono">{selectedPoliza.user_id || "-"}</p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <p className="text-xs text-muted-foreground">Lista Columnas</p>
                    <p className="text-sm font-mono text-xs break-all">
                      {selectedPoliza.listacolumnas ? selectedPoliza.listacolumnas.substring(0, 200) + "..." : "-"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
