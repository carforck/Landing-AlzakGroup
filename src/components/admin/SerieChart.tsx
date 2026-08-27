"use client";

import { useState } from "react";
import type { Centro, PuntoSerie } from "../../lib/capulmon-db";

/**
 * Evolución de registros: una línea de totales y, debajo, un panel por centro.
 *
 * Se descartó pintar los cinco centros como cinco líneas en el mismo eje. Dos
 * razones, y las dos son de fondo:
 *
 *  1. Cinco series necesitan cinco tonos distinguibles entre sí. La paleta de
 *     ALZAK es menta y gris; inventar cinco colores traería al proyecto una
 *     familia cromática que no es la de la marca.
 *  2. SURA aporta el 85 % de los registros. En un eje compartido, las líneas de
 *     los otros cuatro centros quedan pegadas al cero y no se lee ninguna.
 *
 * Los paneles pequeños resuelven ambas: cada centro tiene su propia escala, se
 * compara la FORMA de la actividad y no su volumen, y todo se pinta con un solo
 * tono. El volumen ya se compara en la tabla por centro.
 *
 * Es componente de cliente por el recorrido con el cursor: la caja de datos
 * sigue al mes más cercano en lugar de obligar a apuntar cada punto.
 */

const ALTO = 132;
const ANCHO = 760;

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function ruta(valores: number[], ancho: number, alto: number, max: number) {
  if (valores.length === 0) return { linea: "", area: "" };
  const paso = valores.length > 1 ? ancho / (valores.length - 1) : 0;
  const y = (v: number) => alto - (max > 0 ? (v / max) * alto : 0);

  const linea = valores
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i * paso).toFixed(1)} ${y(v).toFixed(1)}`)
    .join(" ");
  return { linea, area: `${linea} L${ancho} ${alto} L0 ${alto} Z` };
}

function etiquetaMes(mes: string) {
  const [a, m] = mes.split("-");
  return `${MESES[Number(m) - 1] ?? m} ${a.slice(2)}`;
}

export function SerieChart({
  serie,
  centros,
}: {
  serie: PuntoSerie[];
  centros: Centro[];
}) {
  const [activo, setActivo] = useState<number | null>(null);

  if (serie.length === 0) {
    return (
      <p className="rounded-2xl border border-hairline bg-surface p-7 text-sm text-ink-soft">
        No hay registros con fecha legible para construir la serie.
      </p>
    );
  }

  const totales = serie.map((p) => p.total);
  const maxTotal = Math.max(...totales);
  const { linea, area } = ruta(totales, ANCHO, ALTO, maxTotal);
  const picoIdx = totales.indexOf(maxTotal);
  const paso = serie.length > 1 ? ANCHO / (serie.length - 1) : 0;

  /* Longitud aproximada del trazo, para que el dibujado no se corte. */
  const largo = Math.round(ANCHO * 1.6);
  const punto = activo === null ? null : serie[activo];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-hairline bg-surface p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-semibold text-heading">Registros por mes</h2>
          <p className="text-xs text-ink-soft">
            {punto ? (
              <>
                <strong className="text-heading">{etiquetaMes(punto.mes)}</strong>:{" "}
                <strong className="text-heading">
                  {punto.total.toLocaleString("es-CO")}
                </strong>{" "}
                registros
              </>
            ) : (
              <>
                Máximo:{" "}
                <strong className="text-heading">
                  {maxTotal.toLocaleString("es-CO")}
                </strong>{" "}
                en {etiquetaMes(serie[picoIdx].mes)}
              </>
            )}
          </p>
        </div>

        <svg
          viewBox={`0 -6 ${ANCHO} ${ALTO + 12}`}
          className="mt-5 w-full"
          style={{ height: "10rem" }}
          role="img"
          aria-label={`Registros por mes, de ${etiquetaMes(serie[0].mes)} a ${etiquetaMes(serie[serie.length - 1].mes)}. Máximo de ${maxTotal} registros.`}
          onMouseLeave={() => setActivo(null)}
        >
          <defs>
            <linearGradient id="serie-relleno" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2f8ba3" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#2f8ba3" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((g) => (
            <line
              key={g}
              x1="0"
              x2={ANCHO}
              y1={ALTO - g * ALTO}
              y2={ALTO - g * ALTO}
              stroke="currentColor"
              className="text-hairline"
              strokeWidth="1"
              strokeDasharray="2 5"
            />
          ))}

          <path d={area} fill="url(#serie-relleno)" className="admin-area" />
          <path
            d={linea}
            fill="none"
            stroke="#2f8ba3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="admin-linea"
            style={{ ["--largo" as string]: String(largo) }}
          />

          {/* Guía vertical del mes bajo el cursor. */}
          {activo === null ? null : (
            <line
              x1={activo * paso}
              x2={activo * paso}
              y1="0"
              y2={ALTO}
              stroke="#2f8ba3"
              strokeWidth="1"
              strokeOpacity="0.35"
            />
          )}

          {serie.map((p, i) => {
            const cy = ALTO - (maxTotal > 0 ? (p.total / maxTotal) * ALTO : 0);
            const resaltado = i === activo;
            return (
              <g key={p.mes}>
                <circle
                  cx={i * paso}
                  cy={cy}
                  r={resaltado ? 6 : i === picoIdx ? 4.5 : 3}
                  fill={resaltado || i === picoIdx ? "#285c6d" : "#2f8ba3"}
                  stroke="var(--color-surface)"
                  strokeWidth="2"
                  className="admin-punto"
                />
                {/*
                  Zona sensible ancha e invisible: apuntar a un círculo de 3 px
                  con el ratón es incómodo, así que cada mes reclama su franja.
                */}
                <rect
                  x={i * paso - paso / 2}
                  y={-6}
                  width={paso || ANCHO}
                  height={ALTO + 12}
                  fill="transparent"
                  onMouseEnter={() => setActivo(i)}
                >
                  <title>{`${etiquetaMes(p.mes)}: ${p.total} registros`}</title>
                </rect>
              </g>
            );
          })}
        </svg>

        <div className="mt-2 flex justify-between text-[0.68rem] text-ink-soft">
          {serie.map((p, i) =>
            i === 0 || i === serie.length - 1 || i === picoIdx || i === activo ? (
              <span key={p.mes} className={i === activo ? "font-semibold text-heading" : ""}>
                {etiquetaMes(p.mes)}
              </span>
            ) : (
              <span key={p.mes} aria-hidden />
            ),
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-hairline bg-surface p-7">
        <h2 className="font-semibold text-heading">Actividad por centro</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft dark:text-body">
          Cada panel usa su propia escala, así que muestran cuándo estuvo activo
          cada centro, no cuánto aporta. El volumen se compara en la tabla.
        </p>

        <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {centros.map((c) => {
            const vals = serie.map((p) => p[c] ?? 0);
            const max = Math.max(...vals, 0);
            const total = vals.reduce((a, b) => a + b, 0);
            const mini = ruta(vals, 200, 40, max);
            return (
              <div key={c} className="group">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-heading">{c}</span>
                  <span className="text-xs text-ink-soft tabular-nums">
                    {total.toLocaleString("es-CO")} · pico {max}
                  </span>
                </div>
                <svg
                  viewBox="0 -3 200 46"
                  className="mt-2 w-full"
                  style={{ height: "3rem" }}
                  role="img"
                  aria-label={`${c}: ${total} registros, máximo mensual de ${max}.`}
                >
                  <path
                    d={mini.area}
                    fill="#5dc3da"
                    fillOpacity="0.18"
                    className="admin-area transition-[fill-opacity] duration-200 group-hover:fill-opacity-30"
                  />
                  <path
                    d={mini.linea}
                    fill="none"
                    stroke="#2f8ba3"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="admin-linea"
                    style={{ ["--largo" as string]: "400" }}
                  />
                </svg>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
