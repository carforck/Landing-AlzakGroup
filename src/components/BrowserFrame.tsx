import type { ReactNode } from "react";
import { Lock, ShieldCheck } from "lucide-react";

/**
 * Marco de ventana para la demostración del modelo.
 *
 * La calculadora es un producto de software, no una ilustración, y encuadrarla
 * como una ventana lo dice sin necesidad de explicarlo: se lee como el prototipo
 * que es. El marco es puramente estructural, no un adorno con textura.
 *
 * Un detalle deliberado: la barra NO lleva una dirección web. Inventar una URL
 * que no existe daría a entender que la herramienta está publicada en abierto, y
 * no lo está. En su lugar la barra identifica el modelo que corre dentro, que es
 * la información que de verdad importa aquí.
 *
 * Los tres puntos van en gris neutro. El menta queda reservado para el indicador
 * de que el cálculo ocurre en el equipo del visitante, que es el único dato que
 * merece color.
 */
export function BrowserFrame({
  label,
  badge,
  children,
}: {
  /** Lo que se identifica en la barra. Aquí, el modelo que se ejecuta. */
  label: string;
  /** Texto del indicador de la derecha. */
  badge: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gris-800 shadow-[0_1px_2px_rgba(0,0,0,0.3),0_24px_60px_-24px_rgba(0,0,0,0.6)]">
      {/* Barra de la ventana */}
      <div className="flex items-center gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
        <div className="flex shrink-0 gap-2" aria-hidden>
          <span className="size-3 rounded-full bg-white/15" />
          <span className="size-3 rounded-full bg-white/15" />
          <span className="size-3 rounded-full bg-white/15" />
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-gris-900 px-3.5 py-1.5">
          <Lock className="size-3 shrink-0 text-menta-400" strokeWidth={2.5} />
          <span className="truncate font-mono text-[0.7rem] tracking-tight text-gris-300">
            {label}
          </span>
        </div>

        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          {/* El punto late para decir que esto corre de verdad, no es una captura. */}
          <span className="relative flex size-2">
            <span
              aria-hidden
              className="timeline-pulse absolute inline-flex size-full rounded-full bg-menta-400"
            />
            <span className="relative inline-flex size-2 rounded-full bg-menta-400" />
          </span>
          <span className="text-[0.7rem] font-medium text-gris-300">{badge}</span>
        </div>
      </div>

      {/* Contenido de la ventana */}
      {/*
        El contenido va sobre superficie apagada y no sobre blanco: dentro de la
        demostración la tarjeta de resultado es blanca, y sobre blanco perdía su
        sombra y su separación.
      */}
      <div className="bg-surface-muted p-6 sm:p-8 lg:p-10">{children}</div>

      {/* Pie técnico */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 px-4 py-3 sm:px-5">
        <span className="inline-flex items-center gap-2 text-[0.7rem] text-gris-400">
          <ShieldCheck className="size-3.5 text-menta-400" strokeWidth={2.25} />
          Sin envío de datos: el cálculo ocurre en su equipo
        </span>
        <span className="font-mono text-[0.7rem] text-gris-500">
          16 variables · salida en milisegundos
        </span>
      </div>
    </div>
  );
}
