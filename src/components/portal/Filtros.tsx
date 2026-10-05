"use client";

import Link from "next/link";
import { useState } from "react";
import { Filter, X } from "lucide-react";

type Geo = { departamento: string; municipios: string[] };

/** Igual que `nombreLugar` del servidor: quita el código DANE para leer. El valor enviado no cambia. */
function etiqueta(v: string) {
  const menores = new Set(["de", "del", "la", "las", "los", "y", "el"]);
  return v
    .replace(/^\d+\s*-\s*/, "")
    .toLocaleLowerCase("es-CO")
    .split(/(\s+|-)/)
    .map((w, i) => (i > 0 && menores.has(w) ? w : w.charAt(0).toLocaleUpperCase("es-CO") + w.slice(1)))
    .join("")
    .replace(/D\.c\./g, "D.C.");
}

const campo =
  "h-10 w-full rounded-lg border border-hairline bg-surface px-3 text-sm text-heading outline-none focus:border-[var(--t-primario)]";

/**
 * Filtros del tablero y del visor. Formulario GET: los filtros quedan en la
 * URL, se pueden compartir y el servidor los vuelve a validar al leerlos.
 *
 * El municipio depende del departamento, como en Shiny. Las opciones salen de
 * los datos de la empresa, no de un catálogo nacional: sólo se ofrece lo que
 * de verdad tiene registros.
 */
export function Filtros({
  accion,
  geo,
  conFechas = false,
  rango,
  valores,
}: {
  accion: string;
  geo: Geo[];
  conFechas?: boolean;
  rango?: { min: string | null; max: string | null };
  valores: { nivel?: string; departamento?: string; municipio?: string; desde?: string; hasta?: string };
}) {
  const [dpto, setDpto] = useState(valores.departamento ?? "");
  const municipios = geo.find((g) => g.departamento === dpto)?.municipios ?? [];

  return (
    <form action={accion} method="get" className="grid gap-4 rounded-2xl border border-hairline bg-surface p-5 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] lg:items-end">
      {conFechas ? (
        <>
          <label className="block text-xs font-medium text-ink-soft">
            Desde
            <input type="date" name="desde" defaultValue={valores.desde} min={rango?.min ?? undefined} max={rango?.max ?? undefined} className={`${campo} mt-1.5`} />
          </label>
          <label className="block text-xs font-medium text-ink-soft">
            Hasta
            <input type="date" name="hasta" defaultValue={valores.hasta} min={rango?.min ?? undefined} max={rango?.max ?? undefined} className={`${campo} mt-1.5`} />
          </label>
        </>
      ) : null}

      <label className="block text-xs font-medium text-ink-soft">
        Nivel de riesgo
        <select name="nivel" defaultValue={valores.nivel ?? ""} className={`${campo} mt-1.5`}>
          <option value="">Todos</option>
          <option>Riesgo bajo</option>
          <option>Riesgo moderado</option>
          <option>Riesgo alto</option>
        </select>
      </label>

      {geo.length ? (
        <>
          <label className="block text-xs font-medium text-ink-soft">
            Departamento
            <select name="departamento" value={dpto} onChange={(e) => setDpto(e.target.value)} className={`${campo} mt-1.5`}>
              <option value="">Todos</option>
              {geo.map((g) => (
                <option key={g.departamento} value={g.departamento}>
                  {etiqueta(g.departamento)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-ink-soft">
            Municipio
            <select
              name="municipio"
              key={dpto}
              defaultValue={dpto === valores.departamento ? valores.municipio ?? "" : ""}
              disabled={!dpto}
              className={`${campo} mt-1.5 disabled:opacity-50`}
            >
              <option value="">Todos</option>
              {municipios.map((m) => (
                <option key={m} value={m}>
                  {etiqueta(m)}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : null}

      <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
        <button type="submit" className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--t-primario)] px-4 text-sm font-medium text-white hover:opacity-90">
          <Filter className="size-4" strokeWidth={2} />
          Aplicar
        </button>
        <Link href={accion} aria-label="Restablecer filtros" className="inline-flex size-10 items-center justify-center rounded-lg border border-hairline text-ink-soft hover:text-heading">
          <X className="size-4" />
        </Link>
      </div>
    </form>
  );
}
