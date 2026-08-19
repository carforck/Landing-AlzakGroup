/**
 * Fuente única de verdad para todo el contenido editorial del sitio.
 *
 * Origen de los datos:
 *  · brand-source/Sobre ALZAK.pdf            → misión, visión, promesa de valor,
 *    diferenciadores, cifras, servicios, líderes y clientes (material más reciente).
 *  · brand-source/Manual de imagen corporativa.pdf → marca, paleta, tipografía.
 *  · alzak.com.co                            → historia y datos de contacto.
 *
 * Donde el deck y el sitio web discrepan, manda el deck: es material posterior
 * y más completo. Las discrepancias están anotadas en cada punto.
 *
 * Centralizar el texto aquí permite añadir la versión en inglés más adelante
 * duplicando el objeto bajo una clave de idioma, sin tocar los componentes.
 */

export const site = {
  name: "ALZAK Consulting & Research",
  shortName: "ALZAK",
  legalName: "ALZAK GROUP S.A.S.",
  tagline: "Consulting & Research",
  /** Claim de cierre del deck corporativo. */
  claim: "Aportamos valor al sistema de salud",
  url: "https://alzak.com.co",
  description:
    "Consultoría e investigación en salud pública, economía de la salud y epidemiología. Más de 70 proyectos y 200 publicaciones científicas. Certificados ISO 9001:2015 por Bureau Veritas.",
  foundedYear: 2015,
} as const;

export const hero = {
  eyebrow: "Consultoría e investigación en salud",
  title: "Aportamos valor al sistema de salud",
  subtitle:
    "Desarrollamos proyectos de consultoría e investigación en salud pública, economía de la salud y epidemiología para la toma informada de decisiones.",
  primaryCta: { label: "Contáctenos", href: "#contacto" },
  secondaryCta: { label: "Ver nuestros servicios", href: "#servicios" },
} as const;

/** Tira de imágenes del hero. Optimizadas a 1200×800 (3:2) en WebP. */
export const heroImages = [
  {
    src: "/hero/analisis-datos.webp",
    alt: "Gráficos y tablas de análisis sobre una mesa de trabajo",
  },
  {
    src: "/hero/revision-evidencia.webp",
    alt: "Equipo revisando indicadores de salud en una tableta",
  },
  {
    src: "/hero/equipo-trabajo.webp",
    alt: "Equipo discutiendo los resultados financieros de un proyecto",
  },
] as const;

/** Cifras de la lámina "Experiencia" del deck corporativo. */
export const stats = [
  { value: "70+", label: "Proyectos de consultoría e investigación" },
  { value: "200+", label: "Publicaciones científicas" },
  { value: "13", label: "Laboratorios de la industria satisfechos" },
  { value: "ISO 9001:2015", label: "Certificados por Bureau Veritas" },
] as const;

export const missionVision = {
  mission: {
    title: "Misión",
    body: "Desarrollar proyectos de consultoría e investigación en salud pública, economía de la salud y epidemiología para la toma informada de decisiones.",
  },
  vision: {
    title: "Visión",
    // El deck dice "referencia nacional"; el sitio web decía "nacional y regional".
    body: "Para 2028 ser un centro de consultoría e investigación de referencia nacional en el desarrollo de estudios en nuestras áreas de interés.",
  },
  promise: {
    title: "Promesa de valor",
    body: "Generar insumos para la toma informada de decisiones con el más alto estándar de calidad, oportunidad y objetividad.",
  },
  values: ["Calidad", "Puntualidad", "Trabajo en equipo"],
} as const;

