"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Building2, LoaderCircle } from "lucide-react";

/**
 * Selector de centro, equivalente al del tablero de Shiny.
 *
 * La elección viaja en la URL y no en estado del componente. Así el enlace se
 * puede compartir o guardar, el botón de atrás funciona, y las páginas siguen
 * siendo de servidor: el filtrado ocurre en la consulta y no trayéndose todos
 * los registros al navegador para descartarlos allí.
 *
 * `useTransition` mantiene la tabla anterior en pantalla mientras llega la
 * nueva, en lugar de vaciarla y dejar un hueco durante la carga.
 */
export function CentroSelector({
  centros,
  incluirTodos = true,
}: {
  centros: readonly string[];
  /** El visor de registros exige elegir un centro concreto. */
  incluirTodos?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pendiente, iniciar] = useTransition();

  const actual = params.get("centro") ?? (incluirTodos ? "todos" : "");

  const cambiar = (valor: string) => {
    const siguiente = new URLSearchParams(params.toString());
    if (valor === "todos") siguiente.delete("centro");
    else siguiente.set("centro", valor);
    const qs = siguiente.toString();
    iniciar(() => router.push(qs ? `${pathname}?${qs}` : pathname));
  };

  return (
    <label className="inline-flex items-center gap-3">
      <span className="sr-only">Seleccionar centro</span>
      <span className="relative inline-flex items-center">
        <Building2
          className="pointer-events-none absolute left-3.5 size-4 text-ink-soft"
          strokeWidth={2}
        />
        <select
          value={actual}
          onChange={(e) => cambiar(e.target.value)}
          className="h-11 appearance-none rounded-xl border border-hairline bg-surface pr-10 pl-10 text-sm text-heading transition-colors duration-200 outline-none focus:border-menta-400"
        >
          {incluirTodos ? <option value="todos">Todos los centros</option> : null}
          {!incluirTodos && !params.get("centro") ? (
            <option value="">Seleccione un centro</option>
          ) : null}
          {centros.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {pendiente ? (
          <LoaderCircle
            className="pointer-events-none absolute right-3 size-4 animate-spin text-menta-600"
            strokeWidth={2}
          />
        ) : (
          <span
            aria-hidden
            className="pointer-events-none absolute right-4 text-xs text-ink-soft"
          >
            ▾
          </span>
        )}
      </span>
    </label>
  );
}
