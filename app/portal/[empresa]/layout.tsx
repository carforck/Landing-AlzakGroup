import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { PortalBienvenida } from "../../../src/components/portal/PortalBienvenida";
import { PortalNav } from "../../../src/components/portal/PortalNav";
import { exigirSesion } from "../../../src/lib/sesion";
import { ETIQUETA_ROL, puede } from "../../../src/tenants/config";
import { salir } from "../../acceso/actions";

export const metadata: Metadata = {
  title: "Portal",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Envoltura del portal de una empresa.
 *
 * La marca entra como variables CSS (`--t-*`) sobre este contenedor, así que
 * todos los componentes del portal son los mismos para las cinco empresas y
 * sólo cambia la paleta: es la "personalización por configuración, no por
 * duplicación" de la propuesta de arquitectura.
 */
export default async function PortalLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ empresa: string }>;
}) {
  const { empresa: slug } = await params;
  const { sesion, empresa } = await exigirSesion(slug);

  const entradas = [
    { href: `/portal/${empresa.slug}`, etiqueta: "Tablero", icono: "tablero", ver: puede(sesion.rol, "tablero") },
    { href: `/portal/${empresa.slug}/registros`, etiqueta: "Registros", icono: "registros", ver: puede(sesion.rol, "registros") },
    { href: `/portal/${empresa.slug}/encuesta`, etiqueta: "Encuesta", icono: "encuesta", ver: puede(sesion.rol, "encuesta") },
    { href: `/portal/${empresa.slug}/usuarios`, etiqueta: "Usuarios", icono: "usuarios", ver: puede(sesion.rol, "usuarios") },
    { href: `/portal/${empresa.slug}/acerca`, etiqueta: "Acerca de", icono: "acerca", ver: true },
  ] as const;

  const estilo = {
    "--t-primario": empresa.color.primario,
    "--t-profundo": empresa.color.profundo,
    "--t-acento": empresa.color.acento,
    "--t-suave": empresa.color.suave,
    // Segundo tono de serie, como el celeste de Radar junto a su azul.
    "--t-claro": `color-mix(in srgb, ${empresa.color.primario} 38%, white)`,
  } as CSSProperties;

  return (
    <div style={estilo} className="min-h-[100svh] bg-surface-muted">
      <PortalBienvenida
        slug={empresa.slug}
        empresa={empresa.nombre}
        logo={{ src: empresa.logo.src, ancho: empresa.logo.width, alto: empresa.logo.height }}
      />
      <PortalNav
        logo={{ src: empresa.logo.src, ancho: empresa.logo.width, alto: empresa.logo.height }}
        empresa={empresa.nombre}
        usuario={sesion.nombre}
        rol={ETIQUETA_ROL[sesion.rol]}
        entradas={entradas.filter((e) => e.ver).map(({ href, etiqueta, icono }) => ({ href, etiqueta, icono }))}
        salir={salir}
      />
      <div className="portal-contenido">{children}</div>
    </div>
  );
}
