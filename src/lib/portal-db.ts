import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import type mysql from "mysql2/promise";
import { FECHA, pool } from "./capulmon-db";
import { ROLES, todasLasEmpresas, type Empresa, type Rol } from "../tenants/config";

/**
 * Consultas del portal por empresa. Todas reciben la `Empresa` ya resuelta
 * desde la sesión (ver `exigirSesion`), nunca un slug venido de la URL.
 *
 * El esquema se interpola en el SQL porque MySQL no admite parámetros en
 * nombres de base, pero sale de `tenants/config.ts`, que es código nuestro.
 * Todo valor que teclea el visitante va como parámetro `?`.
 */

const NIVELES = ["Riesgo bajo", "Riesgo moderado", "Riesgo alto"] as const;
export type Nivel = (typeof NIVELES)[number];

function esNivel(v: string | undefined): v is Nivel {
  return !!v && (NIVELES as readonly string[]).includes(v);
}

// ── Acceso ──────────────────────────────────────────────────────────────

export type Credencial = { empresa: Empresa; usuario: string; nombre: string; rol: Rol };

/**
 * Busca el usuario en las cinco tablas `users` y valida la clave.
 *
 * Las apps de Shiny guardan `sha256(clave)` en hexadecimal, sin sal. Se
 * compara igual para que todos entren con la clave que ya tienen; migrar a un
 * hash con sal (bcrypt o argon2) exige escribir, y queda para cuando exista la
 * tabla central de usuarios.
 *
 * Devuelve todas las coincidencias: si el mismo usuario y clave valen en dos
 * empresas, quien llama no puede adivinar a cuál quería entrar la persona.
 */
export async function validarCredencial(usuario: string, clave: string): Promise<Credencial[]> {
  const hash = Buffer.from(createHash("sha256").update(clave).digest("hex"));
  const p = pool();

  const resultados = await Promise.all(
    todasLasEmpresas().map(async (empresa) => {
      const nombre = empresa.usuariosConFicha ? "nombre" : "NULL";
      try {
        const [filas] = await p.query<mysql.RowDataPacket[]>(
          `SELECT ${empresa.columnaUsuario} AS usuario, pwd, rol, ${nombre} AS nombre
             FROM \`${empresa.esquema}\`.users
            WHERE ${empresa.columnaUsuario} = ?
            LIMIT 5`,
          [usuario],
        );
        // La comparación de MySQL ignora mayúsculas; Shiny no. Se exige igualdad exacta.
        const fila = filas.find((f) => String(f.usuario) === usuario);
        if (!fila || !fila.pwd) return null;

        const guardado = Buffer.from(String(fila.pwd).toLowerCase());
        if (guardado.length !== hash.length || !timingSafeEqual(guardado, hash)) return null;

        const rol = String(fila.rol) as Rol;
        if (!ROLES.includes(rol)) return null;

        return {
          empresa,
          usuario,
          nombre: fila.nombre ? String(fila.nombre) : usuario,
          rol,
        } satisfies Credencial;
      } catch {
        // Una base caída no debe impedir que entren los usuarios de las demás.
        return null;
      }
    }),
  );

  return resultados.filter((r): r is Credencial => r !== null);
}

// ── Filtros ─────────────────────────────────────────────────────────────

export type Filtros = {
  nivel?: Nivel;
  departamento?: string;
  municipio?: string;
  /** AAAA-MM-DD, incluidos. */
  desde?: string;
  hasta?: string;
};

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Limpia lo que llega en la URL: lo que no encaja se descarta, no se corrige. */
export function leerFiltros(
  sp: Record<string, string | string[] | undefined>,
  empresa: Empresa,
): Filtros {
  const uno = (k: string) => {
    const v = sp[k];
    const s = Array.isArray(v) ? v[0] : v;
    return s && s.trim() && s !== "Todos" ? s.trim().slice(0, 120) : undefined;
  };
  const nivel = uno("nivel");
  const desde = uno("desde");
  const hasta = uno("hasta");
  return {
    nivel: esNivel(nivel) ? nivel : undefined,
    departamento: empresa.geografia ? uno("departamento") : undefined,
    municipio: empresa.geografia && uno("departamento") ? uno("municipio") : undefined,
    desde: desde && FECHA_ISO.test(desde) ? desde : undefined,
    hasta: hasta && FECHA_ISO.test(hasta) ? hasta : undefined,
  };
}

