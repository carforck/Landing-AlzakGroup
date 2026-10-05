import type { ReactNode } from "react";
import { CircleHelp, Lightbulb } from "lucide-react";
import { MenuTarjeta } from "./MenuTarjeta";

/**
 * Gráficas del portal, con el lenguaje de Cloudflare Radar (radar.cloudflare.com,
 * sección Tráfico), que es la referencia pedida:
 *
 *  - Tarjeta: título grande, subtítulo gris que dice qué se mide, y junto a él
 *    la ayuda "?", el enlace y el menú "⋯". Al pie, una nota con bombilla.
 *  - Leyenda con la cifra grande debajo de cada serie.
 *  - Medio anillo para pares (Móvil/Escritorio en Radar; aquí Mujeres/Hombres
 *    o Fumadores/No fumadores).
 *  - Tablas top con filas cebra, posición y porcentaje en negrita.
 *
 * Todo se pinta en el servidor salvo lo que sigue al cursor (series y áreas) y
 * el menú. El color de la empresa (`--t-*`) es el de las series; el nivel de
 * riesgo usa siempre el semáforo `riesgo-*`, para leerse igual en todas.
 */

export type Conteo = { etiqueta: string; n: number };

export const fmt = (n: number) => n.toLocaleString("es-CO");
export const pctTxt = (n: number, total: number) =>
  `${(total ? (n / total) * 100 : 0).toFixed(1).replace(".", ",")} %`;

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];
export function fechaLarga(iso: string) {
  const [a, m, d] = iso.split("-");
  return `${+d} ${MESES[+m - 1]} ${a}`;
}

/** Serie oscura y clara de la empresa, como el azul y el celeste de Radar. */
export const COLOR = {
  fuerte: "var(--t-primario)",
  claro: "var(--t-claro)",
  acento: "var(--t-acento)",
  neutro: "#b5b1b0",
};

export const COLORES_NIVEL: Record<string, string> = {
  "Riesgo bajo": "var(--color-riesgo-bajo)",
  "Riesgo moderado": "var(--color-riesgo-moderado)",
  "Riesgo alto": "var(--color-riesgo-alto)",
};

export type Descarga = { nombre: string; columnas: string[]; filas: (string | number)[][] };

