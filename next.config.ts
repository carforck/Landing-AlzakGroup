import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /*
   * Sólo afecta a `next dev`: permite abrir el sitio desde otros equipos de la
   * red local (celular, tableta) por la IP del equipo. Sin esto Next 16 bloquea
   * los recursos de desarrollo pedidos desde un origen que no es localhost.
   */
  allowedDevOrigins: ["192.168.1.*"],
  images: {
    formats: ["image/avif", "image/webp"],
    /*
     * Next 16 sólo sirve las calidades declaradas aquí; por defecto es [75].
     * Sin esta línea los `quality={80}` del sitio se ignoraban en silencio —el
     * srcset salía con `q=75` y pedir `q=80` a mano responde «"q" parameter
     * (quality) of 80 is not allowed»—. Se mantiene el 75 porque es el valor
     * que usan las imágenes que no piden calidad explícita.
     */
    qualities: [75, 80],
  },
  experimental: {
    /*
     * `import { Scale } from "lucide-react"` pasa por un índice que reexporta
     * 6074 iconos. Sin esta línea el empaquetador se traía el barrel entero: la
     * home medida en producción pasaba de 141.7 KB de JS a 266.8 KB. Esto reescribe
     * cada import a su módulo concreto.
     */
    optimizePackageImports: ["lucide-react"],
  },
  async redirects() {
    return [
      // Rutas heredadas del WordPress anterior → secciones de la nueva home.
      { source: "/sobre-nosotros", destination: "/#historia", permanent: true },
      // El sitio anterior llamaba "estudios" a lo que aquí son "servicios".
      { source: "/estudios", destination: "/#servicios", permanent: true },
      { source: "/sistema-de-gestion", destination: "/calidad", permanent: true },
      { source: "/politica-de-privacidad", destination: "/privacidad", permanent: true },
      { source: "/en/home", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