function where(f: Filtros): { sql: string; params: string[] } {
  const partes: string[] = [];
  const params: string[] = [];
  if (f.nivel) {
    partes.push("class_risk = ?");
    params.push(f.nivel);
  }
  if (f.departamento) {
    partes.push("departamento = ?");
    params.push(f.departamento);
  }
  if (f.municipio) {
    partes.push("municipio = ?");
    params.push(f.municipio);
  }
  if (f.desde) {
    partes.push(`DATE(${FECHA}) >= ?`);
    params.push(f.desde);
  }
  if (f.hasta) {
    partes.push(`DATE(${FECHA}) <= ?`);
    params.push(f.hasta);
  }
  return { sql: partes.length ? `WHERE ${partes.join(" AND ")}` : "", params };
}

/** Departamentos y municipios presentes en los datos de la empresa. */
export async function opcionesGeografia(
  empresa: Empresa,
): Promise<{ departamento: string; municipios: string[] }[]> {
  if (!empresa.geografia) return [];
  const [filas] = await pool().query<mysql.RowDataPacket[]>(
    `SELECT DISTINCT departamento, municipio FROM \`${empresa.esquema}\`.data
      WHERE departamento IS NOT NULL AND departamento <> ''
      ORDER BY departamento, municipio`,
  );
  const mapa = new Map<string, string[]>();
  for (const f of filas) {
    const d = String(f.departamento);
    if (!mapa.has(d)) mapa.set(d, []);
    if (f.municipio) mapa.get(d)!.push(String(f.municipio));
  }
  return [...mapa].map(([departamento, municipios]) => ({ departamento, municipios }));
}

export async function rangoFechas(empresa: Empresa): Promise<{ min: string | null; max: string | null }> {
  const [filas] = await pool().query<mysql.RowDataPacket[]>(
    `SELECT DATE_FORMAT(MIN(${FECHA}), '%Y-%m-%d') AS min, DATE_FORMAT(MAX(${FECHA}), '%Y-%m-%d') AS max
       FROM \`${empresa.esquema}\`.data`,
  );
  return { min: filas[0]?.min ?? null, max: filas[0]?.max ?? null };
}

// ── Tablero ─────────────────────────────────────────────────────────────

export type Conteo = { etiqueta: string; n: number };

export type PuntoSerie = {
  /** AAAA-MM-DD del inicio del cubo. */
  inicio: string;
  total: number;
  alto: number;
  moderado: number;
  bajo: number;
};

export type Totales = { total: number; alto: number; fumadores: number };

export type Tablero = {
  total: number;
  alto: number;
  fumadores: number;
  porNivel: Record<Nivel, number>;
  /** Serie con todos los cubos, también los vacíos, y el reparto por nivel. */
  serie: PuntoSerie[];
  granularidad: "día" | "semana";
  /** Mismo largo que `serie`: el período inmediatamente anterior, o null. */
  serieAnterior: number[] | null;
  rangoAnterior: { desde: string; hasta: string } | null;
  /** Por municipio o edad: `n` en riesgo alto de `de` registros. */
  altoPorGrupo: { etiqueta: string; n: number; de: number }[];
  altoPorGrupoMinimo: number;
  /** Primer y último día con datos, para el pie de cada tarjeta. */
  rango: { desde: string | null; hasta: string | null };
  /** Últimos 30 días frente a los 30 anteriores, contados desde hoy. */
  periodo: { actual: Totales; anterior: Totales };
  sexo: Conteo[];
  epoc: Conteo[];
  fumador: Conteo[];
  edad: Conteo[];
  paquetesAno: Conteo[];
  /** Percentil 98 de paquetes-año: tope del eje de la dispersión. */
  paquetesTope: number;
  /** Fumadores: paquetes-año contra probabilidad, por sexo. */
  dispersion: { x: number; y: number; nivel: string; sexo: string }[];
  municipios: Conteo[];
  /**
   * Para el mapa: conteo por código DANE. Las apps guardan "05-ANTIOQUIA" y
   * "05001-MEDELLÍN", así que el código es el prefijo numérico.
   */
  mapa: {
    departamentos: { codigo: string; nombre: string; n: number }[];
    municipios: { codigo: string; nombre: string; departamento: string; n: number }[];
    sinUbicacion: number;
  } | null;
  /** Registros con datos imposibles. Se cuentan para decirlo, no se corrigen. */
  calidad: { probFueraDeRango: number; nivelInvalido: number };
};

