"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reproductor del Lottie del hero.
 *
 * Tres decisiones para que la pieza no le cueste a quien no la ve:
 *
 *  1. El runtime (`lottie-web`) entra por `import()` dinámico y sólo cuando el
 *     contenedor está a punto de entrar en pantalla. No forma parte del bundle
 *     inicial, así que el JS de primera carga no crece.
 *  2. Se usa el build `light`: no trae expresiones ni efectos, que esta animación
 *     no usa. Es el más pequeño de los que publica el paquete.
 *  3. `prefers-reduced-motion` no carga nada: se queda el primer fotograma
 *     pintado como imagen estática. El resto del sitio congela sus fondos en su
 *     encuadre inicial en lugar de ocultarlos, y esto hace lo mismo.
 *
 * El SSR pinta el hueco con la proporción exacta del lienzo (1200×890) para que
 * no haya salto de layout cuando la animación aparece.
 */
export function LottieHero({
  src,
  className = "",
  label,
}: {
  src: string;
  className?: string;
  /** Texto alternativo: la animación es decorativa si se omite. */
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let anim: { destroy: () => void } | null = null;
    let cancelado = false;

    const observer = new IntersectionObserver(
      async ([entrada]) => {
        if (!entrada.isIntersecting || anim) return;
        observer.disconnect();
        try {
          const lottie = (await import("lottie-web/build/player/lottie_light"))
            .default;
          if (cancelado) return;
          anim = lottie.loadAnimation({
            container: nodo,
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: src,
          });
        } catch {
          setFallo(true);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(nodo);
    return () => {
      cancelado = true;
      observer.disconnect();
      anim?.destroy();
    };
  }, [src]);

  if (fallo) return null;

  return (
    <div
      ref={ref}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      // 1200×890 es el lienzo del archivo: reservar la proporción evita el salto.
      style={{ aspectRatio: "1200 / 890" }}
    />
  );
}
