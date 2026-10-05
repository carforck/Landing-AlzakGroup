import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Database,
  ExternalLink,
  Layers,
  Percent,
  Route,
  ScanLine,
  Terminal,
} from "lucide-react";
import { CountUp } from "../../src/components/CountUp";
import { BrowserFrame } from "../../src/components/BrowserFrame";
import { DriftingMotif } from "../../src/components/DriftingMotif";
import { FactorArt } from "../../src/components/FactorArt";
import { InViewGate } from "../../src/components/InViewGate";
import { MotifField } from "../../src/components/MotifField";
import { Marker } from "../../src/components/Marker";
import { LottieHero } from "../../src/components/LottieHero";
import { RiskDemo } from "../../src/components/RiskDemo";
import { SectionHeader } from "../../src/components/SectionHeader";
import { lungCalculator as c } from "../../src/content/site";

export const metadata: Metadata = {
  title: "Calculadora de riesgo de cáncer de pulmón",
  description: c.metaDescription,
  alternates: { canonical: c.slug },
};

const ICONOS = {
  percent: Percent,
  layers: Layers,
  route: Route,
  database: Database,
} as const;

export default function CalculadoraCancerPulmonPage() {
  return (
    <>
      {/* ── Portada ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-hairline bg-gris-900 text-white">
        {/*
          Aquí había dos degradados radiales difusos. El README los prohíbe ("No
          hay degradados difusos ni destellos decorativos: el motivo geométrico
          dice algo sobre esta marca en concreto"), así que se reemplazan por el
          mosaico de triángulos corporativo, que además se pausa fuera de pantalla.
        */}
        <DriftingMotif className="-top-10 right-0 w-64 opacity-[0.18] lg:w-[26rem]" />

        <div className="shell relative py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3.5 py-1.5 text-[0.68rem] font-semibold tracking-[0.18em] text-menta-300 uppercase">
                <ScanLine className="size-3.5" strokeWidth={2.5} />
                {c.eyebrow}
              </p>
              <h1 className="display mt-7 max-w-4xl text-[2.75rem] text-white sm:text-[3.5rem] lg:text-[4rem]">
                {c.titleLead}
                <Marker>{c.titleHighlight}</Marker>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-gris-200">
                {c.lead}
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                {/*
                `btn-primary` es gris-500 y sobre este hero gris-900 se pierde:
                el secundario pesaba más que el principal. Se usa el par que el
                manual documenta como legible (menta con gris-800, 7.09:1), el
                mismo de QualityTeaser pero invertido sobre fondo oscuro.
              */}
                <Link
                  href="#demostracion"
                  className="btn bg-menta-400 text-gris-800 hover:bg-menta-300"
                >
                  Probar la calculadora
                  <ArrowRight className="btn-arrow size-4" strokeWidth={2.5} />
                </Link>
                <Link
                  href="/#contacto"
                  className="btn border border-white/25 text-white hover:border-menta-400 hover:text-menta-300"
                >
                  {c.cta.label}
                </Link>
              </div>
            </div>

            {/*
              Ilustración animada del proyecto. Va a la derecha del titular: el
              texto conserva el lado de lectura y la pieza ocupa el espacio que
              antes quedaba vacío en pantallas anchas.
            */}
            <LottieHero
              src="/riskapplottie/paru-paru.json"
              ratio="1200 / 890"
              label="Ilustración de unos pulmones examinados con lupa y microscopio"
              className="mx-auto w-full max-w-md lg:max-w-none"
            />
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
            {c.stats.map((s) => (
              <div key={s.label} className="h-full bg-gris-900 px-6 py-7">
                <CountUp
                  value={s.value}
                  className="display block text-[2.5rem] leading-none text-menta-300"
                />
                <p className="mt-3 text-sm leading-snug text-gris-300">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Qué estima ───────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="shell">
          <SectionHeader
            eyebrow="Qué entrega"
            title="Qué se puede estimar"
            lead="No devuelve un sí o un no. Devuelve una probabilidad, el nivel de riesgo que le corresponde y la conducta que se desprende de ese nivel."
          />
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-2">
            {c.estimates.map((e) => {
              const Icono = ICONOS[e.icon as keyof typeof ICONOS];
              return (
                <div key={e.title} className="h-full bg-surface p-8 lg:p-10">
                  <Icono className="size-6 text-menta-500" strokeWidth={1.75} />
                  <h3 className="mt-5 text-lg font-semibold text-heading">
                    {e.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-ink-soft dark:text-body">
                    {e.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Demostración ─────────────────────────────────────────── */}
      <section
        id="demostracion"
        className="relative scroll-mt-24 overflow-hidden border-y border-hairline bg-gris-900 py-20 text-white lg:py-28"
      >
        {/*
          Fondo oscuro sólo en esta sección: la ventana con el prototipo tiene que
          despegarse de la página, igual que en una presentación de producto. Se
          escribe la cabecera a mano en vez de usar SectionHeader porque ese
          componente lleva los colores del tema claro.
        */}
        {/*
          Antes había un DriftingMotif suelto al fondo de la sección. Como la
          sección es muy alta, ese rincón casi nunca entraba en pantalla y el
          IntersectionObserver dejaba la animación en pausa: el fondo estaba
          quieto. MotifField cubre `inset-0`, así que se activa en cuanto la
          sección asoma y el tejido rueda de verdad por detrás de la ventana.
        */}
        <MotifField className="opacity-[0.55]" />

        <div className="shell relative">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3.5 py-1.5 text-[0.68rem] font-semibold tracking-[0.18em] text-menta-300 uppercase">
              <Terminal className="size-3.5" strokeWidth={2.5} />
              Vista del proyecto
            </p>
            <h2 className="display mt-6 text-[2rem] text-white sm:text-[2.5rem] lg:text-[3rem]">
              El modelo, funcionando
            </h2>
            <p className="mt-5 leading-relaxed text-gris-300 sm:text-lg">
              Mueva los controles y vea cómo responde el riesgo. Es el mismo
              algoritmo que corre en las implementaciones institucionales, con
              los mismos coeficientes y umbrales.
            </p>
          </div>

          <div className="mt-14">
            <BrowserFrame
              label="modelo PLCOm2012noRace + riesgo ambiental y ocupacional"
              badge="Ejecutándose"
            >
              <RiskDemo />
            </BrowserFrame>
          </div>
        </div>
      </section>

      {/* ── Variables ────────────────────────────────────────────── */}
      <section className="border-t border-hairline bg-surface-muted py-20 lg:py-28">
        <div className="shell">
          <SectionHeader
            eyebrow="El modelo por dentro"
            title="Los 16 factores que evalúa"
            lead="Cuatro bloques. Los dos últimos son la extensión que ALZAK añadió sobre el PLCOm2012 original."
          />
          {/*
            Dos columnas y tarjeta horizontal: antes eran cuatro columnas con el
            icono arriba, y a ese ancho no cabe una ilustración al lado. Con dos
            columnas el dibujo entra a la izquierda y la lista de variables sigue
            legible sin partir palabras.
          */}
          <InViewGate className="mt-14 grid gap-6 lg:grid-cols-2">
            {c.variableGroups.map((g, i) => {
              const propio = i >= 2;
              return (
                <div
                  key={g.title}
                  className={`flex h-full gap-6 rounded-2xl border bg-surface p-7 lg:gap-7 lg:p-8 ${
                    propio
                      ? "border-menta-300 dark:border-menta-800"
                      : "border-hairline"
                  }`}
                >
                  <FactorArt
                    name={g.art}
                    className="size-16 shrink-0 lg:size-20"
                  />

                  <div className="min-w-0">
                    <h3 className="font-semibold text-heading">{g.title}</h3>
                    {propio ? (
                      <p className="mt-2 inline-block rounded-full bg-menta-50 px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide text-menta-700 uppercase dark:bg-menta-900/30 dark:text-menta-300">
                        Extensión ALZAK
                      </p>
                    ) : null}
                    <ul className="mt-5 space-y-2.5">
                      {g.items.map((it) => (
                        <li
                          key={it}
                          className="flex gap-2.5 text-sm leading-snug text-ink-soft dark:text-body"
                        >
                          <span
                            aria-hidden
                            className="mt-1.5 size-1.5 shrink-0 rounded-full bg-menta-400"
                          />
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </InViewGate>
        </div>
      </section>

      {/* ── Bibliografía ─────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="shell">
          <SectionHeader
            eyebrow="Evidencia"
            title="Bibliografía que sustenta cada factor"
            lead="Ningún factor de riesgo entró al modelo por conveniencia. Estas son las fuentes que justifican su inclusión."
          />
          <ol className="mt-14 divide-y divide-hairline border-y border-hairline">
            {c.references.map((ref, i) => (
              <li
                key={ref.cite.slice(0, 40)}
                className="grid gap-3 py-6 lg:grid-cols-[3rem_11rem_1fr] lg:gap-6"
              >
                <span className="display text-[1.25rem] leading-none text-menta-400 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-xs font-semibold tracking-wide text-ink-soft uppercase lg:pt-1">
                  {ref.topic}
                </span>
                <p className="leading-relaxed text-ink-soft dark:text-body">
                  {ref.cite}
                  {"url" in ref && ref.url ? (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 inline-flex items-center gap-1 whitespace-nowrap text-menta-600 hover:underline dark:text-menta-300"
                    >
                      Ver fuente
                      <ExternalLink className="size-3" strokeWidth={2.5} />
                    </a>
                  ) : null}
                </p>
              </li>
            ))}
          </ol>

          <p className="mt-10 flex items-start gap-3 text-sm leading-relaxed text-ink-soft">
            <BookOpen
              className="mt-0.5 size-4 shrink-0 text-menta-500"
              strokeWidth={2}
            />
            El riesgo estimado corresponde a la probabilidad de desarrollar
            cáncer de pulmón en los próximos 6 años según los datos aportados
            por el encuestado.
          </p>
        </div>
      </section>

      {/* ── Cierre ───────────────────────────────────────────────── */}
      <section className="border-t border-hairline bg-gris-800 py-20 text-white">
        <div className="shell flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h2 className="display text-[1.75rem] text-white sm:text-[2.25rem]">
              {c.cta.title}
            </h2>
            <p className="mt-4 leading-relaxed text-gris-300">{c.cta.body}</p>
          </div>
          <Link href="/#contacto" className="btn btn-dark shrink-0">
            {c.cta.label}
            <ArrowRight className="btn-arrow size-4" strokeWidth={2.5} />
          </Link>
        </div>
      </section>
    </>
  );
}
