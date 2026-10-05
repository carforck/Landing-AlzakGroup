import "server-only";
import type { StaticImageData } from "next/image";
import biotorax from "./marcas/biotorax.webp";
import foscal from "./marcas/foscal.webp";
import medisinu from "./marcas/medisinu.webp";
import sanitas from "./marcas/sanitas.webp";
import sura from "./marcas/sura.webp";
import alzak from "./marcas/alzak.png";

/**
 * Una empresa del portal CAPULMON: su marca, su base y lo que tiene su esquema.
 *
 * Es la "configuración por cliente" de la propuesta de arquitectura (sección
 * 04): lo que antes era una copia entera del programa por institución ahora es
 * una entrada de este archivo. Sumar un cliente es sumar una entrada.
 *
 * `server-only` a propósito. La lista de clientes no debe llegar al navegador
 * (ver LoginForm: por eso no hay selector de institución), y los logos se
 * importan aquí para que sólo se emita la URL del que corresponde a la sesión.
 */
export type Empresa = {
  slug: string;
  nombre: string;
  /** Esquema MySQL. Una base por cliente, como hoy. */
  esquema: string;
  /**
   * Columna del nombre de usuario en `users`. Foscal y Biotorax son de la
   * primera generación (`id, username, pwd, rol`); las demás añadieron nombre,
   * institución y área y renombraron la columna a `usuario`.
   */
  columnaUsuario: "username" | "usuario";
  /** Si `users` trae nombre, institución y área. */
  usuariosConFicha: boolean;
  /** Si `data` guarda departamento y municipio de residencia. */
  geografia: boolean;
  logo: StaticImageData;
  /**
   * Edad mínima de la encuesta. El protocolo es de 50 a 80 años; Sanitas abrió
   * su tamizaje desde los 18 (ver calculadora-sanitas).
   */
  edadMin: number;
  /**
   * Si el portal puede GUARDAR encuestas en esta base. Sólo la empresa de
   * prueba: las cinco reales siguen en solo lectura hasta que se apruebe
   * escribir en producción. `guardarEncuesta` lo vuelve a comprobar.
   */
  escritura: boolean;
  /** Oculta en listados globales (el panel /admin): la demo no es un cliente. */
  prueba?: boolean;
  /**
   * Paleta. Sale del CSS de cada app de Shiny y del propio logotipo:
   * `primario` es el color de marca y lleva texto blanco encima (todos pasan
   * 4.5:1), `profundo` es el fondo de la barra lateral y `acento` sólo se usa
   * en detalles, nunca de fondo bajo texto.
   */
  color: { primario: string; profundo: string; acento: string; suave: string };
};

const EMPRESAS: Empresa[] = [
  {
    slug: "sura",
    edadMin: 50,
    escritura: false,
    nombre: "EPS SURA",
    esquema: "capulmon_sura_DB",
    columnaUsuario: "usuario",
    usuariosConFicha: true,
    geografia: true,
    logo: sura,
    color: { primario: "#0033A0", profundo: "#001A57", acento: "#00AEC7", suave: "#E6F7FA" },
  },
  {
    slug: "sanitas",
    edadMin: 18,
    escritura: false,
    nombre: "EPS Sanitas",
    esquema: "capulmon_sanitas_DB",
    columnaUsuario: "usuario",
    usuariosConFicha: true,
    geografia: true,
    logo: sanitas,
    color: { primario: "#0067BA", profundo: "#002F6C", acento: "#00AEEF", suave: "#E9F3FB" },
  },
  {
    slug: "medisinu",
    edadMin: 50,
    escritura: false,
    nombre: "Medisinú IPS",
    esquema: "capulmon_medisinu_DB",
    columnaUsuario: "usuario",
    usuariosConFicha: true,
    geografia: true,
    logo: medisinu,
    color: { primario: "#0B62A0", profundo: "#002855", acento: "#F39200", suave: "#EAF3FA" },
  },
  {
    slug: "foscal",
    edadMin: 50,
    escritura: false,
    nombre: "Clínica FOSCAL",
    esquema: "capulmon_foscal_DB",
    columnaUsuario: "username",
    usuariosConFicha: false,
    geografia: false,
    logo: foscal,
    color: { primario: "#0052AE", profundo: "#2E3141", acento: "#F0A000", suave: "#EAF2FB" },
  },
  {
    slug: "biotorax",
    edadMin: 50,
    escritura: false,
    nombre: "Biotórax",
    esquema: "capulmonDB",
    columnaUsuario: "username",
    usuariosConFicha: false,
    geografia: false,
    logo: biotorax,
    color: { primario: "#006E8A", profundo: "#002F45", acento: "#2BB3C0", suave: "#E6F4F7" },
  },
  {
    /*
     * Empresa de prueba para validar la encuesta de punta a punta: llenar,
     * calcular, GUARDAR y verla en el tablero. Apunta a `demo_capul`, la base
     * de la demo de SURA, que no es de ningún cliente.
     */
    slug: "demo",
    edadMin: 50,
    escritura: true,
    prueba: true,
    nombre: "Demo ALZAK",
    esquema: "demo_capul",
    columnaUsuario: "usuario",
    usuariosConFicha: true,
    geografia: true,
    logo: alzak,
    color: { primario: "#2A7085", profundo: "#1E3A44", acento: "#5DC3DA", suave: "#EAF7FA" },
  },
];

export function todasLasEmpresas(): readonly Empresa[] {
  return EMPRESAS;
}

export function empresaPorSlug(slug: string): Empresa | null {
  return EMPRESAS.find((e) => e.slug === slug) ?? null;
}

/**
 * Roles tal como los guardan las apps de Shiny. No hay rol de médico: quien
 * diligencia la encuesta es `encuestador`.
 */
export type Rol = "sa" | "admin" | "supervisor" | "encuestador";

export const ROLES: readonly Rol[] = ["sa", "admin", "supervisor", "encuestador"];

export const ETIQUETA_ROL: Record<Rol, string> = {
  sa: "Superadministrador",
  admin: "Administrador",
  supervisor: "Supervisor",
  encuestador: "Encuestador",
};

/**
 * Qué ve cada rol. Replica `main_app_ui()` de las apps de Shiny:
 * sa y admin ven todo, supervisor ve tablero y visor, encuestador sólo la
 * encuesta. Configuración aquí es de consulta: el portal es de solo lectura.
 */
export const PERMISOS = {
  tablero: ["sa", "admin", "supervisor"],
  registros: ["sa", "admin", "supervisor"],
  usuarios: ["sa", "admin"],
  encuesta: ["sa", "admin", "supervisor", "encuestador"],
} as const satisfies Record<string, readonly Rol[]>;

export type Seccion = keyof typeof PERMISOS;

export function puede(rol: Rol, seccion: Seccion): boolean {
  return (PERMISOS[seccion] as readonly Rol[]).includes(rol);
}