export function Tarjeta({
  id,
  titulo,
  subtitulo,
  ayuda,
  nota,
  derecha,
  descarga,
  children,
  className = "",
}: {
  id: string;
  titulo: string;
  subtitulo?: string;
  ayuda?: string;
  /** Recuadro con bombilla al pie: cómo leer la gráfica o de dónde sale. */
  nota?: ReactNode;
  /** Control a la derecha del título (en Radar, «Métrica» o «Tipo de tráfico»). */
  derecha?: ReactNode;
  descarga?: Descarga;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-6 rounded-xl border border-hairline bg-surface p-6 lg:p-7 ${className}`}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-heading">{titulo}</h2>
          {subtitulo || ayuda ? (
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[0.95rem] leading-snug text-ink-soft">
              {subtitulo}
              {ayuda ? (
                <span className="group relative inline-flex align-middle" tabIndex={0} aria-label={ayuda}>
                  <CircleHelp className="size-4" strokeWidth={2} />
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute top-full left-1/2 z-30 mt-2 hidden w-72 -translate-x-1/2 rounded-lg bg-gris-900 px-3 py-2 text-xs leading-relaxed text-white shadow-lg group-hover:block group-focus:block"
                  >
                    {ayuda}
                  </span>
                </span>
              ) : null}
              <MenuTarjeta ancla={id} descarga={descarga} />
            </p>
          ) : null}
        </div>
        {derecha}
      </header>
      <div className="mt-6">{children}</div>
      {nota ? (
        <p className="mt-6 flex items-start gap-3 rounded-lg bg-[var(--t-suave)] px-4 py-3 text-[0.8rem] leading-relaxed text-heading">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-ink-soft" strokeWidth={2} />
          <span>{nota}</span>
        </p>
      ) : null}
    </section>
  );
}

export function SinDatos() {
  return <p className="py-10 text-center text-sm text-ink-soft">Sin registros para estos filtros.</p>;
}

/** Leyenda de Radar: trazo de color y nombre, y debajo la cifra grande. */
export function LeyendaValores({ items }: { items: { etiqueta: string; color: string; valor: string; tachado?: boolean }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-3">
      {items.map((i) => (
        <li key={i.etiqueta} className={i.tachado ? "opacity-40" : ""}>
          <span className="inline-flex items-center gap-2 text-sm text-ink-soft">
            <span className="h-[3px] w-5 rounded-full" style={{ background: i.color }} />
            {i.etiqueta}
          </span>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-heading">{i.valor}</p>
        </li>
      ))}
    </ul>
  );
}

/**
 * Medio anillo con dos partes, como los de Móvil/Escritorio y Humano/Bot del
 * resumen de Radar: la primera parte arriba, en el color fuerte; la segunda
 * abajo, en el claro.
 */
export function MedioAnillo({
  a,
  b,
}: {
  a: { etiqueta: string; n: number };
  b: { etiqueta: string; n: number };
}) {
  const total = a.n + b.n;
  const f = total ? a.n / total : 0;
  const R = 40;
  const largo = Math.PI * R;
  return (
    <div className="flex flex-col items-center text-center">
      <p className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
        <span className="size-2.5 rounded-full" style={{ background: COLOR.fuerte }} />
        {a.etiqueta}
      </p>
      <p className="text-xl font-bold tabular-nums text-heading">{pctTxt(a.n, total)}</p>
      <svg viewBox="0 0 100 54" className="mt-2 w-24" role="img" aria-label={`${a.etiqueta} ${pctTxt(a.n, total)}, ${b.etiqueta} ${pctTxt(b.n, total)}`}>
        <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke={COLOR.claro} strokeWidth="16" />
        <path
          d="M10 50 A40 40 0 0 1 90 50"
          fill="none"
          stroke={COLOR.fuerte}
          strokeWidth="16"
          strokeDasharray={`${f * largo} ${largo}`}
        />
      </svg>
      <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-ink-soft">
        <span className="size-2.5 rounded-full" style={{ background: COLOR.claro }} />
        {b.etiqueta}
      </p>
      <p className="text-xl font-bold tabular-nums text-heading">{pctTxt(b.n, total)}</p>
    </div>
  );
}

/** Tabla top de Radar: filas cebra, posición, nombre y valor en negrita. */
export function TablaTop({
  filas,
  encabezado,
}: {
  filas: { etiqueta: string; valor: string; detalle?: string }[];
  encabezado?: [string, string];
}) {
  if (!filas.length) return <SinDatos />;
  return (
    <table className="w-full table-fixed text-sm">
        {/* Anchos fijos para posición y valor: el nombre se queda con el resto. */}
        <colgroup>
          <col className="w-10" />
          <col />
          <col className="w-24" />
        </colgroup>
      {encabezado ? (
        <thead>
          <tr className="text-left text-heading">
            <th scope="col" className="w-8 pb-2" />
            <th scope="col" className="pb-2 font-semibold">{encabezado[0]}</th>
            <th scope="col" className="pb-2 text-right font-semibold">{encabezado[1]}</th>
          </tr>
        </thead>
      ) : null}
      <tbody>
        {filas.map((f, i) => (
          <tr key={f.etiqueta} className="odd:bg-surface-muted">
            <td className="rounded-l-md py-1.5 pl-2.5 text-heading tabular-nums">{i + 1}.</td>
            <td className="max-w-0 truncate py-1.5 pr-3 text-[var(--t-primario)]" title={f.detalle ?? f.etiqueta}>
              {f.etiqueta}
            </td>
            <td className="rounded-r-md py-1.5 pr-2.5 text-right font-semibold whitespace-nowrap tabular-nums text-heading">{f.valor}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Mini serie del resumen, sin ejes: sólo la forma. */
export function MiniSerie({ valores, anterior }: { valores: number[]; anterior?: number[] | null }) {
  if (valores.length < 2) return <SinDatos />;
  const max = Math.max(1, ...valores, ...(anterior ?? []));
  const W = 400;
  const H = 90;
  const d = (v: number[]) => v.map((n, i) => `${i ? "L" : "M"}${((i / (v.length - 1)) * W).toFixed(1)} ${(H - (n / max) * H).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-24 w-full" aria-hidden>
      <line x1={0} x2={W} y1={H - 0.5} y2={H - 0.5} stroke="var(--color-hairline)" vectorEffect="non-scaling-stroke" />
      {anterior ? <path d={d(anterior)} fill="none" stroke={COLOR.neutro} strokeWidth={1.5} strokeDasharray="4 3" vectorEffect="non-scaling-stroke" /> : null}
      <path d={d(valores)} fill="none" stroke={COLOR.fuerte} strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Columnas sobre cuadrícula, con el valor exacto al pasar el cursor. */
export function Histograma({ datos, alto = 220, unidad }: { datos: Conteo[]; alto?: number; unidad?: string }) {
  if (!datos.length) return <SinDatos />;
  const max = Math.max(...datos.map((d) => d.n), 1);
  const cadaCuanto = Math.max(1, Math.ceil(datos.length / 7));
  return (
    <div>
      <div className="relative" style={{ height: alto }}>
        {[0.25, 0.5, 0.75].map((f) => (
          <div key={f} className="absolute inset-x-0 border-t border-dashed border-hairline" style={{ bottom: `${f * 100}%` }} aria-hidden />
        ))}
        <div className="absolute inset-0 flex items-end gap-[3px] border-b border-gris-300" role="img" aria-label="Histograma">
          {datos.map((d) => (
            <div key={d.etiqueta} className="group relative flex h-full flex-1 items-end">
              <div
                className="w-full rounded-t-[2px] bg-[var(--t-primario)] transition-opacity group-hover:opacity-80"
                style={{ height: `${(d.n / max) * 100}%`, minHeight: d.n ? 2 : 0 }}
              />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 rounded-lg border border-hairline bg-surface px-2.5 py-1.5 text-xs whitespace-nowrap shadow-lg group-hover:block">
                <span className="text-ink-soft">
                  {d.etiqueta}
                  {unidad ? ` ${unidad}` : ""}
                </span>
                <strong className="ml-2 tabular-nums text-heading">{fmt(d.n)}</strong>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex gap-[3px]">
        {datos.map((d, i) => (
          <span key={d.etiqueta} className="flex-1 truncate text-center text-[0.68rem] text-ink-soft">
            {i % cadaCuanto === 0 || i === datos.length - 1 ? d.etiqueta.split("–")[0] : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Barra 100 % de una sola fila, para pares y tríos sin dimensión de tiempo. */
export function BarraPartes({ datos, colores }: { datos: Conteo[]; colores?: Record<string, string> }) {
  if (!datos.length) return <SinDatos />;
  const total = datos.reduce((s, d) => s + d.n, 0);
  const paleta = [COLOR.fuerte, COLOR.claro, COLOR.acento, COLOR.neutro];
  const color = (d: Conteo, i: number) => colores?.[d.etiqueta] ?? paleta[i % paleta.length];
  return (
    <div>
      <LeyendaValores items={datos.map((d, i) => ({ etiqueta: d.etiqueta, color: color(d, i), valor: pctTxt(d.n, total) }))} />
      <div className="mt-4 flex h-9 overflow-hidden rounded-md" role="img" aria-label={datos.map((d) => `${d.etiqueta} ${pctTxt(d.n, total)}`).join(", ")}>
        {datos.map((d, i) => (
          <div
            key={d.etiqueta}
            className="group relative h-full"
            style={{ width: `${total ? (d.n / total) * 100 : 0}%`, background: color(d, i) }}
          >
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 rounded-lg border border-hairline bg-surface px-2.5 py-1.5 text-xs whitespace-nowrap shadow-lg group-hover:block">
              {d.etiqueta} <strong className="ml-1 tabular-nums text-heading">{fmt(d.n)}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Riesgo contra paquetes-año de los fumadores, un panel por sexo, como el
 * `px.scatter(..., facet_col="sexo")` del tablero original.
 */
export function Dispersion({
  puntos,
  topeX,
}: {
  puntos: { x: number; y: number; nivel: string; sexo: string }[];
  /** Tope del eje X. Lo que pasa de ahí se dibuja contra el borde derecho. */
  topeX?: number;
}) {
  if (!puntos.length) return <SinDatos />;
  const sexos = [...new Set(puntos.map((p) => p.sexo || "Sin dato"))].sort();
  const maxReal = Math.max(...puntos.map((p) => p.x), 1);
  const maxX = Math.max(1, Math.min(maxReal, topeX ?? maxReal));
  const fuera = puntos.filter((p) => p.x > maxX).length;
  const W = 320;
  const H = 200;
  return (
    <div>
      <LeyendaValores
        items={Object.entries(COLORES_NIVEL).map(([k, c]) => ({
          etiqueta: k,
          color: c,
          valor: fmt(puntos.filter((p) => p.nivel === k).length),
        }))}
      />
      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        {sexos.map((s) => (
          <figure key={s}>
            <figcaption className="mb-2 text-sm font-semibold text-heading">Sexo {s}</figcaption>
            <div className="flex gap-2">
              <div className="flex flex-col justify-between text-right text-[0.68rem] text-ink-soft" aria-hidden>
                <span>100 %</span>
                <span>50 %</span>
                <span>0 %</span>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full flex-1" role="img" aria-label={`Riesgo contra paquetes-año, sexo ${s}`}>
                {[0.25, 0.5, 0.75].map((f) => (
                  <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke="var(--color-hairline)" strokeDasharray="3 4" />
                ))}
                <line x1={0} x2={W} y1={H - 0.5} y2={H - 0.5} stroke="var(--color-gris-300, #c9c4c3)" />
                {puntos
                  .filter((p) => (p.sexo || "Sin dato") === s)
                  .map((p, i) => (
                    <circle
                      key={i}
                      cx={6 + (Math.min(p.x, maxX) / maxX) * (W - 12)}
                      cy={H - 6 - p.y * (H - 12)}
                      r={3.2}
                      fill={COLORES_NIVEL[p.nivel] ?? COLOR.fuerte}
                      fillOpacity={0.65}
                    />
                  ))}
              </svg>
            </div>
            <div className="mt-1 ml-9 flex justify-between text-[0.68rem] text-ink-soft">
              <span>0</span>
              <span>
                {Math.round(maxX)}
                {fuera ? "+" : ""} paquetes-año
              </span>
            </div>
          </figure>
        ))}
      </div>
      {fuera ? (
        <p className="mt-3 text-xs text-ink-soft">
          {fuera} {fuera === 1 ? "registro pasa" : "registros pasan"} de {Math.round(maxX)} paquetes-año y se dibuja
          {fuera === 1 ? "" : "n"} contra el borde: casi siempre son errores de captura.
        </p>
      ) : null}
    </div>
  );
}

export const CLASE_NIVEL: Record<string, string> = {
  "Riesgo bajo": "bg-riesgo-bajo",
  "Riesgo moderado": "bg-riesgo-moderado",
  "Riesgo alto": "bg-riesgo-alto",
};

export function Insignia({ nivel }: { nivel: string | null }) {
  if (!nivel) return <span className="text-ink-soft">·</span>;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-white ${CLASE_NIVEL[nivel] ?? "bg-gris-500"}`}>
      {nivel.replace("Riesgo ", "")}
    </span>
  );
}
