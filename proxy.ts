import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Puertas de /admin y de /portal.
 *
 * Ambos muestran datos de salud (Ley 1581), así que nada se sirve sin
 * credenciales. Las dos puertas usan HTTP Basic sobre HTTPS con claves que
 * viven sólo en variables de entorno, nunca en el código, y fallan cerradas.
 *
 * /admin: ADMIN_USER y ADMIN_PASSWORD. Si falta alguna, responde 503.
 *
 * /portal, tres formas de entrar, en este orden:
 *  1. `next dev` con PORTAL_SIN_LOGIN=1: por la ruta, sin nada (localhost).
 *  2. Cookie de sesión del login de /acceso (usuarios de Shiny).
 *  3. Clave compartida PORTAL_USUARIO / PORTAL_CLAVE, para la validación
 *     interna que pidió Carlos (2026-10-13): el navegador la pide una vez y
 *     luego se navega por las rutas /portal/<empresa>. Si PORTAL_CLAVE no
 *     está definida, esta vía no existe y se manda al login.
 */

/** Cabecera interna con la que el proxy avisa a las páginas de que la clave compartida fue válida. */
const CABECERA_CLAVE = "x-portal-clave";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/portal")) return puertaPortal(request);
  return puertaAdmin(request);
}

function puertaPortal(request: NextRequest) {
  // Nadie puede traer esta cabecera desde fuera: sólo la pone el proxy.
  const cabeceras = new Headers(request.headers);
  cabeceras.delete(CABECERA_CLAVE);

  const seguir = () => {
    const r = NextResponse.next({ request: { headers: cabeceras } });
    r.headers.set("Cache-Control", "no-store");
    r.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return r;
  };

  // En `next dev` con PORTAL_SIN_LOGIN=1 se entra por la ruta (ver sinLoginDesarrollo).
  if (process.env.NODE_ENV === "development" && process.env.PORTAL_SIN_LOGIN === "1") return seguir();
  if (request.cookies.has("capulmon_sesion")) return seguir();

  const clave = process.env.PORTAL_CLAVE;
  if (!clave) return NextResponse.redirect(new URL("/acceso", request.url));

  const usuario = process.env.PORTAL_USUARIO || "alzak";
  if (basicValido(request, usuario, clave)) {
    cabeceras.set(CABECERA_CLAVE, "ok");
    return seguir();
  }
  return pedirClave("Portal ALZAK");
}

function puertaAdmin(request: NextRequest) {
  const usuario = process.env.ADMIN_USER;
  const clave = process.env.ADMIN_PASSWORD;

  if (!usuario || !clave) {
    return new NextResponse("Administración no disponible: faltan ADMIN_USER y ADMIN_PASSWORD.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
  if (basicValido(request, usuario, clave)) {
    const respuesta = NextResponse.next();
    respuesta.headers.set("Cache-Control", "no-store");
    return respuesta;
  }
  return pedirClave("Administracion ALZAK");
}

function basicValido(request: NextRequest, usuario: string, clave: string) {
  const cabecera = request.headers.get("authorization") ?? "";
  if (!cabecera.startsWith("Basic ")) return false;
  let recibido = "";
  try {
    recibido = new TextDecoder().decode(Uint8Array.from(atob(cabecera.slice(6)), (c) => c.charCodeAt(0)));
  } catch {
    // Base64 inválido: se trata como credencial incorrecta.
  }
  return iguales(recibido, `${usuario}:${clave}`);
}

function pedirClave(realm: string) {
  return new NextResponse("Se requiere autenticación.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${realm}", charset="UTF-8"`,
      "Cache-Control": "no-store",
    },
  });
}

/** Comparación en tiempo constante respecto al contenido, para no filtrar la clave por tiempos. */
function iguales(a: string, b: string) {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diferencia = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    diferencia |= (x[i] ?? 0) ^ (y[i] ?? 0);
  }
  return diferencia === 0;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/portal", "/portal/:path*"],
};