function contar(valores: (string | null)[]): Conteo[] {
  const m = new Map<string, number>();
  for (const v of valores) {
    const k = v && v.trim() ? v.trim() : "Sin dato";
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m].map(([etiqueta, n]) => ({ etiqueta, n })).sort((a, b) => b.n - a.n);
}

/**
 * Histograma con la última barra abierta ("80+"). `tope` corta la cola: hay
 * registros con valores imposibles (más de 4.000 paquetes-año, errores de
 * captura) y sin tope producían cientos de barras de un píxel y no se veía
 * ninguna.
 */
function histograma(valores: number[], ancho: number, tope = Infinity): Conteo[] {
  if (!valores.length) return [];
  const min = Math.floor(Math.min(...valores) / ancho) * ancho;
  const max = Math.min(Math.floor(Math.max(...valores) / ancho) * ancho, tope);
  const out: Conteo[] = [];
  for (let b = min; b <= max; b += ancho) {
    const ultima = b === max && Math.max(...valores) >= b + ancho;
    out.push({
      etiqueta: ultima ? `${b}+` : `${b}–${b + ancho - 1}`,
      n: valores.filter((v) => v >= b && (ultima || v < b + ancho)).length,
    });
  }
  return out;
}

/** Percentil simple, para fijar el eje de la dispersión sin que lo dicten los errores de captura. */
function percentil(valores: number[], p: number) {
  if (!valores.length) return 0;
  const o = [...valores].sort((a, b) => a - b);
  return o[Math.min(o.length - 1, Math.floor((p / 100) * o.length))];
}

/**
 * "05001-MEDELLÍN" → "Medellín". Las apps guardan el código DANE pegado al
 * nombre y en mayúsculas; para leer se quita el código y se pasa a título.
 * El valor guardado no cambia: los filtros siguen enviando el original.
 */
export function nombreLugar(v: string) {
  const sin = v.replace(/^\d+\s*-\s*/, "").trim().toLocaleLowerCase("es-CO");
  const menores = new Set(["de", "del", "la", "las", "los", "y", "el"]);
  return sin
    .split(/(\s+|-)/)
    .map((w, i) => (i > 0 && menores.has(w) ? w : w.charAt(0).toLocaleUpperCase("es-CO") + w.slice(1)))
    .join("")
    .replace(/D\.c\./g, "D.C.");
}

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function agruparMapa(filas: mysql.RowDataPacket[]) {
  const dep = new Map<string, { codigo: string; nombre: string; n: number }>();
  const mun = new Map<string, { codigo: string; nombre: string; departamento: string; n: number }>();
  let sinUbicacion = 0;
  for (const r of filas) {
    const d = r.departamento ? String(r.departamento) : "";
    const m = r.municipio ? String(r.municipio) : "";
    const cd = d.match(/^(\d{2})\s*-/)?.[1];
    const cm = m.match(/^(\d{5})\s*-/)?.[1];
    if (!cd) {
      sinUbicacion++;
      continue;
    }
    const vd = dep.get(cd) ?? { codigo: cd, nombre: nombreLugar(d), n: 0 };
    vd.n++;
    dep.set(cd, vd);
    if (cm) {
      const vm = mun.get(cm) ?? { codigo: cm, nombre: nombreLugar(m), departamento: nombreLugar(d), n: 0 };
      vm.n++;
      mun.set(cm, vm);
    }
  }
  const orden = <T extends { n: number }>(a: T, b: T) => b.n - a.n;
  return { departamentos: [...dep.values()].sort(orden), municipios: [...mun.values()].sort(orden), sinUbicacion };
}

