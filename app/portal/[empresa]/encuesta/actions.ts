"use server";

import { revalidatePath } from "next/cache";
import { esquemaEncuesta } from "../../../../src/lib/encuesta";
import { guardarEncuesta } from "../../../../src/lib/encuesta-db";
import { leerSesion } from "../../../../src/lib/sesion";
import { empresaPorSlug, puede } from "../../../../src/tenants/config";

export type RespuestaGuardar =
  | { ok: true; fecha: string; prob: number; clase: string }
  | { ok: false; error: string; campos?: Record<string, string> };

/**
 * Guarda una encuesta. La empresa sale de la sesión (no del formulario), el
 * servidor vuelve a validar cada campo y recalcula el riesgo: lo que guarda
 * no depende de lo que el navegador diga que dio el cálculo.
 */
export async function guardar(slug: string, datos: Record<string, string>): Promise<RespuestaGuardar> {
  const sesion = await leerSesion(slug);
  if (!sesion || sesion.empresa !== slug || !puede(sesion.rol, "encuesta")) {
    return { ok: false, error: "Su sesión no permite guardar encuestas. Vuelva a ingresar." };
  }
  const empresa = empresaPorSlug(sesion.empresa)!;
  const leido = esquemaEncuesta({ edadMin: empresa.edadMin, geografia: empresa.geografia }).safeParse(datos);
  if (!leido.success) {
    const campos: Record<string, string> = {};
    for (const i of leido.error.issues) campos[String(i.path[0])] ??= i.message;
    return { ok: false, error: "Hay campos por corregir.", campos };
  }
  try {
    const { resultado, fecha } = await guardarEncuesta(empresa, sesion, leido.data);
    // El tablero y Registros son dinámicos, pero así cualquier caché del router se descarta.
    revalidatePath(`/portal/${empresa.slug}`, "layout");
    return { ok: true, fecha, prob: resultado.prob, clase: resultado.claseRiesgo };
  } catch (e) {
    return { ok: false, error: e instanceof Error && e.message.includes("solo lectura") ? e.message : "No se pudo guardar. Intente de nuevo." };
  }
}
