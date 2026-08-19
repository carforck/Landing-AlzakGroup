"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Deriva continua por columnas para la retícula de servicios: la primera y la
 * tercera bajan mientras la del medio sube, y en el punto medio del recorrido
 * las exteriores se abren un poco hacia sus lados antes de volver.
 *
 * Se hizo primero ligada al progreso de scroll y estaba mal: el movimiento sólo
 * existía mientras la rueda giraba, así que al llevar el cursor sobre una
 * tarjeta —justo cuando el visitante se detiene a leer— la retícula se congelaba
 * y el efecto parecía roto. Ahora el movimiento vive en su propio reloj, en CSS,
 * y no depende de que pase nada.
 *
 * Este componente sólo aporta la puerta de visibilidad: fuera de pantalla las
 * doce tarjetas quedan en pausa (`data-animate`), como el resto de bucles del
 * sitio. El reparto por columna y las curvas están en globals.css.
 */
export function DriftingColumns({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-animate={visible ? "on" : "off"}
      className={`drift-grid ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
