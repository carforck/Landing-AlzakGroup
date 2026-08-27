import "server-only";
import mysql from "mysql2/promise";

/**
 * Acceso de solo lectura a las bases de CAPULMON para la vista de administración.
 *
 * Replica lo que hace el tablero `dash-seguimiento-capulmon`: una sola cuenta
 * con permiso de lectura sobre las cinco bases de los centros, consultadas por
 * nombre completo de esquema.
 *
 * Tres cosas que no conviene cambiar a la ligera:
 *
 *  1. Las credenciales llegan por variables de entorno. En los proyectos de
 *     Shiny viven en un `init.json` que en tres repositorios acabó versionado;
 *     aquí eso no puede ocurrir porque no hay archivo que olvidar en el commit.
 *  2. Si faltan las variables, el módulo no se conecta y lo dice. Es preferible
 *     fallar de forma visible a arrastrar una configuración a medias.
 *  3. Sólo se piden agregados: conteos y fechas. Ninguna consulta trae columnas
 *     que identifiquen a un paciente.
 */

/** Cada centro y el esquema donde viven sus datos. */
export const CENTROS = {
  Biotorax: "capulmonDB",
  Foscal: "capulmon_foscal_DB",
  SURA: "capulmon_sura_DB",
  Medisinu: "capulmon_medisinu_DB",
  Sanitas: "capulmon_sanitas_DB",
} as const;

export type Centro = keyof typeof CENTROS;

export type ResumenCentro = {
  centro: Centro;
  alto: number;
  moderado: number;
  bajo: number;
  total: number;
  ultimoRegistro: string | null;
};

export type Resumen = {
  centros: ResumenCentro[];
  caidos: Centro[];
  total: number;
  porNivel: { alto: number; moderado: number; bajo: number };
};

export class ConfiguracionAusente extends Error {
  constructor(public faltan: string[]) {
    super(`Faltan variables de entorno: ${faltan.join(", ")}`);
    this.name = "ConfiguracionAusente";
  }
}

const REQUERIDAS = [
  "CAPULMON_DB_HOST",
  "CAPULMON_DB_USER",
  "CAPULMON_DB_PASSWORD",
] as const;

export function faltaConfiguracion(): string[] {
  return REQUERIDAS.filter((k) => !process.env[k]);
}

function config(): mysql.PoolOptions {
  const faltan = faltaConfiguracion();
  if (faltan.length) throw new ConfiguracionAusente(faltan);

  return {
    host: process.env.CAPULMON_DB_HOST,
    port: Number(process.env.CAPULMON_DB_PORT ?? 3306),
    user: process.env.CAPULMON_DB_USER,
    password: process.env.CAPULMON_DB_PASSWORD,
    database: process.env.CAPULMON_DB_NAME ?? "AnaliticaDB",
    waitForConnections: true,
    // El servidor de base es el más pequeño del catálogo (un núcleo, 1 GB) y
    // sostiene las cinco aplicaciones en producción: conviene no apretarlo.
    connectionLimit: 4,
    maxIdle: 2,
    idleTimeout: 30_000,
    connectTimeout: 8_000,
  };
}

/**
 * El pool se guarda en `globalThis` porque en desarrollo Next recarga los
 * módulos en cada cambio: sin esto se abriría una conexión nueva por recarga
 * hasta agotar el límite del servidor.
 */
const global_ = globalThis as unknown as { _capulmonPool?: mysql.Pool };

function pool(): mysql.Pool {
  if (!global_._capulmonPool) {
    global_._capulmonPool = mysql.createPool(config());
  }
  return global_._capulmonPool;
}

/**
 * Expresión SQL que normaliza la columna `fecha`.
 *
 * Cada centro la guarda distinto y algunos mezclan formatos dentro de la misma
 * tabla: Foscal tiene un 30 % en `dd/mm/aaaa hh:mm` y el resto en ISO, y Sanitas
 * la declara como `date` mientras los demás usan `text`. Probar los cuatro
 * formatos en orden y quedarse con el primero que resuelva lleva el parseo al
 * 100 % en los cinco centros; con una sola máscara se perdía casi un tercio de
 * Foscal.
 *
 * Es la causa del hallazgo "estructura de datos inconsistente" de la propuesta
 * de arquitectura. Esto lo salva al leer, pero lo correcto es unificar el
 * esquema en origen.
 */
const FECHA = `COALESCE(
  STR_TO_DATE(LEFT(fecha,19),'%Y-%m-%d %H:%i:%s'),
  STR_TO_DATE(LEFT(fecha,16),'%d/%m/%Y %H:%i'),
  STR_TO_DATE(LEFT(fecha,10),'%d/%m/%Y'),
  STR_TO_DATE(LEFT(fecha,10),'%Y-%m-%d')
)`;

