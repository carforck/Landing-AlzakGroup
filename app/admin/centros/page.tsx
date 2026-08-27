import type { Metadata } from "next";
import { AlertTriangle, Database } from "lucide-react";
import { CountUp } from "../../../src/components/CountUp";
import {
  CENTROS,
  faltaConfiguracion,
  obtenerResumen,
  type Resumen,
} from "../../../src/lib/capulmon-db";

export const metadata: Metadata = {
  title: "Centros · Administración",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

function fecha(v: string | null) {
  if (!v) return "sin registros";
  const d = new Date(v.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Días transcurridos desde el último registro, para ver quién dejó de reportar. */
function diasDesde(v: string | null) {
  if (!v) return null;
  const d = new Date(v.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

export default async function CentrosPage() {
  const faltan = faltaConfiguracion();

  let datos: Resumen | null = null;
  let error: string | null = null;
  if (!faltan.length) {
    try {
      datos = await obtenerResumen();
    } catch (e) {
      error = e instanceof Error ? e.message : "Error desconocido";
    }
  }

  return (
    <div className="px-5 py-10 lg:px-10 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">Seguimiento</p>
        <h1 className="display mt-4 text-[2rem] sm:text-[2.5rem]">Centros</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft dark:text-body">
          Estado de cada institución con la calculadora desplegada, con su
          esquema de datos y cuánto lleva sin reportar.
        </p>

        <div className="mt-10">
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
                className="mt-0.5 size-5 shrink-0 text-menta-700"
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
            <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface">
              <table className="w-full min-w-[46rem] text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left">
                    {[
                      "Centro",
                      "Esquema",
                      "Alto",
                      "Moderado",
                      "Bajo",
                      "Total",
                      "Último registro",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-4 text-xs font-semibold tracking-wide text-ink-soft uppercase ${
                          i >= 2 && i <= 5 ? "text-right" : ""
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {datos.centros.map((c) => {
                    const dias = diasDesde(c.ultimoRegistro);
                    return (
                      <tr key={c.centro}>
                        <td className="px-5 py-4 font-medium text-heading">
                          {c.centro}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-ink-soft">
                          {CENTROS[c.centro]}
                        </td>
                        <td className="px-5 py-4 text-right tabular-nums text-heading">
                          {c.alto.toLocaleString("es-CO")}
                        </td>
                        <td className="px-5 py-4 text-right tabular-nums text-heading">
                          {c.moderado.toLocaleString("es-CO")}
                        </td>
                        <td className="px-5 py-4 text-right tabular-nums text-heading">
                          {c.bajo.toLocaleString("es-CO")}
                        </td>
                        <td className="px-5 py-4 text-right font-semibold tabular-nums text-heading">
                          <CountUp value={c.total.toLocaleString("es-CO")} />
                        </td>
                        <td className="px-5 py-4 text-ink-soft">
                          {fecha(c.ultimoRegistro)}
                          {dias !== null ? (
                            <span
                              className={`ml-2 rounded-full px-2 py-0.5 text-[0.65rem] ${
                                dias <= 7
                                  ? "bg-menta-100 text-menta-800 dark:bg-menta-900/40 dark:text-menta-200"
                                  : "bg-surface-sunken text-ink-soft dark:bg-gris-800"
                              }`}
                            >
                              {dias === 0 ? "hoy" : `hace ${dias} d`}
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