export async function obtenerTablero(empresa: Empresa, f: Filtros): Promise<Tablero> {
  const { sql, params } = where(f);
  const geo = empresa.geografia ? "departamento, municipio," : "NULL AS departamento, NULL AS municipio,";
  const [filas] = await pool().query<mysql.RowDataPacket[]>(
    `SELECT DATE_FORMAT(${FECHA}, '%Y-%m-%d') AS dia, edad, sexo, epoc, fumador,
            fumador_year, n_cigarrillos_dia, ${geo} class_risk, prob
       FROM \`${empresa.esquema}\`.data ${sql}`,
    params,
  );

  const porNivel = { "Riesgo bajo": 0, "Riesgo moderado": 0, "Riesgo alto": 0 } as Record<Nivel, number>;
  for (const r of filas) if (esNivel(r.class_risk)) porNivel[r.class_risk as Nivel]++;

  /*
   * Serie: por día si el rango cabe en un trimestre, por semana si no. Por mes
   * quedaban siete u ocho puntos para SURA y una línea con tan pocos puntos no
   * deja ver la forma de la actividad. Se rellenan los cubos sin registros con
   * cero: si se omitieran, la línea uniría dos días con datos saltándose una
   * semana vacía y daría a entender actividad donde no la hubo.
   */
  const dias = filas.map((r) => r.dia as string | null).filter((d): d is string => !!d).sort();
  const DIA = 864e5;
  const aFecha = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
  const aIso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
  // El eje cubre el rango pedido, no sólo los días con datos: si se piden 30
  // días y sólo hubo registros en cinco, la serie debe mostrar los 25 vacíos.
  const ini = f.desde ?? dias[0];
  const finRango = f.hasta ?? dias.at(-1);
  const semanal = !!ini && !!finRango && aFecha(finRango) - aFecha(ini) > 92 * DIA;
  // Semanas desde el lunes, como las cuenta Colombia.
  const cubo = (iso: string) => {
    if (!semanal) return iso;
    const ms = aFecha(iso);
    const dow = (new Date(ms).getUTCDay() + 6) % 7;
    return aIso(ms - dow * DIA);
  };
  const cubos = new Map<string, PuntoSerie>();
  const paso = semanal ? 7 * DIA : DIA;
  if (ini && finRango) {
    for (let t = aFecha(cubo(ini)); t <= aFecha(finRango); t += paso) {
      const k = aIso(t);
      cubos.set(k, { inicio: k, total: 0, alto: 0, moderado: 0, bajo: 0 });
    }
  }
  const CLAVE = { "Riesgo alto": "alto", "Riesgo moderado": "moderado", "Riesgo bajo": "bajo" } as const;
  for (const r of filas) {
    if (!r.dia) continue;
    const c = cubos.get(cubo(r.dia));
    if (!c) continue;
    c.total++;
    if (esNivel(r.class_risk)) c[CLAVE[r.class_risk as Nivel]]++;
  }
  const serie = [...cubos.values()];

  /*
   * Período anterior, como la línea punteada "Anterior" de Radar: el mismo
   * número de días justo antes del rango pedido, con los mismos filtros, y
   * alineado cubo a cubo con la serie actual. Sólo existe si se eligió un
   * rango; sobre "todo el histórico" no hay un antes con qué comparar.
   */
  let serieAnterior: number[] | null = null;
  let rangoAnterior: { desde: string; hasta: string } | null = null;
  if (f.desde && f.hasta && serie.length) {
    const largo = aFecha(f.hasta) - aFecha(f.desde) + DIA;
    const desdeAnt = aIso(aFecha(f.desde) - largo);
    const hastaAnt = aIso(aFecha(f.desde) - DIA);
    const previo = where({ ...f, desde: desdeAnt, hasta: hastaAnt });
    const [ant] = await pool().query<mysql.RowDataPacket[]>(
      `SELECT DATE_FORMAT(${FECHA}, '%Y-%m-%d') AS dia FROM \`${empresa.esquema}\`.data ${previo.sql}`,
      previo.params,
    );
    serieAnterior = serie.map(() => 0);
    const base = aFecha(cubo(f.desde)) - largo;
    for (const r of ant) {
      if (!r.dia) continue;
      const i = Math.floor((aFecha(r.dia) - base) / paso);
      if (i >= 0 && i < serieAnterior.length) serieAnterior[i]++;
    }
    rangoAnterior = { desde: desdeAnt, hasta: hastaAnt };
  }

  /*
   * Proporción en riesgo alto por grupo, como "Tráfico de bots por país" de
   * Radar: no cuántos hay, sino qué parte del grupo está en riesgo alto. Por
   * municipio si la empresa guarda geografía, por edad si no. Se exige un
   * mínimo de registros: un municipio con dos personas y una en riesgo alto
   * saldría primero con un 50 % que no dice nada.
   */
  const grupoDe = (r: mysql.RowDataPacket) => {
    if (empresa.geografia) return r.municipio ? nombreLugar(String(r.municipio)) : null;
    const e = num(r.edad);
    return e === null ? null : `${Math.floor(e / 5) * 5}–${Math.floor(e / 5) * 5 + 4} años`;
  };
  const grupos = new Map<string, { n: number; alto: number }>();
  for (const r of filas) {
    const g = grupoDe(r);
    if (!g) continue;
    const v = grupos.get(g) ?? { n: 0, alto: 0 };
    v.n++;
    if (r.class_risk === "Riesgo alto") v.alto++;
    grupos.set(g, v);
  }
  const MINIMO = empresa.geografia ? 10 : 5;
  const altoPorGrupo = [...grupos]
    .filter(([, v]) => v.n >= MINIMO)
    .map(([etiqueta, v]) => ({ etiqueta, n: v.alto, de: v.n }))
    .sort((a, b) => b.n / b.de - a.n / a.de || b.de - a.de);

  const hoy = Date.now();
  const totales = (desde: number, hasta: number): Totales => {
    const sel = filas.filter((r) => r.dia && aFecha(r.dia) > desde && aFecha(r.dia) <= hasta);
    return {
      total: sel.length,
      alto: sel.filter((r) => r.class_risk === "Riesgo alto").length,
      fumadores: sel.filter((r) => r.fumador === "Sí").length,
    };
  };

  const fumadores = filas.filter((r) => r.fumador === "Sí");
  const conPaquetes = fumadores
    .map((r) => {
      const cig = num(r.n_cigarrillos_dia);
      const anos = num(r.fumador_year);
      return { r, pa: cig !== null && anos !== null ? (cig / 20) * anos : null };
    })
    .filter((x): x is { r: mysql.RowDataPacket; pa: number } => x.pa !== null);

  return {
    total: filas.length,
    alto: porNivel["Riesgo alto"],
    fumadores: fumadores.length,
    porNivel,
    serie,
    serieAnterior,
    rangoAnterior,
    altoPorGrupo,
    altoPorGrupoMinimo: MINIMO,
    granularidad: semanal ? "semana" : "día",
    rango: { desde: dias[0] ?? null, hasta: dias.at(-1) ?? null },
    periodo: { actual: totales(hoy - 30 * DIA, hoy), anterior: totales(hoy - 60 * DIA, hoy - 30 * DIA) },
    sexo: contar(filas.map((r) => r.sexo)),
    epoc: contar(filas.map((r) => r.epoc)),
    fumador: contar(filas.map((r) => r.fumador)),
    edad: histograma(filas.map((r) => num(r.edad)).filter((v): v is number => v !== null), 5),
    paquetesAno: histograma(conPaquetes.map((x) => x.pa), 10, 80),
    paquetesTope: Math.ceil(percentil(conPaquetes.map((x) => x.pa), 98) / 10) * 10,
    // Sólo probabilidades válidas (0 a 1). Foscal tiene filas con columnas
    // corridas y `prob` de hasta 822; dibujarlas aplastaría el resto.
    dispersion: conPaquetes
      .map(({ r, pa }) => ({ x: pa, y: num(r.prob), nivel: String(r.class_risk), sexo: String(r.sexo ?? "") }))
      .filter((p): p is { x: number; y: number; nivel: string; sexo: string } => p.y !== null && p.y >= 0 && p.y <= 1 && esNivel(p.nivel))
      .slice(0, 3000),
    mapa: empresa.geografia ? agruparMapa(filas) : null,
    calidad: {
      probFueraDeRango: filas.filter((r) => {
        const v = num(r.prob);
        return v !== null && (v < 0 || v > 1);
      }).length,
      nivelInvalido: filas.filter((r) => !esNivel(r.class_risk)).length,
    },
    municipios: empresa.geografia
      ? contar(filas.map((r) => (r.municipio ? `${nombreLugar(String(r.municipio))} · ${nombreLugar(String(r.departamento ?? ""))}` : null))).slice(0, 100)
      : [],
  };
}

