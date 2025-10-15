import { Upload, File, X, CheckCircle2 } from "lucide-react";
import { Label } from "./label";
import { Button } from "./button";

interface FileUploaderProps {
  label: string;
  id: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  required?: boolean;
  accept?: string;
}

export const FileUploader = ({
  label,
  id,
  file,
  onFileChange,
  required = false,
  accept = "image/*,.pdf"
}: FileUploaderProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onFileChange(selectedFile);
  };

  const handleRemoveFile = () => {
    onFileChange(null);
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
        <div className="flex items-center justify-between w-full p-4 border-2 border-success/20 rounded-lg bg-success/5">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
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
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
