import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  Database,
  Gauge,
  TrendingUp,
  Users,
} from "lucide-react";
import { CountUp } from "../../src/components/CountUp";
import { CentroSelector } from "../../src/components/admin/CentroSelector";
import { SerieChart } from "../../src/components/admin/SerieChart";
import {
  CENTROS,
  faltaConfiguracion,
  obtenerMetricas,
  obtenerResumen,
  obtenerSerie,
  type Centro,
  type Metricas,
  type PuntoSerie,
  type Resumen,
} from "../../src/lib/capulmon-db";

export const metadata: Metadata = {
  title: "Administración · Seguimiento de centros",
  // Nunca en buscadores: aquí se ve el reparto real por institución.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Los datos se leen en cada visita. Un tablero de seguimiento que sirviera una
 * copia en caché mostraría cifras viejas sin avisar, que es peor que tardar.
 */
export const dynamic = "force-dynamic";

/**
 * Niveles de riesgo en semáforo, sólo dentro de administración.
 *
 * Es una excepción consciente a la regla de no usar colores fuera de la
 * derivación de menta y gris: el equipo ya lee el tablero de Shiny con este
 * código y cambiárselo le costaría precisión al interpretar un dato clínico. En
 * la web pública y en la calculadora sigue mandando la rampa menta.
 *
 * Los tres tonos están oscurecidos respecto a los del tablero para que el texto
 * blanco encima pase AA: el naranja de Bootstrap se queda en 2.57:1 y el verde
 * en 3.13:1, ambos por debajo del mínimo de 4.5:1.
 */
const NIVELES = [
  { clave: "alto", etiqueta: "Alto", fondo: "bg-riesgo-alto" },
  { clave: "moderado", etiqueta: "Moderado", fondo: "bg-riesgo-moderado" },
  { clave: "bajo", etiqueta: "Bajo", fondo: "bg-riesgo-bajo" },
] as const;

function fecha(v: string | null) {
  if (!v) return "sin registros";
  const d = new Date(v.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function diasDesde(v: string | null) {
  if (!v) return null;
  const d = new Date(v.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

/** Un centro que lleva más de dos semanas callado merece que se note. */
function tonoAntiguedad(dias: number | null) {
  if (dias === null) return "bg-surface-sunken text-ink-soft dark:bg-gris-800";
  if (dias <= 1) return "bg-menta-400 text-gris-800";
  if (dias <= 14)
    return "bg-menta-100 text-menta-800 dark:bg-menta-900/40 dark:text-menta-200";
  return "bg-gris-800 text-white";
}

function textoAntiguedad(dias: number | null) {
  if (dias === null) return "sin datos";
  if (dias === 0) return "hoy";
  if (dias === 1) return "ayer";
  return `hace ${dias} días`;
}

function Aviso({
  icono: Icono,
  titulo,
  children,
}: {
  icono: typeof Database;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-hairline bg-surface p-7">
      <Icono
        className="mt-0.5 size-5 shrink-0 text-menta-600"
        strokeWidth={2}
      />
      <div>
        <p className="font-semibold text-heading">{titulo}</p>
        {children}
      </div>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ centro?: string }>;
}) {
  const { centro: filtro } = await searchParams;
  const faltan = faltaConfiguracion();

  let datos: Resumen | null = null;
  let metricas: Metricas | null = null;
  let serie: PuntoSerie[] = [];
  let error: string | null = null;

  if (!faltan.length) {
    try {
      // Las tres consultas son independientes: se lanzan a la vez para no
      // encadenar tres viajes al servidor uno detrás de otro.
      [datos, metricas, serie] = await Promise.all([
        obtenerResumen(),
        obtenerMetricas(),
        obtenerSerie(),
      ]);
    } catch (e) {
      error = e instanceof Error ? e.message : "Error desconocido";
    }
  }

  const centros = Object.keys(CENTROS) as Centro[];

  // El filtro se aplica al presentar, no al consultar: las cinco consultas ya
  // vienen agregadas y son baratas, y así cambiar de centro no vuelve a la base.
  const visibles =
    datos && filtro && centros.includes(filtro as Centro)
      ? datos.centros.filter((c) => c.centro === filtro)
      : (datos?.centros ?? []);

  return (
    <div className="px-5 py-10 lg:px-10 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Administración</p>
            <h1 className="display mt-4 text-[2rem] sm:text-[2.5rem]">
              Reporte de seguimiento
            </h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft dark:text-body">
              Registros de la aplicación de cáncer de pulmón en los cinco
              centros, leídos en directo. Sólo agregados: esta vista no consulta
              ninguna columna que identifique a un paciente.
            </p>
          </div>
          {/*
            El selector sólo aparece con conexión configurada: sus opciones
            llevan los nombres de las cinco instituciones y esta vista aún no
            tiene autenticación. Sin datos que mostrar, publicar la cartera de
            clientes no aporta nada y sí filtra.
          */}
          {faltan.length ? null : <CentroSelector centros={centros} />}
        </div>

        {faltan.length ? (
          <div className="mt-10">
            <Aviso icono={Database} titulo="Sin conexión configurada">
              <p className="mt-2 text-sm leading-relaxed text-ink-soft dark:text-body">
                Añada estas variables a{" "}
                <code className="font-mono">.env.local</code>:
              </p>
              <ul className="mt-3 space-y-1 font-mono text-xs text-heading">
                {faltan.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </Aviso>
          </div>
        ) : error ? (
          <div className="mt-10">
            <Aviso icono={AlertTriangle} titulo="No se pudo consultar">
              <p className="mt-2 font-mono text-xs break-all text-ink-soft">
                {error}
              </p>
            </Aviso>
          </div>
        ) : datos && metricas ? (
          <>
            {/* Cifras de cabecera, las mismas tres del tablero original. */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icono: Users,
                  valor: datos.total.toLocaleString("es-CO"),
                  etiqueta: "Total de registros",
                  pie: `${datos.centros.length} centros aportando`,
                },
                {
                  icono: TrendingUp,
                  valor: metricas.ultimos7.toLocaleString("es-CO"),
                  etiqueta: "Últimos 7 días",
                  pie: metricas.ultimoDia
                    ? `hasta el ${fecha(metricas.ultimoDia)}`
                    : "sin actividad",
                },
                {
                  icono: Gauge,
                  valor: metricas.promedioDiario.toFixed(1).replace(".", ","),
                  etiqueta: "Promedio diario",
                  pie: `sobre ${metricas.diasConRegistro} días con registros`,
                },
              ].map((m) => (
                <div
                  key={m.etiqueta}
                  className="rounded-2xl border border-hairline bg-surface p-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-menta-50 text-menta-600 dark:bg-menta-900/30 dark:text-menta-300">
                      <m.icono className="size-5" strokeWidth={2} />
                    </span>
                    <p className="text-sm text-ink-soft">{m.etiqueta}</p>
                  </div>
                  <CountUp
                    value={m.valor}
                    className="display mt-4 block text-[2.5rem] leading-none text-heading"
                  />
                  <p className="mt-2 text-xs text-ink-soft">{m.pie}</p>
                </div>
              ))}
            </div>

            {/* Último registro por centro, con su reparto de riesgo. */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-hairline bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-6 py-5">
                <h2 className="inline-flex items-center gap-2 font-semibold text-heading">
                  <CalendarClock
                    className="size-4 text-menta-600"
                    strokeWidth={2}
                  />
                  Último registro por centro
                </h2>
                <Link
                  href="/admin/centros"
                  className="text-xs text-menta-600 hover:underline dark:text-menta-300"
                >
                  Ver detalle
                </Link>
              </div>

              <ul className="grid gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-3">
                {visibles.map((c) => {
                  const dias = diasDesde(c.ultimoRegistro);
                  return (
                    <li key={c.centro} className="bg-surface p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-heading">
                          {c.centro}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium ${tonoAntiguedad(dias)}`}
                        >
                          {textoAntiguedad(dias)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-ink-soft">
                        Último registro: {fecha(c.ultimoRegistro)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {NIVELES.map((n) => (
                          <span
                            key={n.clave}
                            className={`rounded-full px-2.5 py-1 text-[0.68rem] font-medium tabular-nums text-white ${n.fondo}`}
                          >
                            {n.etiqueta}:{" "}
                            <CountUp
                              value={c[n.clave].toLocaleString("es-CO")}
                            />
                          </span>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-6">
              <SerieChart serie={serie} centros={centros} />
            </div>

            {datos.caidos.length ? (
              <p className="mt-5 flex items-start gap-3 rounded-2xl border border-hairline bg-surface p-5 text-sm leading-relaxed text-ink-soft">
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0 text-menta-700"
                  strokeWidth={2.25}
                />
                <span>
                  No respondieron:{" "}
                  <strong className="text-heading">
                    {datos.caidos.join(", ")}
                  </strong>
                  . Las cifras de arriba no los incluyen.
                </span>
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
