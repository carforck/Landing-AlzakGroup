"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { validarCredencial } from "../../src/lib/portal-db";
import { COOKIE_SESION, sellar } from "../../src/lib/sesion";

export type EstadoIngreso = { error: string | null; usuario: string };

const Esquema = z.object({
  usuario: z.string().trim().min(1).max(50),
  clave: z.string().min(1).max(200),
});

/**
 * Freno de fuerza bruta en memoria: cinco intentos fallidos por usuario cada
 * quince minutos. Vive en la instancia y no se comparte entre instancias, así
 * que es un freno y no una garantía; la garantía llega con la tabla central de
 * usuarios, que podrá bloquear cuentas de verdad.
 */
const fallos = new Map<string, { n: number; desde: number }>();
const VENTANA_MS = 15 * 60 * 1000;
const MAX_FALLOS = 5;

function bloqueado(clave: string) {
  const f = fallos.get(clave);
  if (!f) return false;
  if (Date.now() - f.desde > VENTANA_MS) {
    fallos.delete(clave);
    return false;
  }
  return f.n >= MAX_FALLOS;
}

function anotarFallo(clave: string) {
  const f = fallos.get(clave);
  if (!f || Date.now() - f.desde > VENTANA_MS) fallos.set(clave, { n: 1, desde: Date.now() });
  else f.n++;
}

const MENSAJE_GENERICO = "El usuario o la contraseña no son correctos.";

export async function ingresar(_prev: EstadoIngreso, datos: FormData): Promise<EstadoIngreso> {
  const leido = Esquema.safeParse({ usuario: datos.get("usuario"), clave: datos.get("clave") });
  const usuario = String(datos.get("usuario") ?? "").slice(0, 50);
  if (!leido.success) return { error: "Escriba su usuario y su contraseña.", usuario };

  const llave = leido.data.usuario.toLowerCase();
  if (bloqueado(llave)) {
    return { error: "Demasiados intentos. Espere 15 minutos o escriba a soporte.", usuario };
  }

  let coincidencias;
  try {
    coincidencias = await validarCredencial(leido.data.usuario, leido.data.clave);
  } catch {
    return { error: "El servicio no está disponible en este momento. Intente de nuevo en unos minutos.", usuario };
  }

  if (coincidencias.length === 0) {
    anotarFallo(llave);
    // Mismo mensaje exista o no el usuario: no se confirma qué cuentas existen.
    return { error: MENSAJE_GENERICO, usuario };
  }
  if (coincidencias.length > 1) {
    // El mismo usuario y clave valen en dos instituciones. No se elige por la
    // persona: entrar a la base equivocada sería mostrarle datos de otro cliente.
    return {
      error: "Su usuario está registrado en más de una institución. Escriba a soporte para separarlo.",
      usuario,
    };
  }

  fallos.delete(llave);
  const c = coincidencias[0];
  const { valor, maxAge } = sellar({
    usuario: c.usuario,
    nombre: c.nombre,
    empresa: c.empresa.slug,
    rol: c.rol,
  });
  (await cookies()).set(COOKIE_SESION, valor, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  redirect(`/portal/${c.empresa.slug}`);
}

export async function salir() {
  (await cookies()).delete(COOKIE_SESION);
  redirect("/acceso");
}
