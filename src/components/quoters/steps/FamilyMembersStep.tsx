import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { CalendarIcon, Users, Plus, Edit, Trash2, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useQuotation } from "@/contexts/QuotationContext";
import { FamilyMember } from "@/types/quotation";

const familyMemberSchema = z.object({
  relationship: z.enum(["spouse", "child", "parent", "other"]),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  secondName: z.string().optional(),
  secondLastName: z.string().optional(),
  hasId: z.boolean(),
  idType: z.enum(["cedula", "passport"]).optional(),
  idNumber: z.string().optional(),
  birthDate: z.date({
    required_error: "La fecha de nacimiento es requerida",
  }),
  gender: z.enum(["male", "female"]),
  height: z.number().min(50).max(250),
  weight: z.number().min(2).max(300),
  profession: z.string().optional(),
  occupation: z.string().optional(),
  hasGoodHealth: z.boolean(),
});

type FamilyMemberFormData = z.infer<typeof familyMemberSchema>;

const RELATIONSHIP_LABELS = {
  spouse: "Cónyuge",
  child: "Hijo/a",
  parent: "Padre/Madre",
  other: "Otro"
};

export const FamilyMembersStep = () => {
  const { state, addFamilyMember, updateFamilyMember, removeFamilyMember } = useQuotation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  const form = useForm<FamilyMemberFormData>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      relationship: "spouse",
      firstName: "",
      lastName: "",
      secondName: "",
      secondLastName: "",
      hasId: true,
      idType: "cedula",
      idNumber: "",
      birthDate: undefined,
      gender: "male",
      height: 170,
      weight: 70,
      profession: "",
      occupation: "",
      hasGoodHealth: true,
    },
  });

  const onSubmit = (data: FamilyMemberFormData) => {
    const memberData: FamilyMember = {
      id: editingMember?.id || `member_${Date.now()}`,
      relationship: data.relationship,
      firstName: data.firstName,
      lastName: data.lastName,
      secondName: data.secondName,
      secondLastName: data.secondLastName,
      hasId: data.hasId,
      idType: data.idType,
      idNumber: data.idNumber,
      birthDate: data.birthDate.toISOString(),
      gender: data.gender,
      height: data.height,
      weight: data.weight,
      profession: data.profession,
      occupation: data.occupation,
      hasGoodHealth: data.hasGoodHealth,
    };

    if (editingMember) {
      updateFamilyMember(editingMember.id, memberData);
    } else {
      addFamilyMember(memberData);
    }

    form.reset();
    setEditingMember(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    form.reset({
      relationship: member.relationship,
      firstName: member.firstName,
      lastName: member.lastName,
      secondName: member.secondName || "",
      secondLastName: member.secondLastName || "",
      hasId: member.hasId,
      idType: member.idType,
      idNumber: member.idNumber || "",
      birthDate: new Date(member.birthDate),
      gender: member.gender,
      height: member.height,
      weight: member.weight,
      profession: member.profession || "",
      occupation: member.occupation || "",
      hasGoodHealth: member.hasGoodHealth,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (memberId: string) => {
    removeFamilyMember(memberId);
  };

  const handleAddNew = () => {
    setEditingMember(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Users className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Grupo Familiar</h2>
        </div>
        <p className="text-muted-foreground">
          Agregue los familiares que desea incluir en la póliza de seguro
        </p>
      </div>

      {/* Current Family Members */}
      <div className="space-y-4">
        {state.familyMembers.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No hay familiares agregados
              </h3>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Puede continuar solo con el titular o agregar familiares a la póliza
              </p>
              <Button onClick={handleAddNew} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Agregar Familiar</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Familiares Agregados ({state.familyMembers.length})
              </h3>
              <Button onClick={handleAddNew} size="sm" className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Agregar Familiar</span>
              </Button>
            </div>

            <div className="grid gap-4">
              {state.familyMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">
                              {member.firstName} {member.lastName}
                            </h4>
                            <Badge variant="secondary">
                              {RELATIONSHIP_LABELS[member.relationship]}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              {calculateAge(member.birthDate)} años • {member.gender === 'male' ? 'Masculino' : 'Femenino'}
                            </p>
                            <p>
                              {member.height} cm • {member.weight} kg
                            </p>
                            {member.hasId && member.idNumber && (
                              <p>
                                {member.idType === 'cedula' ? 'C.I.' : 'Pasaporte'}: {member.idNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(member)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(member.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Family Member Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Editar Familiar" : "Agregar Familiar"}
            </DialogTitle>
            <DialogDescription>
              Complete la información del familiar que desea incluir en la póliza
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-semibold">Información Básica</h4>
                
                <FormField
                  control={form.control}
                  name="relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parentesco *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione el parentesco" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(RELATIONSHIP_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primer Nombre *</FormLabel>
                        <FormControl>
                          <Input placeholder="Primer nombre" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secondName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Segundo Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="Segundo nombre (opcional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primer Apellido *</FormLabel>
                        <FormControl>
                          <Input placeholder="Primer apellido" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secondLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Segundo Apellido</FormLabel>
                        <FormControl>
                          <Input placeholder="Segundo apellido (opcional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Nacimiento *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy", { locale: es })
                                ) : (
                                  <span>Seleccione una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Género *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-row space-x-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="male" id="male" />
                              <Label htmlFor="male">Masculino</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="female" id="female" />
                              <Label htmlFor="female">Femenino</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* ID Information */}
              <div className="space-y-4">
                <h4 className="font-semibold">Documento de Identidad</h4>
                
                <FormField
                  control={form.control}
                  name="hasId"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>¿El usuario seleccionado tiene cédula?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === "true")}
                          defaultValue={field.value ? "true" : "false"}
                          className="flex flex-row space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="has-id-yes" />
                            <Label htmlFor="has-id-yes">Sí</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="has-id-no" />
                            <Label htmlFor="has-id-no">No</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("hasId") && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="idType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Documento</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cedula">Cédula Venezolana</SelectItem>
                              <SelectItem value="passport">Pasaporte</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="idNumber"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Número de Documento</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: 12345678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Physical Information */}
              <div className="space-y-4">
                <h4 className="font-semibold">Información Física</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estatura: {field.value} cm</FormLabel>
                        <FormControl>
                          <Slider
                            min={50}
                            max={250}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso: {field.value} kg</FormLabel>
                        <FormControl>
                          <Slider
                            min={2}
                            max={300}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Health Status */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasGoodHealth"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>¿Goza de buena salud?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === "true")}
                          defaultValue={field.value ? "true" : "false"}
                          className="flex flex-row space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="health-yes" />
                            <Label htmlFor="health-yes">Sí</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="health-no" />
                            <Label htmlFor="health-no">No</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingMember ? "Actualizar" : "Agregar"} Familiar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
