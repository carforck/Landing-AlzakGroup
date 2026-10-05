import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { empresaPorSlug, ROLES, type Empresa, type Rol, type Seccion, puede } from "../tenants/config";

/**
 * Sesión del portal CAPULMON.
 *
 * Una cookie firmada con HMAC-SHA256, sin base de sesiones: el portal es de
 * solo lectura y no hay dónde guardar nada sin escribir en las bases de los
 * clientes. La firma impide que alguien edite la cookie para cambiarse de
 * empresa o subirse el rol.
 *
 * Lo que NO hace, y conviene saberlo: no se puede revocar una sesión concreta
 * antes de que caduque. Para cortar todas a la vez basta con rotar
 * SESSION_SECRET. Cuando exista la tabla central de usuarios, la sesión pasará
 * a guardarse allí.
 */

export const COOKIE_SESION = "capulmon_sesion";

/** Una jornada de trabajo. Pasado ese tiempo hay que volver a ingresar. */
const DURACION_S = 8 * 60 * 60;

export type Sesion = {
  /** Usuario tal como está en la tabla `users` de su empresa. */
  usuario: string;
  /** Nombre para mostrar; en Foscal y Biotorax no existe y se usa el usuario. */
  nombre: string;
  empresa: string;
  rol: Rol;
  /** Caducidad, en segundos desde epoch. */
  exp: number;
};

function secreto(): Buffer {
  const s = process.env.SESSION_SECRET;
  // 32 caracteres como mínimo: por debajo, la firma se puede forzar.
  if (!s || s.length < 32) {
    throw new Error("SESSION_SECRET falta o es demasiado corta (mínimo 32 caracteres).");
  }
  return Buffer.from(s);
}

function firmar(cuerpo: string): string {
  return createHmac("sha256", secreto()).update(cuerpo).digest("base64url");
}

export function sellar(datos: Omit<Sesion, "exp">): { valor: string; maxAge: number } {
  const sesion: Sesion = { ...datos, exp: Math.floor(Date.now() / 1000) + DURACION_S };
  const cuerpo = Buffer.from(JSON.stringify(sesion)).toString("base64url");
  return { valor: `${cuerpo}.${firmar(cuerpo)}`, maxAge: DURACION_S };
}

export function abrir(valor: string | undefined): Sesion | null {
  if (!valor) return null;
  const [cuerpo, firma] = valor.split(".");
  if (!cuerpo || !firma) return null;

  const esperada = Buffer.from(firmar(cuerpo));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null;

  try {
    const s = JSON.parse(Buffer.from(cuerpo, "base64url").toString()) as Sesion;
    if (typeof s.exp !== "number" || s.exp < Date.now() / 1000) return null;
    if (!ROLES.includes(s.rol) || !empresaPorSlug(s.empresa)) return null;
    return s;
  } catch {
    return null;
  }
}

/**
 * Entrada sin credenciales, SÓLO en `next dev` y con PORTAL_SIN_LOGIN=1.
 *
 * Sirve para revisar las vistas de cada empresa en localhost entrando por la
 * ruta (/portal/sura, /portal/foscal...) mientras no se tienen las claves a
 * mano. Las dos condiciones a la vez, para que no pueda colarse a producción:
 * `next build` fija NODE_ENV=production, así que aunque la variable llegara a
 * Vercel por error, esta rama no se ejecuta allí.
 */
export function sinLoginDesarrollo(): boolean {
  return process.env.NODE_ENV === "development" && process.env.PORTAL_SIN_LOGIN === "1";
}

function sesionDesarrollo(slug: string): Sesion | null {
  if (!sinLoginDesarrollo() || !empresaPorSlug(slug)) return null;
  return {
    usuario: "local",
    nombre: "Revisión local",
    empresa: slug,
    rol: "admin",
    exp: Math.floor(Date.now() / 1000) + DURACION_S,
  };
}

/**
 * Sesión vigente. `slugUrl` sólo se usa en desarrollo sin login, para saber
 * qué empresa simular; con sesión real se ignora.
 */
export async function leerSesion(slugUrl?: string): Promise<Sesion | null> {
  const almacen = await cookies();
  const real = abrir(almacen.get(COOKIE_SESION)?.value);
  if (real) return real;
  return slugUrl ? sesionDesarrollo(slugUrl) : null;
}

/**
 * Puerta de cada página del portal. Devuelve la sesión y la empresa que le
 * corresponde, o redirige.
 *
 * La empresa sale SIEMPRE de la sesión, nunca de la URL. Si alguien de Foscal
 * escribe /portal/sura, se le devuelve a /portal/foscal: la base que se
 * consulta no depende de nada que el visitante pueda teclear.
 */
export async function exigirSesion(
  slugUrl: string,
  seccion?: Seccion,
): Promise<{ sesion: Sesion; empresa: Empresa }> {
  const sesion = await leerSesion(slugUrl);
  if (!sesion) redirect("/acceso");

  const empresa = empresaPorSlug(sesion.empresa)!;
  if (slugUrl !== empresa.slug) redirect(`/portal/${empresa.slug}`);
  if (seccion && !puede(sesion.rol, seccion)) redirect(`/portal/${empresa.slug}`);

  return { sesion, empresa };
}
