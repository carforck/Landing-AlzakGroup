"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";

/**
 * Paginador de tablas.
 *
 * La página viaja en la URL, igual que el centro: así un enlace a la página 4
 * lleva a la página 4, y el botón de atrás recorre el historial de consulta en
 * lugar de sacar al usuario de la vista.
 *
 * Se muestran como mucho siete números. Con más de siete páginas se recorta por
 * el centro con elipsis, porque una fila de treinta números es imposible de
 * apuntar con el ratón y no aporta nada.
 */
function ventana(actual: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (actual <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (actual >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", actual - 1, actual, actual + 1, "...", total];
}

export function Paginador({
  pagina,
  paginas,
  total,
  porPagina,
}: {
  pagina: number;
  paginas: number;
  total: number;
  porPagina: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pendiente, iniciar] = useTransition();

  if (paginas <= 1) {
    return (
      <p className="px-6 py-4 text-xs text-ink-soft">
        {total.toLocaleString("es-CO")} registros
      </p>
    );
  }

  const ir = (n: number) => {
    const siguiente = new URLSearchParams(params.toString());
    if (n <= 1) siguiente.delete("pagina");
    else siguiente.set("pagina", String(n));
    const qs = siguiente.toString();
    iniciar(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const desde = (pagina - 1) * porPagina + 1;
  const hasta = Math.min(pagina * porPagina, total);

  return (
    <nav
      aria-label="Paginación de registros"
      className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
    >
      <p className="inline-flex items-center gap-2 text-xs text-ink-soft tabular-nums">
        {pendiente ? (
          <LoaderCircle className="size-3.5 animate-spin text-menta-600" strokeWidth={2} />
        ) : null}
        {desde.toLocaleString("es-CO")} a {hasta.toLocaleString("es-CO")} de{" "}
        {total.toLocaleString("es-CO")}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => ir(pagina - 1)}
          disabled={pagina <= 1}
          aria-label="Página anterior"
          className="inline-flex size-9 items-center justify-center rounded-lg border border-hairline text-ink-soft transition-colors duration-200 hover:border-menta-400 hover:text-menta-600 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="size-4" strokeWidth={2.25} />
        </button>

        {ventana(pagina, paginas).map((n, i) =>
          n === "..." ? (
            <span key={`e${i}`} className="px-1.5 text-xs text-ink-soft">
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => ir(n)}
              aria-current={n === pagina ? "page" : undefined}
              className={`inline-flex size-9 items-center justify-center rounded-lg text-sm tabular-nums transition-colors duration-200 ${
                n === pagina
                  ? "bg-gris-800 font-medium text-white"
                  : "border border-hairline text-ink-soft hover:border-menta-400 hover:text-menta-600"
              }`}
            >
              {n}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => ir(pagina + 1)}
          disabled={pagina >= paginas}
          aria-label="Página siguiente"
          className="inline-flex size-9 items-center justify-center rounded-lg border border-hairline text-ink-soft transition-colors duration-200 hover:border-menta-400 hover:text-menta-600 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="size-4" strokeWidth={2.25} />
        </button>
      </div>
    </nav>
  );
}
