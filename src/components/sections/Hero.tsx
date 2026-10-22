import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import { BrandMotif } from "../BrandMotif";
import { HeroCarrusel } from "../HeroCarrusel";
import { Presence } from "./Presence";
import { hero, heroCalculadora } from "../../content/site";

/**
 * Hero en diapositivas (ver HeroCarrusel): tres fotografías con el mensaje
 * principal y una cuarta que invita a la calculadora de riesgo de cáncer de
 * pulmón.
 *
 * Los dos textos se arman aquí, en el servidor. El principal es el elemento
 * LCP: está visible desde el primer pintado y no anima su entrada.
 *
 * La tira de cifras que iba debajo se retiró el 2026-10-22: tras el hero
 * entra directamente el globo de presencia.
 */
export function Hero() {
  const principal = (
    <div className="max-w-3xl">
      <p className="eyebrow">{hero.eyebrow}</p>
      <h1 className="display mt-7 text-[2.75rem] sm:text-[3.75rem] lg:text-[4.75rem]">{hero.title}</h1>
      <p className="mt-7 max-w-xl text-lg leading-relaxed text-body">{hero.subtitle}</p>
      <div className="mt-9 flex flex-wrap items-center gap-3">
        <Link href={hero.primaryCta.href} className="btn btn-primary">
          {hero.primaryCta.label}
          <ArrowRight className="btn-arrow size-4" strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );

  const calculadora = (
    <div>
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-1.5 text-[0.68rem] font-semibold tracking-[0.18em] text-menta-300 uppercase">
          {heroCalculadora.eyebrow}
        </p>
        <p className="display mt-6 text-[2.4rem] text-white sm:text-[3.25rem] lg:text-[3.9rem]">{heroCalculadora.title}</p>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">{heroCalculadora.subtitle}</p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href={heroCalculadora.primaryCta.href}
            className="btn bg-menta-400 text-gris-900 hover:bg-menta-300"
          >
            {heroCalculadora.primaryCta.label}
            <ArrowRight className="btn-arrow size-4" strokeWidth={2.5} />
          </Link>
          <Link
            href={heroCalculadora.secondaryCta.href}
            className="btn border border-white/40 text-white hover:bg-white/10"
          >
            <LogIn className="size-4" strokeWidth={2.25} />
            {heroCalculadora.secondaryCta.label}
          </Link>
        </div>
        <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/15 pt-6 text-sm text-white/75">
          {heroCalculadora.datos.map((d) => (
            <li key={d} className="inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-menta-300" />
              {d}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <HeroCarrusel
        principal={principal}
        calculadora={calculadora}
        fondoCalculadora={heroCalculadora.fondo}
        decoracion={<BrandMotif className="absolute -top-4 right-0 w-48 opacity-[0.16] lg:w-72" />}
      />

      {/* Presencia en el globo, justo bajo el hero, como en cloudflare.com. */}
      <Presence />
    </>
  );
}
