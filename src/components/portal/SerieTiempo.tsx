"use client";

import { useMemo, useState, type PointerEvent, type ReactNode } from "react";

type Punto = { inicio: string; total: number; alto: number; moderado: number; bajo: number };
type Clave = "total" | "alto" | "moderado" | "bajo";

/**
 * Series de tiempo con el lenguaje de Cloudflare Radar («Tendencias del
 * tráfico», «Móvil vs. escritorio»):
 *
 *  - Leyenda con el nombre y, debajo, la cifra grande del período. En la de
 *    líneas, cada entrada es además un interruptor.
 *  - Línea punteada «Anterior: fecha → fecha» con el período previo.
 *  - Cuadrícula vertical punteada en cada marca de tiempo y eje en la base.
 *  - Cruz que sigue al cursor con la caja de valores.
 *
 * El SVG se estira a lo ancho con trazo que no escala; puntos y caja van en
 * HTML encima, en porcentaje, para que no se deformen.
 */

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];
const W = 1000;
const H = 280;
const fmt = (n: number) => n.toLocaleString("es-CO");

function fecha(iso: string, conAno = false) {
  const [a, m, d] = iso.split("-");
  return `${+d} ${MESES[+m - 1]}${conAno ? ` ${a}` : ""}`;
}

/** Máximo redondo para que las cuatro divisiones caigan en números legibles. */
function techo(max: number) {
  if (max <= 4) return 4;
  const pot = 10 ** Math.floor(Math.log10(max));
  return [1, 2, 2.5, 5, 10].find((f) => f * pot * 4 >= max)! * pot * 4;
}

function useCursor(n: number) {
  const [foco, setFoco] = useState<number | null>(null);
  const mover = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setFoco(Math.round(t * (n - 1)));
  };
  return { foco, mover, salir: () => setFoco(null) };
}