/**
 * Conteo por nivel de riesgo y último registro de cada centro.
 *
 * Se lanza una consulta por centro en lugar del UNION que usa el tablero: si un
 * esquema no responde se pierde ese centro y no el informe entero, y además se
 * puede decir cuál falló.
 */
export async function obtenerResumen(): Promise<Resumen> {
  const p = pool();
  const nombres = Object.keys(CENTROS) as Centro[];

  const resultados = await Promise.all(
    nombres.map(async (centro): Promise<ResumenCentro | null> => {
      const esquema = CENTROS[centro];
      try {
        const [filas] = await p.query<mysql.RowDataPacket[]>(
          `SELECT class_risk AS nivel,
                  COUNT(*) AS total,
                  DATE_FORMAT(MAX(${FECHA}), '%Y-%m-%d %H:%i:%s') AS ultima
             FROM \`${esquema}\`.data
            WHERE class_risk IN ('Riesgo alto','Riesgo moderado','Riesgo bajo')
            GROUP BY class_risk`,
        );

        const r: ResumenCentro = {
          centro,
          alto: 0,
          moderado: 0,
          bajo: 0,
          total: 0,
          ultimoRegistro: null,
        };

        for (const f of filas) {
          const n = Number(f.total) || 0;
          if (f.nivel === "Riesgo alto") r.alto = n;
          else if (f.nivel === "Riesgo moderado") r.moderado = n;
          else if (f.nivel === "Riesgo bajo") r.bajo = n;
          r.total += n;

          const u = f.ultima ? String(f.ultima) : null;
          if (u && (!r.ultimoRegistro || u > r.ultimoRegistro)) r.ultimoRegistro = u;
        }
        return r;
      } catch {
        return null;
      }
    }),
  );

  const centros: ResumenCentro[] = [];
  const caidos: Centro[] = [];
  resultados.forEach((r, i) => (r ? centros.push(r) : caidos.push(nombres[i])));

  centros.sort((a, b) => b.total - a.total);

  return {
    centros,
    caidos,
    total: centros.reduce((a, c) => a + c.total, 0),
    porNivel: {
      alto: centros.reduce((a, c) => a + c.alto, 0),
      moderado: centros.reduce((a, c) => a + c.moderado, 0),
      bajo: centros.reduce((a, c) => a + c.bajo, 0),
    },
  };
}



export type PuntoSerie = { mes: string; total: number } & Partial<Record<Centro, number>>;

/**
 * Registros por mes y centro, para la gráfica de evolución.
 *
 * Se agrupa por mes y no por día: con 2.026 registros repartidos en diez meses,
 * el detalle diario da una línea de ruido en la que no se distingue nada.
 */
export async function obtenerSerie(): Promise<PuntoSerie[]> {
  const p = pool();
  const nombres = Object.keys(CENTROS) as Centro[];

  const porCentro = await Promise.all(
    nombres.map(async (centro) => {
      try {
        const [filas] = await p.query<mysql.RowDataPacket[]>(
          `SELECT DATE_FORMAT(${FECHA}, '%Y-%m') AS mes, COUNT(*) AS n
             FROM \`${CENTROS[centro]}\`.data
            WHERE ${FECHA} IS NOT NULL
            GROUP BY mes`,
        );
        return { centro, filas };
      } catch {
        return { centro, filas: [] as mysql.RowDataPacket[] };
      }
    }),
  );

  const mapa = new Map<string, PuntoSerie>();
  for (const { centro, filas } of porCentro) {
    for (const f of filas) {
      const mes = String(f.mes);
      const n = Number(f.n) || 0;
      const punto = mapa.get(mes) ?? { mes, total: 0 };
      punto[centro] = (punto[centro] ?? 0) + n;
      punto.total += n;
      mapa.set(mes, punto);
    }
  }

  return [...mapa.values()].sort((a, b) => a.mes.localeCompare(b.mes));
}

export type Metricas = {
  /** Registros en la ventana de 7 dias que termina en el ultimo dia con datos. */
  ultimos7: number;
  /** Media de registros por dia, contando solo los dias que tuvieron registros. */
  promedioDiario: number;
  diasConRegistro: number;
  ultimoDia: string | null;
};

/**
 * Metricas de cabecera, replicando las del tablero `dash-seguimiento-capulmon`.
 *
 * Dos definiciones que conviene no cambiar sin avisar, porque son las que hacen
 * que las cifras coincidan con el tablero que ya usa Gerencia:
 *
 *  · "Ultimos 7 dias" cuenta hacia atras desde el ULTIMO DIA CON REGISTROS, no
 *    desde hoy. Si nadie registra durante un mes, la cifra sigue mostrando la
 *    ultima semana con actividad en lugar de caer a cero.
 *  · "Promedio diario" divide entre los dias que tuvieron registros, no entre
 *    los dias del calendario. Los fines de semana sin actividad no hunden la
 *    media.
 */
