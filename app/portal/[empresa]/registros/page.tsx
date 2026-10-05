import { Download } from "lucide-react";
import { Paginador } from "../../../../src/components/admin/Paginador";
import { Filtros } from "../../../../src/components/portal/Filtros";
import { Insignia } from "../../../../src/components/portal/Graficas";
import {
  columnasVisor,
  leerFiltros,
  nombreLugar,
  obtenerRegistros,
  opcionesGeografia,
  rangoFechas,
} from "../../../../src/lib/portal-db";
import { exigirSesion } from "../../../../src/lib/sesion";

export const dynamic = "force-dynamic";

const POR_PAGINA = 25;

/**
 * Visor de registros. Replica `modules/visor.py`: filtros por fecha, nivel,
 * departamento y municipio, la tabla con la fila tintada por nivel y la
 * descarga de lo filtrado.
 *
 * Muestra datos que identifican al paciente (nombre y documento) porque es lo
 * que ve hoy en Shiny el mismo rol en su propia institución. Sólo llega aquí
 * quien tiene permiso de `registros` y sólo sobre la base de su empresa.
 */
export default async function RegistrosPage({
  params,
  searchParams,
}: {
  params: Promise<{ empresa: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { empresa: slug } = await params;
  const { empresa } = await exigirSesion(slug, "registros");

  const sp = await searchParams;
  const filtros = leerFiltros(sp, empresa);
  const paginaPedida = Number(Array.isArray(sp.pagina) ? sp.pagina[0] : sp.pagina);
  const pagina = Number.isInteger(paginaPedida) && paginaPedida > 0 ? paginaPedida : 1;

  const [{ filas, total }, geo, rango] = await Promise.all([
    obtenerRegistros(empresa, filtros, pagina, POR_PAGINA),
    opcionesGeografia(empresa),
    rangoFechas(empresa),
  ]);
  const columnas = columnasVisor(empresa);
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  const qs = new URLSearchParams(
    Object.entries(filtros).filter((e): e is [string, string] => !!e[1]),
  ).toString();

  const tinte: Record<string, string> = {
    "Riesgo bajo": "bg-riesgo-bajo-suave/60",
    "Riesgo moderado": "bg-riesgo-moderado-suave/60",
    "Riesgo alto": "bg-riesgo-alto-suave/70",
  };

  return (
    <main className="mx-auto max-w-[96rem] px-5 py-8 lg:px-10 lg:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-soft">{empresa.nombre}</p>
          <h1 className="display mt-1 text-[1.9rem]">Registros</h1>
        </div>
        <a
          href={`/portal/${empresa.slug}/registros/descargar${qs ? `?${qs}` : ""}`}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-hairline bg-surface px-4 text-sm font-medium text-heading hover:border-[var(--t-primario)]"
        >
          <Download className="size-4" strokeWidth={2} />
          Descargar CSV
        </a>
      </header>

      <div className="mt-6">
        <Filtros accion={`/portal/${empresa.slug}/registros`} geo={geo} conFechas rango={rango} valores={filtros} />
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-hairline bg-surface">
        <p className="border-b border-hairline px-6 py-4 text-sm text-heading">
          <strong className="tabular-nums">{total.toLocaleString("es-CO")}</strong> registros encontrados
        </p>
        {filas.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted text-xs text-ink-soft">
                <tr>
                  {columnas.map((c) => (
                    <th key={c.clave} scope="col" className="px-4 py-3 font-medium whitespace-nowrap">
                      {c.titulo}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filas.map((f, i) => (
                  <tr key={i} className={tinte[String(f.class_risk)] ?? ""}>
                    {columnas.map((c) => {
                      const v = f[c.clave];
                      let contenido: React.ReactNode = v ?? "";
                      if (c.clave === "class_risk") contenido = <Insignia nivel={v ? String(v) : null} />;
                      else if ((c.clave === "municipio" || c.clave === "departamento") && v) contenido = nombreLugar(String(v));
                      else if (c.clave === "prob" && v !== null && v !== "") {
                        const n = Number(v);
                        contenido =
                          n >= 0 && n <= 1 ? (
                            `${(n * 100).toFixed(2).replace(".", ",")} %`
                          ) : (
                            <span className="text-riesgo-moderado" title={`Valor guardado: ${String(v)}. La probabilidad debe estar entre 0 y 1.`}>
                              Fuera de rango
                            </span>
                          );
                      }
                      return (
                        <td key={c.clave} className="px-4 py-2.5 whitespace-nowrap text-heading tabular-nums">
                          {contenido}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-6 py-12 text-center text-sm text-ink-soft">No hay registros con estos filtros.</p>
        )}
        <div className="border-t border-hairline">
          <Paginador pagina={pagina} paginas={paginas} total={total} porPagina={POR_PAGINA} />
        </div>
      </section>
    </main>
  );
}
