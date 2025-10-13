import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, User, Mail, Phone, MapPin } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useQuotation } from "@/contexts/QuotationContext";
import { VENEZUELAN_STATES, PHONE_CODES } from "@/types/quotation";

const personalInfoSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  secondName: z.string().optional(),
  secondLastName: z.string().optional(),
  idType: z.enum(["cedula", "passport", "rif"]),
  idNumber: z.string().min(6, "Número de identificación inválido"),
  email: z.string().email("Email inválido"),
  birthDate: z.date({
    required_error: "La fecha de nacimiento es requerida",
  }),
  gender: z.enum(["male", "female"]),
  phoneCode: z.string().min(1, "Seleccione un código"),
  phoneNumber: z.string().min(7, "Número de teléfono inválido"),
  hasInsuranceAdvisor: z.boolean(),
  profession: z.string().optional(),
  occupation: z.string().optional(),
  company: z.string().optional(),
  country: z.string().default("Venezuela"),
  state: z.string().min(1, "Seleccione un estado"),
  city: z.string().min(1, "Seleccione una ciudad"),
  zone: z.string().optional(),
  address: z.string().optional(),
  maritalStatus: z.string().optional(),
  annualIncome: z.string().optional(),
  averageAnnualPremium: z.string().optional(),
  economicActivity: z.string().optional(),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

export const PersonalInfoStep = () => {
  const { state, updatePersonalInfo } = useQuotation();

  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: state.personalInfo.firstName,
      lastName: state.personalInfo.lastName,
      secondName: state.personalInfo.secondName || "",
      secondLastName: state.personalInfo.secondLastName || "",
      idType: state.personalInfo.idType,
      idNumber: state.personalInfo.idNumber,
      email: state.personalInfo.email,
      birthDate: state.personalInfo.birthDate ? new Date(state.personalInfo.birthDate) : undefined,
      gender: state.personalInfo.gender,
      phoneCode: state.personalInfo.phone.substring(0, 4) || "",
      phoneNumber: state.personalInfo.phone.substring(4) || "",
      hasInsuranceAdvisor: state.personalInfo.hasInsuranceAdvisor,
      profession: state.personalInfo.profession || "",
      occupation: state.personalInfo.occupation || "",
      company: state.personalInfo.company || "",
      country: state.personalInfo.country,
      state: state.personalInfo.state,
      city: state.personalInfo.city,
      zone: state.personalInfo.zone || "",
      address: state.personalInfo.address || "",
      maritalStatus: state.personalInfo.maritalStatus || "",
      annualIncome: state.personalInfo.annualIncome || "",
      averageAnnualPremium: state.personalInfo.averageAnnualPremium || "",
      economicActivity: state.personalInfo.economicActivity || "",
    },
  });

  const onSubmit = (data: PersonalInfoFormData) => {
    updatePersonalInfo({
      ...data,
      birthDate: data.birthDate.toISOString(),
      phone: data.phoneCode + data.phoneNumber,
    });
  };

  // Auto-save on form changes
  const watchedValues = form.watch();
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.birthDate && value.phoneCode && value.phoneNumber) {
        updatePersonalInfo({
          ...value,
          birthDate: value.birthDate.toISOString(),
          phone: value.phoneCode + value.phoneNumber,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, updatePersonalInfo]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-1 sm:space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold">Información Personal</h2>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground px-4">
          Ingrese sus datos personales para comenzar la cotización
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Datos Básicos</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Información personal del titular de la póliza
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primer Nombre *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese su primer nombre" {...field} />
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
                        <Input placeholder="Ingrese su primer apellido" {...field} />
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="idType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Documento *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cedula">Cédula Venezolana</SelectItem>
                          <SelectItem value="passport">Pasaporte</SelectItem>
                          <SelectItem value="rif">RIF</SelectItem>
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
                  <FormItem className="sm:col-span-2">
                      <FormLabel>Número de Documento *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Información de Contacto</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ejemplo@correo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="phoneCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Código" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PHONE_CODES.map((code) => (
                            <SelectItem key={code.code} value={code.code}>
                              {code.code} - {code.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Número de Teléfono *</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Ubicación</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VENEZUELAN_STATES.map((state) => (
                            <SelectItem key={state} value={state.toLowerCase()}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese su ciudad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Dirección completa (opcional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Insurance Advisor Question */}
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="hasInsuranceAdvisor"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">¿Tiene asesor de seguro?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === "true")}
                        defaultValue={field.value ? "true" : "false"}
                        className="flex flex-row space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="advisor-yes" />
                          <Label htmlFor="advisor-yes">Sí</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="advisor-no" />
                          <Label htmlFor="advisor-no">No</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};
