import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SectionHeader } from "../SectionHeader";
import { leaders } from "../../content/site";

export function Leaders() {
  return (
    <section
      id="lideres"
      className="border-t border-hairline bg-surface-muted py-24 lg:py-32"
    >
      <div className="shell">
        <SectionHeader
          eyebrow="Nuestros líderes"
          title="El equipo que respalda cada estudio"
          lead="Médicos y economistas con formación doctoral y trayectoria comprobada en publicación científica."
        />

        <ul className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {leaders.map((leader) => (
            <li
              key={`${leader.firstName} ${leader.lastName}`}
              className="group"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-surface-sunken">
                <Image
                  src={leader.photo}
                  alt={`${leader.firstName} ${leader.lastName}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover object-top transition-transform duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
              </div>

              <h3 className="mt-5 text-lg leading-tight">
                {leader.firstName}{" "}
                <span className="block font-semibold">{leader.lastName}</span>
              </h3>
              <p className="mt-2 text-xs font-bold tracking-[0.14em] text-menta-600 uppercase dark:text-menta-300">
                {leader.credentials}
              </p>
              <p className="mt-1.5 text-sm leading-snug text-ink-soft dark:text-body">
                {leader.role}
              </p>

              {/* Índice H: señal de productividad científica, del deck corporativo */}
              <p className="mt-4 flex items-baseline gap-2 border-t border-hairline pt-3">
                <abbr
                  title="Índice H: número de publicaciones con al menos ese mismo número de citaciones"
                  className="text-[0.6875rem] font-bold tracking-[0.14em] text-ink-soft uppercase no-underline"
                >
                  Índice H
                </abbr>
                <span className="display text-lg text-menta-600 dark:text-menta-300">
                  {leader.hIndex}
                </span>
              </p>

              {/* Perfiles académicos: CvLAC de Minciencias y Google Scholar. */}
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                {[
                  { href: leader.cvlac, texto: "CvLAC" },
                  { href: leader.scholar, texto: "Scholar" },
                ].map((l) => (
                  <a
                    key={l.texto}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${l.texto} de ${leader.firstName} ${leader.lastName}`}
                    className="group/link inline-flex items-center gap-1 text-xs font-medium text-ink-soft transition-colors duration-200 hover:text-menta-600 dark:hover:text-menta-300"
                  >
                    <span className="link-underline">{l.texto}</span>
                    <ArrowUpRight
                      className="size-3 opacity-50 transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                      strokeWidth={2.5}
                    />
                  </a>
                ))}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
