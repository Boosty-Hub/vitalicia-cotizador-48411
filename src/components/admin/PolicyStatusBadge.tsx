import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldX, ShieldAlert, Clock, RefreshCw } from "lucide-react";

export type PolicyStatus = 'active' | 'error' | 'pending' | 'processing';

interface PolicyStatusBadgeProps {
  status: PolicyStatus;
  message?: string | null;
  onClick?: () => void;
  showTooltip?: boolean;
}

export function getPolizaStatus(poliza: {
  api_status?: string | null;
  api_message?: string | null;
  numero_poliza_monday?: string | null;
  estado_principal_monday?: string | null;
}): { status: PolicyStatus; message: string } {
  // Si tiene número de póliza y estado success, está activa
  if (poliza.numero_poliza_monday && poliza.api_status === 'success') {
    return { status: 'active', message: 'Póliza activada correctamente' };
  }
  
  // Si tiene número de póliza pero sin api_status, puede ser migración anterior
  if (poliza.numero_poliza_monday && !poliza.api_status) {
    return { status: 'active', message: 'Póliza activa (registro anterior)' };
  }
  
  // Si api_status tiene error o mensaje de error
  if (poliza.api_status && poliza.api_status !== 'success' && poliza.api_status !== 'unknown') {
    return { 
      status: 'error', 
      message: poliza.api_message || 'Error al procesar la póliza'
    };
  }
  
  // Si hay mensaje de API pero no hay número de póliza
  if (poliza.api_message && !poliza.numero_poliza_monday) {
    const isError = poliza.api_message.toLowerCase().includes('error') || 
                   poliza.api_message.toLowerCase().includes('fail') ||
                   !poliza.api_message.toLowerCase().includes('success');
    
    if (isError) {
      return { status: 'error', message: poliza.api_message };
    }
  }
  
  // Si está pendiente de revisión por analista (jurídicas)
  if (poliza.estado_principal_monday === 'Pendiente revisión analista' && !poliza.numero_poliza_monday) {
    return { status: 'pending', message: 'Pendiente de revisión por analista' };
  }

  // Si estado es "Nuevo registro" y no tiene número de póliza
  if (poliza.estado_principal_monday === 'Nuevo registro' && !poliza.numero_poliza_monday) {
    return { status: 'pending', message: 'Pendiente de procesar' };
  }
  
  // Sin número de póliza = pendiente
  if (!poliza.numero_poliza_monday) {
    return { status: 'pending', message: 'Pendiente de activación' };
  }
  
  return { status: 'active', message: 'Póliza activa' };
}

export function PolicyStatusBadge({ status, message, onClick, showTooltip = true }: PolicyStatusBadgeProps) {
  const config = {
    active: {
      icon: ShieldCheck,
      label: 'Activa',
      className: 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-default',
    },
    error: {
      icon: ShieldX,
      label: 'Error',
      className: 'bg-red-500 hover:bg-red-600 text-white cursor-pointer',
    },
    pending: {
      icon: Clock,
      label: 'Pendiente',
      className: 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer',
    },
    processing: {
      icon: RefreshCw,
      label: 'Procesando',
      className: 'bg-blue-500 hover:bg-blue-600 text-white cursor-wait',
    },
  };

  const { icon: Icon, label, className } = config[status];
  const isClickable = (status === 'error' || status === 'pending') && onClick;

  return (
    <Badge 
      className={`${className} ${isClickable ? 'cursor-pointer' : ''}`}
      onClick={isClickable ? onClick : undefined}
      title={showTooltip ? message || undefined : undefined}
    >
      <Icon className={`h-3 w-3 mr-1 ${status === 'processing' ? 'animate-spin' : ''}`} />
      {label}
    </Badge>
  );
}
