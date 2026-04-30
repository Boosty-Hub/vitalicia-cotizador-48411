// Shared validation helpers for activation forms (Natural & Juridica)

// ----------------- Constants -----------------

// Allowed mobile phone codes (WhatsApp). Landlines removed per business rules.
export const ALLOWED_MOBILE_CODES = ["0412", "0414", "0416", "0422", "0424", "0426"];

// Allowed marital status descriptions (lowercase). "Concubinato" excluded.
const ALLOWED_MARITAL_DESCRIPTIONS = ["soltero", "soltera", "casado", "casada", "divorciado", "divorciada", "viudo", "viuda"];

// Allowed sex codes & descriptions: only Masculino / Femenino. "No aplica" excluded.
const ALLOWED_SEX_CODES = ["M", "F"];
const ALLOWED_SEX_DESCRIPTIONS = ["masculino", "femenino"];

// Allowed beneficiary relationship options
export const BENEFICIARY_RELATIONSHIPS = [
  { value: "hijo", label: "Hijo(a)" },
  { value: "padres", label: "Padres" },
  { value: "esposa", label: "Esposo(a)" },
  { value: "otro", label: "Otro" },
];

// Min purchase date: invoices not allowed before this date.
export const MIN_FECHA_COMPRA = "2025-02-01";

// ----------------- Cédula formatting / validation -----------------

/**
 * Format identification number as user types.
 * - V / E: numeric, 7-8 digits, prefix "V-" / "E-"
 * - J / G: business RIF, up to 9 + 1 verifier
 * - P: Passport, alphanumeric, no forced prefix
 */
export function formatCedulaInput(tipo: string, value: string): string {
  if (!tipo) return value;

  if (tipo === "P" || tipo === "Pasaporte") {
    // Alphanumeric, uppercase, no spaces, no special chars. No forced prefix.
    return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
  }

  const numbersOnly = value.replace(/[^0-9]/g, "");

  if (tipo === "V" || tipo === "E" || tipo === "Venezolano" || tipo === "Extranjero") {
    const prefix = tipo === "Venezolano" ? "V" : tipo === "Extranjero" ? "E" : tipo;
    if (numbersOnly.length === 0) return `${prefix}-`;
    return `${prefix}-${numbersOnly.slice(0, 8)}`;
  }

  if (tipo === "J" || tipo === "G") {
    if (numbersOnly.length === 0) return `${tipo}-`;
    if (numbersOnly.length <= 9) return `${tipo}-${numbersOnly}`;
    return `${tipo}-${numbersOnly.slice(0, 9)}-${numbersOnly.slice(9, 10)}`;
  }

  return value;
}

/**
 * Validate cédula by type/range.
 * - V (Venezolano): 7-8 digits, value in [2.000.000, 45.000.000]
 * - E (Extranjero): 7-8 digits, value in [80.000.000, 99.999.999]
 * - P (Pasaporte): alphanumeric, 5-15 chars
 */
export function validateCedula(tipo: string, value: string): { valid: boolean; error: string } {
  if (!value) return { valid: false, error: "Número de identificación requerido" };

  if (tipo === "P" || tipo === "Pasaporte") {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean.length < 5) return { valid: false, error: "Pasaporte debe tener al menos 5 caracteres" };
    if (clean.length > 15) return { valid: false, error: "Pasaporte no puede tener más de 15 caracteres" };
    return { valid: true, error: "" };
  }

  const digits = value.replace(/[^0-9]/g, "");
  if (digits.length < 7) return { valid: false, error: "Cédula debe tener mínimo 7 dígitos" };
  if (digits.length > 8) return { valid: false, error: "Cédula debe tener máximo 8 dígitos" };

  const numericValue = parseInt(digits, 10);
  const isVenezolano = tipo === "V" || tipo === "Venezolano";
  const isExtranjero = tipo === "E" || tipo === "Extranjero";

  if (isVenezolano) {
    if (numericValue < 2_000_000 || numericValue > 45_000_000) {
      return { valid: false, error: "Cédula venezolana debe estar entre 2.000.000 y 45.000.000" };
    }
  } else if (isExtranjero) {
    if (numericValue < 80_000_000 || numericValue > 99_999_999) {
      return { valid: false, error: "Cédula de extranjero debe estar entre 80.000.000 y 99.999.999" };
    }
  }

  return { valid: true, error: "" };
}