export async function obtenerMetricas(): Promise<Metricas> {
  const p = pool();
  const nombres = Object.keys(CENTROS) as Centro[];

  const porDia = new Map<string, number>();
  await Promise.all(
    nombres.map(async (centro) => {
      try {
        const [filas] = await p.query<mysql.RowDataPacket[]>(
          `SELECT DATE_FORMAT(${FECHA}, '%Y-%m-%d') AS dia, COUNT(*) AS n
             FROM \`${CENTROS[centro]}\`.data
            WHERE ${FECHA} IS NOT NULL
            GROUP BY dia`,
        );
        for (const f of filas) {
          const dia = String(f.dia).slice(0, 10);
          porDia.set(dia, (porDia.get(dia) ?? 0) + (Number(f.n) || 0));
        }
      } catch {
        // Un centro caido no invalida las metricas de los demas.
      }
    }),
  );

  if (porDia.size === 0) {
    return { ultimos7: 0, promedioDiario: 0, diasConRegistro: 0, ultimoDia: null };
  }

  const dias = [...porDia.keys()].sort();
  const ultimoDia = dias[dias.length - 1];

  const corte = new Date(`${ultimoDia}T00:00:00`);
  corte.setDate(corte.getDate() - 6);
  const desde = corte.toISOString().slice(0, 10);

  let ultimos7 = 0;
  let total = 0;
  for (const [dia, n] of porDia) {
    total += n;
    if (dia >= desde) ultimos7 += n;
  }

  return {
    ultimos7,
    promedioDiario: total / porDia.size,
    diasConRegistro: porDia.size,
    ultimoDia,
  };
}

export type RegistroAlto = {
  centro: Centro;
  fecha: string | null;
  edad: number | null;
  sexo: string | null;
  score: number | null;
  prob: number | null;
};

export type PaginaRegistros = {
  filas: RegistroAlto[];
  total: number;
  pagina: number;
  paginas: number;
  porPagina: number;
};

/**
 * Registros en riesgo alto, con paginación.
 *
 * Sin centro devuelve los de los cinco, cada fila con el suyo. Se consulta cada
 * esquema por separado y se ordena en memoria: un UNION sobre cinco bases con
 * ORDER BY y LIMIT obliga al servidor a materializar el conjunto entero, y ese
 * servidor es el más pequeño del catálogo. Con dos mil registros compensa traer
 * las fechas y ordenar aquí.
 *
 * ANONIMIZADO más estricto que el tablero original: aquel descarta `documento`,
 * `nombre` y `apellido`, pero deja pasar `tipo_doc`, `fecha_nac` y `user`, que
 * también identifican. Aquí se piden SOLO las columnas de la tabla, así que
 * ninguna otra puede colarse si el esquema cambia.
 */
export async function obtenerRegistrosAltos({
  centro,
  pagina = 1,
  porPagina = 25,
}: {
  centro?: Centro | null;
  pagina?: number;
  porPagina?: number;
}): Promise<PaginaRegistros> {
  const p = pool();
  const objetivo = centro ? [centro] : (Object.keys(CENTROS) as Centro[]);

  const porCentro = await Promise.all(
    objetivo.map(async (c) => {
      try {
        const [filas] = await p.query<mysql.RowDataPacket[]>(
          `SELECT DATE_FORMAT(${FECHA}, '%Y-%m-%d %H:%i') AS fecha,
                  edad, sexo, risk AS score, prob
             FROM \`${CENTROS[c]}\`.data
            WHERE class_risk = 'Riesgo alto'`,
        );
        return filas.map(
          (f): RegistroAlto => ({
            centro: c,
            fecha: f.fecha ? String(f.fecha) : null,
            edad: f.edad === null ? null : Number(f.edad),
            sexo: f.sexo === null ? null : String(f.sexo),
            score: f.score === null ? null : Number(f.score),
            prob: f.prob === null ? null : Number(f.prob),
          }),
        );
      } catch {
        return [] as RegistroAlto[];
      }
    }),
  );

  // Más recientes primero. Las fechas ya vienen normalizadas a texto ISO, así
  // que ordenar como cadena equivale a ordenar cronológicamente.
  const todas = porCentro.flat().sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));

  const total = todas.length;
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  const actual = Math.min(Math.max(1, pagina), paginas);
  const desde = (actual - 1) * porPagina;

  return {
    filas: todas.slice(desde, desde + porPagina),
    total,
    pagina: actual,
    paginas,
    porPagina,
  };
}
