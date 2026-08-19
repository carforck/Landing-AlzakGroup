import { z } from "zod";

/**
 * Esquema compartido: el mismo contrato valida en el navegador y en el servidor.
 *
 * Nota sobre el correo: `trim().toLowerCase()` va ANTES del `pipe(z.email())`,
 * porque en Zod 4 las validaciones de formato corren sobre el valor tal cual llega.
 */
export const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Ingrese su nombre completo.")
    .max(120, "El nombre es demasiado largo."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Ingrese un correo electrónico válido.")),
  organization: z.string().trim().max(160, "Nombre de organización demasiado largo.").optional(),
  phone: z.string().trim().max(40, "Teléfono demasiado largo.").optional(),
  message: z
    .string()
    .trim()
    .min(10, "Cuéntenos brevemente en qué podemos ayudarle (mínimo 10 caracteres).")
    .max(4000, "El mensaje excede el máximo de 4000 caracteres."),
  /**
   * Campo trampa: los bots lo llenan, las personas no lo ven.
   * Se acepta cualquier valor a propósito: el Route Handler lo descarta en
   * silencio con un 200. Rechazarlo aquí delataría la trampa en el mensaje de error.
   */
  website: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Errores por campo, con la forma que devuelve el Route Handler. */
export type ContactFieldErrors = Partial<Record<keyof ContactInput, string[]>>;
