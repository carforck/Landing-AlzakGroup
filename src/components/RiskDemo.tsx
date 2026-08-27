"use client";

import { useMemo, useState } from "react";
import {
  OctagonAlert,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  calcularRiesgoCaPulmon,
  packYear,
  type ClaseRiesgo,
  type EntradaRiesgo,
} from "../lib/lung-risk";
import { lungCalculator } from "../content/site";

/**
 * Demostración del modelo corriendo en el navegador.
 *
 * Nada de lo que se teclea aquí sale del equipo del visitante: el cálculo es
 * síncrono en el cliente y no hay petición de red. Es deliberado (son datos de
 * salud) y además permite que el resultado se actualice en cada pulsación.
 *
 * La app clínica sí persiste, pide identidad y añade la pregunta filtro que
 * excluye a los ya diagnosticados. Esto es la vitrina, no el producto.
 */

const INICIAL: EntradaRiesgo = {
  edad: 62,
  sexo: "M",
  epoc: false,
  caAnt: false,
  caPulmonFam: false,
  fumador: true,
  fumadorYear: 30,
  nCigarrillosDia: 15,
  fumadorPasivo: false,
  fumadorPasivoYear: 0,
  hap: false,
  hapYear: 0,
  asbesto: false,
  asbestoYear: 0,
  edadInicioAsbesto: 25,
  diesel: false,
  dieselYear: 0,
  edadInicioDiesel: 25,
  pintura: false,
  pinturaYear: 0,
  edadInicioPintura: 25,
};

/**
 * El riesgo es una MAGNITUD, no una categoría: le corresponde una rampa
 * secuencial de un solo tono, claro → oscuro. Se usan tres pasos del menta
 * corporativo (400 → 600 → 800), validados con el script de paleta: monótonos
 * en luminosidad y dentro de la banda L 0.43–0.77.
 *
 * No se usa el semáforo verde/ámbar/rojo. El manual de marca es explícito en que
 * menta y gris "deben predominar" y en el sitio no hay ningún color fuera de esa
 * derivación; la única excepción documentada es el verde de WhatsApp.
 *
 * Como el color no puede cargar solo con el estado, cada nivel lleva además
 * icono y etiqueta de texto.
 */
const TONO: Record<
  ClaseRiesgo,
  {
    trazo: string;
    texto: string;
    fondo: string;
    borde: string;
    Icono: LucideIcon;
  }
> = {
  "Riesgo bajo": {
    trazo: "#5dc3da", // menta-400 · color oficial de marca
    texto: "text-menta-700 dark:text-menta-300",
    fondo: "bg-menta-50 dark:bg-menta-900/25",
    borde: "border-menta-200 dark:border-menta-800",
    Icono: ShieldCheck,
  },
  "Riesgo moderado": {
    trazo: "#2f8ba3", // menta-600
    texto: "text-menta-800 dark:text-menta-200",
    fondo: "bg-menta-100 dark:bg-menta-900/40",
    borde: "border-menta-300 dark:border-menta-700",
    Icono: TriangleAlert,
  },
  "Riesgo alto": {
    trazo: "#285c6d", // menta-800
    texto: "text-white",
    fondo: "bg-menta-800",
    borde: "border-menta-800",
    Icono: OctagonAlert,
  },
};

