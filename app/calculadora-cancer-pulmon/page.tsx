import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Cigarette,
  Database,
  ExternalLink,
  HardHat,
  Layers,
  Mail,
  Percent,
  Route,
  ScanLine,
  User,
  Wind,
} from "lucide-react";
import { CountUp } from "../../src/components/CountUp";
import { DriftingMotif } from "../../src/components/DriftingMotif";
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
  user: User,
  cigarette: Cigarette,
  wind: Wind,
  "hard-hat": HardHat,
} as const;

export default function CalculadoraCancerPulmonPage() {
  return (
    <>
      {/* ── Portada ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-hairline bg-gris-900 text-white">
        {/*
          Aquí había dos degradados radiales difusos. El README los prohíbe —"No
          hay degradados difusos ni destellos decorativos: el motivo geométrico
          dice algo sobre esta marca en concreto"— así que se reemplazan por el
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
                {c.title}
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-gris-200">
                {c.lead}
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                {/*
                `btn-primary` es gris-500 y sobre este hero gris-900 se pierde:
                el secundario pesaba más que el principal. Se usa el par que el
                manual documenta como legible —menta con gris-800, 7.09:1—, el
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
        className="scroll-mt-24 border-y border-hairline bg-surface-muted py-20 lg:py-28"
      >
        <div className="shell">
          <SectionHeader
            eyebrow="Vista del proyecto"
            title="El modelo, funcionando"
            lead="Mueva los controles y vea cómo responde el riesgo. Es el mismo algoritmo que corre en las implementaciones institucionales, con los mismos coeficientes y umbrales."
          />
          <div className="mt-14">
            <RiskDemo />
          </div>
        </div>
      </section>

      {/* ── Qué mejora ───────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="shell">
          <SectionHeader
            eyebrow="Avances"
            title="Qué mejora frente al tamizaje clásico"
            lead="El criterio tradicional admite o descarta por edad y paquetes-año. Este modelo estima riesgo, y por eso alcanza a personas que la regla categórica deja fuera."
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {c.advances.map((a) => (
              <article
                key={a.title}
                className="flex h-full gap-6 rounded-2xl border border-hairline bg-surface p-8 transition-colors duration-200 hover:border-menta-300 lg:p-9"
              >
                <div className="shrink-0 border-r border-hairline pr-6">
                  <p className="display text-[1.75rem] leading-none whitespace-nowrap text-menta-500">
                    {a.metric}
                  </p>
                  <p className="mt-2 max-w-[7rem] text-[0.68rem] leading-snug tracking-wide text-ink-soft uppercase">
                    {a.metricLabel}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-heading">
                    {a.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-ink-soft dark:text-body">
                    {a.body}
                  </p>
                </div>
              </article>
            ))}
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
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {c.variableGroups.map((g, i) => {
              const Icono = ICONOS[g.icon as keyof typeof ICONOS];
              const propio = i >= 2;
              return (
                <div
                  key={g.title}
                  className={`h-full rounded-2xl border bg-surface p-7 ${
                    propio
                      ? "border-menta-300 dark:border-menta-800"
                      : "border-hairline"
                  }`}
                >
                  <Icono className="size-5 text-menta-500" strokeWidth={1.75} />
                  <h3 className="mt-4 font-semibold text-heading">{g.title}</h3>
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
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Cimiento y autoría ───────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="shell grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <SectionHeader eyebrow="Fundamento" title={c.foundation.title} />
            <p className="mt-8 leading-relaxed text-ink-soft sm:text-lg dark:text-body">
              {c.foundation.body}
            </p>

            <figure className="mt-10 rounded-2xl border-l-[3px] border-menta-400 bg-surface-muted p-7 lg:p-8">
              <blockquote className="leading-relaxed text-heading">
                {c.foundation.anchor.cite}
              </blockquote>
              <figcaption className="mt-4 text-sm text-ink-soft">
                <cite className="not-italic">
                  {c.foundation.anchor.journal}
                </cite>{" "}
                · {c.foundation.anchor.detail}
                <a
                  href={c.foundation.anchor.doi}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 inline-flex items-center gap-1 text-menta-600 hover:underline dark:text-menta-300"
                >
                  DOI
                  <ExternalLink className="size-3" strokeWidth={2.5} />
                </a>
              </figcaption>
            </figure>
          </div>

          {/* Ficha de autoría */}
          <div className="rounded-2xl border border-hairline bg-surface p-8 lg:sticky lg:top-28">
            <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-ink-soft uppercase">
              Quién lo desarrolló
            </p>
            <p className="display mt-5 text-[2rem] leading-tight">
              {c.authorship.lead}
            </p>
            <p className="mt-2 font-semibold text-menta-600 dark:text-menta-300">
              {c.authorship.entity}
            </p>
            <p className="mt-5 text-sm leading-relaxed text-ink-soft dark:text-body">
              {c.authorship.body}
            </p>
            <a
              href={`mailto:${c.authorship.email}`}
              className="mt-5 inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-menta-600 dark:hover:text-menta-300"
            >
              <Mail className="size-3.5" strokeWidth={2} />
              {c.authorship.email}
            </a>

            <dl className="mt-8 space-y-4 border-t border-hairline pt-7">
              {[
                ["Modelo", c.authorship.model],
                ["Creado", c.authorship.created],
                ["Titularidad", c.authorship.ownership],
                ["Tecnología", c.authorship.stack],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-3">
                  <dt className="text-xs tracking-wide text-ink-soft uppercase">
                    {k}
                  </dt>
                  <dd className="text-sm leading-snug text-heading">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── Implementaciones ─────────────────────────────────────── */}
      <section className="border-y border-hairline bg-surface-muted py-20 lg:py-24">
        <div className="shell">
          <SectionHeader
            eyebrow="Alcance"
            title="Implementado en cinco instituciones"
            lead="Cada despliegue lleva la identidad de la institución y alimenta un tablero de seguimiento de la recolección de registros."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {c.deployments.map((d) => (
              <div
                key={d.name}
                className="flex h-full flex-col rounded-2xl border border-hairline bg-surface p-6"
              >
                {/*
                  Logos tomados de cada app de CAPULMON, recortados a su contenido
                  y normalizados a 200 px de alto para que pesen igual en la celda.
                  Mismo tratamiento que el muro de clientes del home: desaturados
                  en reposo, a color al pasar el cursor.
                */}
                <span className="relative block h-16 w-full">
                  <Image
                    src={d.logo}
                    alt={d.name}
                    fill
                    sizes="(min-width: 1024px) 16vw, (min-width: 640px) 30vw, 45vw"
                    className="object-contain object-left opacity-70 grayscale transition-[opacity,filter] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:opacity-100 hover:grayscale-0"
                  />
                </span>
                <p className="mt-5 font-semibold text-heading">{d.name}</p>
                <p className="mt-1.5 text-sm leading-snug text-ink-soft">
                  {d.detail}
                </p>
              </div>
            ))}
          </div>
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
