import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Check, X, AlertCircle, User } from "lucide-react";
import { useQuotation } from "@/contexts/QuotationContext";
import { DocumentUpload } from "@/types/quotation";

export const DocumentUploadStep = () => {
  const { state, updateDocuments } = useQuotation();
  const [documents, setDocuments] = useState<DocumentUpload[]>(() => {
    // Initialize documents for titular and family members
    const initialDocs: DocumentUpload[] = [
      {
        personId: 'titular',
        personName: `${state.personalInfo.firstName} ${state.personalInfo.lastName}`,
        required: true,
        uploaded: false
      }
    ];

    // Add family members
    state.familyMembers.forEach(member => {
      initialDocs.push({
        personId: member.id,
        personName: `${member.firstName} ${member.lastName}`,
        required: true,
        uploaded: false
      });
    });

    return initialDocs;
  });

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleFileSelect = (personId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Use PDF, JPG, PNG o WebP.');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    // Update document state
    const updatedDocuments = documents.map(doc => {
      if (doc.personId === personId) {
        return {
          ...doc,
          idDocument: file,
          uploaded: true
        };
      }
      return doc;
    });

    setDocuments(updatedDocuments);
    updateDocuments(updatedDocuments);
  };

  const handleRemoveFile = (personId: string) => {
    const updatedDocuments = documents.map(doc => {
      if (doc.personId === personId) {
        return {
          ...doc,
          idDocument: undefined,
          uploaded: false
        };
      }
      return doc;
    });

    setDocuments(updatedDocuments);
    updateDocuments(updatedDocuments);

    // Clear file input
    if (fileInputRefs.current[personId]) {
      fileInputRefs.current[personId]!.value = '';
    }
  };

  const handleAdditionalFiles = (personId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (allowedTypes.includes(file.type) && file.size <= maxSize) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      alert('No se seleccionaron archivos válidos.');
      return;
    }

    const updatedDocuments = documents.map(doc => {
      if (doc.personId === personId) {
        return {
          ...doc,
          additionalDocuments: [...(doc.additionalDocuments || []), ...validFiles]
        };
      }
      return doc;
    });

    setDocuments(updatedDocuments);
    updateDocuments(updatedDocuments);
  };

  const removeAdditionalFile = (personId: string, fileIndex: number) => {
    const updatedDocuments = documents.map(doc => {
      if (doc.personId === personId && doc.additionalDocuments) {
        const newAdditionalDocs = doc.additionalDocuments.filter((_, index) => index !== fileIndex);
        return {
          ...doc,
          additionalDocuments: newAdditionalDocs
        };
      }
      return doc;
    });

    setDocuments(updatedDocuments);
    updateDocuments(updatedDocuments);
  };

  const uploadProgress = (documents.filter(doc => doc.uploaded).length / documents.length) * 100;
  const allRequiredUploaded = documents.filter(doc => doc.required).every(doc => doc.uploaded);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Upload className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Carga de documentos</h2>
        </div>
        <p className="text-muted-foreground">
          Suba los documentos de identidad de todas las personas a asegurar
        </p>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progreso de carga</span>
              <span className="text-sm text-muted-foreground">
                {documents.filter(doc => doc.uploaded).length} de {documents.length} completados
              </span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Cards */}
      <div className="space-y-4">
        {documents.map((doc) => (
          <Card key={doc.personId} className={`
            ${doc.uploaded ? 'border-green-200 bg-green-50' : 'border-gray-200'}
            ${doc.required ? '' : 'border-dashed'}
          `}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${doc.uploaded ? 'bg-green-100' : 'bg-gray-100'}
                  `}>
                    {doc.uploaded ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <User className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{doc.personName}</CardTitle>
                    <CardDescription>
                      {doc.personId === 'titular' ? 'Titular' : 'Familiar'}
                      {doc.required && <Badge variant="destructive" className="ml-2">Obligatorio</Badge>}
                    </CardDescription>
                  </div>
                </div>
                {doc.uploaded && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Check className="w-3 h-3 mr-1" />
                    Completado
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Main ID Document */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Documento de identidad (obligatorio)</h4>
                <p className="text-xs text-muted-foreground">
                  (.pdf, .doc, .jpg, .jpeg, .png, .zip) - Tamaño máximo 10MB
                </p>
                
                {!doc.uploaded ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      ref={el => fileInputRefs.current[doc.personId] = el}
                      type="file"
                      accept=".pdf,.doc,.jpg,.jpeg,.png,.zip"
                      onChange={(e) => handleFileSelect(doc.personId, e.target.files)}
                      className="hidden"
                      id={`file-${doc.personId}`}
                    />
                    <label htmlFor={`file-${doc.personId}`} className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium">Haga clic para seleccionar archivo</p>
                      <p className="text-xs text-muted-foreground">o arrastre y suelte aquí</p>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">{doc.idDocument?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.idDocument && formatFileSize(doc.idDocument.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(doc.personId)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Additional Documents */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Otros documentos (opcional)</h4>
                <p className="text-xs text-muted-foreground">
                  Debes adjuntar los documentos de identidad de los asegurados adicionales y cualquier otro 
                  documento que pueda complementar tu solicitud.
                </p>
                
                {doc.additionalDocuments && doc.additionalDocuments.length > 0 && (
                  <div className="space-y-2">
                    {doc.additionalDocuments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="text-xs font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAdditionalFile(doc.personId, index)}
                          className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <input
                  type="file"
                  accept=".pdf,.doc,.jpg,.jpeg,.png,.zip"
                  multiple
                  onChange={(e) => handleAdditionalFiles(doc.personId, e.target.files)}
                  className="hidden"
                  id={`additional-${doc.personId}`}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById(`additional-${doc.personId}`)?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Agregar documentos adicionales
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Alert */}
      {!allRequiredUploaded ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Debe cargar los documentos de identidad obligatorios para continuar con el proceso de cotización.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ¡Perfecto! Todos los documentos obligatorios han sido cargados correctamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Important Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Información Importante</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Una vez cargados los documentos marcados como obligatorios y procesada a continuar con el proceso de cotización, no podrás actualizarlos.</li>
            <li>• ¿Estás seguro que deseas avanzar en la cotización con los documentos seleccionados?</li>
            <li>• Los documentos deben ser legibles y estar en buen estado</li>
            <li>• Formatos aceptados: PDF, DOC, JPG, JPEG, PNG, ZIP</li>
            <li>• Tamaño máximo por archivo: 10MB</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
