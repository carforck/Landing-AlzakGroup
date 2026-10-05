import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandMotif } from "../BrandMotif";
import { CountUp } from "../CountUp";
import { HeroBackdrop } from "../HeroBackdrop";
import { Presence } from "./Presence";
import { hero, stats } from "../../content/site";

/**
 * El texto del hero se renderiza estático a propósito: es contenido
 * above-the-fold y el elemento LCP. Animarlo desde `opacity: 0` retrasaría la
 * pintura del titular. El único movimiento es el giro del fondo, que ocurre
 * detrás del velo y no compite con la lectura.
 *
 * Las cifras van en su propia tira, fuera de la banda de imagen: sobre fondo
 * sólido tienen contraste pleno, y así el hero termina donde termina la
 * fotografía, que es donde deben quedar los indicadores del giro.
 */
export function Hero() {
  return (
    <>
      <section id="inicio" className="relative isolate overflow-hidden">
        <HeroBackdrop />
        <BrandMotif className="pointer-events-none absolute -top-4 right-0 w-48 opacity-[0.16] lg:w-72" />

        <div className="shell relative pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="max-w-3xl">
            <p className="eyebrow">{hero.eyebrow}</p>

            <h1 className="display mt-7 text-[2.75rem] sm:text-[3.75rem] lg:text-[4.75rem]">
              {hero.title}
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-body">
              {hero.subtitle}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href={hero.primaryCta.href} className="btn btn-primary">
                {hero.primaryCta.label}
                <ArrowRight className="btn-arrow size-4" strokeWidth={2.5} />
              </Link>
              <Link
                href={hero.secondaryCta.href}
                className="btn btn-ghost bg-surface/80 backdrop-blur-sm"
              >
                {hero.secondaryCta.label}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/*
        Cifras de la lámina "Experiencia" del deck. Separadas por hairlines
        verticales en lugar de tarjetas: es una fila de datos, no cuatro objetos.
      */}
      <section aria-label="Nuestra experiencia en cifras" className="shell">
        <dl className="grid grid-cols-2 border-t border-hairline lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="border-b border-hairline py-7 pr-6 lg:border-b-0 lg:border-l lg:first:border-l-0 lg:pl-7"
            >
              <dt className="display text-[2rem] text-menta-600">
                <CountUp value={item.value} />
              </dt>
              <dd className="mt-2 max-w-[22ch] text-sm leading-relaxed text-ink-soft">
                {item.label}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Presencia en el globo, debajo de las cifras, como en cloudflare.com. */}
      <Presence />
    </>
  );
}