/** Lámina "¿Qué nos hace diferentes?" del deck corporativo. */
export const differentiators = [
  {
    icon: "badge",
    title: "Certificación ISO 9001:2015",
    body: "Nuestro servicio de consultoría e investigación en salud pública, economía de la salud y epidemiología está certificado bajo la norma ISO 9001:2015.",
  },
  {
    icon: "kanban",
    title: "Project Management Office",
    body: "Contamos con una PMO encargada de estructurar cronogramas con actividades y metas alcanzables dentro de cada proyecto.",
  },
  {
    icon: "users",
    title: "Equipo interdisciplinar",
    body: "Profesionales del área médica y de la economía con gran conocimiento del sector salud.",
  },
  {
    icon: "award",
    title: "+30 años de experiencia",
    body: "Nuestro Director Científico acumula más de 30 años desarrollando estudios técnico-científicos y en gestión de servicios de salud.",
  },
] as const;

/**
 * Servicios de la lámina "Nuestros servicios" del deck (12 líneas).
 * Reemplaza la lista de 9 que publicaba el sitio anterior: esta es más amplia
 * e incorpora líneas que el sitio no mencionaba (RWE, modelos de atención,
 * tableros de control, formación de talento humano).
 */
export const services = [
  {
    title: "Evaluaciones económicas de tecnologías sanitarias",
    icon: "scale",
    description:
      "Evaluaciones parciales y completas: costo-efectividad, costo-utilidad y costo-beneficio para sustentar decisiones de cobertura y adopción.",
  },
  {
    title: "Carga epidemiológica y económica de enfermedad",
    icon: "activity",
    description:
      "Estimación del impacto sanitario y financiero de las enfermedades sobre el sistema de salud y la sociedad.",
  },
  {
    title: "Costos de enfermedades y programas de salud",
    icon: "coins",
    description:
      "Cuantificación de costos directos e indirectos asociados al manejo de patologías y a la operación de programas.",
  },
  {
    title: "Predicción de riesgo de desenlaces en salud",
    icon: "trending",
    description:
      "Modelos predictivos que anticipan desenlaces clínicos para priorizar intervenciones y poblaciones.",
  },
  {
    title: "Estudios de evidencia de vida real (RWE)",
    icon: "lineChart",
    description:
      "Medición del desempeño de tecnologías en salud en condiciones de práctica real, retrospectiva y prospectiva.",
  },
  {
    title: "Caracterización poblacional y análisis de situación de salud",
    icon: "users",
    description:
      "Perfiles de morbilidad y mortalidad que describen el estado de salud de una población definida.",
  },
  {
    title: "Modelos y Rutas Integrales de Atención en Salud",
    icon: "route",
    description:
      "Definición de Modelos de Atención Integral en salud y de Rutas Integrales de Atención en Salud (RIAS).",
  },
  {
    title: "Generación de evidencia científica en salud",
    icon: "library",
    description:
      "Diseño de protocolos, revisiones sistemáticas y síntesis de evidencia con métodos reproducibles.",
  },
  {
    title: "Herramientas de eficiencia y transparencia",
    icon: "clipboard",
    description:
      "Notas técnicas y ajustes por perfil epidemiológico de la población asignada.",
  },
  {
    title: "Tableros de control de costos en salud",
    icon: "gauge",
    description:
      "Generación de tableros de costos y seguimiento de la frecuencia de uso de servicios.",
  },
  {
    title: "Publicación de artículos científicos",
    icon: "fileText",
    description:
      "Estructuración, revisión y sometimiento de artículos de investigación científica en salud hasta su publicación.",
  },
  {
    title: "Formación de talento humano",
    icon: "graduation",
    description:
      "Programas para profesionales con interés en salud pública, epidemiología y economía de la salud.",
  },
] as const;

