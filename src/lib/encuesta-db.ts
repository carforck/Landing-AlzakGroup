import "server-only";
import mysql from "mysql2/promise";
import { calcularRiesgoCaPulmon, type ResultadoRiesgo } from "./lung-risk";
import { edadDesde, num, TIPOS_DOC, type DatosEncuesta } from "./encuesta";
import type { Empresa } from "../tenants/config";
import type { Sesion } from "./sesion";

/**
 * Guardado de la encuesta: la ÚNICA escritura del portal.
 *
 * Todo lo demás pasa por el pool de `capulmon-db`, que abre cada conexión en
 * `READ ONLY`. Este módulo tiene su propio pool, pequeño, y dos cerrojos:
 *
 *  1. La empresa debe tener `escritura: true` en tenants/config.ts.
 *  2. Su esquema debe estar en ESQUEMAS_CON_ESCRITURA, aquí abajo.
 *
 * Hoy sólo `demo_capul` (la base de la demo de SURA) cumple las dos. Abrir
 * otra base exige tocar los dos sitios a propósito; uno solo no basta.
 */
const ESQUEMAS_CON_ESCRITURA = new Set(["demo_capul"]);

const global_ = globalThis as unknown as { _capulmonPoolEscritura?: mysql.Pool };

function poolEscritura(): mysql.Pool {
  if (!global_._capulmonPoolEscritura) {
    global_._capulmonPoolEscritura = mysql.createPool({
      host: process.env.CAPULMON_DB_HOST,
      port: Number(process.env.CAPULMON_DB_PORT ?? 3306),
      user: process.env.CAPULMON_DB_USER,
      password: process.env.CAPULMON_DB_PASSWORD,
      connectionLimit: 2,
      maxIdle: 1,
      idleTimeout: 30_000,
      connectTimeout: 8_000,
    });
  }
  return global_._capulmonPoolEscritura;
}

export function puedeEscribir(empresa: Empresa) {
  return empresa.escritura && ESQUEMAS_CON_ESCRITURA.has(empresa.esquema);
}

/** Columnas de `data` de una base, con su tipo. Cada empresa tiene las suyas. */
const columnasCache = new Map<string, Map<string, { tipo: string; largo: number | null }>>();
async function columnas(esquema: string) {
  const hecho = columnasCache.get(esquema);
  if (hecho) return hecho;
  const [filas] = await poolEscritura().query<mysql.RowDataPacket[]>(
    `SELECT column_name AS c, data_type AS t, character_maximum_length AS l
       FROM information_schema.columns WHERE table_schema = ? AND table_name = 'data'`,
    [esquema],
  );
  const m = new Map(filas.map((f) => [String(f.c), { tipo: String(f.t), largo: f.l === null ? null : Number(f.l) }]));
  columnasCache.set(esquema, m);
  return m;
}

/** Fecha y hora de Colombia, como corrige Shiny (`ZoneInfo("America/Bogota")`). */
function ahoraBogota() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Bogota",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((x) => [x.type, x.value]),
  );
  return { dia: `${p.year}-${p.month}-${p.day}`, completa: `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}` };
}

export function calcular(d: DatosEncuesta): ResultadoRiesgo {
  const s = (k: keyof DatosEncuesta) => d[k] === "Sí";
  const r = d as Record<string, string | undefined>;
  return calcularRiesgoCaPulmon({
    edad: edadDesde(d.fecha_nac) ?? 0,
    sexo: d.sexo,
    epoc: s("epoc"),
    caAnt: s("ca_ant"),
    caPulmonFam: s("ca_pulmon_fam"),
    fumador: s("fumador"),
    fumadorYear: num(r.fumador_year),
    nCigarrillosDia: num(r.n_cigarrillos_dia),
    fumadorPasivo: s("fumador_pasivo"),
    fumadorPasivoYear: num(r.fumador_pasivo_year),
    hap: s("hap"),
    hapYear: num(r.hap_year),
    asbesto: s("asbesto"),
    asbestoYear: num(r.asbesto_year),
    edadInicioAsbesto: num(r.edad_inicio_asbesto),
    diesel: s("diesel"),
    dieselYear: num(r.diesel_year),
    edadInicioDiesel: num(r.edad_inicio_diesel),
    pintura: s("pintura"),
    pinturaYear: num(r.pintura_year),
    edadInicioPintura: num(r.edad_inicio_pintura),
  });
}

/**
 * Inserta el registro con las columnas que de verdad tiene la base de la
 * empresa, y en su formato:
 *  - `fecha` como `date` o como texto con hora, según la columna.
 *  - `tipo_doc` como código (CC, CE…) si la columna es corta, como en Sanitas
 *    y la demo; con el nombre completo si cabe, como en SURA o Medisinú.
 *  - Las preguntas de detalle que no aplican van como NULL, igual que `None`
 *    en Shiny. `ca_pulmon` sólo se guarda donde existe la columna.
 */
export async function guardarEncuesta(empresa: Empresa, sesion: Sesion, d: DatosEncuesta) {
  if (!puedeEscribir(empresa)) throw new Error(`La base de ${empresa.nombre} es de solo lectura.`);

  const cols = await columnas(empresa.esquema);
  const resultado = calcular(d);
  const ahora = ahoraBogota();
  const r = d as Record<string, string | undefined>;
  const tipoDoc = TIPOS_DOC.find((t) => t.codigo === d.tipo_doc)!;
  const corto = (cols.get("tipo_doc")?.largo ?? 255) <= 10;

  const fila: Record<string, string | number | null> = {
    fecha: cols.get("fecha")?.tipo === "date" ? ahora.dia : ahora.completa,
    user: sesion.usuario,
    rol: sesion.rol,
    nombre: d.nombre,
    apellido: d.apellido,
    tipo_doc: corto ? tipoDoc.codigo : tipoDoc.nombre,
    documento: d.documento,
    fecha_nac: d.fecha_nac,
    edad: edadDesde(d.fecha_nac),
    sexo: d.sexo,
    departamento: d.departamento ?? null,
    municipio: d.municipio ?? null,
    ca_pulmon: d.ca_pulmon,
    ca_pulmon_fam: d.ca_pulmon_fam,
    ca_ant: d.ca_ant,
    epoc: d.epoc,
    fumador: d.fumador,
    fumador_pasivo: d.fumador_pasivo,
    vaping: d.vaping,
    hap: d.hap,
    asbesto: d.asbesto,
    diesel: d.diesel,
    pintura: d.pintura,
    risk: resultado.riesgo,
    prob: resultado.prob,
    class_risk: resultado.claseRiesgo,
  };
  for (const k of [
    "fumador_year",
    "n_cigarrillos_dia",
    "fumador_pasivo_year",
    "vaping_year",
    "hap_year",
    "edad_inicio_asbesto",
    "asbesto_year",
    "edad_inicio_diesel",
    "diesel_year",
    "edad_inicio_pintura",
    "pintura_year",
  ]) {
    fila[k] = r[k] ? Number(r[k]) : null;
  }

  const claves = Object.keys(fila).filter((k) => cols.has(k));
  await poolEscritura().query(
    `INSERT INTO \`${empresa.esquema}\`.data (${claves.map((k) => `\`${k}\``).join(", ")}) VALUES (${claves.map(() => "?").join(", ")})`,
    claves.map((k) => fila[k]),
  );
  return { resultado, fecha: ahora.completa };
}