// ----------------- Email -----------------

export function validateEmailFormat(email: string): { valid: boolean; error: string } {
  if (!email) return { valid: false, error: "Correo electrónico requerido" };

  const hasAccents = /[áéíóúÁÉÍÓÚñÑüÜ]/.test(email);
  if (hasAccents) return { valid: false, error: "El correo no debe contener acentos o tildes" };

  if (email.length > 70) {
    return { valid: false, error: `El correo no puede tener más de 70 caracteres (actual: ${email.length})` };
  }

  // RFC-ish format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Por favor ingrese un correo electrónico válido (ej: nombre@dominio.com)" };
  }

  return { valid: true, error: "" };
}

// ----------------- Date helpers -----------------

/** ISO yyyy-mm-dd of today */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/** ISO yyyy-mm-dd of date 18 years ago (max birthdate to be of age) */
export function maxBirthDateForAdult(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split("T")[0];
}

/** Returns true if person is 18 years old or more. */
export function isAdult(birthDateISO: string): boolean {
  if (!birthDateISO) return false;
  const today = new Date();
  const birth = new Date(birthDateISO);
  if (isNaN(birth.getTime())) return false;
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 18;
}

/** Validate purchase date: cannot be future, cannot be older than MIN_FECHA_COMPRA. */
export function validateFechaCompra(fecha: string): { valid: boolean; error: string } {
  if (!fecha) return { valid: false, error: "Fecha de compra requerida" };
  const today = todayISO();
  if (fecha > today) return { valid: false, error: "La fecha de compra no puede ser futura" };
  if (fecha < MIN_FECHA_COMPRA) {
    return { valid: false, error: `La fecha de compra no puede ser anterior al ${MIN_FECHA_COMPRA}` };
  }
  return { valid: true, error: "" };
}

// ----------------- Address -----------------

/**
 * Sanitize address: remove commas. We auto-strip them as the user types so the
 * value never contains a comma, then validate min length.
 */
export function sanitizeDireccion(value: string): string {
  return value.replace(/,/g, "");
}

export function validateDireccion(value: string): { valid: boolean; error: string } {
  if (!value || value.trim().length < 5) {
    return { valid: false, error: "Ingresa una dirección válida (mínimo 5 caracteres)" };
  }
  if (/,/.test(value)) {
    return { valid: false, error: "La dirección no puede contener comas (,)" };
  }
  return { valid: true, error: "" };
}

// ----------------- List filters (catalog sanitization) -----------------

export function filterSexos<T extends { cd_valdet?: string | null; descripcion?: string | null }>(items: T[]): T[] {
  return items.filter((s) => {
    const code = (s.cd_valdet || "").toUpperCase();
    const desc = (s.descripcion || "").toLowerCase();
    if (code) return ALLOWED_SEX_CODES.includes(code);
    return ALLOWED_SEX_DESCRIPTIONS.includes(desc);
  });
}

/** Variant for jurídica which uses descripcion-only objects. */
export function filterSexosByDescripcion<T extends { descripcion: string }>(items: T[]): T[] {
  return items.filter((s) => ALLOWED_SEX_DESCRIPTIONS.includes((s.descripcion || "").toLowerCase()));
}

export function filterEstadosCiviles<T extends { descripcion?: string | null }>(items: T[]): T[] {
  return items.filter((e) => {
    const desc = (e.descripcion || "").toLowerCase();
    if (!desc) return false;
    if (desc.includes("concubin")) return false;
    return ALLOWED_MARITAL_DESCRIPTIONS.some((allowed) => desc.includes(allowed));
  });
}

export function filterCodigosMoviles<T extends { cd_valdet?: string | null }>(items: T[]): T[] {
  return items.filter((c) => ALLOWED_MOBILE_CODES.includes((c.cd_valdet || "").trim()));
}

// ----------------- Field-level error collector for required fields -----------------

export interface MissingField {
  field: string;
  label: string;
}

export function collectMissingFields(checks: Array<{ value: unknown; label: string; field: string; valid?: boolean }>): MissingField[] {
  const missing: MissingField[] = [];
  for (const c of checks) {
    const isEmpty = c.value === undefined || c.value === null || c.value === "";
    if (isEmpty || c.valid === false) {
      missing.push({ field: c.field, label: c.label });
    }
  }
  return missing;
}
