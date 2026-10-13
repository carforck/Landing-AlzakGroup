import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, LogOut } from "lucide-react";
import { esEquipo, leerSesion } from "../../src/lib/sesion";
import { todasLasEmpresas } from "../../src/tenants/config";
import { salir } from "../acceso/actions";

export const metadata: Metadata = {
  title: "Portal",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Selector de empresa para el equipo interno.
 *
 * Sólo lo ve quien entró con la clave compartida: ahí sí se puede mostrar la
 * lista de clientes, porque ya hay autenticación (la regla de no publicarla
 * es para la pantalla de ingreso, que ve cualquiera). Un usuario de una
 * empresa va directo a la suya.
 */
export default async function PortalInicio() {
  if (!(await esEquipo())) {
    const s = await leerSesion();
    redirect(s ? `/portal/${s.empresa}` : "/acceso");
  }

  const empresas = todasLasEmpresas();

  return (
    <main className="min-h-[100svh] bg-surface-muted px-5 py-10 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-menta-600 uppercase">Portal CAPULMON</p>
            <h1 className="display mt-3 text-[1.9rem] sm:text-[2.4rem]">Elija la empresa</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
              Acceso de equipo ALZAK. Cada empresa abre su tablero, sus registros y su encuesta con su propia marca.
            </p>
          </div>
          <form action={salir}>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-hairline bg-surface px-4 text-sm text-heading hover:border-menta-400"
            >
              <LogOut className="size-4" strokeWidth={2} />
              Cerrar sesión
            </button>
          </form>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {empresas.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/portal/${e.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-hairline bg-surface p-5 transition-colors hover:border-menta-400"
              >
                <span className="flex h-24 items-center justify-center rounded-xl bg-white px-6">
                  <Image src={e.logo} alt={e.nombre} className="max-h-16 w-auto object-contain" />
                </span>
                <span className="mt-4 flex items-center justify-between gap-3">
                  <span>
                    <span className="block font-semibold text-heading">{e.nombre}</span>
                    <span className="text-xs text-ink-soft">
                      {e.escritura ? "Prueba · la encuesta guarda" : "Solo lectura"}
                    </span>
                  </span>
                  <ArrowRight className="size-5 shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5 group-hover:text-menta-600" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
