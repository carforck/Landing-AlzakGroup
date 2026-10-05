"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ClipboardList,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  Table2,
  Users,
  X,
} from "lucide-react";

const ICONOS = {
  tablero: LayoutDashboard,
  registros: Table2,
  encuesta: ClipboardList,
  usuarios: Users,
  acerca: Info,
} as const;

type Entrada = { href: string; etiqueta: string; icono: keyof typeof ICONOS };

/**
 * Barra lateral del portal de una empresa.
 *
 * El logotipo va sobre una placa blanca y no directamente sobre el color de
 * marca: los cinco logotipos están dibujados para fondo claro y varios llevan
 * el mismo azul que su barra, así que sobre ella desaparecerían.
 *
 * Recibe ya filtradas las entradas que el rol puede ver. Lo que no aparece
 * aquí tampoco se sirve: cada página vuelve a comprobar el permiso.
 */
export function PortalNav({
  logo,
  empresa,
  usuario,
  rol,
  entradas,
  salir,
}: {
  logo: { src: string; ancho: number; alto: number };
  empresa: string;
  usuario: string;
  rol: string;
  entradas: Entrada[];
  salir: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  const contenido = (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-5">
        <div className="flex h-20 items-center justify-center rounded-2xl bg-white px-4">
          <Image
            src={logo.src}
            alt={empresa}
            width={logo.ancho}
            height={logo.alto}
            className="max-h-14 w-auto object-contain"
            priority
          />
        </div>
        <p className="mt-5 text-[0.65rem] font-semibold tracking-[0.18em] text-[var(--t-acento)] uppercase">
          Calculadora de riesgo
        </p>
        <p className="mt-1 text-sm font-semibold text-white">Cáncer de pulmón</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3" aria-label="Secciones del portal">
        <ul className="space-y-0.5">
          {entradas.map((e) => {
            const Icono = ICONOS[e.icono];
            const activo = pathname === e.href;
            return (
              <li key={e.href}>
                <Link
                  href={e.href}
                  onClick={() => setAbierto(false)}
                  aria-current={activo ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200 ${
                    activo
                      ? "bg-white/15 font-semibold text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icono className="size-4 shrink-0" strokeWidth={2} />
                  {e.etiqueta}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-5 py-5">
        <p className="truncate text-sm font-semibold text-white">{usuario}</p>
        <p className="text-xs text-white/65">{rol}</p>
        <form action={salir} className="mt-4">
          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/20 text-sm text-white transition-colors duration-200 hover:bg-white/10"
          >
            <LogOut className="size-4" strokeWidth={2} />
            Cerrar sesión
          </button>
        </form>
        <p className="mt-4 text-center text-[0.65rem] text-white/50">Desarrollado por ALZAK</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Móvil: barra superior con el botón de menú. */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-[var(--t-profundo)] px-4 lg:hidden">
        <div className="flex h-11 items-center rounded-lg bg-white px-3">
          <Image src={logo.src} alt={empresa} width={logo.ancho} height={logo.alto} className="max-h-8 w-auto" />
        </div>
        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-label="Abrir menú"
          aria-expanded={abierto}
          className="inline-flex size-11 items-center justify-center rounded-lg text-white"
        >
          <Menu className="size-6" />
        </button>
      </header>

      {abierto ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setAbierto(false)}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-[var(--t-profundo)]">
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar menú"
              className="absolute top-3 right-3 z-10 inline-flex size-9 items-center justify-center rounded-lg text-white/80"
            >
              <X className="size-5" />
            </button>
            {contenido}
          </aside>
        </div>
      ) : null}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-[var(--t-profundo)] lg:block">
        {contenido}
      </aside>
    </>
  );
}
