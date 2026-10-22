import { Compass, Handshake, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeader } from "../SectionHeader";
import { missionVision } from "../../content/site";

/**
 * Misión, visión y promesa de valor.
 *
 * Sin tarjetas: tres columnas separadas por hairlines. Encerrar cada texto en
 * su propia caja dentro de una sección que ya es una caja no añade información,
 * sólo bordes.
 */
export function MissionVision() {
  const blocks: { title: string; body: string; ItemIcon: LucideIcon }[] = [
    { ...missionVision.mission, ItemIcon: Handshake },
    { ...missionVision.vision, ItemIcon: Compass },
    { ...missionVision.promise, ItemIcon: Target },
  ];

  return (
    <section
      id="nosotros"
      className="border-t border-hairline bg-surface-muted py-24 lg:py-32"
    >
      <div className="shell">
        {/* «Quiénes somos» pasa a ser el titular, al tamaño que tenía la frase anterior. */}
        <SectionHeader title="Quiénes somos" />

        <div className="mt-16 grid gap-x-12 gap-y-12 border-t border-hairline lg:grid-cols-3">
          {blocks.map((block) => (
            <article
              key={block.title}
              className="pt-8 lg:border-l lg:border-hairline lg:pl-8 lg:first:border-l-0 lg:first:pl-0"
            >
              <block.ItemIcon className="size-6 text-menta-500" />
              <h3 className="display mt-5 text-xl">{block.title}</h3>
              <p className="mt-3 leading-relaxed text-ink-soft dark:text-body">
                {block.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <span className="shrink-0 text-xs font-bold tracking-[0.2em] text-ink-soft uppercase">
            Valores corporativos
          </span>
          <span aria-hidden className="hidden h-px w-8 shrink-0 bg-hairline sm:block" />
          <p className="font-semibold leading-relaxed text-menta-700 dark:text-menta-300">
            {missionVision.valuesStatement}
          </p>
        </div>
      </div>
    </section>
  );
}
