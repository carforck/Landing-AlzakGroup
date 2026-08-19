"use client";

import { useRef, type ReactNode } from "react";

/**
 * Texto resaltado con trazo de brocha.
 *
 * El trazo y el barrido viven en la clase `.marker` de globals.css; aquí sólo
 * está lo que el CSS no puede hacer solo: relanzar la animación cada vez que el
 * cursor pasa por encima. Volver a aplicar el mismo nombre de animación no la
 * reinicia, así que se quita, se fuerza un reflujo leyendo `offsetWidth` y se
 * devuelve.
 *
 * Si no hay JavaScript el barrido de entrada sigue ocurriendo, porque es CSS
 * puro; lo único que se pierde es la repetición al pasar el cursor.
 */
export function Marker({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  const relanzar = () => {
    const nodo = ref.current;
    if (!nodo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    nodo.style.animation = "none";
    void nodo.offsetWidth;
    nodo.style.animation = "";
  };

  return (
    <span ref={ref} className="marker" onMouseEnter={relanzar}>
      {children}
    </span>
  );
}
