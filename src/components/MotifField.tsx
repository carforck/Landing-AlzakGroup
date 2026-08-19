"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mosaico de triángulos en movimiento para el fondo del bloque de calidad.
 *
 * Es el MISMO tejido que BrandMotif pone en las esquinas del sitio —el que usa
 * el material corporativo— extendido a todo el ancho y puesto a rodar. La
 * primera versión de este fondo eran piezas pequeñas, sueltas y con borde, y no
 * era el motivo de la marca: era un patrón cualquiera. Aquí las celdas se tocan
 * y forman molinetes, que es lo que hace reconocible el motivo.
 *
 * El tejido se declara una vez por columna como `<pattern>` de SVG y se pinta
 * sobre un `<rect>` al 100 %. El SVG va SIN `viewBox` a propósito: así una unidad
 * de usuario es un píxel CSS y el mosaico conserva sus diagonales a 45° sea cual
 * sea el alto de la sección. Con `viewBox` habría que escalar y los triángulos
 * saldrían deformados.
 *
 * Movimiento: cada columna es una cinta continua que avanza exactamente un
 * bloque del patrón (2 celdas), así que el fotograma final coincide con el
 * inicial y no hay salto. Las columnas impares suben y las pares bajan, de modo
 * que el conjunto respira de forma simétrica sin que ninguna dirección domine.
 *
 * La intensidad está calibrada contra el motivo de la esquina de Contacto, que es
 * la referencia: se busca un tejido que se perciba y no un patrón que compita con
 * el titular.
 *
 * TODAS las piezas son blanco translúcido. Es deliberado: el texto del bloque es
 * gris sobre menta-400 y cualquier pieza más oscura que el fondo bajaría ese
 * contraste. Aclarando sólo puede subir, y por eso el mosaico puede cruzar por
 * detrás del titular a plena intensidad.
 */

/** Lado de la celda. El bloque del patrón son 2×2 celdas. */
const CELL = 110;
const BLOCK = CELL * 2;

/*
 * Ancho de columna: dos bloques exactos, no una fracción del contenedor.
 *
 * Importa. Las columnas se mueven a distinta velocidad, así que en su frontera
 * el mosaico siempre queda desfasado; lo que decide si eso se lee como tejido o
 * como un panel roto es DÓNDE cae esa frontera. Con `flex-1` caía en un píxel
 * cualquiera —360 px con esta ventana— y cortaba triángulos por la mitad. Sobre
 * un múltiplo del bloque la frontera coincide con una arista de celda, que es un
 * borde que el mosaico ya tiene por todas partes, y el desfase pasa a leerse
 * como parte del dibujo.
 *
 * Por lo mismo no hay desplazamiento horizontal de fase entre columnas: eso
 * volvería a desalinear la retícula. La variedad la dan la velocidad y el
 * retardo, que sólo afectan al eje vertical.
 */
const COLUMN_WIDTH = BLOCK * 2;
/** Suficientes para cubrir una pantalla ultrapanorámica; el resto se recorta. */
const COLUMNS = 6;

/** Las cuatro orientaciones del triángulo, media casilla partida en diagonal. */
const TRIANGLES = [
  `M0 0 H${CELL} V${CELL} Z`, // mitad superior derecha
  `M0 0 H${CELL} L0 ${CELL} Z`, // mitad superior izquierda
  `M${CELL} 0 V${CELL} H0 Z`, // mitad inferior derecha
  `M0 ${CELL} V0 L${CELL} ${CELL} Z`, // mitad inferior izquierda
];

/*
 * Bloque de 2×2. Dos celdas llevan las dos mitades con tonos distintos —de ahí
 * los cuadrados partidos en diagonal del motivo— y las otras dos una sola mitad,
 * que es lo que deja respirar el menta y forma el molinete al repetirse.
 */
const BLOCK_CELLS: { cx: 0 | 1; cy: 0 | 1; halves: { variant: 0 | 1 | 2 | 3; alpha: number }[] }[] = [
  { cx: 0, cy: 0, halves: [{ variant: 1, alpha: 0.18 }, { variant: 2, alpha: 0.07 }] },
  { cx: 1, cy: 0, halves: [{ variant: 0, alpha: 0.1 }] },
  { cx: 0, cy: 1, halves: [{ variant: 3, alpha: 0.1 }] },
  { cx: 1, cy: 1, halves: [{ variant: 2, alpha: 0.18 }, { variant: 1, alpha: 0.07 }] },
];

export function MotifField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Fuera de pantalla las columnas quedan en pausa: cintas infinitas corriendo
  // donde nadie las ve son gasto de batería, igual que en HeroBackdrop.
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
      className={`pointer-events-none absolute inset-0 flex overflow-hidden ${className}`}
    >
      {Array.from({ length: COLUMNS }, (_, column) => (
        <div
          key={column}
          className="relative shrink-0 overflow-hidden"
          style={{ width: `${COLUMN_WIDTH}px` }}
        >
          <svg
            // Un bloque de margen arriba y otro abajo: la cinta se desplaza como
            // máximo un bloque, así que la columna queda cubierta en todo momento.
            className="motif-mosaic absolute inset-x-0"
            style={{
              top: `-${BLOCK}px`,
              height: `calc(100% + ${BLOCK * 2}px)`,
              // Duraciones desiguales para que las columnas no marchen al unísono:
              // el mosaico se recompone en lugar de repetirse en bloque.
              animationDuration: `${22 + (column % 4) * 3}s`,
              animationDirection: column % 2 === 0 ? "normal" : "reverse",
              // Retardo negativo: la columna entra ya empezada, así que las seis
              // no arrancan alineadas. Es la forma de desfasarlas sin tocar el
              // eje horizontal, que es el que debe quedar cuadrado.
              animationDelay: `-${column * 4}s`,
            }}
          >
            <defs>
              <pattern
                id={`motif-mosaic-${column}`}
                width={BLOCK}
                height={BLOCK}
                patternUnits="userSpaceOnUse"
              >
                {BLOCK_CELLS.flatMap((cell) =>
                  cell.halves.map((half) => (
                    <path
                      key={`${cell.cx}-${cell.cy}-${half.variant}`}
                      d={TRIANGLES[half.variant]}
                      transform={`translate(${cell.cx * CELL} ${cell.cy * CELL})`}
                      fill={`rgb(255 255 255 / ${half.alpha})`}
                    />
                  )),
                )}
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#motif-mosaic-${column})`} />
          </svg>
        </div>
      ))}
    </div>
  );
}
