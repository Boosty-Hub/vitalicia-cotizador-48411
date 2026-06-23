import { Upload, File, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Label } from "./label";
import { Button } from "./button";
import type { ValidationStatus } from "@/hooks/useDocumentValidation";

interface FileUploaderProps {
  label: string;
  id: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  required?: boolean;
  accept?: string;
  validationStatus?: ValidationStatus;
  validationMessage?: string;
  validationObservations?: string[];
  /** Sugerencias para corregir el formulario con lo que dice el documento (solo si inválido). */
  suggestions?: Array<{ label: string; onApply: () => void }>;
}

export const FileUploader = ({
  label,
  id,
  file,
  onFileChange,
  required = false,
  accept = "image/*,.pdf",
  validationStatus = "idle",
  validationMessage,
  validationObservations = [],
  suggestions = [],
}: FileUploaderProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onFileChange(selectedFile);
  };

  const handleRemoveFile = () => {
    onFileChange(null);
  };

  const getValidationBorderClass = () => {
    switch (validationStatus) {
      case "validating":
        return "border-yellow-500/50 bg-yellow-50/30 dark:bg-yellow-950/10";
      case "valid":
        return "border-green-500/30 bg-green-50/30 dark:bg-green-950/10";
      case "invalid":
        return "border-destructive/50 bg-destructive/5";
      default:
        return "border-success/20 bg-success/5";
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      
      {!file ? (
        <label
          htmlFor={id}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors group"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-3 text-muted-foreground group-hover:text-foreground transition-colors" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Click para subir</span> o arrastra el archivo
            </p>
            <p className="text-xs text-muted-foreground">
              PDF o Imágenes (MAX. 10MB)
            </p>
          </div>
          <input
            id={id}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className={`flex flex-col w-full border-2 rounded-lg ${getValidationBorderClass()}`}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {validationStatus === "validating" ? (
                <Loader2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 animate-spin" />
              ) : validationStatus === "valid" ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : validationStatus === "invalid" ? (
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              )}
              <File className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="flex-shrink-0 ml-2 hover:bg-destructive/10 hover:text-destructive"
              disabled={validationStatus === "validating"}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Validation status message */}
          {validationMessage && (
            <div className={`px-4 pb-3 ${
              validationStatus === "validating" 
                ? "text-yellow-700 dark:text-yellow-300" 
                : validationStatus === "valid" 
                  ? "text-green-700 dark:text-green-300" 
                  : validationStatus === "invalid" 
                    ? "text-destructive" 
                    : "text-muted-foreground"
            }`}>
              <p className="text-xs font-medium">{validationMessage}</p>
              {validationObservations.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {validationObservations.map((obs, i) => (
                    <li key={i} className="text-xs opacity-80">• {obs}</li>
                  ))}
                </ul>
              )}
              {validationStatus === "invalid" && suggestions.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <p className="text-xs font-medium text-foreground">
                    ¿Te equivocaste al escribir? Corregí tu dato con lo que dice el documento:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s, i) => (
                      <Button
                        key={i}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={s.onApply}
                      >
                        {s.label}
                      </Button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Si en cambio el documento no es el correcto, quitalo con la ✕ y subí el indicado.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