/** Marco común: eje Y a la izquierda, área de dibujo, marcas de tiempo abajo. */
function Marco({
  etiquetasY,
  marcas,
  x,
  inicios,
  cursor,
  children,
  capa,
  etiqueta,
}: {
  etiquetasY: string[];
  marcas: number[];
  x: (i: number) => number;
  inicios: string[];
  cursor: ReturnType<typeof useCursor>;
  children: ReactNode;
  capa?: ReactNode;
  etiqueta: string;
}) {
  return (
    <div className="flex gap-2">
      <div className="relative w-11 shrink-0 text-right text-[0.7rem] tabular-nums text-ink-soft" style={{ height: H }} aria-hidden>
        {etiquetasY.map((t, i) => {
          const f = i / (etiquetasY.length - 1);
          return (
            <span
              key={i}
              className="absolute right-0 leading-none"
              style={{ top: `${f * 100}%`, transform: i === 0 ? "none" : i === etiquetasY.length - 1 ? "translateY(-100%)" : "translateY(-50%)" }}
            >
              {t}
            </span>
          );
        })}
      </div>
      <div className="min-w-0 flex-1">
        <div
          className="relative touch-none"
          style={{ height: H }}
          onPointerMove={cursor.mover}
          onPointerDown={cursor.mover}
          onPointerLeave={cursor.salir}
          role="img"
          aria-label={etiqueta}
        >
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            {[...new Set(marcas)].map((i) => (
              <line key={`v${i}`} x1={x(i)} x2={x(i)} y1={0} y2={H} stroke="var(--color-hairline)" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            ))}
            {children}
            <line x1={0} x2={W} y1={H - 0.5} y2={H - 0.5} stroke="var(--color-gris-300, #c9c4c3)" vectorEffect="non-scaling-stroke" />
            <line x1={0.5} x2={0.5} y1={0} y2={H} stroke="var(--color-gris-300, #c9c4c3)" vectorEffect="non-scaling-stroke" />
            {cursor.foco !== null ? (
              <line x1={x(cursor.foco)} x2={x(cursor.foco)} y1={0} y2={H} stroke="#6b6665" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            ) : null}
          </svg>
          {capa}
        </div>
        <div className="relative mt-2 h-4 text-[0.7rem] text-ink-soft" aria-hidden>
          {[...new Set(marcas)].map((i, n, arr) => (
            <span
              key={i}
              className="absolute whitespace-nowrap"
              style={{ left: `${(x(i) / W) * 100}%`, transform: n === 0 ? "none" : n === arr.length - 1 ? "translateX(-100%)" : "translateX(-50%)" }}
            >
              {fecha(inicios[i])}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Caja({ izquierda, titulo, filas }: { izquierda: number; titulo: string; filas: { etiqueta: string; color: string; valor: string; punteado?: boolean }[] }) {
  return (
    <div
      className="pointer-events-none absolute top-2 z-10 w-56 rounded-lg border border-hairline bg-surface p-3 text-xs shadow-lg"
      style={izquierda > 58 ? { right: `${100 - izquierda + 2}%` } : { left: `${izquierda + 2}%` }}
    >
      <p className="font-semibold text-heading">{titulo}</p>
      <ul className="mt-2 space-y-1.5">
        {filas.map((f) => (
          <li key={f.etiqueta} className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-ink-soft">
              <span className="h-[3px] w-3 rounded-full" style={{ background: f.punteado ? `repeating-linear-gradient(90deg, ${f.color} 0 3px, transparent 3px 5px)` : f.color }} />
              {f.etiqueta}
            </span>
            <span className="font-semibold tabular-nums text-heading">{f.valor}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function marcasDe(n: number) {
  return Array.from({ length: Math.min(n, 5) }, (_, i) => Math.round((i * (n - 1)) / Math.max(1, Math.min(n, 5) - 1)));
}

const LINEAS: { clave: Clave; etiqueta: string; color: string; ancho: number }[] = [
  { clave: "total", etiqueta: "Total de registros", color: "var(--t-primario)", ancho: 2.25 },
  { clave: "alto", etiqueta: "Riesgo alto", color: "var(--color-riesgo-alto)", ancho: 1.75 },
  { clave: "moderado", etiqueta: "Riesgo moderado", color: "var(--color-riesgo-moderado)", ancho: 1.75 },
  { clave: "bajo", etiqueta: "Riesgo bajo", color: "var(--color-riesgo-bajo)", ancho: 1.75 },
];

export function SerieTiempo({
  serie,
  anterior,
  rangoAnterior,
  granularidad,
}: {
  serie: Punto[];
  anterior: number[] | null;
  rangoAnterior: { desde: string; hasta: string } | null;
  granularidad: "día" | "semana";
}) {
  const [activas, setActivas] = useState<Record<Clave, boolean>>({ total: true, alto: true, moderado: false, bajo: false });
  const cursor = useCursor(serie.length);

  const max = useMemo(
    () =>
      techo(
        Math.max(
          1,
          ...serie.flatMap((p) => LINEAS.filter((s) => activas[s.clave]).map((s) => p[s.clave])),
          ...(anterior && activas.total ? anterior : []),
        ),
      ),
    [serie, anterior, activas],
  );

  if (!serie.length) return <p className="py-10 text-center text-sm text-ink-soft">Sin registros para estos filtros.</p>;

  const x = (i: number) => (serie.length > 1 ? (i / (serie.length - 1)) * W : W / 2);
  const y = (v: number) => H - (v / max) * H;
  const ruta = (v: number[]) => v.map((n, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(n).toFixed(1)}`).join(" ");
  const suma = (k: Clave) => serie.reduce((s, p) => s + p[k], 0);
  const p = cursor.foco !== null ? serie[cursor.foco] : null;
  const izq = cursor.foco !== null ? (x(cursor.foco) / W) * 100 : 0;
  const ant = anterior && activas.total ? anterior : null;

  return (
    <div>
      <ul className="flex flex-wrap gap-x-6 gap-y-3">
        {LINEAS.map((s) => (
          <li key={s.clave}>
            <button
              type="button"
              aria-pressed={activas[s.clave]}
              onClick={() => setActivas((a) => ({ ...a, [s.clave]: !a[s.clave] }))}
              className={`text-left transition-opacity ${activas[s.clave] ? "" : "opacity-40"}`}
            >
              <span className="inline-flex items-center gap-2 text-sm text-ink-soft">
                <span className="h-[3px] w-5 rounded-full" style={{ background: s.color }} />
                <span className={activas[s.clave] ? "" : "line-through"}>{s.etiqueta}</span>
              </span>
              <span className="mt-0.5 block text-xl font-bold tabular-nums text-heading">{fmt(suma(s.clave))}</span>
            </button>
          </li>
        ))}
        {anterior && rangoAnterior ? (
          <li className={activas.total ? "" : "opacity-40"}>
            <span className="inline-flex items-center gap-2 text-sm text-ink-soft">
              <span className="h-[3px] w-5" style={{ background: "repeating-linear-gradient(90deg, #8a8483 0 4px, transparent 4px 7px)" }} />
              Anterior: {fecha(rangoAnterior.desde, true)} → {fecha(rangoAnterior.hasta, true)}
            </span>
            <span className="mt-0.5 block text-xl font-bold tabular-nums text-heading">{fmt(anterior.reduce((s, n) => s + n, 0))}</span>
          </li>
        ) : null}
      </ul>

      <div className="mt-6">
        <Marco
          etiquetasY={[4, 3, 2, 1, 0].map((i) => fmt((max / 4) * i))}
          marcas={marcasDe(serie.length)}
          x={x}
          inicios={serie.map((s) => s.inicio)}
          cursor={cursor}
          etiqueta={`Registros por ${granularidad}`}
          capa={
            p ? (
              <>
                {LINEAS.filter((s) => activas[s.clave]).map((s) => (
                  <span
                    key={s.clave}
                    className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                    style={{ left: `${izq}%`, top: `${(y(p[s.clave]) / H) * 100}%`, background: s.color }}
                  />
                ))}
                <Caja
                  izquierda={izq}
                  titulo={granularidad === "semana" ? `Semana del ${fecha(p.inicio, true)}` : fecha(p.inicio, true)}
                  filas={[
                    ...LINEAS.filter((s) => activas[s.clave]).map((s) => ({ etiqueta: s.etiqueta, color: s.color, valor: fmt(p[s.clave]) })),
                    ...(ant && cursor.foco !== null ? [{ etiqueta: "Período anterior", color: "#8a8483", valor: fmt(ant[cursor.foco]), punteado: true }] : []),
                  ]}
                />
              </>
            ) : null
          }
        >
          {[1, 2, 3].map((i) => (
            <line key={i} x1={0} x2={W} y1={(H / 4) * i} y2={(H / 4) * i} stroke="var(--color-hairline)" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
          ))}
          {ant ? <path d={ruta(ant)} fill="none" stroke="#8a8483" strokeWidth={1.75} strokeDasharray="5 4" vectorEffect="non-scaling-stroke" /> : null}
          {LINEAS.filter((s) => activas[s.clave])
            .reverse()
            .map((s) => (
              <path key={s.clave} d={ruta(serie.map((q) => q[s.clave]))} fill="none" stroke={s.color} strokeWidth={s.ancho} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            ))}
        </Marco>
      </div>
    </div>
  );
}

/**
 * Proporción de cada nivel de riesgo en el tiempo, apilada al 100 %, como
 * «Móvil vs. escritorio» o «Bots vs. usuarios humanos» en Radar. Los cubos sin
 * registros no tienen proporción y se saltan: el área une los vecinos.
 */
export function AreaNiveles({ serie: original, granularidad: g }: { serie: Punto[]; granularidad: "día" | "semana" }) {
  /*
   * Con datos diarios y pocos registros por día, la proporción salta de 0 a
   * 100 % entre un día y el siguiente y el área se vuelve dientes de sierra.
   * Radar no lo sufre porque cada punto agrega millones de solicitudes. Aquí,
   * pasado mes y medio de días, se agrupa por semana antes de calcularla.
   */
  const agrupar = g === "día" && original.length > 45;
  const serie = agrupar
    ? Array.from({ length: Math.ceil(original.length / 7) }, (_, k) => {
        const tramo = original.slice(k * 7, k * 7 + 7);
        return tramo.reduce(
          (a, p) => ({ ...a, total: a.total + p.total, alto: a.alto + p.alto, moderado: a.moderado + p.moderado, bajo: a.bajo + p.bajo }),
          { inicio: tramo[0].inicio, total: 0, alto: 0, moderado: 0, bajo: 0 },
        );
      })
    : original;
  const granularidad = agrupar ? "semana" : g;
  const conDatos = serie.filter((p) => p.total > 0);
  const cursor = useCursor(conDatos.length);
  if (conDatos.length < 2) return <p className="py-10 text-center text-sm text-ink-soft">No hay suficientes períodos con registros para ver la evolución.</p>;

  const x = (i: number) => (i / (conDatos.length - 1)) * W;
  const sumas = { bajo: 0, moderado: 0, alto: 0 };
  for (const p of conDatos) {
    sumas.bajo += p.bajo;
    sumas.moderado += p.moderado;
    sumas.alto += p.alto;
  }
  const totalNivel = sumas.bajo + sumas.moderado + sumas.alto || 1;

  // Pila de abajo hacia arriba: alto en la base, como el tono fuerte de Radar.
  const capas: { clave: "alto" | "moderado" | "bajo"; etiqueta: string; color: string }[] = [
    { clave: "alto", etiqueta: "Riesgo alto", color: "var(--color-riesgo-alto)" },
    { clave: "moderado", etiqueta: "Riesgo moderado", color: "var(--color-riesgo-moderado)" },
    { clave: "bajo", etiqueta: "Riesgo bajo", color: "var(--color-riesgo-bajo)" },
  ];
  const frac = (p: Punto, k: "alto" | "moderado" | "bajo") => {
    const t = p.alto + p.moderado + p.bajo;
    return t ? p[k] / t : 0;
  };
  const acumulado = (p: Punto, hasta: number) => capas.slice(0, hasta).reduce((s, c) => s + frac(p, c.clave), 0);
  const y = (f: number) => H - f * H;

  const p = cursor.foco !== null ? conDatos[cursor.foco] : null;
  const izq = cursor.foco !== null ? (x(cursor.foco) / W) * 100 : 0;

  return (
    <div>
      <ul className="flex flex-wrap gap-x-6 gap-y-3">
        {[...capas].reverse().map((c) => (
          <li key={c.clave}>
            <span className="inline-flex items-center gap-2 text-sm text-ink-soft">
              <span className="h-[3px] w-5 rounded-full" style={{ background: c.color }} />
              {c.etiqueta}
            </span>
            <span className="mt-0.5 block text-xl font-bold tabular-nums text-heading">
              {((sumas[c.clave] / totalNivel) * 100).toFixed(1).replace(".", ",")} %
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Marco
          etiquetasY={[100, 75, 50, 25, 0].map((v) => `${v} %`)}
          marcas={marcasDe(conDatos.length)}
          x={x}
          inicios={conDatos.map((q) => q.inicio)}
          cursor={cursor}
          etiqueta={`Proporción por nivel de riesgo, por ${granularidad}`}
          capa={
            p ? (
              <Caja
                izquierda={izq}
                titulo={`${granularidad === "semana" ? "Semana del " : ""}${fecha(p.inicio, true)} · ${fmt(p.total)} registros`}
                filas={[...capas].reverse().map((c) => ({
                  etiqueta: c.etiqueta,
                  color: c.color,
                  valor: `${(frac(p, c.clave) * 100).toFixed(1).replace(".", ",")} %`,
                }))}
              />
            ) : null
          }
        >
          {capas.map((c, k) => {
            const arriba = conDatos.map((q, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(acumulado(q, k + 1)).toFixed(1)}`).join(" ");
            const abajo = conDatos
              .map((q, i) => ({ q, i }))
              .reverse()
              .map(({ q, i }) => `L${x(i).toFixed(1)} ${y(acumulado(q, k)).toFixed(1)}`)
              .join(" ");
            return <path key={c.clave} d={`${arriba} ${abajo} Z`} fill={c.color} fillOpacity={0.9} />;
          })}
        </Marco>
      </div>
    </div>
  );
}
