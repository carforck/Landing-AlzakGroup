/**
 * Ilustraciones animadas de las doce líneas de trabajo (bento de Services).
 *
 * Cada una cuenta su servicio con un gesto propio, no con un icono genérico:
 * una balanza que se equilibra para las evaluaciones económicas, una curva que
 * cruza el umbral para la predicción de riesgo, un forest plot para la síntesis
 * de evidencia, una ruta que se recorre para las RIAS.
 *
 * Son SVG en línea con clases `sa-*`; la animación vive en globals.css y sólo
 * corre cuando la cuadrícula está en pantalla (`[data-visto="si"]`). Trazo en
 * `currentColor`, así que toman el menta del contenedor en claro y en oscuro.
 * Con «reducir movimiento» quedan quietas en su estado final.
 */

const base = {
  viewBox: "0 0 160 100",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function Balanza() {
  return (
    <svg {...base}>
      <path d="M80 18v66M62 88h36" />
      <g className="sa-balanza">
        <path d="M36 30h88" />
        <circle cx="80" cy="30" r="3.5" fill="currentColor" />
        <path d="M36 30l-12 26h24zM124 30l-12 26h24z" strokeWidth="1.6" />
        <path d="M22 56a14 6 0 0 0 28 0M110 56a14 6 0 0 0 28 0" />
        <text x="36" y="52" textAnchor="middle" fontSize="12" fill="currentColor" stroke="none" fontWeight="700">$</text>
        <path d="M124 44v8M120 48h8" strokeWidth="2.4" />
      </g>
    </svg>
  );
}

function Pulso() {
  return (
    <svg {...base}>
      <path d="M8 76h144" strokeOpacity=".2" />
      <path className="sa-trazo" pathLength={1} d="M8 60h28l8-22 10 44 10-58 8 36h14l6-10 6 10h54" />
      <rect className="sa-barra" x="114" y="40" width="10" height="36" rx="2" fill="currentColor" fillOpacity=".18" stroke="none" />
      <rect className="sa-barra sa-d1" x="130" y="28" width="10" height="48" rx="2" fill="currentColor" fillOpacity=".32" stroke="none" />
    </svg>
  );
}

function Monedas() {
  return (
    <svg {...base}>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} className={`sa-moneda sa-d${i}`}>
          <ellipse cx="62" cy={80 - i * 11} rx="22" ry="6" fill="var(--sa-fondo)" />
          <path d={`M40 ${80 - i * 11}v5a22 6 0 0 0 44 0v-5`} />
        </g>
      ))}
      <g className="sa-moneda sa-d4">
        <ellipse cx="112" cy="80" rx="22" ry="6" fill="var(--sa-fondo)" />
        <path d="M90 80v5a22 6 0 0 0 44 0v-5" />
      </g>
      <g className="sa-moneda sa-d5">
        <ellipse cx="112" cy="69" rx="22" ry="6" fill="var(--sa-fondo)" />
        <path d="M90 69v5a22 6 0 0 0 44 0v-5" />
      </g>
    </svg>
  );
}

function Riesgo() {
  return (
    <svg {...base}>
      <path d="M14 84h136M14 84V12" strokeOpacity=".25" />
      <path d="M14 40h136" strokeDasharray="4 4" strokeOpacity=".5" />
      <text x="148" y="35" textAnchor="end" fontSize="8" fill="currentColor" stroke="none" opacity=".7">umbral</text>
      <path className="sa-area" d="M14 80C50 78 70 70 88 54s34-34 62-40V84H14z" fill="currentColor" fillOpacity=".12" stroke="none" />
      <path className="sa-trazo" pathLength={1} d="M14 80C50 78 70 70 88 54s34-34 62-40" strokeWidth="2.6" />
      <circle className="sa-punto-curva" r="5" fill="var(--color-riesgo-alto)" stroke="var(--sa-fondo)" strokeWidth="2" />
    </svg>
  );
}

function Dispersion() {
  const pts = [
    [22, 74], [34, 66], [40, 72], [52, 58], [60, 62], [70, 50], [78, 56], [88, 44], [98, 46], [108, 36], [118, 40], [130, 28], [140, 30],
  ];
  return (
    <svg {...base}>
      <path d="M12 86h140M12 86V10" strokeOpacity=".25" />
      {pts.map(([x, y], i) => (
        <circle key={i} className="sa-pop" style={{ animationDelay: `${i * 70}ms` }} cx={x} cy={y} r="3.4" fill="currentColor" stroke="none" />
      ))}
      <path className="sa-trazo sa-d4" pathLength={1} d="M16 78L146 24" strokeDasharray="1" strokeWidth="1.8" />
    </svg>
  );
}

function Poblacion() {
  const filas = 4;
  const cols = 9;
  return (
    <svg {...base}>
      {Array.from({ length: filas * cols }, (_, k) => {
        const x = 18 + (k % cols) * 15.5;
        const y = 20 + Math.floor(k / cols) * 19;
        const marcada = [3, 4, 12, 13, 14, 22, 23].includes(k);
        return (
          <g key={k} className={marcada ? "sa-persona sa-marcada" : "sa-persona"} style={{ animationDelay: `${(k % cols) * 60 + Math.floor(k / cols) * 40}ms` }}>
            <circle cx={x} cy={y} r="3" fill="currentColor" stroke="none" />
            <path d={`M${x - 4.5} ${y + 11}a4.5 5 0 0 1 9 0`} fill="currentColor" stroke="none" />
          </g>
        );
      })}
    </svg>
  );
}