export function RiskDemo() {
  const [v, setV] = useState<EntradaRiesgo>(INICIAL);
  const set = <K extends keyof EntradaRiesgo>(k: K, val: EntradaRiesgo[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const r = useMemo(() => calcularRiesgoCaPulmon(v), [v]);
  const tono = TONO[r.claseRiesgo];
  const pct = r.prob * 100;

  // Umbrales vigentes para este perfil: el modelo los cambia según fume o no.
  const cortes = v.fumador ? { mod: 10, alto: 20 } : { mod: 26.5, alto: 53 };
  const pa = v.fumador ? packYear(v.nCigarrillosDia, v.fumadorYear) : 0;

  /*
   * Curva de riesgo por edad para ESTE perfil: se recalcula el modelo de 50 a 80
   * años dejando el resto de respuestas como están. Rellena el hueco que quedaba
   * bajo el medidor con algo que informa en vez de decorar, y responde a la
   * pregunta que todo el mundo se hace al ver un porcentaje: ¿y cómo evoluciona?
   *
   * Se recorre de dos en dos años: 16 puntos bastan para que la curva se lea
   * suave y evitan recalcular el modelo 31 veces en cada pulsación.
   */
  const curva = useMemo(() => {
    const puntos: { edad: number; prob: number }[] = [];
    for (let edad = 50; edad <= 80; edad += 2) {
      puntos.push({ edad, prob: calcularRiesgoCaPulmon({ ...v, edad }).prob });
    }
    return puntos;
  }, [v]);

  const CW = 300;
  const CH = 72;
  const cx = (edad: number) => ((edad - 50) / 30) * CW;
  const cy = (prob: number) => CH - prob * CH;
  const linea = curva
    .map(
      (pt, i) =>
        `${i === 0 ? "M" : "L"}${cx(pt.edad).toFixed(1)} ${cy(pt.prob).toFixed(1)}`,
    )
    .join(" ");
  const area = `${linea} L${CW} ${CH} L0 ${CH} Z`;

  // Arco de 240°, abierto abajo. R=80 → longitud = 240/360 · 2πr.
  const R = 80;
  const ARCO = (240 / 360) * 2 * Math.PI * R;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:gap-10">
      {/* ── Entradas ─────────────────────────────────────────────── */}
      <div className="space-y-7">
        <Bloque titulo="Perfil">
          <Deslizador
            etiqueta="Edad"
            valor={v.edad}
            min={50}
            max={80}
            sufijo=" años"
            onChange={(n) => set("edad", n)}
          />
          <Segmentado
            etiqueta="Sexo biológico"
            valor={v.sexo}
            opciones={[
              { valor: "M", texto: "Hombre" },
              { valor: "F", texto: "Mujer" },
            ]}
            onChange={(s) => set("sexo", s as "M" | "F")}
          />
        </Bloque>

        <Bloque titulo="Antecedentes clínicos">
          <div className="grid gap-2.5 sm:grid-cols-3">
            <Casilla
              texto="EPOC"
              activo={v.epoc}
              onChange={(b) => set("epoc", b)}
            />
            <Casilla
              texto="Cáncer previo"
              activo={v.caAnt}
              onChange={(b) => set("caAnt", b)}
            />
            <Casilla
              texto="Familiar con CaP"
              activo={v.caPulmonFam}
              onChange={(b) => set("caPulmonFam", b)}
            />
          </div>
        </Bloque>

        <Bloque titulo="Tabaquismo">
          <Casilla
            texto="Fumador activo"
            activo={v.fumador}
            onChange={(b) => set("fumador", b)}
          />
          {v.fumador ? (
            <div className="mt-4 space-y-4 border-l-2 border-menta-300 pl-5 dark:border-menta-800">
              <Deslizador
                etiqueta="Años fumando"
                valor={v.fumadorYear}
                min={1}
                max={60}
                sufijo=" años"
                onChange={(n) => set("fumadorYear", n)}
              />
              <Deslizador
                etiqueta="Cigarrillos por día"
                valor={v.nCigarrillosDia}
                min={1}
                max={60}
                onChange={(n) => set("nCigarrillosDia", n)}
              />
              <p className="text-xs text-ink-soft">
                Dosis acumulada:{" "}
                <strong className="text-heading tabular-nums">
                  {pa.toFixed(1)}
                </strong>{" "}
                paquetes-año
                {v.edad >= 50 && pa >= 20 ? (
                  <span className="ml-1.5 rounded-full bg-menta-100 px-2 py-0.5 text-[0.68rem] font-semibold text-menta-800 dark:bg-menta-900/50 dark:text-menta-200">
                    cumple criterio NCCN · +20 %
                  </span>
                ) : null}
              </p>
            </div>
          ) : null}
          <div className="mt-4">
            <Casilla
              texto="Tabaquismo pasivo"
              activo={v.fumadorPasivo}
              onChange={(b) => set("fumadorPasivo", b)}
            />
            {v.fumadorPasivo ? (
              <div className="mt-4 border-l-2 border-menta-300 pl-5 dark:border-menta-800">
                <Deslizador
                  etiqueta="Años de exposición"
                  valor={v.fumadorPasivoYear}
                  min={0}
                  max={60}
                  sufijo=" años"
                  umbral={10}
                  onChange={(n) => set("fumadorPasivoYear", n)}
                />
              </div>
            ) : null}
          </div>
        </Bloque>

        <Bloque titulo="Exposición ambiental">
          <Casilla
            texto="Humo de biomasa en interiores"
            activo={v.hap}
            onChange={(b) => set("hap", b)}
          />
          {v.hap ? (
            <div className="mt-4 border-l-2 border-menta-300 pl-5 dark:border-menta-800">
              <Deslizador
                etiqueta="Años de exposición"
                valor={v.hapYear}
                min={0}
                max={70}
                sufijo=" años"
                umbral={34}
                onChange={(n) => set("hapYear", n)}
              />
            </div>
          ) : null}
        </Bloque>

        <Bloque titulo="Exposición ocupacional">
          <p className="-mt-1 mb-4 text-xs leading-relaxed text-ink-soft">
            Sólo suman al riesgo con 10 años o más de exposición y 30 o más de
            latencia desde que empezó.
          </p>
          <div className="space-y-4">
            <Ocupacional
              texto="Asbesto"
              activo={v.asbesto}
              anios={v.asbestoYear}
              inicio={v.edadInicioAsbesto}
              edad={v.edad}
              onActivo={(b) => set("asbesto", b)}
              onAnios={(n) => set("asbestoYear", n)}
              onInicio={(n) => set("edadInicioAsbesto", n)}
            />
            <Ocupacional
              texto="Emisiones diésel"
              activo={v.diesel}
              anios={v.dieselYear}
              inicio={v.edadInicioDiesel}
              edad={v.edad}
              onActivo={(b) => set("diesel", b)}
              onAnios={(n) => set("dieselYear", n)}
              onInicio={(n) => set("edadInicioDiesel", n)}
            />
            <Ocupacional
              texto="Pinturas"
              activo={v.pintura}
              anios={v.pinturaYear}
              inicio={v.edadInicioPintura}
              edad={v.edad}
              onActivo={(b) => set("pintura", b)}
              onAnios={(n) => set("pinturaYear", n)}
              onInicio={(n) => set("edadInicioPintura", n)}
            />
          </div>
        </Bloque>

        <button
          type="button"
          onClick={() => setV(INICIAL)}
          className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-menta-600 dark:hover:text-menta-300"
        >
          <RotateCcw className="size-3.5" strokeWidth={2.5} />
          Reiniciar el perfil
        </button>
      </div>

      {/* ── Resultado ────────────────────────────────────────────── */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="overflow-hidden rounded-3xl border border-hairline bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.12)]">
          <div className="flex flex-col items-center px-7 pt-9 pb-7">
            <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-ink-soft uppercase">
              Probabilidad a 6 años
            </p>

            <div className="relative mt-5 grid h-[168px] w-[200px] place-items-center">
              <svg
                viewBox="0 0 200 168"
                className="absolute inset-0 h-full w-full"
              >
                <g transform="rotate(150 100 100)">
                  <circle
                    cx="100"
                    cy="100"
                    r={R}
                    fill="none"
                    stroke="currentColor"
                    className="text-surface-sunken dark:text-gris-800"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${ARCO} 999`}
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r={R}
                    fill="none"
                    stroke={tono.trazo}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${(ARCO * r.prob).toFixed(2)} 999`}
                    style={{
                      transition:
                        "stroke-dasharray 420ms cubic-bezier(0.16,1,0.3,1), stroke 300ms",
                    }}
                  />
                </g>
              </svg>
              <div className="relative pt-3 text-center">
                <span
                  className="display block text-[3.25rem] leading-none tabular-nums"
                  style={{ color: tono.trazo }}
                >
                  {pct.toFixed(1)}
                  <span className="text-[1.5rem]">%</span>
                </span>
              </div>
            </div>

            <span
              className={`-mt-1 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${tono.fondo} ${tono.borde} ${tono.texto}`}
            >
              <tono.Icono className="size-4" strokeWidth={2.25} />
              {r.claseRiesgo}
            </span>
          </div>

          {/*
            Curva de riesgo por edad. El trazo se redibuja en cada cambio y la
            transición de `d` no existe en SVG, así que el movimiento lo da el
            propio recálculo: al arrastrar un control la curva se deforma en
            vivo. El punto marca la edad seleccionada.
          */}
          <div className="px-7 pb-5">
            <div className="flex items-baseline justify-between">
              <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-ink-soft uppercase">
                Riesgo según la edad
              </p>
              <p className="text-[0.68rem] text-ink-soft">
                con este mismo perfil
              </p>
            </div>

            <svg
              viewBox={`0 -4 ${CW} ${CH + 8}`}
              className="mt-3 w-full"
              style={{ height: "5.25rem" }}
              role="img"
              aria-label={`Curva de riesgo entre los 50 y los 80 años para el perfil actual. A los ${v.edad} años el riesgo es del ${pct.toFixed(1)} por ciento.`}
            >
              <defs>
                <linearGradient id="curva-relleno" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={tono.trazo} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={tono.trazo} stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Referencias horizontales al 25, 50 y 75 %. */}
              {[0.25, 0.5, 0.75].map((g) => (
                <line
                  key={g}
                  x1="0"
                  x2={CW}
                  y1={cy(g)}
                  y2={cy(g)}
                  stroke="currentColor"
                  className="text-hairline"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />
              ))}

              <path d={area} fill="url(#curva-relleno)" />
              <path
                d={linea}
                fill="none"
                stroke={tono.trazo}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: "stroke 300ms" }}
              />

              {/* Edad seleccionada. */}
              <line
                x1={cx(v.edad)}
                x2={cx(v.edad)}
                y1="0"
                y2={CH}
                stroke={tono.trazo}
                strokeWidth="1"
                strokeOpacity="0.35"
              />
              <circle
                cx={cx(v.edad)}
                cy={cy(r.prob)}
                r="4.5"
                fill={tono.trazo}
                stroke="var(--color-surface)"
                strokeWidth="2.5"
                style={{
                  transition:
                    "cx 220ms ease-out, cy 220ms ease-out, fill 300ms",
                }}
              />
            </svg>

            <div className="flex justify-between text-[0.68rem] text-ink-soft tabular-nums">
              <span>50 años</span>
              <span className="font-semibold text-heading">{v.edad} años</span>
              <span>80 años</span>
            </div>
          </div>

          {/* Escala con los cortes vigentes para este perfil. */}
          <div className="px-7 pb-6">
            <div className="relative h-2 overflow-hidden rounded-full bg-surface-sunken dark:bg-gris-800">
              {/* Separación de 2px entre tramos: los rellenos contiguos no se tocan. */}
              <div
                className="absolute inset-y-0 left-0 bg-menta-400"
                style={{ width: `calc(${cortes.mod}% - 1px)` }}
              />
              <div
                className="absolute inset-y-0 bg-menta-600"
                style={{
                  left: `calc(${cortes.mod}% + 1px)`,
                  width: `calc(${cortes.alto - cortes.mod}% - 2px)`,
                }}
              />
              <div
                className="absolute inset-y-0 right-0 bg-menta-800"
                style={{ left: `calc(${cortes.alto}% + 1px)` }}
              />
              <div
                className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-surface bg-heading shadow"
                style={{
                  left: `${Math.min(pct, 99.5)}%`,
                  transition: "left 420ms cubic-bezier(0.16,1,0.3,1)",
                }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[0.68rem] text-ink-soft tabular-nums">
              <span>0 %</span>
              <span>
                cortes {cortes.mod} % · {cortes.alto} %
                <span className="ml-1 opacity-70">
                  ({v.fumador ? "fumador" : "no fumador"})
                </span>
              </span>
              <span>100 %</span>
            </div>
          </div>

          <div className="border-t border-hairline bg-surface-muted px-7 py-6">
            <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-ink-soft uppercase">
              Conducta recomendada
            </p>
            <p className="mt-3 text-sm leading-relaxed text-heading">
              {r.recomendacion}
            </p>
          </div>

          {/*
            Aviso legal. Va en menta-400 con texto gris-800, el par que el manual
            documenta en 7.09:1, porque es el contraste mas alto disponible en la
            paleta y este es el mensaje que no puede pasar desapercibido. Antes
            iba en gris sobre gris a 12 px y se leia como una nota al pie.
            La segunda frase va en negrita: es la que delimita el alcance clinico.
          */}
          <div className="flex items-start gap-3.5 bg-menta-400 px-7 py-5">
            <TriangleAlert
              className="mt-0.5 size-5 shrink-0 text-gris-800"
              strokeWidth={2.5}
            />
            <p className="text-sm leading-relaxed text-gris-800">
              {lungCalculator.disclaimer.lead}{" "}
              <strong className="font-bold">
                {lungCalculator.disclaimer.emphasis}
              </strong>
            </p>
          </div>
        </div>

        <p className="mt-4 px-1 text-xs leading-relaxed text-ink-soft">
          El cálculo ocurre en su navegador. Ningún dato de esta demostración se
          envía ni se almacena.
        </p>
      </div>
    </div>
  );
}

