import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldX } from "lucide-react";

interface InventoryPolicyBadgeProps {
  hasPolicy: boolean;
  isActive: boolean;
  onClick?: () => void;
}

/**
 * Badge for inventory pages showing if a vehicle has an associated policy
 */
export function InventoryPolicyBadge({ hasPolicy, isActive, onClick }: InventoryPolicyBadgeProps) {
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
