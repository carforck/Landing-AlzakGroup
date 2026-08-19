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
type Logo = {
  readonly name: string;
  readonly logo: string;
  readonly logoWidth: number;
  readonly logoHeight: number;
};

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
        // Sin ancho fijo: la celda mide lo que mide su logotipo. Con celdas
        // iguales, un logotipo cuadrado como el de Biotórax dejaba un hueco
        // enorme a los lados y la separación entre marcas se veía irregular.
        className="flex shrink-0 items-center px-9 lg:px-12"
      >
        <Image
          src={it.logo}
          alt={copia === 0 ? it.name : ""}
          aria-hidden={copia === 1}
          width={it.logoWidth}
          height={it.logoHeight}
          // Alto común y tope de ancho: los logotipos muy apaisados se reducen
          // en lugar de aplastar al resto. `object-contain` mantiene la
          // proporción cuando el tope entra en juego.
          className="h-20 w-auto max-w-[18rem] object-contain lg:h-28 lg:max-w-[22rem]"
        />
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
