"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef, type CSSProperties } from "react";

type Milestone = { readonly year: string; readonly label: string };

/**
 * Línea de tiempo de la historia de ALZAK.
 *
 * Tres capas de movimiento, cada una con un trabajo distinto:
 *
 *  1. El trazo menta se rellena de arriba abajo con el avance del scroll
 *     (`scaleY` sobre el hairline). Dice cuánto de la historia se ha recorrido.
 *  2. Cada punto se enciende al alcanzar el 60 % de la altura de la ventana:
 *     pasa de menta claro a menta-600 y crece un 25 %. Ese es el "resaltar
 *     puntos" del encargo, y va ligado a la lectura, no a un reloj.
 *  3. Un halo pulsa de forma continua con un retardo escalonado por hito, así
 *     que el latido parece viajar hacia abajo por la línea en lugar de que los
 *     cuatro puntos parpadeen a la vez.
 *
 * Con `prefers-reduced-motion` desaparecen el relleno y el latido (los dos por
 * CSS: `.timeline-fill` y `.timeline-pulse`) y del paso 2 sobrevive sólo el
 * cambio de color, porque MotionProvider descarta las animaciones de transform.
 * Queda el estado sin el desplazamiento, que es la regla del sitio.
 */
export function Timeline({
  milestones,
  className = "",
}: {
  milestones: readonly Milestone[];
  className?: string;
}) {
  const ref = useRef<HTMLOListElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 65%"],
  });
  const fill = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 24,
    mass: 0.4,
  });

  return (
    <ol ref={ref} className={`relative border-l border-hairline pl-8 ${className}`}>
      {/*
        El relleno va sobre el hairline, no en su lugar: si la línea base
        desapareciera, el tramo aún no recorrido perdería su estructura y la
        columna quedaría flotando.
      */}
      <motion.span
        aria-hidden
        className="timeline-fill absolute inset-y-0 -left-px w-px origin-top bg-menta-400"
        style={{ scaleY: fill }}
      />

      {milestones.map((milestone, i) => (
        <li
          key={`${milestone.year}-${milestone.label}`}
          className="relative pb-9 last:pb-0"
        >
          {/*
            El halo y el punto comparten centro. El halo va detrás y sólo es
            transform + opacity, así que el latido no provoca repintados de
            layout aunque haya cuatro corriendo.
          */}
          <span
            aria-hidden
            className="absolute top-1.5 -left-[calc(2rem+4.5px)] size-2.5"
            style={{ "--pulse-delay": `${i * 0.45}s` } as CSSProperties}
          >
            <span className="timeline-pulse absolute inset-0 rounded-full bg-menta-400" />
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-surface-muted bg-menta-400"
              initial={{ scale: 1 }}
              whileInView={{ scale: 1.25, backgroundColor: "var(--color-menta-600)" }}
              viewport={{ once: false, margin: "0px 0px -40% 0px" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            />
          </span>

          <p className="display text-sm tracking-[0.14em] text-menta-600 dark:text-menta-300">
            {milestone.year}
          </p>
          <p className="mt-1.5 leading-relaxed text-heading">{milestone.label}</p>
        </li>
      ))}
    </ol>
  );
}
