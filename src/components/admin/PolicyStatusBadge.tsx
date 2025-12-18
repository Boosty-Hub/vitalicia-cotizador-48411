import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldX, ShieldAlert } from "lucide-react";

interface PolicyStatusBadgeProps {
  hasPolicy: boolean;
  isActive: boolean;
  onClick?: () => void;
}

export function PolicyStatusBadge({ hasPolicy, isActive, onClick }: PolicyStatusBadgeProps) {
  if (!hasPolicy) {
    return (
      <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-muted cursor-default">
        <Shield className="h-3 w-3 mr-1" />
        Sin póliza
      </Badge>
    );
  }

  if (isActive) {
    return (
      <Badge 
        className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer" 
        onClick={onClick}
      >
        <ShieldCheck className="h-3 w-3 mr-1" />
        Póliza activa
      </Badge>
    );
  }

  return (
    <Badge 
      variant="destructive" 
      className="bg-red-500 hover:bg-red-600 cursor-pointer"
      onClick={onClick}
    >
      <ShieldX className="h-3 w-3 mr-1" />
      Póliza vencida
    </Badge>
  );
}
