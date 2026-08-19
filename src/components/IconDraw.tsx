"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * Dibuja el icono trazo a trazo cuando entra en pantalla.
 *
 * El truco está en `pathLength="1"`. Un icono de Lucide son varios `<path>`,
 * `<circle>` o `<line>` de longitudes muy distintas, así que un único
 * `stroke-dasharray` en unidades de usuario serviría para uno y estropearía el
 * resto: en los trazos cortos el dibujado terminaría en la primera fracción de la
 * transición y el icono aparecería de golpe. `pathLength="1"` redefine la
 * longitud de CADA trazo como 1, y entonces `dasharray: 1` con `dashoffset: 1`
 * vale igual para todos, sea un punto o el contorno completo.
 *
 * Ese atributo no se puede poner desde CSS ni pasar como prop, porque los
 * subtrazos los genera Lucide por dentro. Se recorren aquí una sola vez al
 * montar.
 *
 * `data-ready` existe para que no se vea un icono roto: hasta que el atributo
 * está puesto, aplicar `dasharray: 1` dejaría cada trazo como una mota de un
 * píxel. Así que el CSS del dibujado sólo entra en juego cuando ya se ha medido,
 * y sin JavaScript el icono se ve entero y quieto, que es el resultado correcto.
 *
 * `data-drawn` se activa y se desactiva con el viewport, no una sola vez: la
 * retícula se recorre de arriba abajo y al volver a subir el gesto se repite,
 * igual que los contadores de las cifras.
 */
const DRAWABLE = "path, circle, line, rect, polyline, polygon, ellipse";

export function IconDraw({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    node
      .querySelectorAll<SVGElement>(DRAWABLE)
      .forEach((shape) => shape.setAttribute("pathLength", "1"));
    setReady(true);

    const observer = new IntersectionObserver(
      ([entry]) => setDrawn(entry.isIntersecting),
      { rootMargin: "-10% 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className="icon-draw"
      data-ready={ready ? "true" : "false"}
      data-drawn={drawn ? "true" : "false"}
    >
      {children}
    </span>
  );
}
