import Link from "next/link";
import { AlertTriangle, ClipboardList } from "lucide-react";
import {
  BarraPartes,
  Dispersion,
  fechaLarga,
  fmt,
  Histograma,
  MedioAnillo,
  MiniSerie,
  pctTxt,
  TablaTop,
  Tarjeta,
} from "../../../src/components/portal/Graficas";
import {
  AreaNiveles,
  SerieTiempo,
} from "../../../src/components/portal/SerieTiempo";
import { MapaColombia } from "../../../src/components/portal/MapaColombia";
import { Filtros } from "../../../src/components/portal/Filtros";
import {
  leerFiltros,
  obtenerTablero,
  opcionesGeografia,
  rangoFechas,
} from "../../../src/lib/portal-db";
import { exigirSesion } from "../../../src/lib/sesion";
import { puede } from "../../../src/tenants/config";

export const dynamic = "force-dynamic";

/**
 * Tablero de la empresa. Mismo contenido que `modules/dashboard.py` (tres
 * totales, registros en el tiempo, sexo, edad, EPOC, fumadores, paquetes-año y
 * riesgo contra paquetes-año) con el lenguaje visual de Cloudflare Radar:
 * cifras con variación frente al período anterior, serie interactiva,
 * distribuciones en barra 100 % y rankings. Se añaden el reparto por nivel y,
 * en las empresas con geografía, los municipios con más registros en lugar
 * del mapa.
 */

