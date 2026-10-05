"use client";

import { useEffect, useRef } from "react";

/**
 * Fondo del globo de presencia: una trama de puntos menta casi invisible que
 * se ilumina al paso de ondas concéntricas, como un sonar que sale desde el
 * globo. Llena el blanco sin competir con los datos: los puntos son de 1 px y
 * las ondas no pasan del 45 % de opacidad.
 *
 * `origen` devuelve dónde nace la onda en coordenadas de este contenedor; se
 * pide en cada medida porque depende del ancho del globo.
 *
 * Se pausa fuera de pantalla, va a ~30 fps (no hace falta más para algo tan
 * lento) y con «reducir movimiento» queda la trama quieta.
 */
const PASO = 22;
const VELOCIDAD = 70; // px por segundo
const PERIODO = 3.2; // segundos entre ondas
const ANCHO_ONDA = 46;

export function MallaOndas({ origen }: { origen: () => { x: number; y: number } | null }) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const origenRef = useRef(origen);
  useEffect(() => {
    origenRef.current = origen;
  }, [origen]);

  useEffect(() => {
    const canvas = lienzo.current!;
    const ctx = canvas.getContext("2d")!;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let o = { x: 0, y: 0 };
    let raf = 0;
    let ultimo = 0;
    let visible = false;
    const t0 = performance.now();

    const medir = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      o = origenRef.current() ?? { x: w / 2, y: h / 2 };
    };

    const dibujar = (ahora: number) => {
      raf = 0;
      if (ahora - ultimo < 32 && !reducido) {
        if (visible) raf = requestAnimationFrame(dibujar);
        return;
      }
      ultimo = ahora;
      const t = (ahora - t0) / 1000;
      const alcance = Math.hypot(Math.max(o.x, w - o.x), Math.max(o.y, h - o.y));
      const radios: number[] = [];
      if (!reducido) {
        for (let k = 0; k < Math.ceil(alcance / (VELOCIDAD * PERIODO)) + 1; k++) {
          radios.push(((t + k * PERIODO) * VELOCIDAD) % (alcance + ANCHO_ONDA * 2));
        }
      }
      ctx.clearRect(0, 0, w, h);
      for (let y = PASO / 2; y < h; y += PASO) {
        // Se desvanece arriba (bajo el titular) y abajo (bajo la leyenda).
        const fy = Math.min(1, y / (h * 0.25), (h - y) / (h * 0.2));
        if (fy <= 0) continue;
        for (let x = PASO / 2; x < w; x += PASO) {
          const d = Math.hypot(x - o.x, y - o.y);
          let onda = 0;
          for (const r of radios) {
            const k = (d - r) / ANCHO_ONDA;
            if (k > -2.5 && k < 2.5) onda += Math.exp(-k * k) * (1 - Math.min(1, r / alcance));
          }
          const lejos = Math.max(0.35, 1 - d / (alcance * 1.1));
          const a = (0.24 + Math.min(1, onda) * 0.55) * fy * lejos;
          ctx.fillStyle = `rgba(63,169,194,${a.toFixed(3)})`;
          const r = 1.4 + Math.min(1, onda) * 1.1;
          ctx.fillRect(x - r / 2, y - r / 2, r, r);
        }
      }
      if (visible && !reducido) raf = requestAnimationFrame(dibujar);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(dibujar);
    });
    const ro = new ResizeObserver(() => {
      medir();
      if (!raf) raf = requestAnimationFrame(dibujar);
    });
    medir();
    io.observe(canvas);
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return <canvas ref={lienzo} aria-hidden className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />;
}
