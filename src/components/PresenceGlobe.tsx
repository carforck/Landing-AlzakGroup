"use client";

import { useEffect, useRef, useState } from "react";
import { geoGraticule10, geoInterpolate, geoOrthographic, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import { presence } from "../content/site";

/**
 * Globo de presencia de ALZAK, a la manera del de cloudflare.com: medio globo
 * que gira despacio, continentes rellenos sobre un océano claro, halo en el
 * borde y puntos oscuros en cada ciudad. La parte de abajo se desvanece.
 *
 * Diferencias a propósito con la referencia:
 *  - La paleta es la de ALZAK: menta en lugar de naranja, gris oscuro en los
 *    puntos. Los países con presencia van en un menta más intenso.
 *  - No da vueltas completas. Toda la presencia está en América; un giro de
 *    360° la escondería la mitad del tiempo. Entra rotando desde el Atlántico,
 *    se detiene sobre la región y luego oscila suave. Se puede arrastrar.
 *  - Los puntos aparecen en el orden de la lámina 8 de la presentación
 *    institucional (sede → pacientes → institucional → internacional → LATAM
 *    → nueva sede), con un pulso y un arco desde Cartagena.
 *
 * Se pausa fuera de pantalla y con «reducir movimiento» queda quieto, con
 * todos los puntos ya visibles.
 */

type Lugar = (typeof presence.lugares)[number];
type Categoria = (typeof presence.categorias)[number]["clave"];

const COLOR = {
  oceano: "#f0fafc",
  tierra: "#8ad8e7",
  tierraFuerte: "#3fa9c2",
  borde: "#ffffff",
  halo: "rgba(93,195,218,0.55)",
  rejilla: "rgba(42,112,133,0.08)",
  punto: "#2b2928",
  sede: "#264d5b",
  nueva: "#e2704b",
  arco: "rgba(38,77,91,0.45)",
};

export const COLOR_CATEGORIA: Record<Categoria, string> = {
  sede: COLOR.sede,
  pacientes: "#2a7085",
  institucional: "#2f8ba3",
  internacional: "#3a3736",
  latam: "#54504f",
  nueva: COLOR.nueva,
};

/**
 * Tamaño del globo para un ancho dado. Se exporta porque las líneas de las
 * cifras de arriba (ver Presence) se miden con esto para caer justo sobre la
 * superficie, como en la portada de Cloudflare.
 */
export function geometriaGlobo(ancho: number) {
  const radio = Math.min(ancho * 0.42, 460);
  return { radio, alto: Math.round(radio * 1.62), cx: ancho / 2, cy: radio + 8 };
}

const CENTRO_LON = -72;
const CENTRO_LAT = -6;
const MS_POR_FASE = 650;
const INTRO_MS = 2400;

export function PresenceGlobe({ resaltada }: { resaltada: Categoria | null }) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const caja = useRef<HTMLDivElement>(null);
  const [foco, setFoco] = useState<{ x: number; y: number; lugar: Lugar } | null>(null);
  const resaltadaRef = useRef(resaltada);
  const redibujar = useRef<() => void>(() => {});
  useEffect(() => {
    resaltadaRef.current = resaltada;
    redibujar.current();
  }, [resaltada]);

  useEffect(() => {
    const canvas = lienzo.current!;
    const contenedor = caja.current!;
    const ctx = canvas.getContext("2d")!;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let tierra: GeoPermissibleObjects | null = null;
    let paises: GeoPermissibleObjects | null = null;
    let ancho = 0;
    let alto = 0;
    let radio = 0;
    let raf = 0;
    let visible = false;
    let inicio = performance.now();
    let lon = CENTRO_LON + 70; // entra desde el Atlántico
    let arrastrando: { x: number; lon: number } | null = null;
    let soltadoEn = 0;
    let lonAlSoltar = CENTRO_LON;

    const proyeccion = geoOrthographic().clipAngle(90).precision(0.4);
    const ruta = geoPath(proyeccion, ctx);
    const rejilla = geoGraticule10();

    // Los mapas se piden aparte para no engordar el bundle de la portada.
    import("world-atlas/countries-110m.json").then((m) => {
      const topo = m.default as unknown as Topology<{ countries: GeometryCollection; land: GeometryCollection }>;
      tierra = feature(topo, topo.objects.land) as unknown as GeoPermissibleObjects;
      const todos = feature(topo, topo.objects.countries) as unknown as { features: { id?: string }[] };
      paises = {
        type: "FeatureCollection",
        features: todos.features.filter((f) => (presence.paises as readonly string[]).includes(String(f.id))),
      } as unknown as GeoPermissibleObjects;
      if (!raf) dibujar(performance.now());
    });

    const medir = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      ancho = contenedor.clientWidth;
      // Medio globo largo, como en la referencia: se ve buena parte del disco.
      ({ radio, alto } = geometriaGlobo(ancho));
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
      canvas.style.height = `${alto}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      proyeccion.scale(radio).translate([geometriaGlobo(ancho).cx, geometriaGlobo(ancho).cy]);
    };

    const facil = (t: number) => 1 - Math.pow(1 - t, 3);

    const longitud = (ahora: number) => {
      if (arrastrando) return lon;
      if (reducido) return CENTRO_LON;
      const t = ahora - inicio;
      if (t < INTRO_MS) return CENTRO_LON + 70 * (1 - facil(t / INTRO_MS));
      // Tras soltar, vuelve con suavidad al vaivén.
      const vaiven = CENTRO_LON + Math.sin((t - INTRO_MS) / 5200) * 16;
      if (soltadoEn) {
        const k = Math.min(1, (ahora - soltadoEn) / 1600);
        if (k >= 1) soltadoEn = 0;
        return lonAlSoltar + (vaiven - lonAlSoltar) * facil(k);
      }
      return vaiven;
    };

    const dibujar = (ahora: number) => {
      raf = 0;
      lon = longitud(ahora);
      proyeccion.rotate([-lon, -CENTRO_LAT, 0]);
      const t = reducido ? Infinity : ahora - inicio - INTRO_MS * 0.55;
      const fase = (n: number) => Math.max(0, Math.min(1, (t - n * MS_POR_FASE) / 500));
      const marcada = resaltadaRef.current;

      ctx.clearRect(0, 0, ancho, alto);
      const [cx, cy] = proyeccion.translate();

      // Halo exterior, el brillo del borde.
      const halo = ctx.createRadialGradient(cx, cy, radio * 0.94, cx, cy, radio * 1.08);
      halo.addColorStop(0, COLOR.halo);
      halo.addColorStop(1, "rgba(93,195,218,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, radio * 1.08, 0, Math.PI * 2);
      ctx.fill();

      // Océano.
      ctx.fillStyle = COLOR.oceano;
      ctx.beginPath();
      ruta({ type: "Sphere" });
      ctx.fill();

      ctx.strokeStyle = COLOR.rejilla;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ruta(rejilla);
      ctx.stroke();

      if (tierra) {
        ctx.fillStyle = COLOR.tierra;
        ctx.beginPath();
        ruta(tierra);
        ctx.fill();
      }
      if (paises) {
        ctx.fillStyle = COLOR.tierraFuerte;
        ctx.strokeStyle = COLOR.borde;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ruta(paises);
        ctx.fill();
        ctx.stroke();
      }

      // Arcos desde Cartagena a los puntos fuera de Colombia.
      const sede = presence.lugares[0];
      for (const l of presence.lugares) {
        if (l.fase < 4) continue;
        const f = fase(l.fase);
        if (!f) continue;
        const interp = geoInterpolate([sede.lon, sede.lat], [l.lon, l.lat]);
        const pasos = 32;
        const hasta = Math.round(pasos * f);
        ctx.strokeStyle = marcada && marcada !== l.categoria ? "rgba(38,77,91,0.12)" : COLOR.arco;
        ctx.lineWidth = 1.1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        let empezado = false;
        for (let i = 0; i <= hasta; i++) {
          const k = i / pasos;
          // El arco se eleva sobre la superficie: se aleja del centro un 8 % en su punto medio.
          const p = proyeccion(interp(k));
          if (!p || !visibleEn(interp(k))) {
            empezado = false;
            continue;
          }
          const alza = 1 + Math.sin(Math.PI * k) * 0.08;
          const x = cx + (p[0] - cx) * alza;
          const y = cy + (p[1] - cy) * alza;
          if (!empezado) {
            ctx.moveTo(x, y);
            empezado = true;
          } else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Puntos, con un pulso al aparecer y uno continuo en las sedes.
      for (const l of presence.lugares) {
        const f = fase(l.fase);
        if (!f || !visibleEn([l.lon, l.lat])) continue;
        const p = proyeccion([l.lon, l.lat])!;
        const apagado = marcada && marcada !== l.categoria;
        const esSede = l.categoria === "sede" || l.categoria === "nueva";
        const color = COLOR_CATEGORIA[l.categoria];
        const r = (esSede ? 6 : 3.6) * (0.4 + 0.6 * facil(f));
        ctx.globalAlpha = apagado ? 0.25 : 1;

        if (f < 1 || esSede) {
          const onda = f < 1 ? f : ((ahora / 1800) % 1);
          ctx.strokeStyle = color;
          ctx.globalAlpha = (apagado ? 0.1 : 0.55) * (1 - onda);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p[0], p[1], r + onda * (esSede ? 18 : 12), 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = apagado ? 0.25 : 1;
        }
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(p[0], p[1], r + 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (visible && !reducido) raf = requestAnimationFrame(dibujar);
    };

    // Un punto es visible si está en el hemisferio que mira al espectador.
    const visibleEn = (c: [number, number]) => {
      const [l0, p0] = [lon, CENTRO_LAT].map((v) => (v * Math.PI) / 180);
      const [l1, p1] = c.map((v) => (v * Math.PI) / 180);
      return Math.sin(p0) * Math.sin(p1) + Math.cos(p0) * Math.cos(p1) * Math.cos(l1 - l0) > 0.05;
    };

    const observador = new IntersectionObserver(([e]) => {
      const antes = visible;
      visible = e.isIntersecting;
      if (visible && !antes) {
        // La animación arranca cuando el globo entra en pantalla, no al cargar.
        if (!tierra || performance.now() - inicio < 100) inicio = performance.now();
        if (!raf) raf = requestAnimationFrame(dibujar);
      }
    }, { threshold: 0.15 });

    const alRedimensionar = () => {
      medir();
      if (!raf) dibujar(performance.now());
    };

    const bajar = (e: PointerEvent) => {
      arrastrando = { x: e.clientX, lon };
      canvas.setPointerCapture(e.pointerId);
    };
    const mover = (e: PointerEvent) => {
      if (arrastrando) {
        lon = arrastrando.lon - ((e.clientX - arrastrando.x) / radio) * 57;
        if (reducido && !raf) dibujar(performance.now());
        return;
      }
      // Caja del punto más cercano bajo el cursor.
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      let mejor: { d: number; lugar: Lugar; p: [number, number] } | null = null;
      for (const l of presence.lugares) {
        if (!visibleEn([l.lon, l.lat])) continue;
        const p = proyeccion([l.lon, l.lat]);
        if (!p) continue;
        const d = Math.hypot(p[0] - x, p[1] - y);
        if (d < 14 && (!mejor || d < mejor.d)) mejor = { d, lugar: l, p };
      }
      setFoco(mejor ? { x: mejor.p[0], y: mejor.p[1], lugar: mejor.lugar } : null);
    };
    const soltar = () => {
      if (!arrastrando) return;
      arrastrando = null;
      soltadoEn = performance.now();
      lonAlSoltar = lon;
      if (inicio > performance.now() - INTRO_MS) inicio = performance.now() - INTRO_MS;
    };

    redibujar.current = () => {
      if (!raf) dibujar(performance.now());
    };
    medir();
    observador.observe(contenedor);
    window.addEventListener("resize", alRedimensionar);
    canvas.addEventListener("pointerdown", bajar);
    canvas.addEventListener("pointermove", mover);
    canvas.addEventListener("pointerup", soltar);
    canvas.addEventListener("pointercancel", soltar);
    canvas.addEventListener("pointerleave", () => setFoco(null));
    dibujar(performance.now());

    return () => {
      cancelAnimationFrame(raf);
      observador.disconnect();
      window.removeEventListener("resize", alRedimensionar);
      canvas.removeEventListener("pointerdown", bajar);
      canvas.removeEventListener("pointermove", mover);
      canvas.removeEventListener("pointerup", soltar);
      canvas.removeEventListener("pointercancel", soltar);
    };
  }, []);

  return (
    <div ref={caja} className="relative w-full">
      {/* El corte inferior es una máscara y no pintura: así vale igual sobre fondo claro u oscuro. */}
      <canvas
        ref={lienzo}
        className="block w-full cursor-grab touch-pan-y [mask-image:linear-gradient(to_bottom,#000_62%,transparent_98%)] active:cursor-grabbing"
        role="img"
        aria-label={`Globo con la presencia de ALZAK: ${presence.lugares.map((l) => l.nombre).join(", ")}.`}
      />
      {foco ? (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-hairline bg-surface px-3 py-2 text-xs whitespace-nowrap shadow-lg"
          style={{ left: foco.x, top: foco.y - 12 }}
        >
          <p className="font-semibold text-heading">{foco.lugar.nombre}</p>
          <p className="mt-0.5 text-ink-soft">{foco.lugar.detalle}</p>
        </div>
      ) : null}
    </div>
  );
}
