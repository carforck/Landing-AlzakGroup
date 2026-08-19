import { BadgeCheck, Kanban, Medal, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeader } from "../SectionHeader";
import { differentiators } from "../../content/site";
import { DriftingMotif } from "../DriftingMotif";

const iconMap: Record<string, LucideIcon> = {
  badge: BadgeCheck,
  kanban: Kanban,
  users: Users,
  award: Medal,
};

/**
 * Lámina "¿Qué nos hace diferentes?" del deck corporativo.
 *
 * En claro: la marca es clara y un segundo bloque oscuro (además del footer)
 * cargaba de más la página. El acento lo pone el número grande en menta, no un
 * fondo saturado.
 */
export function Differentiators() {
  return (
    <section
      id="diferenciadores"
      className="relative isolate overflow-hidden border-t border-hairline py-24 lg:py-32"
    >
      <DriftingMotif className="-bottom-10 left-0 w-56 opacity-[0.10] lg:w-80" />
      <div className="shell relative">
        <SectionHeader
          eyebrow="¿Qué nos hace diferentes?"
          title="Método, certificación y trayectoria"
          lead="Cuatro razones por las que la industria farmacéutica y el sector público confían sus estudios a ALZAK."
        />

        <ol className="mt-16 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {differentiators.map((item, i) => {
            const ItemIcon = iconMap[item.icon] ?? BadgeCheck;
            return (
              <li
                key={item.title}
                className="flex gap-5 border-t border-hairline pt-7"
              >
                <span
                  aria-hidden
                  className="display shrink-0 text-2xl text-menta-300 dark:text-menta-800"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="flex items-center gap-2.5 text-lg font-semibold">
                    <ItemIcon className="size-5 shrink-0 text-menta-500" />
                    {item.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-ink-soft dark:text-body">
                    {item.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