const SI_NO = {
  Sí: "var(--t-primario)",
  No: "var(--t-claro)",
  "Sin dato": "#e4e1e0",
};
const SEXO: Record<string, string> = { F: "Mujeres", M: "Hombres" };
export default async function TableroPage({
  params,
  searchParams,
}: {
  params: Promise<{ empresa: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { empresa: slug } = await params;
  const { sesion, empresa } = await exigirSesion(slug);

  // El encuestador no tiene tablero en Shiny; aquí ve su punto de partida.
  if (!puede(sesion.rol, "tablero")) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12 lg:px-10">
        <p className="text-sm text-ink-soft">{empresa.nombre}</p>
        <h1 className="display mt-2 text-3xl">Hola, {sesion.nombre}</h1>
        <p className="mt-4 leading-relaxed text-ink-soft">
          Su perfil es de encuestador. Desde aquí diligenciará la encuesta de
          tamizaje.
        </p>
        <Link
          href={`/portal/${empresa.slug}/encuesta`}
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--t-primario)] px-5 text-sm font-medium text-white"
        >
          <ClipboardList className="size-4" /> Ir a la encuesta
        </Link>
      </main>
    );
  }

  const sp = await searchParams;
  const filtros = leerFiltros(sp, empresa);
  const [t, geo, rango] = await Promise.all([
    obtenerTablero(empresa, filtros),
    opcionesGeografia(empresa),
    rangoFechas(empresa),
  ]);

  const desde = filtros.desde ?? t.rango.desde;
  const hasta = filtros.hasta ?? t.rango.hasta;
  const periodo =
    desde && hasta
      ? `${fechaLarga(desde)} → ${fechaLarga(hasta)}`
      : "Sin registros";
  const archivo = (n: string) => `${empresa.slug}_${n}`;
  const niveles = (
    ["Riesgo bajo", "Riesgo moderado", "Riesgo alto"] as const
  ).map((n) => ({ etiqueta: n, n: t.porNivel[n] }));
  const sexo = (k: string) => t.sexo.find((x) => x.etiqueta === k)?.n ?? 0;
  const fum = (k: string) => t.fumador.find((x) => x.etiqueta === k)?.n ?? 0;
  const totalAnterior = t.serieAnterior?.reduce((a, b) => a + b, 0) ?? null;
  const cambio = totalAnterior
    ? ((t.total - totalAnterior) / totalAnterior) * 100
    : null;
  const grupo = empresa.geografia ? "municipio" : "grupo de edad";
  const principales = empresa.geografia
    ? t.municipios.map((m) => ({
        etiqueta: m.etiqueta.split(" · ")[0],
        detalle: m.etiqueta,
        valor: pctTxt(m.n, t.total),
      }))
    : t.edad
        .slice()
        .sort((a, b) => b.n - a.n)
        .map((e) => ({
          etiqueta: `${e.etiqueta} años`,
          valor: pctTxt(e.n, t.total),
        }));

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-[1.75rem] font-bold text-heading">Tablero</h1>
          <span className="text-sm text-ink-soft">{empresa.nombre}</span>
        </div>
        <p className="rounded-lg border border-hairline bg-surface px-4 py-2 text-sm tabular-nums text-heading">
          {periodo}
        </p>
      </header>

      <div className="mt-5">
        <Filtros
          accion={`/portal/${empresa.slug}`}
          geo={geo}
          conFechas
          rango={rango}
          valores={filtros}
        />
      </div>

      {t.calidad.probFueraDeRango || t.calidad.nivelInvalido ? (
        <div
          role="note"
          className="mt-4 flex items-start gap-3 rounded-xl border border-riesgo-moderado/30 bg-riesgo-moderado-suave p-4"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-riesgo-moderado"
            strokeWidth={2.25}
          />
          <p className="text-sm leading-relaxed text-heading">
            <strong>Calidad de datos.</strong>{" "}
            {t.calidad.probFueraDeRango
              ? `${fmt(t.calidad.probFueraDeRango)} registros tienen la probabilidad fuera de rango (debe estar entre 0 y 1) y no se dibujan en la dispersión. `
              : ""}
            {t.calidad.nivelInvalido
              ? `${fmt(t.calidad.nivelInvalido)} no tienen un nivel de riesgo válido y no entran en el reparto por nivel. `
              : ""}
            Todos se cuentan en el total de registros. Hay que corregirlos en la
            base de origen.
          </p>
        </div>
      ) : null}

      {/* ── Resumen, como «Volumen de tráfico» de Radar ── */}
      <section
        id="resumen"
        className="mt-5 rounded-xl border border-hairline bg-surface p-6 lg:p-7"
      >
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-0">
          <div className="lg:pr-8">
            <h2 className="text-lg font-bold text-heading">
              Volumen de registros
            </h2>
            <p className="mt-1 text-[0.95rem] text-ink-soft">
              {t.serieAnterior
                ? "Frente al período anterior"
                : "Elija un rango de fechas para comparar con el período anterior"}
            </p>
            <div className="mt-4 flex items-end gap-4">
              <p className="text-[2.5rem] leading-none font-bold tabular-nums text-heading">
                {fmt(t.total)}
              </p>
              {cambio !== null ? (
                <p className="pb-1 text-sm font-semibold tabular-nums text-heading">
                  {cambio > 0 ? "+" : ""}
                  {cambio.toFixed(1).replace(".", ",")} %
                  <span className="ml-1.5 font-normal text-ink-soft">
                    vs. {fmt(totalAnterior!)}
                  </span>
                </p>
              ) : null}
            </div>
            <div className="mt-3">
              <MiniSerie
                valores={t.serie.map((p) => p.total)}
                anterior={t.serieAnterior}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 items-center gap-6 border-hairline lg:border-l lg:pl-8">
            <MedioAnillo
              a={{ etiqueta: "Mujeres", n: sexo("F") }}
              b={{ etiqueta: "Hombres", n: sexo("M") }}
            />
            <MedioAnillo
              a={{ etiqueta: "Fumadores", n: fum("Sí") }}
              b={{ etiqueta: "No fumadores", n: fum("No") }}
            />
          </div>
        </div>
        <div className="mt-7 grid gap-8 border-t border-hairline pt-7 md:grid-cols-2 md:gap-0">
          <div className="md:pr-8">
            <h3 className="font-bold text-heading">
              {empresa.geografia ? "Municipios principales" : "Grupos de edad"}
            </h3>
            <p className="mt-1 mb-3 text-sm text-ink-soft">
              Porcentaje de registros
            </p>
            <TablaTop filas={principales.slice(0, 5)} />
          </div>
          <div className="border-hairline md:border-l md:pl-8">
            <h3 className="font-bold text-heading">Riesgo alto por {grupo}</h3>
            <p className="mt-1 mb-3 text-sm text-ink-soft">
              Porcentaje del {grupo} en riesgo alto
            </p>
            <TablaTop
              filas={t.altoPorGrupo
                .slice(0, 5)
                .map((g) => ({
                  etiqueta: g.etiqueta,
                  valor: pctTxt(g.n, g.de),
                  detalle: `${g.etiqueta}: ${fmt(g.n)} de ${fmt(g.de)}`,
                }))}
            />
            <p className="mt-3 text-xs text-ink-soft">
              Sólo {grupo === "municipio" ? "municipios" : "grupos"} con{" "}
              {t.altoPorGrupoMinimo} registros o más.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-5 space-y-5">
        <Tarjeta
          id="tendencias"
          titulo="Tendencias de registros"
          subtitulo={`Tamizajes guardados por ${t.granularidad} durante el período seleccionado`}
          ayuda="Pulse una serie de la leyenda para mostrarla u ocultarla. Pase el cursor sobre la gráfica para ver el detalle."
          descarga={{
            nombre: archivo("tendencias"),
            columnas: [
              "inicio",
              "total",
              "riesgo_alto",
              "riesgo_moderado",
              "riesgo_bajo",
              ...(t.serieAnterior ? ["periodo_anterior"] : []),
            ],
            filas: t.serie.map((p, i) => [
              p.inicio,
              p.total,
              p.alto,
              p.moderado,
              p.bajo,
              ...(t.serieAnterior ? [t.serieAnterior[i]] : []),
            ]),
          }}
          nota={
            t.serieAnterior
              ? "La línea punteada es el mismo número de días inmediatamente antes del rango elegido, con los mismos filtros."
              : "Para ver la línea del período anterior, elija un rango de fechas en los filtros."
          }
        >
          <SerieTiempo
            serie={t.serie}
            anterior={t.serieAnterior}
            rangoAnterior={t.rangoAnterior}
            granularidad={t.granularidad}
          />
        </Tarjeta>

        <Tarjeta
          id="niveles"
          titulo="Nivel de riesgo en el tiempo"
          subtitulo={`Distribución de los registros por nivel de riesgo, por ${t.granularidad}`}
          ayuda="Cada franja es la parte de los registros de ese período que cae en cada nivel. Las cifras de la leyenda son el reparto del período completo."
          descarga={{
            nombre: archivo("nivel_de_riesgo"),
            columnas: ["nivel", "registros"],
            filas: niveles.map((n) => [n.etiqueta, n.n]),
          }}
          nota="Clasificación del modelo PLCOm2012noRace con el ajuste ambiental y ocupacional. Los períodos sin registros se omiten."
        >
          <AreaNiveles serie={t.serie} granularidad={t.granularidad} />
        </Tarjeta>

        {t.mapa ? (
          <Tarjeta
            id="geografia"
            titulo="Distribución geográfica"
            subtitulo="Porcentaje de registros durante el período seleccionado, por ubicación de residencia"
            ayuda="Cambie entre departamento y municipio con el selector. Use + y − para acercar y arrastre para moverse."
            descarga={{
              nombre: archivo("geografia"),
              columnas: ["nivel", "codigo_dane", "nombre", "departamento", "registros"],
              filas: [
                ...t.mapa.departamentos.map((d) => ["departamento", d.codigo, d.nombre, d.nombre, d.n]),
                ...t.mapa.municipios.map((m) => ["municipio", m.codigo, m.nombre, m.departamento, m.n]),
              ],
            }}
            nota="Ubicación de residencia declarada en la encuesta. En la vista por municipio, el área de cada círculo es proporcional a sus registros."
          >
            <MapaColombia
              departamentos={t.mapa.departamentos}
              municipios={t.mapa.municipios}
              total={t.total}
              sinUbicacion={t.mapa.sinUbicacion}
            />
          </Tarjeta>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-2">
          <Tarjeta
            id="edad"
            titulo="Edad"
            subtitulo="Registros por grupos de cinco años"
            descarga={{ nombre: archivo("edad"), columnas: ["grupo_edad", "registros"], filas: t.edad.map((x) => [x.etiqueta, x.n]) }}
          >
            <Histograma datos={t.edad} unidad="años" alto={260} />
          </Tarjeta>
          <Tarjeta
            id="paquetes"
            titulo="Paquetes-año"
            subtitulo="Exposición acumulada al tabaco, sólo fumadores"
            ayuda="Paquetes-año = cigarrillos al día ÷ 20 × años fumando."
            descarga={{ nombre: archivo("paquetes_ano"), columnas: ["paquetes_ano", "registros"], filas: t.paquetesAno.map((x) => [x.etiqueta, x.n]) }}
            nota="La última barra agrupa todo lo que pasa de 80. Valores de varios miles son errores de captura."
          >
            <Histograma datos={t.paquetesAno} alto={260} />
          </Tarjeta>
        </div>

        <Tarjeta
          id="antecedentes"
          titulo="Antecedentes y hábitos"
          subtitulo="Proporción de registros con cada antecedente"
          descarga={{
            nombre: archivo("antecedentes"),
            columnas: ["variable", "valor", "registros"],
            filas: [...t.epoc.map((e) => ["epoc", e.etiqueta, e.n]), ...t.fumador.map((e) => ["fumador", e.etiqueta, e.n]), ...t.sexo.map((e) => ["sexo", SEXO[e.etiqueta] ?? e.etiqueta, e.n])],
          }}
        >
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-heading">EPOC</h3>
              <BarraPartes datos={t.epoc} colores={SI_NO} />
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-heading">Fumador</h3>
              <BarraPartes datos={t.fumador} colores={SI_NO} />
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-heading">Sexo</h3>
              <BarraPartes datos={t.sexo.map((x) => ({ ...x, etiqueta: SEXO[x.etiqueta] ?? x.etiqueta }))} />
            </div>
          </div>
        </Tarjeta>

        <Tarjeta
          id="dispersion"
          titulo="Riesgo contra paquetes-año"
          subtitulo="Probabilidad estimada de cada fumador, un panel por sexo"
          ayuda="Cada punto es un registro, coloreado por nivel de riesgo."
          nota="El eje horizontal se corta en el percentil 98 para que unos pocos valores extremos no aplasten el resto."
        >
          <Dispersion puntos={t.dispersion} topeX={t.paquetesTope} />
        </Tarjeta>
      </div>
    </main>
  );
}
