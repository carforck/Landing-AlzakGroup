import { z } from "zod";

/**
 * Encuesta de tamizaje de cáncer de pulmón, igual a la de las apps de Shiny
 * (`modules/shared.py` y `modules/survey.py` de calucaladora-medisinu).
 *
 * La comparten el formulario (cliente) y `guardarEncuesta` (servidor): el
 * servidor vuelve a validar todo y vuelve a calcular el riesgo, no se fía de
 * lo que llega del navegador.
 *
 * Reglas que trae Shiny y se conservan:
 *  - Todas las preguntas son obligatorias; las de detalle (años, cigarrillos,
 *    edad de inicio) sólo cuando la principal es «Sí», y deben ser > 0.
 *  - La edad sale de la fecha de nacimiento y debe estar en el protocolo
 *    (50–80; Sanitas desde 18).
 *  - Quien ya tiene diagnóstico de cáncer de pulmón no puede usar la
 *    herramienta: la pregunta corta el flujo.
 */

export const TIPOS_DOC = [
  { codigo: "CC", nombre: "Cédula de ciudadanía" },
  { codigo: "CE", nombre: "Cédula de extranjería" },
  { codigo: "PA", nombre: "Pasaporte" },
  { codigo: "ASI", nombre: "Adulto sin identificación" },
  { codigo: "PEP", nombre: "Permiso especial de permanencia" },
  { codigo: "CD", nombre: "Carné diplomático" },
  { codigo: "SC", nombre: "Salvoconducto" },
  { codigo: "DE", nombre: "Documento extranjero" },
  { codigo: "PPT", nombre: "Permiso por protección temporal" },
] as const;

export type SiNo = "Sí" | "No";

/** Preguntas Sí/No, con el texto exacto de Shiny. */
export const SI_NO = {
  ca_pulmon: "¿Usted ha sido diagnosticado con cáncer de pulmón?",
  ca_ant: "¿Usted ha sido diagnosticado con linfomas, cánceres de cabeza y cuello o cánceres relacionados con el tabaquismo?",
  epoc: "¿Ha sido diagnosticado con fibrosis pulmonar o enfermedad pulmonar obstructiva crónica (EPOC)?",
  ca_pulmon_fam: "¿Tiene historia familiar de primer grado (padres, hermanos) de cáncer de pulmón?",
  fumador: "¿Usted fuma o ha fumado?",
  fumador_pasivo: "¿Usted estuvo frecuentemente expuesto al humo de cigarrillo dentro de su casa o en el sitio de trabajo?",
  vaping: "¿Usted fuma cigarrillos electrónicos (vapeadores)?",
  hap: "¿Usted cocina con leña, carbón o está expuesto diariamente a humo, como el de la quema de basura?",
  asbesto:
    "¿Alguna vez ha trabajado en una industria o profesión conocida por la exposición al asbesto, como construcción, minería de carbón, fabricación de productos de asbesto, demolición de edificios, reparación o construcción de barcos o partes automotrices, fabricación de papel y productos de papel, aires acondicionados o refinerías de petróleo?",
  diesel:
    "¿Ha trabajado alguna vez en una industria o profesión donde haya estado expuesto al humo de diésel, como conductores de camiones, operadores de maquinaria pesada, mineros, trabajadores de ferrocarriles o empleados en terminales de autobuses?",
  pintura: "¿Usted ha trabajado con pinturas o expuesto a pinturas, disolventes o químicos utilizados para pintar?",
} as const;

export type ClaveSiNo = keyof typeof SI_NO;

/** Preguntas de detalle que se abren con un «Sí». */
export const DETALLE: Record<string, { depende: ClaveSiNo; texto: string }> = {
  fumador_year: { depende: "fumador", texto: "¿Cuántos años ha fumado o fumó?" },
  n_cigarrillos_dia: { depende: "fumador", texto: "¿Cuántos cigarrillos en promedio usted fuma o fumaba al día?" },
  fumador_pasivo_year: { depende: "fumador_pasivo", texto: "¿Por cuánto tiempo ha estado expuesto al humo de cigarrillo? (años)" },
  vaping_year: { depende: "vaping", texto: "¿Hace cuántos años empezó a fumar con cigarrillos electrónicos (vapeadores)?" },
  hap_year: { depende: "hap", texto: "¿Cuántos años ha estado expuesto al humo?" },
  edad_inicio_asbesto: { depende: "asbesto", texto: "¿A qué edad comenzó a trabajar en ese lugar o con esos materiales relacionados con el asbesto?" },
  asbesto_year: { depende: "asbesto", texto: "¿Cuántos años duró trabajando con esos materiales relacionados con el asbesto?" },
  edad_inicio_diesel: { depende: "diesel", texto: "¿A qué edad comenzó a trabajar en ese lugar donde haya estado expuesto al humo de diésel?" },
  diesel_year: { depende: "diesel", texto: "¿Cuántos años duró trabajando en ese ambiente expuesto al humo de diésel?" },
  edad_inicio_pintura: { depende: "pintura", texto: "¿A qué edad comenzó a trabajar con pinturas, disolventes o químicos utilizados para pintar?" },
  pintura_year: { depende: "pintura", texto: "¿Cuántos años trabajó con esos materiales?" },
};

