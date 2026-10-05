"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { services } from "../content/site";
import { ARTE } from "./ServiceArt";

/**
 * Las doce líneas de trabajo en una cuadrícula bento.
 *
 * Tamaños distintos para que el ojo tenga dónde empezar: la línea insignia
 * (evaluaciones económicas) ocupa 2 × 2, y otras cinco van a lo ancho. El
 * orden de `services` no cambia; `grid-flow-dense` rellena los huecos.
 *
 * Cada tarjeta trae su ilustración animada (ServiceArt), una luz que sigue al
 * cursor y una inclinación leve en 3D. Las animaciones arrancan cuando la
 * cuadrícula entra en pantalla. Con «reducir movimiento» no hay inclinación ni
 * animación: las ilustraciones se ven en su estado final.
 */
const TAMANO: Record<string, string> = {
  scale: "md:col-span-2 lg:row-span-2",
  trending: "md:col-span-2",
  lineChart: "md:col-span-2",
  route: "lg:col-span-2",
  gauge: "md:col-span-2",
  graduation: "md:col-span-2",
};

export function ServicesBento() {
  const rejilla = useRef<HTMLUListElement>(null);
  const [visto, setVisto] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisto(true), { threshold: 0.12 });
    if (rejilla.current) io.observe(rejilla.current);
    return () => io.disconnect();
  }, []);

  return (
    <ul
      ref={rejilla}
      data-visto={visto ? "si" : "no"}
      className="bento mt-14 grid grid-flow-dense auto-rows-[minmax(15rem,auto)] gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      {services.map((s, i) => {
        const Arte = ARTE[s.icon];
        const grande = s.icon === "scale";
        // Las anchas van en horizontal: texto a la izquierda, ilustración grande
        // a la derecha. Con la ilustración arriba quedaba medio hueco vacío.
        const ancha = !grande && (TAMANO[s.icon] ?? "").includes("col-span-2");
        return (
          <li key={s.title} className={TAMANO[s.icon] ?? ""} style={{ ["--orden" as string]: i }}>
            <Tarjeta grande={grande} ancha={ancha}>
              <div
                className={`bento-arte text-menta-500 dark:text-menta-300 ${
                  grande ? "h-44 lg:h-64" : ancha ? "h-28 md:order-2 md:h-auto md:w-[46%] md:shrink-0 md:self-stretch md:py-2" : "h-28"
                }`}
              >
                {Arte ? <Arte /> : null}
              </div>
              <div className={`relative pt-6 ${ancha ? "md:mt-0 md:flex md:flex-1 md:flex-col md:justify-end md:pt-0 md:pr-6" : "mt-auto"}`}>
                <p className="text-xs font-semibold tracking-[0.16em] text-menta-600 tabular-nums dark:text-menta-300">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className={`display mt-2 leading-snug ${grande ? "text-[1.5rem] lg:text-[1.75rem]" : "text-base"}`}>{s.title}</h3>
                <p className={`mt-2.5 leading-relaxed text-ink-soft dark:text-body ${grande ? "text-base" : "text-sm"}`}>{s.description}</p>
              </div>
            </Tarjeta>
          </li>
        );
      })}
    </ul>
  );
}

function Tarjeta({ grande, ancha, children }: { grande: boolean; ancha: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  // La luz y la inclinación se escriben como variables CSS: sin estado de
  // React, así que mover el cursor no vuelve a renderizar la tarjeta.
  const mover = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.style.setProperty("--rx", `${(0.5 - y) * 5}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 6}deg`);
  };
  const salir = () => {
    const el = ref.current!;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={ref}
      onPointerMove={mover}
      onPointerLeave={salir}
      className={`bento-tarjeta group relative flex h-full flex-col overflow-hidden rounded-2xl border border-hairline bg-surface ${ancha ? "md:flex-row md:items-stretch" : ""} ${grande ? "p-8 lg:p-10" : "p-6 lg:p-7"}`}
    >
      {children}
    </div>
  );
}