export const history = {
  title: "Nuestra historia",
  paragraphs: [
    "ALZAK Consulting & Research nace en 2015 como una iniciativa de desarrollo de proyectos de consultoría e investigación en las áreas de Economía de la Salud, Salud Pública y Epidemiología.",
    "Fue fundada por cuatro hermanos con el interés de generar insumos importantes para la toma informada de decisiones. De la mano de su padre, un científico colombiano de gran experiencia en el sector salud, han consolidado una empresa de gran proyección y reconocimiento en el mercado de consultoría e investigación en Colombia.",
    "La calidad, la puntualidad y el trabajo en equipo son los valores corporativos que representan a ALZAK Consulting & Research.",
  ],
  milestones: [
    { year: "2015", label: "Fundación de ALZAK Consulting & Research" },
    { year: "2021", label: "Implementación del Sistema de Gestión de Calidad ISO 9001:2015" },
    { year: "2021", label: "Certificación otorgada por Bureau Veritas (27 de septiembre)" },
    { year: "2028", label: "Meta: centro de referencia nacional" },
  ],
} as const;

/**
 * Líderes según el deck corporativo, que corrige al sitio web en dos puntos:
 * Nelson J. Alvis Zakzuk es Ph.D (c), candidato y no (e), y María Carrasquilla
 * figura como Eco. MSc. Ph.D (c) con el cargo "Líder Modelación Económica".
 * El índice H proviene de la misma lámina.
 */
export const leaders = [
  {
    firstName: "Nelson",
    lastName: "Alvis Guzmán",
    credentials: "MD. MSc. Ph.D",
    role: "Director científico",
    hIndex: 99,
    photo: "/team/nelson-alvis-guzman.webp",
  },
  {
    firstName: "Josefina",
    lastName: "Zakzuk Sierra",
    credentials: "MD. Ph.D",
    role: "Asesora Clínica y Metodológica",
    hIndex: 24,
    photo: "/team/josefina-zakzuk-sierra.webp",
  },
  {
    firstName: "Nelson J.",
    lastName: "Alvis Zakzuk",
    credentials: "Eco. MSc. Ph.D (c)",
    role: "Gerente General",
    hIndex: 26,
    photo: "/team/nelson-jose-alvis-zakzuk.webp",
  },
  {
    firstName: "María",
    lastName: "Carrasquilla S.",
    credentials: "Eco. MSc. Ph.D (c)",
    role: "Líder Modelación Económica",
    hIndex: 7,
    photo: "/team/maria-carrasquilla-sotomayor.webp",
  },
] as const;

/** Lámina "Hemos trabajado con" del deck: 16 compañías. */
export const clients = [
  { name: "Bayer", logo: "/logos/bayer.png" },
  { name: "Sanofi", logo: "/logos/sanofi.png" },
  { name: "Novo Nordisk", logo: "/logos/novo-nordisk.png" },
  { name: "MSD", logo: "/logos/msd.png" },
  { name: "Janssen", logo: "/logos/janssen.png" },
  { name: "Novartis", logo: "/logos/novartis.png" },
  { name: "Servier", logo: "/logos/servier.png" },
  { name: "AbbVie", logo: "/logos/abbvie.png" },
  { name: "Pfizer", logo: "/logos/pfizer.png" },
  { name: "Amgen", logo: "/logos/amgen.png" },
  { name: "Biogen", logo: "/logos/biogen.png" },
  { name: "Merck", logo: "/logos/merck.png" },
  { name: "GSK", logo: "/logos/gsk.png" },
  { name: "Bristol Myers Squibb", logo: "/logos/bristol-myers-squibb.png" },
  { name: "Adium", logo: "/logos/adium.png" },
  { name: "Biopas Laboratoires", logo: "/logos/biopas.png" },
] as const;

