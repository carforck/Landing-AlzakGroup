"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { access, quality } from "../content/site";

/**
 * Etiqueta lateral con el sello de certificación ISO 9001:2015.
 *
 * Va anclada al centro del borde derecho y NO abajo a la derecha: esa esquina la
 * ocupa el botón de WhatsApp en la home, y dos flotantes en el mismo vértice se
 * tapan entre sí.
 *
 * Se muestra sólo en las páginas donde la certificación dice algo: la home, la
 * de la calculadora y la de ingreso. En la página de Calidad se oculta, porque
 * llevaría a donde ya se está, y en Privacidad sobra.
 *
 * En reposo asoma únicamente el sello; al pasar el cursor o al recibir el foco
 * la pestaña se desliza y descubre el texto. La pieza entera es un enlace, así
 * que funciona igual con teclado.
 */
const RUTAS = new Set<string>(["/", "/calculadora-cancer-pulmon", access.href]);

export function CertBadge() {
  const pathname = usePathname();
  if (!RUTAS.has(pathname)) return null;

  return (
    <Link
      href="/calidad"
      aria-label={`${quality.certificate.alt}. Ver el sistema de gestión de calidad`}
      className="group fixed top-1/2 right-0 z-[80] flex -translate-y-1/2 items-center gap-3 rounded-l-2xl border border-r-0 border-hairline bg-surface py-3 pr-2 pl-3 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_30px_-12px_rgba(0,0,0,0.25)] transition-[padding,border-color] duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-menta-400 hover:pr-4 focus-visible:border-menta-400"
    >
      {/*
        El texto ocupa ancho 0 en reposo y se abre en el hover. Se anima
        `max-width` y no `display`, para que la transición exista.
      */}
      <span className="max-w-0 overflow-hidden text-right whitespace-nowrap opacity-0 transition-[max-width,opacity] duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:max-w-[9rem] group-hover:opacity-100 group-focus-visible:max-w-[9rem] group-focus-visible:opacity-100">
        <span className="block text-[0.68rem] leading-tight font-semibold tracking-wide text-heading uppercase">
          Certificados
        </span>
        <span className="block text-[0.68rem] leading-tight text-ink-soft">
          ISO 9001:2015
        </span>
      </span>

      <Image
        src={quality.certificate.image}
        alt=""
        width={350}
        height={248}
        className="h-11 w-auto shrink-0 sm:h-14"
      />
    </Link>
  );
}
