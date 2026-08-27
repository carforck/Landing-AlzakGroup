import type { Metadata } from "next";
import { AlertTriangle, Database, ShieldCheck } from "lucide-react";
import { CountUp } from "../../../src/components/CountUp";
import { CentroSelector } from "../../../src/components/admin/CentroSelector";
import { Paginador } from "../../../src/components/admin/Paginador";
import {
  CENTROS,
  faltaConfiguracion,
  obtenerRegistrosAltos,
  type Centro,
  type PaginaRegistros,
} from "../../../src/lib/capulmon-db";

export const metadata: Metadata = {
  title: "Registros · Administración",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const POR_PAGINA = 25;

function esCentro(v: string | undefined): v is Centro {
  return typeof v === "string" && v in CENTROS;
}

function fechaCorta(v: string | null) {
  if (!v) return "sin fecha";
  const d = new Date(v.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function RegistrosPage({
  searchParams,
}: {
  searchParams: Promise<{ centro?: string; pagina?: string }>;
}) {
  const { centro: pedido, pagina: pagPedida } = await searchParams;
  const faltan = faltaConfiguracion();
  const centro = esCentro(pedido) ? pedido : null;
  const pagina = Math.max(1, Number(pagPedida) || 1);

  let datos: PaginaRegistros | null = null;
  let error: string | null = null;
  if (!faltan.length) {
    try {
      datos = await obtenerRegistrosAltos({
        centro,
        pagina,
        porPagina: POR_PAGINA,
      });
    } catch (e) {
      error = e instanceof Error ? e.message : "Error desconocido";
    }
  }

  const centros = Object.keys(CENTROS) as Centro[];

  return (
    <div className="px-5 py-10 lg:px-10 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Datos</p>
            <h1 className="display mt-4 text-[2rem] sm:text-[2.5rem]">
              Registros en riesgo alto
            </h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft dark:text-body">
              Los de los cinco centros, ordenados del más reciente al más
              antiguo. Use el selector para quedarse con una sola institución.
            </p>
          </div>
          <CentroSelector centros={centros} />
        </div>

        <div className="mt-8">
          {faltan.length ? (
            <div className="flex items-start gap-4 rounded-2xl border border-hairline bg-surface p-7">
              <Database
                className="mt-0.5 size-5 shrink-0 text-menta-600"
                strokeWidth={2}
              />
              <div>
                <p className="font-semibold text-heading">
                  Sin conexión configurada
                </p>
                <ul className="mt-3 space-y-1 font-mono text-xs text-heading">
                  {faltan.map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-start gap-4 rounded-2xl border border-hairline bg-surface p-7">
              <AlertTriangle
                className="mt-0.5 size-5 shrink-0 text-riesgo-alto"
                strokeWidth={2}
              />
              <div>
                <p className="font-semibold text-heading">
                  No se pudo consultar
                </p>
                <p className="mt-2 font-mono text-xs break-all text-ink-soft">
                  {error}
                </p>
              </div>
            </div>
          ) : datos ? (
            <div className="overflow-hidden rounded-2xl border border-hairline bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-6 py-4">
                <p className="text-sm text-ink-soft">
                  <CountUp
                    value={datos.total.toLocaleString("es-CO")}
                    className="font-semibold text-heading"
                  />{" "}
                  registros{centro ? ` en ${centro}` : " en los cinco centros"}
                </p>
                <span className="rounded-full bg-riesgo-alto px-3 py-1 text-xs font-medium text-white">
                  Riesgo alto
                </span>
              </div>

              {datos.total === 0 ? (
                <p className="p-10 text-center text-sm text-ink-soft">
                  No hay registros en riesgo alto{centro ? ` en ${centro}` : ""}
                  .
                </p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[44rem] text-sm">
                      <thead>
                        <tr className="border-b border-hairline text-left">
                          {[
                            "Centro",
                            "Fecha",
                            "Edad",
                            "Sexo",
                            "Score",
                            "Probabilidad",
                          ].map((h, i) => (
                            <th
                              key={h}
                              className={`px-5 py-3 text-xs font-semibold tracking-wide text-ink-soft uppercase ${
                                i >= 2 ? "text-right" : ""
                              }`}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hairline">
                        {datos.filas.map((f, i) => (
                          <tr
                            key={`${f.centro}-${f.fecha}-${i}`}
                            className="transition-colors duration-150 hover:bg-surface-muted"
                          >
                            <td className="px-5 py-3">
                              <span className="rounded-full bg-surface-sunken px-2.5 py-0.5 text-xs text-heading dark:bg-gris-800">
                                {f.centro}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-ink-soft">
                              {fechaCorta(f.fecha)}
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums text-heading">
                              {f.edad ?? "—"}
                            </td>
                            <td className="px-5 py-3 text-right text-heading">
                              {f.sexo === "M"
                                ? "Hombre"
                                : f.sexo === "F"
                                  ? "Mujer"
                                  : "—"}
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums text-ink-soft">
                              {f.score === null
                                ? "—"
                                : f.score.toFixed(3).replace(".", ",")}
                            </td>
                            <td className="px-5 py-3 text-right font-semibold tabular-nums text-heading">
                              {f.prob === null
                                ? "—"
                                : `${(f.prob * 100).toFixed(1).replace(".", ",")} %`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t border-hairline">
                    <Paginador
                      pagina={datos.pagina}
                      paginas={datos.paginas}
                      total={datos.total}
                      porPagina={datos.porPagina}
                    />
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>

        <p className="mt-5 flex items-start gap-3 text-xs leading-relaxed text-ink-soft">
          <ShieldCheck
            className="mt-0.5 size-4 shrink-0 text-menta-600"
            strokeWidth={2}
          />
          Los registros van anonimizados: la consulta pide únicamente centro,
          fecha, edad, sexo, score y probabilidad. No se solicita nombre,
          documento, fecha de nacimiento ni ningún otro dato identificador.
        </p>
      </div>
    </div>
  );
}