export const BLOQUES = [
  { titulo: "Antecedentes médicos", preguntas: ["ca_pulmon", "ca_ant", "epoc", "ca_pulmon_fam"] },
  { titulo: "Hábitos", preguntas: ["fumador", "fumador_pasivo", "vaping"] },
  { titulo: "Riesgos ocupacionales y ambientales", preguntas: ["hap", "asbesto", "diesel", "pintura"] },
] as const;

/** Edad en años cumplidos, como la calcula Shiny (días ÷ 365). */
export function edadDesde(fechaNac: string, hoy = new Date()): number | null {
  const t = Date.parse(`${fechaNac}T00:00:00`);
  if (!Number.isFinite(t)) return null;
  return Math.floor((hoy.getTime() - t) / 86_400_000 / 365);
}

const siNo = z.enum(["Sí", "No"], { message: "Este campo es obligatorio" });
const positivo = z.coerce.number({ message: "Debe ser un número" }).int("Debe ser un número entero").min(1, "El valor debe ser mayor a 0").max(120);

export function esquemaEncuesta(opciones: { edadMin: number; geografia: boolean }) {
  return z
    .object({
      nombre: z.string().trim().min(1, "Este campo es obligatorio").max(100),
      apellido: z.string().trim().min(1, "Este campo es obligatorio").max(100),
      tipo_doc: z.enum(TIPOS_DOC.map((t) => t.codigo) as [string, ...string[]], { message: "Este campo es obligatorio" }),
      documento: z.string().trim().regex(/^\d{3,15}$/, "Escriba sólo números (entre 3 y 15 dígitos)"),
      fecha_nac: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Este campo es obligatorio"),
      sexo: z.enum(["M", "F"], { message: "Este campo es obligatorio" }),
      departamento: opciones.geografia ? z.string().min(1, "Este campo es obligatorio") : z.string().optional(),
      municipio: opciones.geografia ? z.string().min(1, "Este campo es obligatorio") : z.string().optional(),
      ca_pulmon: siNo,
      ca_ant: siNo,
      epoc: siNo,
      ca_pulmon_fam: siNo,
      fumador: siNo,
      fumador_pasivo: siNo,
      vaping: siNo,
      hap: siNo,
      asbesto: siNo,
      diesel: siNo,
      pintura: siNo,
      ...Object.fromEntries(Object.keys(DETALLE).map((k) => [k, z.string().optional()])),
    })
    .superRefine((v, ctx) => {
      const edad = edadDesde(v.fecha_nac);
      if (edad === null) ctx.addIssue({ code: "custom", path: ["fecha_nac"], message: "Fecha no válida" });
      else if (edad < opciones.edadMin || edad > 80)
        ctx.addIssue({
          code: "custom",
          path: ["fecha_nac"],
          message: `La edad calculada es ${edad} años. El protocolo de detección es para personas entre ${opciones.edadMin} y 80 años.`,
        });
      if (v.ca_pulmon === "Sí")
        ctx.addIssue({ code: "custom", path: ["ca_pulmon"], message: "Esta herramienta sólo calcula el riesgo en personas sin diagnóstico de cáncer de pulmón." });
      const r = v as Record<string, string | undefined>;
      for (const [k, d] of Object.entries(DETALLE)) {
        if (r[d.depende] !== "Sí") continue;
        const p = positivo.safeParse(r[k]);
        if (!p.success) ctx.addIssue({ code: "custom", path: [k], message: p.error.issues[0].message });
      }
      if (edad !== null)
        for (const k of ["asbesto", "diesel", "pintura"] as const) {
          const ini = Number(r[`edad_inicio_${k}`]);
          if (r[k] === "Sí" && ini > edad) ctx.addIssue({ code: "custom", path: [`edad_inicio_${k}`], message: "No puede ser mayor que la edad actual" });
        }
    });
}

export type DatosEncuesta = z.infer<ReturnType<typeof esquemaEncuesta>>;

/** Valor numérico de una pregunta de detalle, o 0 si no aplica (como `None` en Shiny). */
export const num = (v: string | undefined) => (v ? Number(v) : 0);
