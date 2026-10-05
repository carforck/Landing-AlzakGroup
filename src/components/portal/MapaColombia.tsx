"use client";

import { useRef, useState, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { ALTO, ANCHO, DEPARTAMENTOS, MUNICIPIOS } from "../../lib/geo-colombia";

/**
 * «Distribución geográfica» al estilo de Cloudflare Radar: mapa coroplético
 * con rampa de un solo tono, bordes finos, zoom con + y −, leyenda en barra
 * degradada debajo y, a la derecha, la tabla cebra paginada de 20 en 20.
 *
 * Dos vistas, con el selector de la cabecera como el de «Métrica» en Radar:
 *  - Departamento: cada departamento se pinta según su parte de los registros.
 *  - Municipio: un círculo por municipio, con el área proporcional al número
 *    de registros (radio = raíz), sobre los departamentos en gris. El radio
 *    lineal exageraría los grandes: Medellín taparía medio Antioquia.
 *
 * San Andrés queda a 700 km del continente; como los territorios pequeños de
 * Radar, va como un círculo en un recuadro arriba a la izquierda, y sólo
 * cuando la empresa tiene registros allí.
 */

type Dep = { codigo: string; nombre: string; n: number };
type Mun = { codigo: string; nombre: string; departamento: string; n: number };

const POR_PAGINA = 20;
const fmt = (n: number) => n.toLocaleString("es-CO");
const pct = (n: number, t: number) => `${(t ? (n / t) * 100 : 0).toFixed(1).replace(".", ",")} %`;

/** Rampa de Radar: de casi blanco al color de la empresa. `f` entre 0 y 1. */
const rampa = (f: number) =>
  `color-mix(in srgb, var(--t-primario) ${Math.round(8 + f * 92)}%, #f2f6fc)`;

export function MapaColombia({
  departamentos,
  municipios,
  total,
  sinUbicacion,
}: {
  departamentos: Dep[];
  municipios: Mun[];
  total: number;
  sinUbicacion: number;
}) {
  const [vista, setVista] = useState<"departamento" | "municipio">("departamento");
  const [zoom, setZoom] = useState(1);
  const [centro, setCentro] = useState<[number, number]>([ANCHO / 2, ALTO / 2]);
  const [foco, setFoco] = useState<{ x: number; y: number; ancho: number; titulo: string; detalle: string } | null>(null);
  const [pagina, setPagina] = useState(0);
  const arrastre = useRef<{ x: number; y: number; c: [number, number] } | null>(null);
  const lienzo = useRef<HTMLDivElement>(null);

  const porCodigo = new Map(departamentos.map((d) => [d.codigo, d]));
  const maxDep = Math.max(1, ...departamentos.map((d) => d.n));
  const maxMun = Math.max(1, ...municipios.map((m) => m.n));
  const maxPct = (vista === "departamento" ? maxDep : maxMun) / Math.max(1, total);

  const w = ANCHO / zoom;
  const h = ALTO / zoom;
  const caja = `${centro[0] - w / 2} ${centro[1] - h / 2} ${w} ${h}`;

  const acercar = (factor: number) => {
    setZoom((z) => {
      const nz = Math.min(6, Math.max(1, z * factor));
      if (nz === 1) setCentro([ANCHO / 2, ALTO / 2]);
      return nz;
    });
  };

  const bajar = (e: PointerEvent<HTMLDivElement>) => {
    if (zoom === 1) return;
    arrastre.current = { x: e.clientX, y: e.clientY, c: centro };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const mover = (e: PointerEvent<HTMLDivElement>) => {
    const a = arrastre.current;
    if (!a || !lienzo.current) return;
    const escala = w / lienzo.current.clientWidth;
    setCentro([a.c[0] - (e.clientX - a.x) * escala, a.c[1] - (e.clientY - a.y) * escala]);
  };
  const soltar = () => (arrastre.current = null);

  const mostrar = (e: React.MouseEvent, titulo: string, detalle: string) => {
    const r = lienzo.current?.getBoundingClientRect();
    if (!r) return;
    setFoco({ x: e.clientX - r.left, y: e.clientY - r.top, ancho: r.width, titulo, detalle });
  };

  const filas = vista === "departamento" ? departamentos : municipios;
  const paginas = Math.max(1, Math.ceil(filas.length / POR_PAGINA));
  const vistaFilas = filas.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA);
  const sanAndres = porCodigo.get("88");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <label className="inline-flex items-center gap-3 text-sm font-semibold text-heading">
          Ubicación
          <select
            value={vista}
            onChange={(e) => {
              setVista(e.target.value as typeof vista);
              setPagina(0);
              setFoco(null);
            }}
            className="h-10 rounded-lg border border-hairline bg-surface px-3 text-sm font-normal text-heading outline-none focus:border-[var(--t-primario)]"
          >
            <option value="departamento">Departamento</option>
            <option value="municipio">Municipio</option>
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <div
            ref={lienzo}
            className={`relative overflow-hidden rounded-lg bg-surface ${zoom > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
            style={{ aspectRatio: `${ANCHO} / ${ALTO}`, maxHeight: 620, marginInline: "auto" }}
            onPointerDown={bajar}
            onPointerMove={mover}
            onPointerUp={soltar}
            onPointerLeave={() => {
              soltar();
              setFoco(null);
            }}
          >
            <svg viewBox={caja} className="h-full w-full touch-none" role="img" aria-label={`Mapa de Colombia: registros por ${vista}`}>
              {DEPARTAMENTOS.filter((d) => d.d).map((d) => {
                const dato = porCodigo.get(d.codigo);
                const relleno =
                  vista === "municipio" ? "#f2f4f7" : dato ? rampa(dato.n / maxDep) : "#f5f7fa";
                return (
                  <path
                    key={d.codigo}
                    d={d.d}
                    fill={relleno}
                    stroke="#4a4544"
                    strokeWidth={0.7}
                    vectorEffect="non-scaling-stroke"
                    className={vista === "departamento" ? "transition-[fill] hover:brightness-95" : ""}
                    onMouseMove={
                      vista === "departamento"
                        ? (e) => mostrar(e, dato?.nombre ?? d.nombre.charAt(0) + d.nombre.slice(1).toLowerCase(), dato ? `${pct(dato.n, total)} · ${fmt(dato.n)} registros` : "Sin registros")
                        : undefined
                    }
                  />
                );
              })}
              {vista === "municipio"
                ? municipios
                    .filter((m) => MUNICIPIOS[m.codigo])
                    .slice()
                    .reverse()
                    .map((m) => {
                      const [x, y] = MUNICIPIOS[m.codigo];
                      return (
                        <circle
                          key={m.codigo}
                          cx={x}
                          cy={y}
                          r={(4 + Math.sqrt(m.n / maxMun) * 38) / Math.sqrt(zoom)}
                          fill="var(--t-primario)"
                          fillOpacity={0.55}
                          stroke="white"
                          strokeWidth={1}
                          vectorEffect="non-scaling-stroke"
                          onMouseMove={(e) => mostrar(e, `${m.nombre} · ${m.departamento}`, `${pct(m.n, total)} · ${fmt(m.n)} registros`)}
                        />
                      );
                    })
                : null}
            </svg>

            {/*
              San Andrés queda fuera de la caja continental. Sólo se muestra si
              tiene registros: vacío era un recuadro que no decía nada.
            */}
            {sanAndres ? (
              <div className="pointer-events-auto absolute top-3 left-3 flex items-center gap-2 rounded-md border border-hairline bg-surface/90 px-2.5 py-1.5 text-[0.7rem] text-ink-soft">
                <span
                  className="size-3 rounded-full border border-[#4a4544]"
                  style={{ background: rampa(sanAndres.n / maxDep) }}
                  onMouseMove={(e) => mostrar(e, "San Andrés y Providencia", `${pct(sanAndres.n, total)} · ${fmt(sanAndres.n)} registros`)}
                />
                San Andrés
              </div>
            ) : null}

            <div className="absolute right-3 bottom-3 flex flex-col overflow-hidden rounded-md border border-hairline bg-surface shadow-sm">
              <button type="button" onClick={() => acercar(1.6)} aria-label="Acercar" className="inline-flex size-9 items-center justify-center text-heading hover:bg-surface-muted">
                <Plus className="size-4" strokeWidth={2.5} />
              </button>
              <button type="button" onClick={() => acercar(1 / 1.6)} aria-label="Alejar" disabled={zoom === 1} className="inline-flex size-9 items-center justify-center border-t border-hairline text-heading hover:bg-surface-muted disabled:opacity-35">
                <Minus className="size-4" strokeWidth={2.5} />
              </button>
            </div>

            {foco ? (
              <div
                className="pointer-events-none absolute z-10 rounded-lg border border-hairline bg-surface px-3 py-2 text-xs shadow-lg"
                style={{ left: Math.min(foco.x + 14, foco.ancho - 190), top: Math.max(4, foco.y - 50) }}
              >
                <p className="font-semibold text-heading">{foco.titulo}</p>
                <p className="mt-0.5 tabular-nums text-ink-soft">{foco.detalle}</p>
              </div>
            ) : null}
          </div>

          {/* Leyenda en barra degradada, como «0 % · Tráfico · 31 %». */}
          <div className="mx-auto mt-4 max-w-sm">
            <div className="relative h-6 overflow-hidden rounded-sm" style={{ background: `linear-gradient(90deg, ${rampa(0)}, ${rampa(0.5)}, ${rampa(1)})` }}>
              <span className="absolute top-1/2 left-2 -translate-y-1/2 text-[0.7rem] font-bold text-heading">0 %</span>
              <span className="absolute top-1/2 right-2 -translate-y-1/2 text-[0.7rem] font-bold text-white">{pct(maxPct, 1)}</span>
            </div>
            <div className="flex justify-between px-px" aria-hidden>
              {Array.from({ length: 11 }, (_, i) => (
                <span key={i} className="h-1.5 w-px bg-gris-400" />
              ))}
            </div>
            <p className="mt-1 text-center text-xs font-semibold text-heading">Porcentaje de registros</p>
            {sinUbicacion ? (
              <p className="mt-2 text-center text-xs text-ink-soft">{fmt(sinUbicacion)} registros sin departamento no aparecen en el mapa.</p>
            ) : null}
          </div>
        </div>

        <div>
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-10" />
              <col />
              <col className="w-24" />
            </colgroup>
            <thead>
              <tr className="text-left text-heading">
                <th scope="col" className="pb-2" />
                <th scope="col" className="pb-2 font-semibold">{vista === "departamento" ? "Departamento" : "Municipio"}</th>
                <th scope="col" className="pb-2 text-right font-semibold">Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              {vistaFilas.map((f, i) => (
                <tr key={f.codigo} className="odd:bg-surface-muted">
                  <td className="rounded-l-md py-1.5 pl-2.5 tabular-nums text-heading">{pagina * POR_PAGINA + i + 1}.</td>
                  <td className="truncate py-1.5 pr-3 text-[var(--t-primario)]" title={"departamento" in f ? `${f.nombre} · ${f.departamento}` : f.nombre}>
                    {f.nombre}
                  </td>
                  <td className="rounded-r-md py-1.5 pr-2.5 text-right font-semibold tabular-nums text-heading">{pct(f.n, total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginas > 1 ? (
            <div className="mt-4 flex items-center gap-2">
              <button type="button" onClick={() => setPagina((p) => Math.max(0, p - 1))} disabled={pagina === 0} aria-label="Página anterior" className="inline-flex size-9 items-center justify-center rounded-md border border-hairline text-heading disabled:opacity-35">
                <ChevronLeft className="size-4" />
              </button>
              <button type="button" onClick={() => setPagina((p) => Math.min(paginas - 1, p + 1))} disabled={pagina === paginas - 1} aria-label="Página siguiente" className="inline-flex size-9 items-center justify-center rounded-md border border-hairline text-heading disabled:opacity-35">
                <ChevronRight className="size-4" />
              </button>
              <p className="ml-2 text-sm text-heading">
                Página <strong>{pagina + 1}</strong> de <strong>{paginas}</strong>
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
