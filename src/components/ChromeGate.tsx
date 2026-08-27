"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { access } from "../content/site";

/**
 * Oculta la cabecera y el pie en las pantallas que deben ir solas.
 *
 * La de ingreso es una de ellas: con el sitio completo alrededor aparecían tres
 * logotipos a la vez (cabecera, formulario y pie) y el visitante tenía toda la
 * navegación corporativa disponible en el momento en que se le pide una
 * contraseña. Una pantalla de acceso se presenta sin distracciones y con una
 * sola salida, que es el enlace de volver que lleva el propio formulario.
 *
 * Se resuelve así, y no moviendo las páginas a un grupo de rutas, porque el
 * layout raíz es el que monta la cabecera y el pie: cambiar eso obligaría a
 * mover todas las páginas del sitio para una sola excepción.
 */
const SIN_CROMO = new Set<string>([access.href]);

/** La administración tiene su propia barra lateral y no usa la del sitio. */
const PREFIJOS_SIN_CROMO = ["/admin"];

export function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (SIN_CROMO.has(pathname)) return null;
  if (PREFIJOS_SIN_CROMO.some((pre) => pathname.startsWith(pre))) return null;
  return <>{children}</>;
}
