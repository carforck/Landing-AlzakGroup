"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Cinta infinita de logotipos.
 *
 * La lista se pinta dos veces seguidas y el carril se desplaza exactamente un
 * -50 %: cuando la primera copia termina de salir, la segunda está justo donde
 * arrancó la primera, así que el salto del bucle no se ve. Por eso el número de
 * logos no importa, pero sí que las dos copias sean idénticas.
 *
 * Como el resto de bucles del sitio, sólo anima `transform` y se pausa cuando la
 * sección no está en pantalla (`data-animate`), para no gastar batería moviendo
 * lo que nadie ve. También se pausa al pasar el cursor, que es cuando el
 * visitante quiere leer una marca concreta.
 *
 * La segunda copia va oculta a lectores de pantalla: son los mismos logos y
 * anunciarlos dos veces sería ruido.
 */
type Logo = { readonly name: string; readonly logo: string };

export function LogoMarquee({ items }: { items: readonly Logo[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const fila = (copia: number) =>
    items.map((it) => (
      <li
        key={`${copia}-${it.name}`}
        className="flex w-88 shrink-0 items-center justify-center px-10 lg:w-112"
      >
        <span className="relative block h-28 w-full lg:h-32">
          <Image
            src={it.logo}
            alt={copia === 0 ? it.name : ""}
            aria-hidden={copia === 1}
            fill
            sizes="448px"
            className="object-contain"
          />
        </span>
      </li>
    ));

  return (
    <div
      ref={ref}
      data-animate={visible ? "on" : "off"}
      className="logo-marquee relative overflow-hidden"
    >
      <ul className="logo-marquee-track flex w-max items-center">
        {fila(0)}
        {fila(1)}
      </ul>
    </div>
  );
}
