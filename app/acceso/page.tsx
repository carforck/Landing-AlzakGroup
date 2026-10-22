import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { LoginForm } from "../../src/components/LoginForm";
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
     *
     * Pantalla dividida: el formulario sobre fondo claro y, a su lado, un panel
     * de marca con la misma radiografía de la diapositiva de la calculadora en
     * la portada. Así quien llega desde allí reconoce el producto sin que haga
     * falta una ilustración, y el formulario conserva un fondo limpio donde se
     * lee bien en claro y en oscuro.
     */
    <div className="grid min-h-[100svh] bg-surface lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      {/*
        Columna del formulario. Va primero en el documento: en móvil es lo
        primero que se ve y en lectores de pantalla lo primero que se anuncia.
      */}
      <main className="flex min-w-0 flex-col px-5 py-5 sm:px-8 lg:px-12 lg:py-8 xl:px-16">
        {/*
          El botón de volver va en el flujo, en una barra propia sobre el
          formulario, y no flotando: flotante caía encima del logotipo de la
          tarjeta en pantallas angostas. Área de 48 px, por encima del mínimo
          táctil de 44.
        */}
        <div className="flex">
          <Link
            href="/calculadora-cancer-pulmon"
            className="group -ml-2 inline-flex h-12 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-soft transition-colors duration-200 hover:bg-surface-muted hover:text-heading"
          >
            <ChevronLeft
              className="size-5 transition-transform duration-200 group-hover:-translate-x-0.5"
              strokeWidth={2.25}
            />
            {access.back}
          </Link>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-8 lg:py-10">
          <LoginForm />

          {/*
            Aviso de habeas data. Fuera del formulario y siempre visible, no
            detrás de una casilla: la Ley 1581 pide informar la finalidad del
            tratamiento ANTES de recoger el dato, no después.
          */}
          <aside className="mt-8 w-full max-w-md border-t border-hairline pt-6">
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
              className="mt-4 inline-block text-xs font-medium text-menta-700 hover:underline dark:text-menta-300"
            >
              {access.habeas.linkLabel}
            </Link>
          </aside>
        </div>
      </main>

      {/*
        Panel de marca. En escritorio ocupa media pantalla a la altura del
        visor (sticky) para que la radiografía no se corte al hacer scroll; en
        móvil queda debajo del formulario como una franja corta, porque ahí lo
        urgente es ingresar y la marca ya está en el logotipo.
      */}
      <section
        aria-label={access.panel.eyebrow}
        className="relative isolate min-w-0 overflow-hidden bg-[#0e262e] text-white lg:sticky lg:top-0 lg:h-[100svh]"
      >
        <Image
          src="/hero/calculadora-fondo.webp"
          alt=""
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          quality={80}
          className="-z-10 object-cover object-right"
        />
        {/*
          Velo azul profundo, el mismo tono de la portada. Se oscurece hacia
          abajo y hacia la izquierda, donde va el texto, y deja respirar la
          radiografía arriba a la derecha. El texto blanco nunca depende del
          punto de la imagen sobre el que caiga.
        */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(0deg, rgba(14,38,46,0.95) 0%, rgba(14,38,46,0.6) 45%, rgba(14,38,46,0.05) 100%), linear-gradient(90deg, rgba(14,38,46,0.5) 0%, rgba(14,38,46,0) 70%)",
          }}
        />

        <div className="flex h-full flex-col justify-end px-5 py-10 sm:px-8 lg:px-14 lg:py-14 xl:px-20">
          <p className="text-[0.6875rem] font-bold tracking-[0.2em] text-menta-300 uppercase">
            {access.panel.eyebrow}
          </p>
          <h2 className="display mt-4 max-w-xl text-[1.625rem] text-white sm:text-[2rem] lg:text-[2.75rem]">
            {access.panel.title}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 lg:text-base">
            {access.panel.lead}
          </p>

          <ul className="mt-8 grid max-w-2xl gap-5 border-t border-white/15 pt-6 sm:grid-cols-3 sm:gap-6 lg:mt-10">
            {access.panel.facts.map((fact) => (
              <li key={fact.label} className="min-w-0">
                <p className="text-sm font-semibold text-menta-300">
                  {fact.label}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/70">
                  {fact.detail}
                </p>
              </li>
            ))}
          </ul>

          {/* Firma de autoría: discreta, al pie, como en las apps de CAPULMON. */}
          <p className="mt-8 text-[0.6875rem] leading-relaxed text-white/55 lg:mt-12">
            {access.credit.copyright} · {access.credit.place}.{" "}
            {access.credit.rights}.
          </p>
        </div>
      </section>
    </div>
  );
}
