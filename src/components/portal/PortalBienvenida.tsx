"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Pantalla de entrada al portal de una empresa: su logotipo y una barra que
 * se llena con su color, antes de abrir el tablero.
 *
 * Sale la primera vez por sesión del navegador y empresa. Navegar entre
 * secciones o recargar no la repite; una pestaña nueva o cambiar de empresa,
 * sí. Se guarda en sessionStorage, que es preferencia de esta pestaña y no
 * dato de nadie, así que si el navegador lo bloquea simplemente se muestra.
 *
 * Por qué se pinta desde el servidor y no al montar: si apareciera después de
 * hidratar, el tablero se vería un instante y luego lo taparía la bienvenida.
 * Al revés también fallaría: quien ya la vio tendría un destello de la capa
 * antes de quitarla. El script en línea resuelve las dos cosas, porque marca
 * el documento ANTES del primer pintado y el CSS la oculta sin parpadeo.
 */
const DURACION_MS = 1900;

export function PortalBienvenida({
  slug,
  empresa,
  logo,
}: {
  slug: string;
  empresa: string;
  logo: { src: string; ancho: number; alto: number };
}) {
  const clave = `portal-bienvenida-${slug}`;
  const [fase, setFase] = useState<"cargando" | "saliendo" | "fuera">("cargando");

  useEffect(() => {
    let vista = false;
    try {
      vista = sessionStorage.getItem(clave) === "1";
    } catch {}
    // Ya vista: el CSS la tiene oculta desde antes de pintar, no hay nada que hacer.
    if (vista) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = reducido ? 600 : DURACION_MS;
    const t1 = setTimeout(() => setFase("saliendo"), total);
    const t2 = setTimeout(() => {
      setFase("fuera");
      try {
        sessionStorage.setItem(clave, "1");
      } catch {}
    }, total + 450);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [clave]);

  if (fase === "fuera") return null;

  return (
    <>
      <script
        // Corre antes de pintar: si ya se vio en esta pestaña, la capa nace oculta.
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem(${JSON.stringify(clave)})==="1")document.documentElement.setAttribute("data-bienvenida-vista","")}catch(e){}`,
        }}
      />
      <div
        role="status"
        aria-live="polite"
        aria-label={`Ingresando al portal de ${empresa}`}
        data-fase={fase}
        className="portal-bienvenida fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[var(--t-profundo)] px-6"
      >
        {/*
          Luz suave con el color de marca detrás de la placa. Es un degradado
          radial directo y no un círculo con blur: el blur grande dejaba anillos
          visibles (bandas) sobre fondos oscuros planos.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 45% at 50% 45%, color-mix(in srgb, var(--t-primario) 55%, transparent), transparent 75%)",
          }}
        />

        <div className="portal-bienvenida-placa relative flex h-32 w-72 items-center justify-center rounded-3xl bg-white px-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] sm:h-36 sm:w-80">
          <Image
            src={logo.src}
            alt={empresa}
            width={logo.ancho}
            height={logo.alto}
            priority
            className="max-h-20 w-auto object-contain"
          />
        </div>

        <p className="relative mt-10 text-center text-[0.68rem] font-semibold tracking-[0.2em] text-[var(--t-acento)] uppercase">
          Calculadora de riesgo <span className="hidden sm:inline">·</span>
          <br className="sm:hidden" /> Cáncer de pulmón
        </p>
        <p className="relative mt-2 text-sm text-white/80">Preparando su espacio de trabajo</p>

        <div className="relative mt-6 h-1.5 w-64 overflow-hidden rounded-full bg-white/15 sm:w-72">
          <div
            className="portal-bienvenida-barra h-full rounded-full bg-[var(--t-acento)]"
            style={{ animationDuration: `${DURACION_MS}ms` }}
          />
        </div>

        <p className="absolute bottom-8 text-[0.68rem] text-white/45">Desarrollado por ALZAK</p>
      </div>
    </>
  );
}