// ── Visor de registros ──────────────────────────────────────────────────

/** Columnas de la tabla en pantalla. La descarga lleva todas. */
export function columnasVisor(empresa: Empresa) {
  return [
    { clave: "fecha", titulo: "Fecha" },
    { clave: "nombre", titulo: "Nombre" },
    { clave: "apellido", titulo: "Apellido" },
    { clave: "tipo_doc", titulo: "Tipo doc." },
    { clave: "documento", titulo: "Documento" },
    { clave: "edad", titulo: "Edad" },
    { clave: "sexo", titulo: "Sexo" },
    ...(empresa.geografia
      ? [
          { clave: "municipio", titulo: "Municipio" },
          { clave: "departamento", titulo: "Departamento" },
        ]
      : []),
    { clave: "fumador", titulo: "Fumador" },
    { clave: "epoc", titulo: "EPOC" },
    { clave: "prob", titulo: "Probabilidad" },
    { clave: "class_risk", titulo: "Nivel" },
    { clave: "user", titulo: "Registró" },
  ] as const;
}

export type FilaVisor = Record<string, string | number | null>;

export async function obtenerRegistros(
  empresa: Empresa,
  f: Filtros,
  pagina: number,
  porPagina = 25,
): Promise<{ filas: FilaVisor[]; total: number }> {
  const { sql, params } = where(f);
  const cols = columnasVisor(empresa)
    .map((c) => (c.clave === "fecha" ? `DATE_FORMAT(${FECHA}, '%Y-%m-%d %H:%i') AS fecha` : `\`${c.clave}\``))
    .join(", ");
  const p = pool();
  const [[{ total }], [filas]] = await Promise.all([
    p.query<mysql.RowDataPacket[]>(`SELECT COUNT(*) AS total FROM \`${empresa.esquema}\`.data ${sql}`, params).then(
      ([r]) => [r[0] as { total: number }] as const,
    ),
    p.query<mysql.RowDataPacket[]>(
      `SELECT ${cols} FROM \`${empresa.esquema}\`.data ${sql}
        ORDER BY ${FECHA} DESC LIMIT ? OFFSET ?`,
      [...params, porPagina, (pagina - 1) * porPagina],
    ),
  ]);
  return { filas: filas.map((r) => ({ ...r }) as FilaVisor), total: Number(total) };
}

