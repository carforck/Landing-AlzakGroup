import Image from "next/image";
import { history } from "../../content/site";
import { SectionHeader } from "../SectionHeader";
import { Timeline } from "../Timeline";

/**
 * Nuestra historia: fotografía a la izquierda, relato y línea de tiempo a la
 * derecha.
 *
 * La fotografía cambia de naturaleza según el ancho, y por eso es UN solo
 * `<Image>` reposicionado y no dos marcados alternos: dos elementos con
 * `hidden`/`lg:hidden` obligan al navegador a descargar los dos juegos de
 * recortes, y uno de ellos nunca se ve.
 *
 *   · Hasta 1024px va en flujo, arriba del texto, sangrando hasta los bordes de
 *     la pantalla anulando el padding de `.shell` con márgenes negativos.
 *   · Desde 1024px se saca del flujo y se ancla al borde de la SECCIÓN, no del
 *     `.shell`. Por eso el `.shell` NO lleva `relative`: si lo lleva pasa a ser
 *     el bloque contenedor y la fotografía se queda a 112px del filo con esta
 *     ventana, y en vertical se recorta a la caja de texto en lugar de cubrir el
 *     `py-32` de la sección. Anclada a la sección llega a sangre por los tres
 *     lados. El texto se manda a la segunda columna con `lg:col-start-2`.
 *
 * El borde derecho se disuelve en el gris de la sección con un degradado en
 * lugar de cortar en recto: un canto duro a media página compite con la columna
 * de texto que empieza justo después.
 */
export function History() {
  return (
    <section
      id="historia"
      className="relative isolate overflow-hidden border-t border-hairline bg-surface-muted py-24 lg:py-32"
    >
      <div className="shell grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="relative -mx-6 aspect-[4/3] overflow-hidden lg:absolute lg:inset-y-0 lg:left-0 lg:mx-0 lg:aspect-auto lg:w-[44%]">
          <Image
            src="/historia-equipo.webp"
            alt=""
            fill
            /*
             * 100vw y no 44vw, que es el ancho real de la caja en lg.
             *
             * `sizes` sirve para elegir cuántos píxeles bajar, y con `object-cover`
             * el ancho de la caja no basta para calcularlos: la caja mide 634×1078
             * y la fotografía es 2000×1500 (4:3), así que para cubrir 1078 de alto hay
             * que escalarla por su altura y el ancho efectivo pasa a ser
             * 1078 × 1.333 ≈ 1437 px. Declarando 44vw se serviría el recorte de
             * 640 px y se ampliaría 2.5×: la foto saldría blanda.
             * 100vw pide ese ancho; el optimizador no sube del original, así que
             * el techo son los 2000 px del archivo. Se recortó a 4:3 a propósito: con 3:2 ninguna variante servida llegaba a 1078 px de alto.
             */
            sizes="100vw"
            quality={80}
            className="object-cover"
          />
          {/*
            Fundido hacia el fondo. En vertical el corte molesto es el de abajo,
            contra el texto; en horizontal, el de la derecha. De ahí los dos.
          */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-transparent from-60% to-surface-muted lg:bg-gradient-to-r lg:from-50%"
          />
        </div>

        {/*
          `relative` para que el texto quede por encima de la fotografía: al estar
          ésta posicionada, sin esto pintaría sobre el contenido en flujo.
        */}
        <div className="relative lg:col-start-2">
          <SectionHeader eyebrow="Nuestra historia" title={history.title} />
          <div className="mt-8 space-y-5 leading-relaxed text-ink-soft lg:text-lg dark:text-body">
            {history.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          {/* Línea de tiempo: hairline vertical con marcas mínimas y en movimiento */}
          <Timeline milestones={history.milestones} className="mt-12" />
        </div>
      </div>
    </section>
  );
}
