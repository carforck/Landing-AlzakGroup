"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { heroImages } from "../content/site";

/*
 * Ritmo del giro. Las fotografías siguen en 4 s (ver la historia en el commit
 * del hero: a 8 s el visitante se iba habiendo visto una y media). La
 * diapositiva de la calculadora se queda 7 s porque trae más texto y dos
 * botones: en 4 s no da tiempo a leerla.
 */
const FOTO_MS = 4000;
const CALCULADORA_MS = 7000;
const FADE_MS = 650;

/**
 * Hero en diapositivas: las tres fotografías con el mensaje principal y una
 * cuarta, propia, que invita a la calculadora de riesgo de cáncer de pulmón
 * (pedida por Carlos el 2026-10-22).
 *
 * Los dos textos llegan desde el servidor como `principal` y `calculadora`, y
 * aquí sólo se alternan. El principal está visible desde el primer pintado:
 * es el elemento LCP y no se anima su entrada. El que no se ve queda `inert`
 * para que el teclado y los lectores de pantalla no lo recorran.
 *
 * Fondo: en las fotografías, la foto con su velo blanco calibrado para el
 * contraste del titular; en la calculadora, un fondo oscuro de la marca, sobre
 * el que el texto va en blanco.
 *
 * El giro se detiene fuera de pantalla, al pasar el cursor o enfocar algo
 * dentro (WCAG 2.2.2), y no arranca si se pidió menos movimiento. Los puntos
 * permiten cambiar de diapositiva a mano.
 */
export function HeroCarrusel({
  principal,
  calculadora,
  decoracion,
  fondoCalculadora,
}: {
  principal: ReactNode;
  calculadora: ReactNode;
  /** Fotografía de fondo de la diapositiva de la calculadora (null: fondo de color). */
  fondoCalculadora?: { src: string; atribucion: string } | null;
  /** Motivo de marca encima del fondo (sólo en las fotografías). */
  decoracion?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(true);
  const [pausado, setPausado] = useState(false);
  const [actual, setActual] = useState(0);
  const total = heroImages.length + 1;
  const esCalculadora = actual === heroImages.length;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "80px" });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || pausado) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setActual((i) => (i + 1) % total), esCalculadora ? CALCULADORA_MS : FOTO_MS);
    return () => clearTimeout(id);
  }, [visible, pausado, actual, esCalculadora, total]);

  return (
    <section
      ref={ref}
      id="inicio"
      aria-roledescription="carrusel"
      className="relative isolate overflow-hidden"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
    >
      {/* ── Fondo ── */}
      <div aria-hidden data-animate={visible ? "on" : "off"} className="pointer-events-none absolute inset-0 overflow-hidden">
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
            className={`hero-photo object-cover transition-opacity ease-in-out ${i === actual ? "opacity-100" : "opacity-0"}`}
          />
        ))}

        {/* Velos de las fotografías (ver calibración del contraste en el commit del hero). */}
        <div
          className={`absolute inset-0 transition-opacity ease-in-out ${esCalculadora ? "opacity-0" : "opacity-100"}`}
          style={{ transitionDuration: `${FADE_MS}ms` }}
        >
          <div className="absolute inset-0 bg-surface/8" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface/90 from-0% via-surface/72 via-50% to-transparent to-74%" />
          {decoracion}
        </div>

        {/*
          Fondo de la diapositiva de la calculadora: la fotografía médica, si
          la hay, bajo un velo azul profundo de la marca que garantiza el
          contraste del texto blanco; si no, sólo el degradado de la marca.
        */}
        <div
          className={`absolute inset-0 transition-opacity ease-in-out ${esCalculadora ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDuration: `${FADE_MS}ms` }}
        >
          {fondoCalculadora ? (
            <Image src={fondoCalculadora.src} alt="" fill sizes="100vw" quality={80} className="object-cover object-right" />
          ) : null}
          <div
            className="absolute inset-0"
            style={{
              background: fondoCalculadora
                ? // La imagen ya trae oscura la zona del texto; el velo sólo la refuerza y deja ver la radiografía.
                  "linear-gradient(90deg, rgba(14,38,46,0.85) 0%, rgba(14,38,46,0.55) 45%, rgba(14,38,46,0.05) 80%)"
                : "radial-gradient(ellipse 60% 70% at 78% 45%, rgba(93,195,218,0.35), transparent 70%), linear-gradient(120deg, #1e3a44 0%, #264d5b 55%, #2a7085 100%)",
            }}
          />
        </div>

        {/* Cierre inferior hacia la siguiente sección */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-surface" />
      </div>

      {/* ── Contenido: las dos capas comparten celda y se alternan ── */}
      <div className="shell relative grid pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div
          className={`col-start-1 row-start-1 transition-opacity ease-in-out ${esCalculadora ? "pointer-events-none opacity-0" : "opacity-100"}`}
          style={{ transitionDuration: `${FADE_MS}ms` }}
          inert={esCalculadora}
          aria-hidden={esCalculadora}
        >
          {principal}
        </div>
        <div
          className={`col-start-1 row-start-1 self-center transition-opacity ease-in-out ${esCalculadora ? "opacity-100" : "pointer-events-none opacity-0"}`}
          style={{ transitionDuration: `${FADE_MS}ms` }}
          inert={!esCalculadora}
          aria-hidden={!esCalculadora}
          data-activa={esCalculadora ? "si" : "no"}
        >
          {calculadora}
        </div>
      </div>

      {fondoCalculadora?.atribucion && esCalculadora ? (
        <p className="absolute right-6 bottom-6 z-20 text-[0.65rem] text-white/60 lg:right-10">{fondoCalculadora.atribucion}</p>
      ) : null}

      {/* Puntos del giro, abajo a la izquierda (lejos del botón de WhatsApp). */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2 lg:bottom-8 lg:left-10">
        {Array.from({ length: total }, (_, i) => {
          const calc = i === heroImages.length;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActual(i)}
              aria-label={calc ? "Mostrar la calculadora de riesgo" : `Mostrar la imagen ${i + 1} de ${heroImages.length}`}
              aria-current={i === actual}
              className={`h-1.5 rounded-full transition-[width,background-color] duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                // Mismos colores en todas: los puntos caen sobre el cierre claro
                // del borde inferior, también en la diapositiva oscura.
                i === actual ? "w-8 bg-menta-600" : "w-1.5 bg-gris-500/40 hover:bg-gris-500/70"
              }`}
            />
          );
        })}
      </div>
    </section>
  );
}