/** Todas las columnas, para la descarga. Mismo filtro que la tabla. */
export async function exportarRegistros(empresa: Empresa, f: Filtros): Promise<FilaVisor[]> {
  const { sql, params } = where(f);
  const [filas] = await pool().query<mysql.RowDataPacket[]>(
    `SELECT * FROM \`${empresa.esquema}\`.data ${sql} ORDER BY ${FECHA} DESC`,
    params,
  );
  return filas.map((r) => ({ ...r }) as FilaVisor);
}

// ── Usuarios (consulta) ─────────────────────────────────────────────────

export type UsuarioEmpresa = {
  usuario: string;
  rol: string;
  nombre: string | null;
  institucion: string | null;
  area: string | null;
};

/**
 * Lista de usuarios de la empresa, sin la clave. Como en Shiny
 * (`user_available_table`), se oculta la cuenta `sa`.
 */
export async function listarUsuarios(empresa: Empresa): Promise<UsuarioEmpresa[]> {
  const ficha = empresa.usuariosConFicha ? "nombre, institucion, area" : "NULL AS nombre, NULL AS institucion, NULL AS area";
  const [filas] = await pool().query<mysql.RowDataPacket[]>(
    `SELECT ${empresa.columnaUsuario} AS usuario, rol, ${ficha}
       FROM \`${empresa.esquema}\`.users
      WHERE ${empresa.columnaUsuario} <> 'sa'
      ORDER BY rol, usuario`,
  );
  return filas.map((r) => ({
    usuario: String(r.usuario),
    rol: String(r.rol),
    nombre: r.nombre ? String(r.nombre) : null,
    institucion: r.institucion ? String(r.institucion) : null,
    area: r.area ? String(r.area) : null,
  }));
}
