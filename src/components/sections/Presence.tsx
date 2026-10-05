"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { presence } from "../../content/site";
import { CountUp } from "../CountUp";
import { MallaOndas } from "../MallaOndas";
import { COLOR_CATEGORIA, geometriaGlobo, PresenceGlobe } from "../PresenceGlobe";

type Categoria = (typeof presence.categorias)[number]["clave"];

/**
 * Presencia de ALZAK, bajo la tira de cifras del hero, con la composición de
 * la portada de cloudflare.com («Una red global en la nube como ninguna otra»):
 *
 *  - Cuatro cifras en columnas sobre el globo. De cada una baja una línea fina
 *    con un punto arriba que termina justo en la superficie del globo; las de
 *    los extremos son más largas porque ahí la esfera ya va cayendo.
 *  - Al entrar en pantalla las líneas crecen hacia abajo, las cifras cuentan y
 *    el texto aparece, columna por columna con un pequeño desfase.
 *
 * El largo de cada línea se mide con la misma geometría que dibuja el globo
 * (`geometriaGlobo`), así que acompaña cualquier ancho de pantalla.
 *
 * La leyenda va debajo y filtra: al pasar o pulsar una categoría, el resto de
 * puntos y arcos se atenúa.
 */
export function Presence() {
  const [resaltada, setResaltada] = useState<Categoria | null>(null);
  const [visto, setVisto] = useState(false);
  const [largos, setLargos] = useState<number[]>([]);
  const fila = useRef<HTMLDivElement>(null);
  const globo = useRef<HTMLDivElement>(null);
  const anclas = useRef<(HTMLSpanElement | null)[]>([]);
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

  useEffect(() => {
    const medir = () => {
      const g = globo.current?.getBoundingClientRect();
      if (!g) return;
      const { radio, cx, cy } = geometriaGlobo(g.width);
      setLargos(
        anclas.current.map((a) => {
          const r = a?.getBoundingClientRect();
          if (!r) return 0;
          const dx = r.left + r.width / 2 - g.left - cx;
          // Superficie de la esfera bajo esa columna; fuera del disco, hasta el ecuador.
          // Se limita al 85 % del radio: más afuera la esfera cae en picado y
          // la línea atravesaría medio globo.
          const d = Math.min(Math.abs(dx), radio * 0.85);
          const sup = cy - Math.sqrt(radio * radio - d * d);
          return Math.max(24, g.top + sup + 6 - (r.top + r.height / 2));
        }),
      );
    };
    // Primera medida en el siguiente fotograma, cuando el globo ya tiene ancho.
    const primera = requestAnimationFrame(medir);
    const ro = new ResizeObserver(medir);
    if (globo.current) ro.observe(globo.current);
    window.addEventListener("resize", medir);

    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisto(true), { threshold: 0.35 });
    if (fila.current) io.observe(fila.current);
    return () => {
      cancelAnimationFrame(primera);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("resize", medir);
    };
  }, []);

  return (
    <section ref={seccion} id="presencia" aria-labelledby="presencia-titulo" className="relative isolate overflow-hidden pt-16 lg:pt-20">
      <MallaOndas origen={origen} />
      <div className="shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow justify-center">{presence.eyebrow}</p>
          <h2 id="presencia-titulo" className="display mt-5 text-[2rem] sm:text-[2.5rem]">
            {presence.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-body">{presence.lead}</p>
        </div>
      </div>

      <div className="relative mx-auto mt-12 max-w-[72rem] px-4">
        {/*
          En móvil (2 × 2) las líneas cruzarían las cifras de abajo: sólo el punto.

          Cifras con su línea. La fila va encima del globo (z-10) y las líneas
          se dibujan por detrás del texto, de modo que la del extremo cruza el
          halo como en la referencia.
        */}
        <div ref={fila} data-visto={visto ? "si" : "no"} className="presencia-cifras relative z-10 mx-auto grid max-w-3xl grid-cols-2 gap-x-6 gap-y-8 px-2 md:grid-cols-4">
          {presence.cifras.map((c, i) => (
            <div key={c.etiqueta} className="relative pl-5" style={{ ["--retraso" as string]: `${i * 140}ms` }}>
              <span
                ref={(n) => {
                  anclas.current[i] = n;
                }}
                aria-hidden
                className="presencia-punto absolute top-3 left-0 size-2 -translate-x-1/2 rounded-full bg-menta-500"
              />
              <span
                aria-hidden
                className="presencia-linea absolute top-3 left-0 hidden w-px md:block origin-top -translate-x-1/2 bg-gradient-to-b from-menta-500 to-menta-400/30"
                style={{ height: largos[i] ?? 0 }}
              />
              <p className="presencia-valor display text-[2.25rem] leading-none text-menta-600 sm:text-[2.6rem]">
                {visto ? <CountUp value={c.valor} /> : <span className="opacity-0">{c.valor}</span>}
              </p>
              <p className="presencia-texto mt-2 max-w-[19ch] text-sm leading-snug font-medium text-heading">{c.etiqueta}</p>
            </div>
          ))}
        </div>

        <div ref={globo} className="relative -mt-2 md:mt-4">
          <PresenceGlobe resaltada={resaltada} />
        </div>
      </div>

      <div className="shell relative -mt-4 pb-8 md:-mt-24">
        <ul className="mx-auto flex max-w-4xl flex-wrap justify-center gap-2" aria-label="Categorías de presencia">
          {presence.categorias.map((c) => {
            const activa = resaltada === c.clave;
            return (
              <li key={c.clave}>
                <button
                  type="button"
                  aria-pressed={activa}
                  onMouseEnter={() => setResaltada(c.clave)}
                  onMouseLeave={() => setResaltada(null)}
                  onFocus={() => setResaltada(c.clave)}
                  onBlur={() => setResaltada(null)}
                  onClick={() => setResaltada(activa ? null : c.clave)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
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
