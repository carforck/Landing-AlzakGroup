import Image from "next/image";
import { clients } from "../../content/site";

/**
 * Muro de logos.
 *
 * Los archivos vienen del deck corporativo con fondos blancos horneados y
 * proporciones muy distintas, así que se recortaron a su contenido y aquí se
 * normalizan en celdas del mismo tamaño con `object-contain`: todos ocupan el
 * mismo peso óptico sin deformar ninguna marca.
 *
 * En reposo van desaturados para que la sección lea como un solo bloque y no
 * como dieciséis paletas compitiendo; al pasar el cursor recuperan su color.
 */
export function Clients() {
  return (
    <section id="clientes" className="border-t border-hairline py-20 lg:py-24">
      <div className="shell">
        <div className="text-center">
          <p className="eyebrow">Hemos trabajado con</p>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-ink-soft dark:text-body">
            Compañías farmacéuticas y laboratorios que han confiado sus estudios de
            evaluación económica, carga de enfermedad y evidencia de vida real a ALZAK.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-px bg-hairline sm:grid-cols-3 lg:grid-cols-4">
          {clients.map((client) => (
            <li
              key={client.name}
              className="flex h-24 items-center justify-center bg-surface p-6"
            >
              <span className="relative block h-full w-full">
                <Image
                  src={client.logo}
                  alt={client.name}
                  fill
                  sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 45vw"
                  className="object-contain opacity-60 grayscale transition-[opacity,filter] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:opacity-100 hover:grayscale-0"
                />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
