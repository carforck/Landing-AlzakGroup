/**
 * Mosaico de triángulos en menta y azul corporativo.
 *
 * Es el motivo gráfico que el propio material de ALZAK usa en las esquinas de
 * sus láminas (brand-source/Sobre ALZAK.pdf). Sustituye al degradado difuso
 * genérico: dice algo sobre esta marca en concreto en lugar de decorar.
 */
export function BrandMotif({ className = "" }: { className?: string }) {
  // 4 columnas × 3 filas de celdas de 40px; cada celda es media casilla partida
  // en diagonal. El patrón se declara una vez y se reutiliza por <use>.
  const cells: { x: number; y: number; variant: 0 | 1 | 2 | 3; tone: 0 | 1 | 2 }[] = [
    { x: 0, y: 0, variant: 1, tone: 0 },
    { x: 1, y: 0, variant: 0, tone: 1 },
    { x: 2, y: 0, variant: 2, tone: 0 },
    { x: 3, y: 0, variant: 1, tone: 2 },
    { x: 0, y: 1, variant: 3, tone: 1 },
    { x: 1, y: 1, variant: 2, tone: 0 },
    { x: 2, y: 1, variant: 1, tone: 2 },
    { x: 3, y: 1, variant: 0, tone: 0 },
    { x: 1, y: 2, variant: 1, tone: 0 },
    { x: 2, y: 2, variant: 3, tone: 1 },
    { x: 3, y: 2, variant: 2, tone: 0 },
  ];

  const S = 40;
  const paths = [
    `M0 0 H${S} V${S} Z`, // esquina inferior derecha
    `M0 0 H${S} L0 ${S} Z`, // esquina superior izquierda
    `M${S} 0 V${S} H0 Z`, // inferior derecha invertido
    `M0 ${S} V0 L${S} ${S} Z`, // inferior izquierda
  ];
  const tones = ["var(--color-menta-400)", "var(--color-azul)", "var(--color-verde)"];

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${S * 4} ${S * 3}`}
      className={className}
      fill="none"
    >
      {cells.map((c) => (
        <path
          key={`${c.x}-${c.y}`}
          d={paths[c.variant]}
          transform={`translate(${c.x * S} ${c.y * S})`}
          fill={tones[c.tone]}
        />
      ))}
    </svg>
  );
}
