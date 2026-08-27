"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { brand, site } from "../../content/site";

/**
 * Barra lateral de la vista de administración.
 *
 * Sustituye a la navegación corporativa: quien entra aquí viene a operar, no a
 * leer la web, y el menú de la landing no le sirve de nada.
 *
 * Las entradas sin destino se marcan como pendientes en lugar de omitirse. Así
 * el menú muestra la estructura completa que se quiere alcanzar y se puede
 * discutir el mapa antes de construir cada pantalla, que es justo lo que se
 * pidió al pedir "el sidebar para validar los submenús".
 */
type Entrada = {
  etiqueta: string;
  href?: string;
  icono: typeof LayoutDashboard;
};

const GRUPOS: { titulo: string; entradas: Entrada[] }[] = [
  {
    titulo: "Seguimiento",
    entradas: [
      { etiqueta: "Resumen", href: "/admin", icono: LayoutDashboard },
      { etiqueta: "Centros", href: "/admin/centros", icono: Building2 },
      { etiqueta: "Evolución", href: "/admin/evolucion", icono: TrendingUp },
    ],
  },
  {
    titulo: "Datos",
    entradas: [
      { etiqueta: "Registros", href: "/admin/registros", icono: FileText },
      { etiqueta: "Reportes", icono: FileText },
    ],
  },
  {
    titulo: "Sistema",
    entradas: [
      { etiqueta: "Usuarios", icono: Users },
      { etiqueta: "Auditoría", icono: ShieldCheck },
      { etiqueta: "Configuración", icono: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  /*
   * Plegado en escritorio. Se guarda en el propio componente y no en la URL:
   * es una preferencia de cómo se mira la pantalla, no parte de lo que se está
   * consultando, así que no debe viajar en un enlace compartido.
   */
  const [plegado, setPlegado] = useState(false);

  const contenido = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-6 py-6">
        {plegado ? null : (
          <Link href="/" aria-label={`${site.name} · Inicio`}>
            <Image
              src={brand.logo.white}
              alt={site.name}
              width={brand.logo.aspect.width}
              height={brand.logo.aspect.height}
              className="h-8 w-auto"
            />
          </Link>
        )}
        <button
          type="button"
          onClick={() => setPlegado((v) => !v)}
          aria-label={plegado ? "Expandir menú" : "Plegar menú"}
          aria-expanded={!plegado}
          className="hidden size-9 items-center justify-center rounded-lg text-gris-400 transition-colors duration-200 hover:text-white lg:inline-flex"
        >
          {plegado ? (
            <PanelLeftOpen className="size-5" strokeWidth={2} />
          ) : (
            <PanelLeftClose className="size-5" strokeWidth={2} />
          )}
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          aria-label="Cerrar menú"
          className="inline-flex size-9 items-center justify-center rounded-lg text-gris-400 hover:text-white lg:hidden"
        >
          <X className="size-5" />
        </button>
      </div>

      {plegado ? null : (
        <p className="px-6 pb-6 text-[0.68rem] font-semibold tracking-[0.18em] text-menta-300 uppercase">
          Administración
        </p>
      )}

      <nav
        className="flex-1 space-y-7 overflow-y-auto px-3"
        aria-label="Secciones de administración"
      >
        {GRUPOS.map((g) => (
          <div key={g.titulo}>
            {plegado ? (
              <div className="mx-3 mb-2 border-t border-white/10" />
            ) : (
              <p className="px-3 pb-2 text-[0.62rem] font-semibold tracking-[0.16em] text-gris-500 uppercase">
                {g.titulo}
              </p>
            )}
            <ul className="space-y-0.5">
              {g.entradas.map((e) => {
                const activo = e.href === pathname;
                const Icono = e.icono;

                if (!e.href) {
                  return (
                    <li key={e.etiqueta}>
                      <span
                        className="flex cursor-default items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gris-500"
                        title={`${e.etiqueta} · pendiente de construir`}
                      >
                        <Icono className="size-4 shrink-0" strokeWidth={2} />
                        {plegado ? null : (
                          <>
                            {e.etiqueta}
                            <span className="ml-auto rounded-full border border-gris-700 px-2 py-0.5 text-[0.6rem] tracking-wide uppercase">
                              Pendiente
                            </span>
                          </>
                        )}
                      </span>
                    </li>
                  );
                }

                return (
                  <li key={e.etiqueta}>
                    <Link
                      href={e.href}
                      onClick={() => setAbierto(false)}
                      aria-current={activo ? "page" : undefined}
                      title={e.etiqueta}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200 ${
                        activo
                          ? "bg-menta-400 font-medium text-gris-800"
                          : "text-gris-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icono className="size-4 shrink-0" strokeWidth={2} />
                      {plegado ? null : e.etiqueta}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <Link
          href="/calculadora-cancer-pulmon"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gris-400 transition-colors duration-200 hover:text-white"
        >
          <ChevronLeft className="size-4 shrink-0" strokeWidth={2} />
          {plegado ? null : "Volver al sitio"}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Barra superior sólo en móvil: el panel lateral no cabe en pantalla estrecha. */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/10 bg-gris-900 px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-label="Abrir menú"
          aria-expanded={abierto}
          className="inline-flex size-11 items-center justify-center rounded-lg text-white"
        >
          <Menu className="size-5" />
        </button>
        <span className="text-sm font-medium text-white">Administración</span>
      </div>

      {abierto ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setAbierto(false)}
          className="fixed inset-0 z-40 bg-gris-900/60 lg:hidden"
        />
      ) : null}

      <aside
        data-plegado={plegado ? "si" : "no"}
        className={`admin-sidebar fixed inset-y-0 left-0 z-50 bg-gris-900 transition-[transform,width] duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 ${
          plegado ? "w-[4.75rem]" : "w-72"
        } ${abierto ? "translate-x-0" : "-translate-x-full"}`}
      >
        {contenido}
      </aside>
    </>
  );
}
