"use client";

import { useEffect, useRef, useState } from "react";
import { BrandMotif } from "./BrandMotif";

/**
 * Motivo de marca con deriva muy lenta, para dar algo de vida a un fondo sin
 * competir con la lectura.
 *
 * Igual que las franjas del hero: sólo `transform`, y en pausa mientras la
 * sección no está en pantalla.
 */
export function DriftingMotif({ className = "" }: { className?: string }) {
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
      aria-hidden
      data-animate={visible ? "on" : "off"}
      className={`pointer-events-none absolute ${className}`}
    >
      <BrandMotif className="motif-drift w-full" />
    </div>
  );
}
