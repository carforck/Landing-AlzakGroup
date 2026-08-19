import { Activity, ClipboardList, Coins, FileText, Gauge, GraduationCap, Library, LineChart, Route, Scale, TrendingUp, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "../Reveal";
import { DriftingColumns } from "../DriftingColumns";
import { IconDraw } from "../IconDraw";
import { SectionHeader } from "../SectionHeader";
import { services } from "../../content/site";

const iconMap: Record<string, LucideIcon> = {
  scale: Scale,
  activity: Activity,
  coins: Coins,
  trending: TrendingUp,
  lineChart: LineChart,
  users: Users,
  route: Route,
  library: Library,
  clipboard: ClipboardList,
  gauge: Gauge,
  fileText: FileText,
  graduation: GraduationCap,
};

export function Services() {
  return (
    <section id="servicios" className="border-t border-hairline py-24 lg:py-32">
      <div className="shell">
        <SectionHeader
          eyebrow="Nuestros servicios"
          title="Doce líneas de trabajo, un mismo estándar de calidad"
          lead="Cada proyecto se ejecuta bajo protocolos reproducibles y control documental del Sistema de Gestión de Calidad certificado."
        />

        {/*
          Entrada escalonada por columna (retardo acotado a 120 ms) y, ya en
          pantalla, deriva continua por columna: ver DriftingColumns.
          Las tarjetas llevan borde propio y separación real en lugar del truco
          de `gap-px` sobre fondo hairline que había antes: en cuanto las
          columnas se mueven de forma independiente, un hairline compartido se
          parte y deja huecos irregulares que se leen como un fallo de maqueta.
        */}
        <DriftingColumns>
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => {
              const ItemIcon = iconMap[service.icon] ?? FileText;
              return (
                <li
                  key={service.title}
                  className="overflow-hidden rounded-lg border border-hairline bg-surface"
                >
                  <Reveal delay={(i % 3) * 0.06} className="h-full">
                    <div className="service-row group h-full p-7 lg:p-8">
                      {/*
                        Los iconos son de trazo (Lucide), así que se dibujan al
                        entrar en pantalla: ver IconDraw. Van a size-7 y no size-6
                        porque un trazo de 1.5px pesa menos en la página que el
                        contorno relleno que había antes, y al mismo tamaño el
                        icono se quedaba corto frente al titular.
                      */}
                      <span className="inline-flex items-center justify-center text-menta-500 transition-colors duration-200 group-hover:text-menta-700 dark:text-menta-300">
                        <IconDraw>
                          <ItemIcon className="size-7" />
                        </IconDraw>
                      </span>
                      <h3 className="display mt-6 text-base leading-snug">
                        {service.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-ink-soft dark:text-body">
                        {service.description}
                      </p>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </DriftingColumns>
      </div>
    </section>
  );
}
