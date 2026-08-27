/**
 * Ilustraciones de los cuatro bloques de factores del modelo.
 *
 * Están dibujadas aquí y no traídas de un banco de imágenes: los assets de stock
 * llegan con una licencia que habría que verificar archivo por archivo y con un
 * estilo genérico que no es el de esta marca. Dibujarlas cuesta poco y salen en
 * menta y gris corporativo, sin peso de red y sin runtime.
 *
 * El movimiento vive en globals.css y arranca en pausa: sólo corre cuando el
 * contenedor marca `data-animate="on"`, como el resto de bucles del sitio, y
 * `prefers-reduced-motion` lo detiene dejando cada pieza en su encuadre inicial.
 */

/** Paleta: sólo derivaciones de los dos colores oficiales. */
const M100 = "#d9f2f8";
const M200 = "#b3e6f0";
const M400 = "#5dc3da";
const M600 = "#2f8ba3";
const M800 = "#285c6d";

export type FactorArtName =
  | "clinico"
  | "tabaquismo"
  | "ambiental"
  | "ocupacional";

export function FactorArt({
  name,
  className = "",
}: {
  name: FactorArtName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 88 88"
      className={className}
      aria-hidden
      focusable="false"
    >
      {name === "clinico" ? <Clinico /> : null}
      {name === "tabaquismo" ? <Tabaquismo /> : null}
      {name === "ambiental" ? <Ambiental /> : null}
      {name === "ocupacional" ? <Ocupacional /> : null}
    </svg>
  );
}

/** Persona y trazo de pulso: edad, sexo, EPOC y antecedentes. */
function Clinico() {
  return (
    <>
      <circle cx="44" cy="24" r="12" fill={M200} />
      <path d="M22 62c0-11.6 9.8-19 22-19s22 7.4 22 19z" fill={M200} />
      {/*
        El trazo se dibuja de izquierda a derecha con dashoffset. La longitud del
        recorrido está fijada en el CSS: si se cambia la `d`, hay que ajustarla.
      */}
      <path
        className="art-pulse"
        d="M8 72h12l5-12 7 24 6-16 4 4h38"
        fill="none"
        stroke={M600}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

/** Cigarrillo encendido: condición de fumador, años, cigarrillos por día. */
function Tabaquismo() {
  return (
    <>
      <g className="art-smoke" style={{ ["--art-delay" as string]: "0s" }}>
        <path
          d="M18 46c6-5-6-9 0-14s-4-8 2-12"
          fill="none"
          stroke={M400}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      <g className="art-smoke" style={{ ["--art-delay" as string]: "1.4s" }}>
        <path
          d="M31 44c5-4-5-8 0-12s-3-7 2-10"
          fill="none"
          stroke={M200}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      <rect x="10" y="58" width="46" height="12" rx="6" fill={M100} />
      <rect x="52" y="58" width="20" height="12" rx="6" fill={M200} />
      <rect x="66" y="58" width="6" height="12" rx="3" fill={M600} />
      <circle cx="12" cy="64" r="5" fill={M400} />
    </>
  );
}

/** Vivienda con humo: biomasa en interiores y tabaquismo pasivo. */
function Ambiental() {
  return (
    <>
      <g className="art-smoke" style={{ ["--art-delay" as string]: "0s" }}>
        <path
          d="M60 30c6-4-5-8 1-13"
          fill="none"
          stroke={M400}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      <g className="art-smoke" style={{ ["--art-delay" as string]: "1.1s" }}>
        <path
          d="M52 26c5-4-4-7 1-11"
          fill="none"
          stroke={M200}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      <rect x="54" y="30" width="9" height="14" rx="2" fill={M600} />
      <path d="M44 26 74 50v2H14v-2z" fill={M400} />
      <rect x="20" y="50" width="48" height="24" rx="3" fill={M200} />
      <rect x="38" y="58" width="12" height="16" rx="2" fill={M800} />
    </>
  );
}

/** Casco con partículas en suspensión: asbesto, diésel y pinturas. */
function Ocupacional() {
  return (
    <>
      <g className="art-float" style={{ ["--art-delay" as string]: "0s" }}>
        <circle cx="16" cy="22" r="3.5" fill={M200} />
      </g>
      <g className="art-float" style={{ ["--art-delay" as string]: "0.9s" }}>
        <circle cx="70" cy="18" r="2.5" fill={M400} />
      </g>
      <g className="art-float" style={{ ["--art-delay" as string]: "1.8s" }}>
        <circle cx="76" cy="40" r="3" fill={M200} />
      </g>
      <g className="art-float" style={{ ["--art-delay" as string]: "2.6s" }}>
        <circle cx="10" cy="44" r="2.5" fill={M400} />
      </g>

      <path d="M22 58a22 22 0 0 1 44 0z" fill={M400} />
      <path d="M40 36h8v22h-8z" fill={M600} opacity="0.55" />
      <rect x="12" y="58" width="64" height="9" rx="4.5" fill={M600} />
    </>
  );
}
