import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Database,
  ExternalLink,
  Layers,
  Mail,
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
import { LogoMarquee } from "../../src/components/LogoMarquee";
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
          {/*
            Antes eran cinco tarjetas con nombre y descripción. Ahora sólo los
            logotipos, en una cinta que corre sin fin: el nombre ya lo dice cada
            marca, y repetirlo debajo era redundante.
          */}
          <div className="mt-12">
            <LogoMarquee items={c.deployments} />
          </div>
        </div>
      </section>

      {/* ── Calibración y validación ─────────────────────────────── */}
      {/*
        Las cifras salen de los dos artículos que sustentan el PLCOm2012 y que ya
        estaban citados en `creditos.md`. Se explicitan aquí porque son las que
        responden a «¿por qué creerle a este número?».

        La comparación contra el criterio USPSTF es de dos series, así que cada
        una va con su etiqueta de texto y no sólo con color: menta para el modelo
        y gris para la referencia.
      */}
      <section className="py-20 lg:py-28">
        <div className="shell">
          <SectionHeader
            eyebrow={c.validation.eyebrow}
            title={c.validation.title}
            lead={c.validation.lead}
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {/* Discriminación */}
            <div className="rounded-2xl border border-hairline bg-surface p-8">
              <h3 className="font-semibold text-heading">
                {c.validation.discrimination.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft dark:text-body">
                {c.validation.discrimination.body}
              </p>
              <div className="mt-7 space-y-6">
                {c.validation.discrimination.items.map((it) => (
                  <div key={it.label}>
                    <div className="flex items-baseline gap-3">
                      <span className="display text-[2rem] leading-none text-menta-600 dark:text-menta-300">
                        {it.value}
                      </span>
                      <span className="text-xs text-ink-soft tabular-nums">
                        {it.ci}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-heading">{it.label}</p>
                    {"note" in it && it.note ? (
                      <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                        {it.note}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* Calibración */}
            <div className="rounded-2xl border border-hairline bg-surface p-8">
              <h3 className="font-semibold text-heading">
                {c.validation.calibration.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft dark:text-body">
                {c.validation.calibration.body}
              </p>
              <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-6">
                {c.validation.calibration.items.map((it) => (
                  <div key={it.label}>
                    <dt className="display text-[1.75rem] leading-none text-menta-600 dark:text-menta-300">
                      {it.value}
                    </dt>
                    <dd className="mt-2 text-xs leading-snug text-ink-soft">
                      {it.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Eficiencia frente al criterio categórico */}
          <div className="mt-6 rounded-2xl border border-hairline bg-surface p-8 lg:p-10">
            <h3 className="font-semibold text-heading">
              {c.validation.efficiency.title}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft dark:text-body">
              {c.validation.efficiency.body}
            </p>

            <div className="mt-6 flex flex-wrap gap-x-7 gap-y-2 text-xs">
              <span className="inline-flex items-center gap-2 text-heading">
                <span
                  aria-hidden
                  className="size-2.5 rounded-full bg-menta-600"
                />
                {c.validation.efficiency.columns.model}
              </span>
              <span className="inline-flex items-center gap-2 text-ink-soft">
                <span
                  aria-hidden
                  className="size-2.5 rounded-full bg-gris-300 dark:bg-gris-600"
                />
                {c.validation.efficiency.columns.baseline}
              </span>
            </div>

            <ul className="mt-8 space-y-8">
              {c.validation.efficiency.rows.map((r) => (
                <li key={r.metric}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <span className="font-medium text-heading">{r.metric}</span>
                    <span className="text-xs text-ink-soft">{r.hint}</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {[
                      {
                        v: r.model,
                        ci: r.modelCi,
                        tono: "bg-menta-600",
                        fuerte: true,
                      },
                      {
                        v: r.baseline,
                        ci: r.baselineCi,
                        tono: "bg-gris-300 dark:bg-gris-600",
                        fuerte: false,
                      },
                    ].map((b) => (
                      <div key={b.ci} className="flex items-center gap-3">
                        <div className="h-3 flex-1 rounded-full bg-surface-sunken dark:bg-gris-800">
                          <div
                            className={`h-full rounded-full ${b.tono}`}
                            style={{ width: `${b.v}%` }}
                          />
                        </div>
                        <span
                          className={`w-32 shrink-0 text-right text-sm tabular-nums ${
                            b.fuerte
                              ? "font-semibold text-heading"
                              : "text-ink-soft"
                          }`}
                        >
                          {b.v.toFixed(1).replace(".", ",")} %
                          <span className="ml-1.5 text-[0.68rem] font-normal text-ink-soft">
                            ({b.ci})
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 grid gap-6 border-t border-hairline pt-8 sm:grid-cols-2">
              {[
                c.validation.efficiency.headline.left,
                c.validation.efficiency.headline.right,
              ].map((h) => (
                <div key={h.label}>
                  <p className="display text-[2.25rem] leading-none text-menta-600 dark:text-menta-300">
                    {h.value}
                  </p>
                  <p className="mt-2 text-sm text-heading">{h.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs leading-relaxed text-ink-soft">
              {c.validation.efficiency.headline.detail}
            </p>
          </div>

          {/* Punto ciego y respuesta */}
          <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline lg:grid-cols-2">
            <div className="bg-surface p-8 lg:p-10">
              <h3 className="font-semibold text-heading">
                {c.validation.neverSmokers.title}
              </h3>
              <p className="mt-4 leading-relaxed text-ink-soft dark:text-body">
                {c.validation.neverSmokers.finding}
              </p>
            </div>
            <div className="bg-menta-400 p-8 lg:p-10">
              <p className="text-xs font-semibold tracking-[0.18em] text-gris-800 uppercase">
                La extensión de ALZAK
              </p>
              <p className="mt-4 leading-relaxed text-gris-800">
                {c.validation.neverSmokers.response}
              </p>
            </div>
          </div>

          {/* Los dos artículos */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {c.validation.papers.map((pa) => (
              <a
                key={pa.url}
                href={pa.url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-hairline p-6 transition-colors duration-200 hover:border-menta-400"
              >
                <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-menta-600 uppercase dark:text-menta-300">
                  {pa.role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-heading">
                  {pa.cite}
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-soft">
                  <cite className="not-italic">{pa.journal}</cite> · {pa.detail}
                  <ExternalLink
                    className="size-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={2.5}
                  />
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Operación ────────────────────────────────────────────── */}
      {/*
        Barras en HTML, sin librería de gráficos: son dos composiciones de cinco
        y tres valores, y traerse un runtime entero para eso no se justifica.
        El riesgo reutiliza la MISMA rampa secuencial del medidor (menta 400,
        600 y 800), así que un color significa lo mismo en toda la página.
        Los tramos llevan 2 px de separación para que no se toquen.
      */}
      <section className="border-t border-hairline bg-surface-muted py-20 lg:py-28">
        <div className="shell">
          <SectionHeader
            eyebrow={c.operations.eyebrow}
            title={c.operations.title}
            lead={c.operations.lead}
          />

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
            {c.operations.stats.map((st) => (
              <div key={st.label} className="bg-surface px-6 py-7">
                <CountUp
                  value={st.value}
                  className="display block text-[2.25rem] leading-none text-menta-600 dark:text-menta-300"
                />
                <p className="mt-3 text-sm leading-snug text-ink-soft">
                  {st.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {/* Reparto del riesgo */}
            <div className="rounded-2xl border border-hairline bg-surface p-8">
              <h3 className="font-semibold text-heading">
                {c.operations.riskMix.title}
              </h3>

              <div className="mt-7 flex h-4 w-full gap-[2px] overflow-hidden">
                {c.operations.riskMix.segments.map((sg) => (
                  <span
                    key={sg.label}
                    className={
                      sg.tone === "alto"
                        ? "bg-menta-800"
                        : sg.tone === "moderado"
                          ? "bg-menta-600"
                          : "bg-menta-400"
                    }
                    style={{
                      width: `${(sg.value / c.operations.riskMix.total) * 100}%`,
                    }}
                  />
                ))}
              </div>

              <ul className="mt-7 space-y-4">
                {c.operations.riskMix.segments.map((sg) => (
                  <li key={sg.label} className="flex items-baseline gap-3">
                    <span
                      aria-hidden
                      className={`size-2.5 shrink-0 translate-y-[1px] rounded-full ${
                        sg.tone === "alto"
                          ? "bg-menta-800"
                          : sg.tone === "moderado"
                            ? "bg-menta-600"
                            : "bg-menta-400"
                      }`}
                    />
                    <span className="flex-1 text-sm text-body">{sg.label}</span>
                    <span className="text-sm font-semibold text-heading tabular-nums">
                      {sg.value.toLocaleString("es-CO")}
                    </span>
                    <span className="w-14 text-right text-sm text-ink-soft tabular-nums">
                      {((sg.value / c.operations.riskMix.total) * 100)
                        .toFixed(1)
                        .replace(".", ",")}{" "}
                      %
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-7 border-t border-hairline pt-6 leading-relaxed text-ink-soft dark:text-body">
                {c.operations.riskMix.insight}
              </p>
              <p className="mt-4 text-xs text-ink-soft">
                {c.operations.riskMix.note}
              </p>
            </div>

            {/* Volumen por centro */}
            <div className="rounded-2xl border border-hairline bg-surface p-8">
              <h3 className="font-semibold text-heading">
                {c.operations.byCenter.title}
              </h3>

              <ul className="mt-7 space-y-5">
                {c.operations.byCenter.items.map((it) => (
                  <li key={it.label}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm text-body">{it.label}</span>
                      <span className="text-sm font-semibold text-heading tabular-nums">
                        {it.value.toLocaleString("es-CO")}
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 w-full rounded-full bg-surface-sunken dark:bg-gris-800">
                      <div
                        className="h-full rounded-full bg-menta-600"
                        style={{
                          width: `${Math.max((it.value / c.operations.byCenter.items[0].value) * 100, 0.8)}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-7 border-t border-hairline pt-6 text-xs leading-relaxed text-ink-soft">
                {c.operations.byCenter.note} Datos del tablero de seguimiento al{" "}
                {c.operations.asOf}.
              </p>
            </div>
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
