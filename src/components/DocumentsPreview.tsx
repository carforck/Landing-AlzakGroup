"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Download, ExternalLink, Eye, FileX, X } from "lucide-react";

type Doc = {
  readonly code: string;
  readonly title: string;
  readonly href: string;
  readonly cover: string | null;
  readonly pages: number | null;
};

/**
 * Lista de documentos del sistema, con dos niveles de vista previa.
 *
 *   1. Al pasar por encima del nombre se despliega una tarjeta con la PORTADA del
 *      documento —la primera página, renderizada a WebP— igual que la tarjeta que
 *      muestra un mensajero al pegar un enlace. Sirve para reconocer el documento
 *      sin abrirlo.
 *   2. Al pulsar, el documento completo se abre en un diálogo dentro de la propia
 *      página, sin salir al visor del navegador en otra pestaña.
 *
 * Antes cada fila era un enlace con `target="_blank"`: el visitante salía del
 * sitio y volver dependía de que encontrara la pestaña.
 *
 * Para el diálogo se usa el `<dialog>` nativo y no un div con posición fija. No es
 * por brevedad: `showModal()` da gratis y correctamente la capa superior —por
 * encima de cualquier `z-index`, incluido el botón flotante de WhatsApp—, el
 * cierre con Escape, el atrapado del foco y el `inert` sobre el resto de la
 * página. Reimplementar eso a mano es donde se rompe la accesibilidad de los
 * modales.
 */
