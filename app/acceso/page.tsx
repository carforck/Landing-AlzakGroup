import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { LoginForm } from "../../src/components/LoginForm";
import { LoginBackdrop } from "../../src/components/LoginBackdrop";
import { LottieHero } from "../../src/components/LottieHero";
import { access } from "../../src/content/site";

export const metadata: Metadata = {
  title: "Acceso al aplicativo",
  description:
    "Acceso institucional a la calculadora de riesgo de cáncer de pulmón de ALZAK.",
  alternates: { canonical: access.href },
  // Una pantalla de ingreso no aporta nada en buscadores y sí revela superficie.
  robots: { index: false, follow: false },
};

export default function AccesoPage() {
  return (
    /*
     * Pantalla de ingreso. La cabecera y el pie del sitio se ocultan aquí (ver
     * ChromeGate): con el sitio completo alrededor había tres logotipos a la vez
     * y toda la navegación corporativa justo cuando se pide una contraseña.
     */
    <div className="relative isolate min-h-[100svh] overflow-hidden bg-surface">
      <LoginBackdrop />
      {/*
        Botón de volver anclado arriba a la izquierda, como el retroceso de una
        aplicación móvil: en esa esquina el gesto es el mismo en cualquier
        pantalla y no compite con el formulario. Área de 48 px, por encima del
        mínimo táctil de 44, y se mantiene fijo al hacer scroll en móvil.
      */}
      <Link
        href="/calculadora-cancer-pulmon"
        className="group fixed top-5 left-5 z-20 inline-flex h-12 items-center gap-1.5 rounded-full border border-hairline bg-surface pr-5 pl-3.5 text-sm font-medium text-heading shadow-sm transition-colors duration-200 hover:border-menta-400 hover:text-menta-600 lg:top-8 lg:left-8 dark:hover:text-menta-300"
      >
        <ChevronLeft
          className="size-5 transition-transform duration-200 group-hover:-translate-x-0.5"
          strokeWidth={2.25}
        />
        <span className="hidden sm:inline">{access.back}</span>
        <span className="sr-only sm:hidden">{access.back}</span>
      </Link>

      <div className="mx-auto grid min-h-[100svh] w-full max-w-[96rem] items-center gap-10 px-5 py-20 lg:grid-cols-[auto_1.9fr] lg:gap-10 lg:py-10">
        <div className="flex flex-col items-center lg:items-start">
          <LoginForm />

          {/*
            Aviso de habeas data. Fuera de la tarjeta y siempre visible, no
            detrás de una casilla: la Ley 1581 pide informar la finalidad del
            tratamiento ANTES de recoger el dato, no después.
          */}
          <aside className="mt-4 w-full max-w-md rounded-2xl border border-hairline bg-surface p-5">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-menta-700 uppercase dark:text-menta-300">
              <ShieldCheck className="size-3.5" strokeWidth={2.5} />
              {access.habeas.title}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-ink-soft dark:text-body">
              {access.habeas.body}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-ink-soft">
              {access.habeas.rights}
            </p>
            <Link
              href={access.habeas.linkHref}
              className="mt-4 inline-block text-xs font-medium text-menta-600 hover:underline dark:text-menta-300"
            >
              {access.habeas.linkLabel}
            </Link>
          </aside>
        </div>

        {/* Ilustración: recoloreada a la paleta de marca. Ver README. */}
        <div className="flex flex-col items-center">
          <LottieHero
            src="/riskapplottie/login.json"
            ratio="501 / 373"
            label="Ilustración de una persona ingresando a una aplicación"
            className="mx-auto w-full max-w-md lg:max-w-none"
          />

          {/*
            Firma de autoría sobre una placa oscura.
            
            Se midió el fondo real que cae detrás: el degradado ahí ronda
            #2c788e, donde gris-800 se queda en 2.88:1 y el blanco en 4.19:1.
            Los dos fallan el mínimo de 4.5:1 para texto pequeño. La placa
            resuelve el problema de raíz: el texto deja de depender del punto del
            degradado sobre el que caiga.
          */}
          <div className="mt-5 rounded-2xl bg-gris-900/45 px-6 py-4 text-center backdrop-blur-md">
            <p className="text-sm font-semibold text-white">
              {access.credit.line}
            </p>
            <p className="mt-1.5 text-xs text-gris-200">
              {access.credit.copyright} · {access.credit.place}
            </p>
            <p className="text-xs text-gris-200">{access.credit.rights}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
