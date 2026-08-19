/**
 * Port a TypeScript del modelo PLCOm2012noRace + riesgo ambiental y ocupacional.
 *
 * Original: `modules/risk_ca_pulmon.py` de las apps Shiny de CAPULMON.
 * Desarrollo de ALZAK (2024).
 *
 * Referencia del núcleo estadístico:
 *   Tammemägi MC, Katki HA, Hocking WG, et al. Selection criteria for lung-cancer
 *   screening. N Engl J Med. 2013;368:728-736. doi:10.1056/NEJMoa1211776
 *
 * Los coeficientes son idénticos a los de la app en producción. Esta copia existe
 * para que la demostración de la web corra en el navegador, sin enviar a un
 * servidor los datos de salud que teclea el visitante. No sustituye a la app
 * clínica: ésta no persiste nada y omite la captura de identidad.
 */

/** Betas del modelo. No tocar sin actualizar también la app Shiny. */
const B = {
  cero: -0.5953979,
  edad: 0.0778895,
  bmi: -0.0251066,
  educacion: -0.0811569,
  epoc: 0.3606082,
  ca: 0.4683545,
  faCa: 0.584541,
  fumar: 0.2675539,
  nCigarrillos: -1.767578,
  ajusteNCigarrillos: -0.4021541613,
  tiempoFumador: 0.031949,
  fumadorPasivo: 0.4605103,
  hap: 1.3967896,
  asbesto: 1.7282104,
  diesel: 3.5482788,
  pintura: 0.7339478,
} as const;

/**
 * El PLCOm2012 pide IMC y nivel educativo. La app los asume en vez de
 * preguntarlos: el IMC sale del promedio ENSIN 2015 para mayores de 50, por sexo,
 * y la educación se fija en "básica" (nivel 2 de 6). Cambiarlos aquí cambiaría el
 * resultado respecto de la app clínica.
 */
const BMI_ASUMIDO = { M: 26.61297, F: 27.91364 } as const;
const EDUCACION_ASUMIDA = 2;

/**
 * Puntos de corte de la probabilidad. Un fumador activo salta a "alto" con 20 %,
 * mientras que a un no fumador se le exige 53 %: el modelo se construyó sobre
 * cohortes de fumadores, así que en no fumadores la escala se estira.
 */
const CORTES = {
  fumador: { moderado: 0.1, alto: 0.2 },
  noFumador: { moderado: 0.265, alto: 0.53 },
} as const;

export type ClaseRiesgo = "Riesgo bajo" | "Riesgo moderado" | "Riesgo alto";

export type EntradaRiesgo = {
  edad: number;
  sexo: "M" | "F";
  epoc: boolean;
  caAnt: boolean;
  caPulmonFam: boolean;
  fumador: boolean;
  fumadorYear: number;
  nCigarrillosDia: number;
  fumadorPasivo: boolean;
  fumadorPasivoYear: number;
  hap: boolean;
  hapYear: number;
  asbesto: boolean;
  asbestoYear: number;
  edadInicioAsbesto: number;
  diesel: boolean;
  dieselYear: number;
  edadInicioDiesel: number;
  pintura: boolean;
  pinturaYear: number;
  edadInicioPintura: number;
};

export type ResultadoRiesgo = {
  /** Predictor lineal, antes de la transformación logística. */
  riesgo: number;
  /** Probabilidad a 6 años, entre 0 y 1. */
  prob: number;
  claseRiesgo: ClaseRiesgo;
  recomendacion: string;
};

const RECOMENDACIONES: Record<ClaseRiesgo, string> = {
  "Riesgo bajo":
    "Se recomienda no hacer seguimiento para cáncer de pulmón. Sin embargo, si el paciente tiene antecedente de EPOC, tabaquismo o enfermedad pulmonar debe ser remitido al respectivo programa de gestión del riesgo.",
  "Riesgo moderado":
    "Se recomienda hacer seguimiento anual con medicina general para una evaluación periódica del riesgo. Adicionalmente, si el paciente tiene antecedente de EPOC, tabaquismo o enfermedad pulmonar debe ser redirigido a los programas de cada una de esas enfermedades.",
  "Riesgo alto":
    "Se recomienda remitir al programa de detección temprana de cáncer de pulmón y hacer seguimiento.",
};

export function calcularRiesgoCaPulmon(e: EntradaRiesgo): ResultadoRiesgo {
  let riesgo = B.cero;

  if (e.edad > 0) riesgo += B.edad * (e.edad - 62);

  riesgo += B.bmi * (BMI_ASUMIDO[e.sexo] - 27);
  riesgo += B.educacion * (EDUCACION_ASUMIDA - 4);

  if (e.caPulmonFam) riesgo += B.faCa;
  if (e.caAnt) riesgo += B.ca;
  if (e.epoc) riesgo += B.epoc;

  // La intensidad del tabaquismo entra invertida: el daño por cigarrillo extra
  // decrece, así que 40/día no duplica el efecto de 20/día.
  if (e.fumador) {
    riesgo +=
      B.fumar +
      B.nCigarrillos * (Math.pow(e.nCigarrillosDia / 10, -1) + B.ajusteNCigarrillos) +
      B.tiempoFumador * (e.fumadorYear - 27);
  }

  // Las exposiciones ambientales y ocupacionales sólo suman si superan un umbral
  // de dosis; por debajo, la evidencia no sostiene un efecto.
  if (e.fumadorPasivo && e.fumadorPasivoYear >= 10) riesgo += B.fumadorPasivo;
  if (e.hap && e.hapYear >= 34) riesgo += B.hap;

  // Las tres ocupacionales piden además 30 años de latencia desde la exposición.
  if (e.asbesto && e.asbestoYear >= 10 && e.edad - e.edadInicioAsbesto >= 30) {
    riesgo += B.asbesto;
  }
  if (e.diesel && e.dieselYear >= 10 && e.edad - e.edadInicioDiesel >= 30) {
    riesgo += B.diesel;
  }
  if (e.pintura && e.pinturaYear >= 10 && e.edad - e.edadInicioPintura >= 30) {
    riesgo += B.pintura;
  }

  // Ajuste discrecional NCCN v2.2024: quien ya cumple el criterio clásico de
  // tamizaje (≥50 años y ≥20 paquetes-año) se recalifica un 20 % al alza.
  if (e.fumador) {
    const packYear = (e.nCigarrillosDia / 20) * e.fumadorYear;
    if (e.edad >= 50 && packYear >= 20) riesgo = riesgo * 1.2;
  }

  const prob = Math.exp(riesgo) / (1 + Math.exp(riesgo));

  const corte = e.fumador ? CORTES.fumador : CORTES.noFumador;
  const claseRiesgo: ClaseRiesgo =
    prob < corte.moderado
      ? "Riesgo bajo"
      : prob < corte.alto
        ? "Riesgo moderado"
        : "Riesgo alto";

  return { riesgo, prob, claseRiesgo, recomendacion: RECOMENDACIONES[claseRiesgo] };
}

/** Paquetes-año: la unidad con la que las guías expresan la dosis acumulada. */
export function packYear(nCigarrillosDia: number, anios: number) {
  return (nCigarrillosDia / 20) * anios;
}
