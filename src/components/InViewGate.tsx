"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * Puerta de visibilidad reutilizable.
 *
 * Marca `data-animate="on"` mientras el contenido está en pantalla y "off"
 * cuando sale, que es el mecanismo con el que el sitio pausa sus bucles. La
 * lógica ya existía repetida en DriftingMotif y MotifField;
 * aquí se extrae para lo que no necesita, además, dibujar nada.
 */
export function InViewGate({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;
    const observer = new IntersectionObserver(
      ([entrada]) => setVisible(entrada.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(nodo);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-animate={visible ? "on" : "off"} className={className}>
      {children}
    </div>
  );
}