function Ruta() {
  const d = "M18 76C40 76 40 28 64 28s26 48 50 48 24-40 30-50";
  return (
    <svg {...base}>
      <path d={d} strokeOpacity=".2" strokeWidth="6" />
      <path className="sa-trazo" pathLength={1} d={d} strokeDasharray="1" />
      {[[18, 76], [64, 28], [114, 76], [144, 26]].map(([x, y], i) => (
        <circle key={i} className="sa-pop" style={{ animationDelay: `${300 + i * 260}ms` }} cx={x} cy={y} r="5.5" fill="var(--sa-fondo)" strokeWidth="2.4" />
      ))}
      <circle className="sa-viajero" r="4" fill="currentColor" stroke="none" style={{ offsetPath: `path("${d}")` }} />
    </svg>
  );
}

/** Forest plot: lo que se ve al final de una revisión sistemática con metaanálisis. */
function Forest() {
  const estudios = [
    [46, 92, 68], [38, 80, 60], [56, 100, 76], [42, 86, 62], [52, 94, 72],
  ];
  return (
    <svg {...base}>
      <path d="M80 8v74" strokeDasharray="3 3" strokeOpacity=".45" />
      {estudios.map(([a, b, c], i) => (
        <g key={i} className="sa-estudio" style={{ animationDelay: `${i * 140}ms` }}>
          <path d={`M${a} ${16 + i * 12}H${b}`} strokeWidth="1.6" />
          <rect x={c - 3} y={13 + i * 12} width="6" height="6" fill="currentColor" stroke="none" />
        </g>
      ))}
      <path className="sa-diamante" d="M54 90l14-6 14 6-14 6z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Lista() {
  return (
    <svg {...base}>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="22" y={16 + i * 24} width="16" height="16" rx="4" />
          <path className={`sa-check sa-d${i * 2}`} pathLength={1} d={`M26 ${24 + i * 24}l4 4 6-8`} strokeWidth="2.4" />
          <path d={`M48 ${24 + i * 24}h${[86, 70, 92][i]}`} strokeOpacity=".3" strokeWidth="5" />
          <path className={`sa-linea sa-d${i * 2}`} pathLength={1} d={`M48 ${24 + i * 24}h${[86, 70, 92][i]}`} strokeWidth="5" strokeOpacity=".7" />
        </g>
      ))}
    </svg>
  );
}

function Tablero() {
  return (
    <svg {...base}>
      <rect x="8" y="8" width="144" height="84" rx="8" strokeOpacity=".25" />
      {[30, 46, 24, 58, 40].map((h, i) => (
        <rect key={i} className="sa-columna" style={{ animationDelay: `${i * 110}ms` }} x={20 + i * 14} y={80 - h} width="9" height={h} rx="2" fill="currentColor" fillOpacity={0.25 + i * 0.12} stroke="none" />
      ))}
      <path d="M100 74a24 24 0 0 1 44 0" strokeWidth="5" strokeOpacity=".2" />
      <path className="sa-trazo sa-d2" pathLength={1} d="M100 74a24 24 0 0 1 34-21" strokeWidth="5" strokeDasharray="1" />
      <g className="sa-aguja">
        <path d="M122 74l-10-14" strokeWidth="2.4" />
      </g>
      <circle cx="122" cy="74" r="3" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Articulo() {
  return (
    <svg {...base}>
      <path d="M44 8h52l20 20v64H44z" fill="var(--sa-fondo)" />
      <path d="M96 8v20h20" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} className={`sa-linea sa-d${i}`} pathLength={1} d={`M54 ${38 + i * 10}h${i === 4 ? 28 : 52}`} strokeWidth="3" strokeOpacity=".55" />
      ))}
      <g className="sa-sello">
        <circle cx="114" cy="78" r="14" fill="currentColor" stroke="var(--sa-fondo)" strokeWidth="3" />
        <path d="M107 78l5 5 9-10" stroke="var(--sa-fondo)" strokeWidth="2.6" />
      </g>
    </svg>
  );
}

function Formacion() {
  return (
    <svg {...base}>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} className="sa-columna" style={{ animationDelay: `${i * 140}ms` }} x={22 + i * 30} y={84 - (i + 1) * 15} width="26" height={(i + 1) * 15} rx="3" fill="currentColor" fillOpacity={0.14 + i * 0.1} stroke="none" />
      ))}
      <g className="sa-birrete">
        <path d="M128 18l-20 8 20 8 20-8z" fill="currentColor" stroke="none" />
        <path d="M116 30v8c0 3 6 5 12 5s12-2 12-5v-8" />
        <path d="M148 26v12" strokeWidth="1.6" />
      </g>
    </svg>
  );
}

export const ARTE: Record<string, () => React.JSX.Element> = {
  scale: Balanza,
  activity: Pulso,
  coins: Monedas,
  trending: Riesgo,
  lineChart: Dispersion,
  users: Poblacion,
  route: Ruta,
  library: Forest,
  clipboard: Lista,
  gauge: Tablero,
  fileText: Articulo,
  graduation: Formacion,
};
