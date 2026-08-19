"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { heroImages } from "../content/site";

/*
 * Ritmo del giro. Arrancó en 8000 ms, el mismo que el hero de ALZAK Foundation,
 * y se dobló a 4000: con tres fotografías, a 8 s el visitante medio se iba
 * habiendo visto una y media, así que dos de las tres no llegaban a existir.
 *
 * El fundido se queda en 650 ms. Es el 16 % del ciclo, todavía una transición
 * entre dos estados; acortarlo con el giro lo convertiría en un corte seco, y
 * alargarlo dejaría las dos fotografías superpuestas la mayor parte del tiempo.
 */
const ROTATION_MS = 4000;
const FADE_MS = 650;

/**
 * Fondo del hero: una sola fotografía a sangre que gira entre las tres.
 *
 * Es el mismo patrón del hero de Foundation: una imagen por diapositiva, fundido
 * cruzado cada 8 s y puntos indicadores clicables. Se descartó una versión con
 * las tres fotos en franjas verticales porque el velo del texto tapaba por
 * completo la franja izquierda, así que sólo se percibían dos fotos pegadas con
 * una costura vertical dura en medio: se leía como un error, no como diseño.
 *
 * Encima va un velo blanco doble: uno plano y suave, y otro en degradado
 * horizontal sobre la columna del texto. Está calibrado al mínimo que aguanta la
 * lectura: la fotografía se ve nítida en casi todo el encuadre y el titular
 * conserva holgura sobre el 4.5:1 que exige la WCAG.
 *
 * Las tres van con `priority`: a 4 s de ciclo la segunda entra demasiado pronto
 * para confiar en la carga diferida, y un fundido hacia una imagen a medio
 * decodificar se ve como un parpadeo en blanco.
 *
 * El giro y la deriva se detienen cuando la sección sale de pantalla.
 */
export function HeroBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "80px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    // WCAG 2.2.2: sin rotación automática si el visitante pidió menos movimiento;
    // los puntos siguen permitiendo cambiar de fotografía a mano.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(
      () => setCurrent((i) => (i + 1) % heroImages.length),
      ROTATION_MS,
    );
    return () => clearInterval(id);
  }, [visible]);

  return (
    <>
      <div
        ref={ref}
        aria-hidden
        data-animate={visible ? "on" : "off"}
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {heroImages.map((img, i) => (
          <Image
            key={img.src}
            src={img.src}
            alt=""
            fill
            sizes="100vw"
            priority
            quality={80}
            style={{ transitionDuration: `${FADE_MS}ms` }}
            className={`hero-photo object-cover transition-opacity ease-in-out ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Velo plano y suave: quita brillo a la fotografía sin taparla */}
        <div className="absolute inset-0 bg-surface/8" />
        {/*
          Velo en degradado, y el reparto importa más que la cantidad.
          Antes bajaba en diagonal por todo el ancho: opaco al 30 %, 55 % en el
          centro y nulo al 68 %, así que la mitad derecha —donde está el motivo
          de la fotografía— arrastraba un velo que no protegía ningún texto y
          sólo lavaba la imagen.
          Ahora sostiene el 72 % hasta el 50 % del ancho, que es hasta donde
          llegan el titular y el subtítulo, y cae a cero al 74 %. A partir de ahí
          la fotografía se ve prácticamente limpia: sólo queda el 8 % del velo
          plano.
          Los cortes no son estimados. Se midió el peor píxel del fondo bajo cada
          bloque de texto en las tres fotografías del giro y se ajustó hasta que
          el subtítulo, que es texto de 18 px y necesita 4.5:1, pasara en las
          tres. Bajar más el 72 % lo tumba sobre la tercera fotografía.
        */}
        <div className="absolute inset-0 bg-gradient-to-r from-surface/90 from-0% via-surface/72 via-50% to-transparent to-74%" />
        {/* Cierre inferior hacia la siguiente sección */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-surface" />
      </div>

      {/*
        Indicadores del giro, abajo a la izquierda: alineados con la columna de
        texto y lejos del botón flotante de WhatsApp, con el que colisionaban
        cuando estaban a la derecha. Dan el control manual que exige la
        WCAG 2.2.2 para contenido que se actualiza solo.
      */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2 lg:bottom-8 lg:left-10">
        {heroImages.map((img, i) => (
          <button
            key={`dot-${img.src}`}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`Mostrar la imagen ${i + 1} de ${heroImages.length}`}
            aria-current={i === current}
            className={`h-1.5 rounded-full transition-[width,background-color] duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              i === current
                ? "w-8 bg-menta-600"
                : "w-1.5 bg-gris-500/40 hover:bg-gris-500/70"
            }`}
          />
        ))}
      </div>
    </>
  );
}