/* ── Primitivas del formulario ──────────────────────────────────── */

function Bloque({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-4 text-[0.68rem] font-semibold tracking-[0.18em] text-ink-soft uppercase">
        {titulo}
      </legend>
      {children}
    </fieldset>
  );
}

function Deslizador({
  etiqueta,
  valor,
  min,
  max,
  sufijo = "",
  umbral,
  onChange,
}: {
  etiqueta: string;
  valor: number;
  min: number;
  max: number;
  sufijo?: string;
  /** Si se indica, marca desde dónde la variable empieza a sumar riesgo. */
  umbral?: number;
  onChange: (n: number) => void;
}) {
  const activa = umbral === undefined || valor >= umbral;
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm text-body">{etiqueta}</label>
        <span
          className={`text-sm font-semibold tabular-nums ${activa ? "text-heading" : "text-ink-soft"}`}
        >
          {valor}
          {sufijo}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={etiqueta}
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-sunken accent-menta-500 dark:bg-gris-800"
      />
      {umbral !== undefined && !activa ? (
        <p className="mt-1.5 text-[0.68rem] text-ink-soft">
          Suma riesgo desde {umbral} años
        </p>
      ) : null}
    </div>
  );
}

function Segmentado({
  etiqueta,
  valor,
  opciones,
  onChange,
}: {
  etiqueta: string;
  valor: string;
  opciones: { valor: string; texto: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="text-sm text-body">{etiqueta}</span>
      <div className="mt-2 inline-flex rounded-full border border-hairline p-1">
        {opciones.map((o) => (
          <button
            key={o.valor}
            type="button"
            onClick={() => onChange(o.valor)}
            aria-pressed={valor === o.valor}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors duration-200 ${
              valor === o.valor
                ? "bg-heading text-surface"
                : "text-ink-soft hover:text-heading"
            }`}
          >
            {o.texto}
          </button>
        ))}
      </div>
    </div>
  );
}

function Casilla({
  texto,
  activo,
  onChange,
}: {
  texto: string;
  activo: boolean;
  onChange: (b: boolean) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm transition-colors duration-200 ${
        activo
          ? "border-menta-400 bg-menta-50 text-heading dark:bg-menta-900/25"
          : "border-hairline text-body hover:border-menta-300"
      }`}
    >
      <input
        type="checkbox"
        checked={activo}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-menta-500"
      />
      {texto}
    </label>
  );
}

function Ocupacional({
  texto,
  activo,
  anios,
  inicio,
  edad,
  onActivo,
  onAnios,
  onInicio,
}: {
  texto: string;
  activo: boolean;
  anios: number;
  inicio: number;
  edad: number;
  onActivo: (b: boolean) => void;
  onAnios: (n: number) => void;
  onInicio: (n: number) => void;
}) {
  const cumple = anios >= 10 && edad - inicio >= 30;
  return (
    <div>
      <Casilla texto={texto} activo={activo} onChange={onActivo} />
      {activo ? (
        <div className="mt-3 ml-5 border-l-2 border-menta-300 pl-5 dark:border-menta-800">
          <div className="grid gap-3 sm:grid-cols-2">
            <Numerito
              etiqueta="Años expuesto"
              valor={anios}
              min={0}
              max={60}
              onChange={onAnios}
            />
            <Numerito
              etiqueta="Edad de inicio"
              valor={inicio}
              min={5}
              max={edad}
              onChange={onInicio}
            />
          </div>
          <p
            className={`mt-2 text-[0.68rem] ${cumple ? "font-semibold text-menta-700 dark:text-menta-300" : "text-ink-soft"}`}
          >
            {cumple
              ? "✓ Cumple dosis y latencia, suma al riesgo"
              : `No suma aún · faltan ${anios < 10 ? `${10 - anios} años de exposición` : `${30 - (edad - inicio)} años de latencia`}`}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function Numerito({
  etiqueta,
  valor,
  min,
  max,
  onChange,
}: {
  etiqueta: string;
  valor: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-ink-soft">{etiqueta}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-1.5 text-sm tabular-nums text-heading focus:border-menta-400 focus:outline-none"
      />
    </label>
  );
}