export const quality = {
  title: "Sistema de Gestión de Calidad",
  paragraphs: [
    "ALZAK Consulting & Research es una empresa 100% colombiana que nace con el propósito de desarrollar proyectos de consultoría e investigación en las áreas de salud pública, economía de la salud y epidemiología. Cuenta con experiencia en el desarrollo de proyectos en el mercado nacional y tiene proyectado crecer a nivel internacional.",
    "La satisfacción de las necesidades y expectativas de sus clientes y demás stakeholders es uno de los pilares que fundamenta a la compañía, razón por la cual en marzo de 2021 optó por implementar su Sistema de Gestión de Calidad bajo lo establecido en la norma ISO 9001:2015. Bajo este estándar, el cual se basa en la satisfacción del cliente, la gestión del riesgo, el enfoque basado en procesos y la mejora continua, obtuvo el 27 de septiembre de 2021 la certificación de parte de Bureau Veritas para la prestación de los servicios de consultoría e investigación en salud pública, economía de la salud y epidemiología.",
    "Posterior a esto, ALZAK ha venido cumpliendo con todas las actividades requeridas en auditorías de seguimiento y recertificación, y mantiene activa su certificación de calidad.",
    "Con esta certificación, ALZAK Consulting & Research se convierte en una de las primeras compañías que desarrolla proyectos de consultoría e investigación de la región Caribe en obtener este reconocimiento.",
  ],
  pillars: [
    "Satisfacción del cliente",
    "Gestión del riesgo",
    "Enfoque basado en procesos",
    "Mejora continua",
  ],
  certificate: {
    // Sello sin fondo, con transparencia real. Se sirve el WebP (16 KB); el PNG
    // del mismo nombre queda disponible para firmas de correo y documentos.
    image: "/cert-iso9001-bureau-veritas.webp",
    alt: "Certificado ISO 9001:2015 otorgado por Bureau Veritas a ALZAK GROUP S.A.S.",
  },
  /*
   * `cover` es la primera página del propio PDF, renderizada con pdftoppm y
   * guardada en /docs/previews. Alimenta la tarjeta que se despliega al pasar
   * por encima del nombre, al modo de la vista previa de un enlace.
   *
   * CAL-POL-002 va SIN portada a propósito, no por olvido: el archivo que hay en
   * /docs con ese nombre no es un PDF, es una página «404 Not Found» de
   * alzak.com.co guardada con extensión .pdf (102 KB de HTML). No se puede
   * renderizar su primera página porque no tiene ninguna. Hace falta el PDF real.
   */
  documents: [
    {
      code: "EST-POL-001",
      title: "Política del Sistema Integrado de gestión",
      href: "/docs/EST-POL-001-politica-sistema-integrado-gestion.pdf",
      cover: "/docs/previews/EST-POL-001.webp",
      pages: 1,
    },
    {
      code: "EST-OBJ-001",
      title: "Objetivos de Calidad",
      href: "/docs/EST-OBJ-001-objetivos-de-calidad.pdf",
      cover: "/docs/previews/EST-OBJ-001.webp",
      pages: 2,
    },
    {
      code: "CAL-POL-002",
      title: "Política de seguridad y privacidad de la información",
      href: "/docs/CAL-POL-002-politica-seguridad-privacidad-informacion.pdf",
      cover: null,
      pages: null,
    },
  ],
} as const;

export const brand = {
  logo: {
    /** Principal a color, para fondos claros. */
    color: "/brand/logo-alzak.png",
    /** Blanco, para fondos oscuros. */
    white: "/brand/logo-alzak-blanco.png",
    /** Proporción común de las versiones oficiales (ancho / alto). */
    aspect: { width: 1200, height: 433 },
  },
} as const;

export const contact = {
  title: "Escríbanos",
  subtitle: "Ingrese sus datos y envíenos un mensaje. Pronto nos pondremos en contacto.",
  phones: ["(+57) 300-243-3252", "(+57) 605-643-6819"],
  email: "info@alzak.com.co",
  city: "Cartagena de Indias, Colombia",
  social: [
    { network: "LinkedIn", href: "https://www.linkedin.com/company/alzak-consulting-research/" },
    { network: "Facebook", href: "https://www.facebook.com/alzakconsulting" },
    { network: "Twitter", href: "https://twitter.com/alzakconsulting" },
  ],
} as const;

export const navigation = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Servicios", href: "/#servicios" },
  { label: "Equipo", href: "/#lideres" },
  { label: "Calidad", href: "/calidad" },
  { label: "Contáctenos", href: "/#contacto" },
] as const;
