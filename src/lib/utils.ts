import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fixEncoding(text: string | null | undefined): string {
  if (!text) return '';
  
  // Corregir caracteres mal codificados usando expresiones regulares
  let fixed = text;
  
  // Reemplazar el carácter � seguido de patrones comunes
  fixed = fixed.replace(/�/g, 'é');
  fixed = fixed.replace(/Cr�dito/g, 'Crédito');
  fixed = fixed.replace(/P�blica/g, 'Pública');
  fixed = fixed.replace(/Ganadere�a/g, 'Ganadería');
  fixed = fixed.replace(/Ganader�a/g, 'Ganadería');
  fixed = fixed.replace(/Pel�culas/g, 'Películas');
  fixed = fixed.replace(/T�cnica/g, 'Técnica');
  fixed = fixed.replace(/V�a/g, 'Vía');
  fixed = fixed.replace(/Administraci�n/g, 'Administración');
  fixed = fixed.replace(/Profesión/g, 'Profesión');
  
  // Intentar reparar otros caracteres comunes mal codificados
  const charMap: Record<string, string> = {
    '\u00c3\u00a1': 'á',
    '\u00c3\u00a9': 'é',
    '\u00c3\u00ad': 'í',
    '\u00c3\u00b3': 'ó',
    '\u00c3\u00ba': 'ú',
    '\u00c3\u00b1': 'ñ',
  };
  
  Object.entries(charMap).forEach(([wrong, correct]) => {
    fixed = fixed.split(wrong).join(correct);
  });
  
  return fixed;
}