export function DocumentsPreview({ documents }: { documents: readonly Doc[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<Doc | null>(null);
  /*
   * Portadas ya solicitadas. La tarjeta se muestra y se oculta por CSS —es más
   * fluido que remontarla—, pero la <Image> sólo se pinta cuando la fila ha
   * recibido atención al menos una vez: si las tres estuvieran en el marcado
   * desde el principio, la página bajaría 132 KB de miniaturas que la mayoría de
   * visitantes no va a mirar. Una vez pintada se queda, así que a partir del
   * segundo paso la tarjeta aparece ya con la imagen.
   */
  const [primed, setPrimed] = useState<ReadonlySet<string>>(new Set());

  function prime(code: string) {
    setPrimed((current) => (current.has(code) ? current : new Set(current).add(code)));
  }

  function openDoc(doc: Doc) {
    setActive(doc);
    dialogRef.current?.showModal();
  }

  return (
    <>
      <ul className="mt-5 divide-y divide-hairline border-y border-hairline">
        {documents.map((doc) => (
          <li key={doc.code} className="relative">
            <button
              type="button"
              onClick={() => openDoc(doc)}
              onPointerEnter={() => prime(doc.code)}
              onFocus={() => prime(doc.code)}
              className="group flex w-full items-start justify-between gap-4 py-5 text-left transition-colors hover:text-menta-500"
            >
              <span>
                <span className="block text-xs font-semibold tracking-widest text-menta-500 dark:text-menta-300">
                  {doc.code}
                </span>
                <span className="mt-1.5 block text-sm leading-snug text-heading group-hover:text-menta-500">
                  {doc.title}
                </span>
              </span>
              <Eye
                className="mt-0.5 size-4 shrink-0 text-ink-soft transition-colors group-hover:text-menta-500"
              />

              {/*
                Tarjeta de portada. Va DENTRO del botón para que el hover no se
                pierda al bajar el cursor hacia ella, y con `pointer-events-none`
                porque no es interactiva: quien quiera el documento pulsa la fila.
                Es decorativa —código, título y formato ya están en la fila y en el
                diálogo—, así que queda fuera del árbol de accesibilidad.

                Lleva sombra, que es la única del sitio: el sistema evita la
                elevación, pero esto flota por encima de las filas siguientes y sin
                separarlas se leería como parte de la lista.

                La transición nombra `translate`, no `transform`: Tailwind v4 aplica
                `translate-y-*` con la propiedad `translate`, así que con
                `transition-[opacity,transform]` la opacidad se fundía pero los 4px
                de desplazamiento pegaban un salto sin animar.
              */}
              <span
                aria-hidden
                className="pointer-events-none absolute top-full left-0 z-20 mt-1 block w-64 origin-top translate-y-1 overflow-hidden rounded-lg border border-hairline bg-surface opacity-0 shadow-[0_12px_28px_-12px_rgb(0_0_0/0.28)] transition-[opacity,translate] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
              >
                {doc.cover && primed.has(doc.code) ? (
                  /*
                    Ventana recortada al borde superior de la página, no la página
                    entera: una carta completa a este ancho deja el texto a un
                    tamaño en que no se reconoce nada. Así se lee el encabezado,
                    que es lo que identifica el documento.
                  */
                  <span className="block h-28 overflow-hidden bg-surface-sunken">
                    <Image
                      src={doc.cover}
                      alt=""
                      width={900}
                      height={1165}
                      sizes="16rem"
                      className="h-auto w-full object-cover object-top"
                    />
                  </span>
                ) : doc.cover ? (
                  <span className="block h-28 bg-surface-sunken" />
                ) : (
                  <span className="flex h-28 flex-col items-center justify-center gap-2 bg-surface-sunken text-ink-soft">
                    <FileX className="size-6" />
                    <span className="text-[0.625rem] tracking-wider uppercase">
                      Sin portada disponible
                    </span>
                  </span>
                )}

                <span className="block px-3.5 py-3">
                  <span className="block text-[0.625rem] font-semibold tracking-widest text-menta-600 uppercase dark:text-menta-300">
                    {doc.code}
                    {doc.pages ? ` · PDF · ${doc.pages} pág.` : " · PDF"}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-heading">
                    {doc.title}
                  </span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-ink-soft">
        Documentos en formato PDF. Se abren aquí mismo.
      </p>

      <dialog
        ref={dialogRef}
        onClose={() => setActive(null)}
        /*
         * Cierre al pulsar fuera. Se compara la posición del clic con la caja del
         * diálogo en lugar de mirar si `event.target` es el propio <dialog>: ese
         * truco depende de que el contenido cubra el interior por completo, y al
         * depurarlo resultó que el diálogo ni estaba centrado —ver `.doc-dialog`
         * en globals.css—, así que un clic en la esquina caía sobre el contenido.
         * Con la geometría no hay nada que suponer.
         */
        onClick={(event) => {
          const dialog = dialogRef.current;
          if (!dialog) return;
          const box = dialog.getBoundingClientRect();
          const inside =
            event.clientX >= box.left &&
            event.clientX <= box.right &&
            event.clientY >= box.top &&
            event.clientY <= box.bottom;
          if (!inside) dialog.close();
        }}
        aria-label={active ? `${active.code} · ${active.title}` : "Documento"}
        className="doc-dialog"
      >
        {active ? (
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-6 border-b border-hairline px-5 py-4">
              <div>
                <p className="text-xs font-semibold tracking-widest text-menta-600 dark:text-menta-300">
                  {active.code}
                </p>
                <p className="mt-1 text-sm leading-snug font-medium text-heading">
                  {active.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Cerrar la previsualización"
                className="-mt-1 -mr-1 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface-muted hover:text-heading"
              >
                <X className="size-5" strokeWidth={2.5} />
              </button>
            </div>

            {/*
              `#view=FitH` pide al visor del navegador que ajuste al ancho. Es una
              sugerencia, no una garantía: cada visor decide.
            */}
            <iframe
              src={`${active.href}#view=FitH`}
              title={`${active.code} · ${active.title}`}
              className="min-h-0 flex-1 bg-surface-sunken"
            />

            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-hairline px-5 py-4">
              {/*
                No todos los navegadores pintan un PDF dentro de un iframe —Safari
                en iOS es el caso conocido: muestra la primera página o nada—. Por
                eso la salida alternativa es visible siempre y no un mensaje de
                error que sólo aparece cuando ya es tarde.
              */}
              <p className="text-xs text-ink-soft">
                Si la previsualización no carga en su navegador, ábralo aparte.
              </p>
              <div className="flex items-center gap-5 text-sm">
                <a
                  href={active.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-heading transition-colors hover:text-menta-600"
                >
                  <ExternalLink className="size-4" />
                  <span className="link-underline">Abrir aparte</span>
                </a>
                <a
                  href={active.href}
                  download
                  className="inline-flex items-center gap-2 text-heading transition-colors hover:text-menta-600"
                >
                  <Download className="size-4" />
                  <span className="link-underline">Descargar</span>
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
