import type { Metadata } from "next";
import { AlertTriangle, Database } from "lucide-react";
import { SerieChart } from "../../../src/components/admin/SerieChart";
import {
  CENTROS,
  faltaConfiguracion,
  obtenerSerie,
  type Centro,
  type PuntoSerie,
} from "../../../src/lib/capulmon-db";

export const metadata: Metadata = {
  title: "Evolución · Administración",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function EvolucionPage() {
  const faltan = faltaConfiguracion();

  let serie: PuntoSerie[] = [];
  let error: string | null = null;
  if (!faltan.length) {
    try {
      serie = await obtenerSerie();
    } catch (e) {
      error = e instanceof Error ? e.message : "Error desconocido";
    }
  }

  const centros = Object.keys(CENTROS) as Centro[];

  return (
    <div className="px-5 py-10 lg:px-10 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">Seguimiento</p>
        <h1 className="display mt-4 text-[2rem] sm:text-[2.5rem]">
          Evolución de registros
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft dark:text-body">
          Tamizajes por mes, agregando los cinco centros. Las fechas se normalizan
          al leerlas porque cada centro las guarda en un formato distinto.
        </p>

        <div className="mt-10">
          {faltan.length ? (
            <div className="flex items-start gap-4 rounded-2xl border border-hairline bg-surface p-7">
              <Database className="mt-0.5 size-5 shrink-0 text-menta-600" strokeWidth={2} />
              <div>
                <p className="font-semibold text-heading">Sin conexión configurada</p>
                <ul className="mt-3 space-y-1 font-mono text-xs text-heading">
                  {faltan.map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-start gap-4 rounded-2xl border border-hairline bg-surface p-7">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-menta-700" strokeWidth={2} />
              <div>
                <p className="font-semibold text-heading">No se pudo consultar</p>
                <p className="mt-2 font-mono text-xs break-all text-ink-soft">{error}</p>
              </div>
            </div>
          ) : (
            <SerieChart serie={serie} centros={centros} />
          )}
        </div>
      </div>
    </div>
  );
}
