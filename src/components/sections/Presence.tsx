"use client";

import { useCallback, useRef, useState } from "react";
import { presence } from "../../content/site";
import { MallaOndas } from "../MallaOndas";
import { COLOR_CATEGORIA, geometriaGlobo, PresenceGlobe } from "../PresenceGlobe";

type Categoria = (typeof presence.categorias)[number]["clave"];

/**
 * Presencia de ALZAK, justo bajo el hero: título, globo y leyenda, con la
 * composición de la portada de cloudflare.com.
 *
 * El 2026-10-22 Carlos pidió quitar el párrafo y las cuatro cifras con líneas
 * que iban sobre el globo, y dejar sólo tres categorías (sede principal,
 * colaboración en LATAM y nueva sede).
 *
 * La leyenda va debajo y filtra: al pasar o pulsar una categoría, el resto de
 * puntos y arcos se atenúa.
 */
export function Presence() {
  const [resaltada, setResaltada] = useState<Categoria | null>(null);
  const globo = useRef<HTMLDivElement>(null);
  const seccion = useRef<HTMLElement>(null);
  const cuenta = (c: Categoria) => presence.lugares.filter((l) => l.categoria === c).length;

  // Las ondas del fondo nacen en el centro del globo, en coordenadas de la sección.
  const origen = useCallback(() => {
    const s = seccion.current?.getBoundingClientRect();
    const g = globo.current?.getBoundingClientRect();
    if (!s || !g) return null;
    const { cx, cy } = geometriaGlobo(g.width);
    return { x: g.left - s.left + cx, y: g.top - s.top + cy };
  }, []);

  return (
    <section
      ref={seccion}
      id="presencia"
      aria-labelledby="presencia-titulo"
      className="relative isolate overflow-hidden pt-16 lg:pt-20"
    >
      <MallaOndas origen={origen} />
      <div className="shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow justify-center">{presence.eyebrow}</p>
          <h2 id="presencia-titulo" className="display mt-5 text-[2rem] sm:text-[2.5rem]">
            {presence.title}
          </h2>
        </div>
      </div>

      <div className="relative mx-auto mt-10 max-w-[72rem] px-4">
        <div ref={globo} className="relative">
          <PresenceGlobe resaltada={resaltada} />
        </div>
      </div>

      <div className="shell relative -mt-4 pb-8 md:-mt-24">
        {/* En móvil, una sola fila que se desliza si no cabe. */}
        <ul
          className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-auto md:max-w-4xl md:flex-wrap md:justify-center md:overflow-visible md:px-0 md:pb-0"
          aria-label="Categorías de presencia"
        >
          {presence.categorias.map((c) => {
            const activa = resaltada === c.clave;
            return (
              <li key={c.clave} className="shrink-0 snap-start">
                <button
                  type="button"
                  aria-pressed={activa}
                  onMouseEnter={() => setResaltada(c.clave)}
                  onMouseLeave={() => setResaltada(null)}
                  onFocus={() => setResaltada(c.clave)}
                  onBlur={() => setResaltada(null)}
                  onClick={() => setResaltada(activa ? null : c.clave)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm whitespace-nowrap transition-colors ${
                    activa
                      ? "border-menta-400 bg-menta-50 text-heading dark:bg-menta-900/30"
                      : "border-hairline bg-surface text-ink-soft hover:text-heading"
                  }`}
                >
                  <span className="size-2.5 rounded-full" style={{ background: COLOR_CATEGORIA[c.clave] }} />
                  {c.etiqueta}
                  <span className="font-semibold tabular-nums text-heading">{cuenta(c.clave)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
