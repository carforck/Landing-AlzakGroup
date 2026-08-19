import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { quality } from "../../content/site";
import { MotifField } from "../MotifField";

/**
 * Bloque menta que ancla la home y enlaza a la página completa de calidad.
 *
 * Todo el texto va en gris corporativo, nunca en blanco ni en gris translúcido:
 * el menta #5DC3DA es un color claro y el blanco sobre él sólo alcanza 2.04:1
 * de contraste. El gris-800 llega a 7.09:1 y además es el otro color
 * corporativo, así que la combinación es la que el manual prescribe.
 *
 * El patrón del fondo sigue la misma regla: sólo piezas en blanco translúcido.
 * Aclarar el menta sube el contraste del texto gris; oscurecerlo lo bajaría, y
 * por eso el patrón puede ir a plena intensidad y cruzar por detrás del titular
 * sin comprometer la lectura. Se probó taparlo con un velo sobre la columna de
 * texto y el movimiento dejaba de percibirse justo donde se mira: el bloque
 * quedaba plano. Aquí el fondo es el efecto, no un adorno de los márgenes.
 */
export function QualityTeaser() {
  return (
    <section
      id="calidad"
      className="relative isolate overflow-hidden bg-menta-400 py-24 lg:py-32"
    >
      {/* Cuadros y rombos rodando por debajo del menta: ver MotifField */}
      <MotifField />

      <div className="shell relative grid items-center gap-14 lg:grid-cols-[1fr_auto] lg:gap-24">
        <div>
          <p className="eyebrow !text-gris-800">Sistema de Gestión de Calidad</p>

          <h2 className="display mt-6 max-w-xl text-[2rem] !text-gris-900 sm:text-[2.5rem] lg:text-[3rem]">
            Certificados ISO 9001:2015 por Bureau Veritas
          </h2>

          <p className="mt-6 max-w-xl leading-relaxed text-gris-800">
            Una de las primeras compañías de consultoría e investigación de la región
            Caribe en obtener este reconocimiento, vigente desde el 27 de septiembre de
            2021 y mantenido mediante auditorías de seguimiento y recertificación.
          </p>

          <ul className="mt-9 grid gap-3 sm:grid-cols-2">
            {quality.pillars.map((pillar) => (
              <li
                key={pillar}
                className="flex items-center gap-2.5 text-sm font-medium text-gris-800"
              >
                <Check className="size-4 shrink-0" strokeWidth={2.5} />
                {pillar}
              </li>
            ))}
          </ul>

          <Link href="/calidad" className="btn btn-dark mt-10">
            Ver el sistema de gestión
            <ArrowRight className="btn-arrow size-4" strokeWidth={2.5} />
          </Link>
        </div>

        {/*
          Tamaño del sello. Se pidió 3.5× (952 px de ancho) y no es alcanzable con
          este archivo: el original mide 350×248 px, así que 952 px son un aumento
          de 2.7× sobre un sello con letra fina —"ISO 9001:2015", "BUREAU VERITAS",
          "Certification"— que se deshace al ampliarlo. Se revisaron los dos PDF
          corporativos y su copia es aún menor, 240×169. Tampoco cabría: a 1440 px
          la fila mide 1136 con 96 de separación, así que un sello de 952 dejaría
          88 px para la columna de texto.
          Esto es el techo de esta maqueta: 22rem hasta xl —el ancho nativo, nítido—
          y 30rem desde xl, donde ya sobran 560 px para el texto. Para llegar al
          3.5× hace falta un sello de 1000 px de ancho o, mejor, en SVG.

          El ancho va en `w-*` y no en `max-w-*`. La columna es `auto`, así que se
          dimensiona por el contenido: un `max-width` sólo puede recortar y con
          `max-w-[30rem]` el sello se quedaba clavado en sus 350 px intrínsecos.
          `max-w-full` lo devuelve a una sola columna en móvil, donde 22rem no cabe.
        */}
        <Image
          src={quality.certificate.image}
          alt={quality.certificate.alt}
          width={350}
          height={249}
          className="h-auto w-[22rem] max-w-full xl:w-[30rem]"
        />
      </div>
    </section>
  );
}
