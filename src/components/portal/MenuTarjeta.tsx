"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Download, Link2, MoreHorizontal } from "lucide-react";

/**
 * Menú "⋯" de una tarjeta, como en Radar: descargar los datos de la gráfica y
 * copiar un enlace que lleva directo a ella. Los datos son agregados, nunca
 * registros de pacientes, así que el CSV se arma aquí con lo que ya se ve.
 */
export function MenuTarjeta({
  ancla,
  descarga,
}: {
  ancla: string;
  descarga?: { nombre: string; columnas: string[]; filas: (string | number)[][] };
}) {
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const cerrar = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !caja.current?.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("mousedown", cerrar);
    document.addEventListener("keydown", cerrar);
    return () => {
      document.removeEventListener("mousedown", cerrar);
      document.removeEventListener("keydown", cerrar);
    };
  }, [abierto]);

  const descargar = () => {
    if (!descarga) return;
    const celda = (v: string | number) => {
      const s = String(v);
      return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [descarga.columnas, ...descarga.filas].map((f) => f.map(celda).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
    Object.assign(document.createElement("a"), { href: url, download: `${descarga.nombre}.csv` }).click();
    URL.revokeObjectURL(url);
    setAbierto(false);
  };

  const copiar = async () => {
    const url = `${location.origin}${location.pathname}${location.search}#${ancla}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1600);
    } catch {
      // Sin permiso de portapapeles: se deja la URL en la barra para copiarla a mano.
      history.replaceState(null, "", `#${ancla}`);
    }
  };

  return (
    <span ref={caja} className="relative inline-flex items-center gap-0.5">
      <button
        type="button"
        onClick={copiar}
        aria-label="Copiar enlace a esta gráfica"
        title={copiado ? "Enlace copiado" : "Copiar enlace"}
        className="inline-flex size-7 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-surface-muted hover:text-heading"
      >
        {copiado ? <Check className="size-4 text-riesgo-bajo" strokeWidth={2.25} /> : <Link2 className="size-4" strokeWidth={2} />}
      </button>
      {descarga ? (
        <>
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-label="Más opciones"
            aria-expanded={abierto}
            aria-haspopup="menu"
            className="inline-flex size-7 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-surface-muted hover:text-heading"
          >
            <MoreHorizontal className="size-4" strokeWidth={2.25} />
          </button>
          {abierto ? (
            <div role="menu" className="absolute top-full left-0 z-30 mt-1 w-48 rounded-xl border border-hairline bg-surface p-1 shadow-lg">
              <button
                type="button"
                role="menuitem"
                onClick={descargar}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-heading hover:bg-surface-muted"
              >
                <Download className="size-4 text-ink-soft" strokeWidth={2} />
                Descargar CSV
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </span>
  );
}
