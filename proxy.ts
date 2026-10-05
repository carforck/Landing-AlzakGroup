import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Clave mínima para /admin.
 *
 * El panel lee en directo las bases de CAPULMON: por cada paciente de riesgo
 * alto muestra centro, fecha, edad, sexo, puntaje y probabilidad. Son datos de
 * salud (Ley 1581), así que no se sirven sin credenciales.
 *
 * Es HTTP Basic sobre HTTPS, con usuario y clave en ADMIN_USER y
 * ADMIN_PASSWORD. Falla cerrado: si alguna de las dos falta en el despliegue,
 * /admin responde 503 en lugar de abrirse. No sustituye al portal de /acceso,
 * que sigue pendiente; solo evita que el panel quede público mientras tanto.
 */
export function proxy(request: NextRequest) {
  /*
   * Portal por empresa: aquí sólo se mira que exista la cookie, para no servir
   * la página a quien llega sin sesión. La validación real (firma, caducidad,
   * empresa y rol) la hace `exigirSesion` en cada página, porque el proxy no
   * es el sitio para autorizar.
   */
  if (request.nextUrl.pathname.startsWith("/portal")) {
    // En `next dev` con PORTAL_SIN_LOGIN=1 se entra por la ruta (ver sinLoginDesarrollo).
    const sinLogin = process.env.NODE_ENV === "development" && process.env.PORTAL_SIN_LOGIN === "1";
    if (!sinLogin && !request.cookies.has("capulmon_sesion")) {
      return NextResponse.redirect(new URL("/acceso", request.url));
    }
    const r = NextResponse.next();
    r.headers.set("Cache-Control", "no-store");
    return r;
  }

  const usuario = process.env.ADMIN_USER;
  const clave = process.env.ADMIN_PASSWORD;

  if (!usuario || !clave) {
    return new NextResponse("Administración no disponible: faltan ADMIN_USER y ADMIN_PASSWORD.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const cabecera = request.headers.get("authorization") ?? "";
  if (cabecera.startsWith("Basic ")) {
    let recibido = "";
    try {
      recibido = atob(cabecera.slice(6));
    } catch {
      // Base64 inválido: se trata como credencial incorrecta.
    }
    if (iguales(recibido, `${usuario}:${clave}`)) {
      const respuesta = NextResponse.next();
      respuesta.headers.set("Cache-Control", "no-store");
      return respuesta;
    }
  }

  return new NextResponse("Se requiere autenticación.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Administracion ALZAK", charset="UTF-8"',
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
