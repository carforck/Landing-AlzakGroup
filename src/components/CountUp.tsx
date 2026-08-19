"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cifra que cuenta desde cero al entrar en pantalla.
 *
 * Se reanima cada vez que la sección vuelve a verse, no una sola vez: la tira de
 * cifras es corta y el visitante que sube y baja debe volver a ver el gesto.
 *
 * Sólo anima valores que EMPIEZAN por dígito ("70+", "200+", "13"). Un valor
 * como "ISO 9001:2015" no es una cantidad —contar hasta 9001 no significaría
 * nada— así que se pinta tal cual.
 */
const DURATION_MS = 1400;

/**
 * Desaceleración cúbica. Se probó una quíntica —la curva del resto del sitio—
 * y no sirve para contar: a mitad de recorrido ya va por el 97 % del objetivo,
 * así que "70+" llegaba a 68 en 700 ms y se arrastraba los otros 700 ms en dos
 * unidades. La cúbica reparte el ascenso de forma legible y aun así frena al
 * final, que es donde la cifra se fija.
 */
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

type CountUpProps = {
  /** Valor tal como se publica, con su sufijo: "70+", "200+", "13". */
  value: string;
  className?: string;
};

export function CountUp({ value, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const frame = useRef<number | null>(null);
  // Arranca en el valor final: si no hay JS, o si se pidió menos movimiento,
  // la cifra publicada es lo que se lee.
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const match = /^(\d[\d.,]*)(.*)$/.exec(value);
    if (!match) return;

    const [, digits, suffix] = match;

    // Convención española: el punto agrupa millares y la coma separa decimales.
    // Antes se borraban ambos y se pintaba el entero pelado, así que "2.018"
    // aparecía como "2018" y "12,7" como "127". Se conserva cuántos decimales
    // traía el valor publicado y se vuelve a formatear en cada fotograma.
    const decimales = digits.includes(",") ? digits.split(",")[1].length : 0;
    const target = Number(digits.replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(target)) return;

    const formato = new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const run = () => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - start) / DURATION_MS, 1);
        const current = easeOutCubic(t) * target;
        setShown(`${formato.format(current)}${suffix}`);
        if (t < 1) frame.current = requestAnimationFrame(step);
      };
      frame.current = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (frame.current !== null) cancelAnimationFrame(frame.current);
        run();
      },
      { threshold: 0.6 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [value]);

  return (
    <span
      ref={ref}
      className={className}
      // Cifras de ancho fijo: sin esto el número salta de ancho en cada
      // fotograma y arrastra la etiqueta de debajo.
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {shown}
    </span>
  );
}
