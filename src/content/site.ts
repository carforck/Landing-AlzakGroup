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

/**
 * Página de servicio de la calculadora de riesgo de cáncer de pulmón.
 *
 * Origen de los datos: las apps Shiny de CAPULMON (`CLIENTES CAPULMON/`), en
 * particular `modules/risk_ca_pulmon.py`, `static/creditos.md` y
 * `static/instrucciones.md`. Las cifras y referencias no se redondean ni se
 * reinterpretan aquí: son las que sustentan el modelo en producción.
 */
export const lungCalculator = {
  slug: "/calculadora-cancer-pulmon",
  navLabel: "Calculadora CaP",
  eyebrow: "Producto de investigación",
  title: "Calculadora de riesgo de cáncer de pulmón",
  lead: "Estima la probabilidad individual de desarrollar cáncer de pulmón en los próximos 6 años, clasifica el riesgo y devuelve la conducta recomendada. Modelo PLCOm2012noRace extendido con exposición ambiental y ocupacional del contexto colombiano.",
  metaDescription:
    "Herramienta de tamizaje basada en el modelo PLCOm2012noRace extendido con riesgo ambiental y ocupacional. Estima la probabilidad de cáncer de pulmón a 6 años y orienta la remisión a programas de detección temprana.",

  /** Cifras de cabecera. Todas verificables contra el código del modelo. */
  stats: [
    { value: "6", label: "Años de horizonte de predicción" },
    { value: "16", label: "Factores de riesgo evaluados" },
    { value: "3", label: "Niveles de clasificación y conducta" },
    { value: "5", label: "Implementaciones institucionales" },
  ],

  /** Qué entrega la herramienta. */
  estimates: [
    {
      icon: "percent",
      title: "Probabilidad a 6 años",
      body: "Un valor continuo, no una casilla de elegible/no elegible. El modelo logístico devuelve la probabilidad individual de desarrollar cáncer de pulmón en los próximos seis años.",
    },
    {
      icon: "layers",
      title: "Clasificación del riesgo",
      body: "Bajo, moderado o alto, contra umbrales distintos según la persona sea fumadora activa o no. El modelo se construyó en cohortes de fumadores, así que en no fumadores la escala se ajusta.",
    },
    {
      icon: "route",
      title: "Conducta recomendada",
      body: "Cada nivel resuelve en una acción concreta: sin seguimiento, evaluación anual con medicina general, o remisión al programa de detección temprana.",
    },
    {
      icon: "database",
      title: "Registro poblacional",
      body: "Las implementaciones persisten cada tamizaje, de modo que la institución acumula una base de riesgo poblacional además del resultado individual.",
    },
  ],

  /** Qué aporta frente al criterio clásico de tamizaje. */
  advances: [
    {
      title: "De criterio categórico a riesgo continuo",
      body: "El tamizaje clásico admite o descarta según edad y paquetes-año. Tammemägi et al. (PLOS Medicine, 2014) mostraron sobre las cohortes PLCO y NLST que seleccionar por riesgo estimado detecta más casos que aplicar reglas categóricas.",
      metric: "PLCO + NLST",
      metricLabel: "Cohortes de validación",
    },
    {
      title: "Incorpora al no fumador",
      body: "El criterio por paquetes-año deja fuera a quien nunca fumó. El modelo suma humo de biomasa en interiores y tabaquismo pasivo, dos exposiciones con peso propio en la carga de cáncer de pulmón de la región.",
      metric: "+2",
      metricLabel: "Exposiciones ambientales",
    },
    {
      title: "Riesgo ocupacional con latencia",
      body: "Asbesto, emisiones diésel y pinturas entran sólo si superan diez años de exposición y treinta de latencia. La parametrización se apoya en CAREX Colombia, no en supuestos importados.",
      metric: "+3",
      metricLabel: "Exposiciones ocupacionales",
    },
    {
      title: "Alineado con NCCN v2.2024",
      body: "Quien ya cumple el criterio clásico —50 años o más y 20 paquetes-año o más— se recalifica al alza. La herramienta amplía el tamizaje sin contradecir la guía vigente.",
      metric: "v2.2024",
      metricLabel: "Guía NCCN aplicada",
    },
  ],

  /** Los 16 factores, agrupados como los ve el modelo. */
  variableGroups: [
    {
      icon: "user",
      title: "Demográficos y clínicos",
      items: [
        "Edad (centrada en 62 años)",
        "Sexo biológico",
        "EPOC diagnosticada",
        "Antecedente personal de cáncer",
        "Antecedente familiar de cáncer de pulmón",
      ],
    },
    {
      icon: "cigarette",
      title: "Tabaquismo",
      items: [
        "Condición de fumador activo",
        "Años fumando",
        "Cigarrillos por día (relación no lineal)",
        "Tabaquismo pasivo y sus años",
      ],
    },
    {
      icon: "wind",
      title: "Exposición ambiental",
      items: [
        "Humo de biomasa en interiores (HAP)",
        "Años de exposición a biomasa",
      ],
    },
    {
      icon: "hard-hat",
      title: "Exposición ocupacional",
      items: [
        "Asbesto: años y edad de inicio",
        "Emisiones diésel: años y edad de inicio",
        "Pinturas: años y edad de inicio",
      ],
    },
  ],

  /** Titularidad del desarrollo. */
  authorship: {
    entity: "ALZAK",
    lead: "Desarrollo propio",
    body: "La calculadora es un desarrollo de ALZAK: el modelo, la extensión de riesgo ambiental y ocupacional, la implementación y el tablero de seguimiento se construyeron en casa, por el equipo interdisciplinar de investigación e ingeniería.",
    email: "info@alzak.com.co",
    created: "2024",
    model: "PLCOm2012noRace + riesgo ambiental y ocupacional",
    ownership: "ALZAK — todos los derechos reservados",
    stack: "Shiny for Python · MySQL · Posit Connect Cloud",
  },

  /** El núcleo estadístico. */
  foundation: {
    title: "Sobre qué está cimentado",
    body: "El núcleo es el modelo PLCOm2012, derivado y validado sobre dos de las cohortes de tamizaje más grandes que existen: el Prostate, Lung, Colorectal and Ovarian Cancer Screening Trial (PLCO) y el National Lung Screening Trial (NLST). Sobre esa base, ALZAK añadió los términos de exposición ambiental y ocupacional que el modelo original no contemplaba, calibrados con evidencia y con la guía NCCN vigente.",
    anchor: {
      cite: "Tammemägi MC, Katki HA, Hocking WG, et al. Selection criteria for lung-cancer screening.",
      journal: "New England Journal of Medicine",
      detail: "2013;368:728-736",
      doi: "https://doi.org/10.1056/NEJMoa1211776",
    },
  },

  /** Bibliografía íntegra de `static/creditos.md`. */
  references: [
    {
      cite: "National Comprehensive Cancer Network. Clinical Practice Guidelines in Oncology for Lung Cancer Screening, Version 2.2024.",
      topic: "Guía de tamizaje",
    },
    {
      cite: "Tammemägi MC, Church TR, Hocking WG, et al. Evaluation of the Lung Cancer Risks at Which to Screen Ever- and Never-Smokers: Screening Rules Applied to the PLCO and NLST Cohorts. PLOS Medicine. 2014;11(12):e1001764.",
      topic: "Selección por riesgo",
      url: "https://doi.org/10.1371/journal.pmed.1001764",
    },
    {
      cite: "Office on Smoking and Health (US). The Health Consequences of Involuntary Exposure to Tobacco Smoke: A Report of the Surgeon General. Cap. 7, Cancer Among Adults from Exposure to Secondhand Smoke. CDC; 2006.",
      topic: "Tabaquismo pasivo",
      url: "https://www.ncbi.nlm.nih.gov/books/NBK44330/",
    },
    {
      cite: "Chen LS, Baker T, Hung RJ, et al. Genetic risk can be decreased: Quitting smoking decreases and delays lung cancer for smokers with high and low CHRNA5 risk genotypes — A meta-analysis. EBioMedicine. 2016;11:219-226.",
      topic: "Cesación y riesgo",
      url: "https://www.ncbi.nlm.nih.gov/pubmed/27543155",
    },
    {
      cite: "O'Dwyer E, Halpenny DF, Ginsberg MS. Lung cancer screening in patients with previous malignancy: Is this cohort at increased risk for malignancy? European Radiology. 2021;31:458-467.",
      topic: "Antecedente de cáncer",
      url: "https://www.ncbi.nlm.nih.gov/pubmed/32728771",
    },
    {
      cite: "Yang IA, Holloway JW, Fong KM. Genetic susceptibility to lung cancer and co-morbidities. Journal of Thoracic Disease. 2013;5(Suppl 5):S454-462.",
      topic: "EPOC y comorbilidad",
      url: "https://www.ncbi.nlm.nih.gov/pubmed/24163739",
    },
    {
      cite: "Raspanti GA, Hashibe M, Siwakoti B, et al. Household Air Pollution and Lung Cancer Risk among Never-Smokers in Nepal. Environmental Research. 2016;147:141-145.",
      topic: "Humo de biomasa",
      url: "https://doi.org/10.1016/j.envres.2016.02.008",
    },
    {
      cite: "Nielsen LS, Bælum J, Rasmussen J, et al. Occupational asbestos exposure and lung cancer — A systematic review of the literature. Archives of Environmental & Occupational Health. 2014;69(4):191-206.",
      topic: "Asbesto",
    },
    {
      cite: "Sistema de Información sobre la Exposición Ocupacional a Agentes Carcinógenos para Colombia (CAREX Colombia). Fondo de Riesgos Laborales; 2012.",
      topic: "Contexto colombiano",
      url: "https://www.fondoriesgoslaborales.gov.co/documents/publicaciones/guias/Colombia%20CAREX.pdf",
    },
    {
      cite: "Brey C, Consonni D, Sarquis LMM, Miranda FMDa. Lung cancer and occupational exposure: hospital-based case-control study. Revista Gaúcha de Enfermagem. 2022;43:e20210043.",
      topic: "Exposición ocupacional",
    },
    {
      cite: "Starke KR, Bolm-Audorff U, Reissig D, et al. Dose-response-relationship between occupational exposure to diesel engine emissions and lung cancer risk: A systematic review and meta-analysis. International Journal of Hygiene and Environmental Health. 2024;256:114299.",
      topic: "Emisiones diésel",
    },
  ],

  /**
   * Instituciones con la herramienta desplegada. Los tres primeros son los que
   * el tablero de seguimiento reporta recolectando registros; Sanitas y Medisinú
   * tienen versión de marca propia.
   */
  deployments: [
    {
      name: "EPS SURA",
      detail: "Encuesta con autenticación y módulos",
      logo: "/instituciones/sura.webp",
    },
    {
      name: "Clínica FOSCAL",
      detail: "Calculadora asistencial",
      logo: "/instituciones/foscal.webp",
    },
    {
      name: "Biotórax",
      detail: "Calculadora asistencial",
      logo: "/instituciones/biotorax.webp",
    },
    {
      name: "Sanitas EPS",
      detail: "Encuesta pública de tamizaje",
      logo: "/instituciones/sanitas.webp",
    },
    {
      name: "Medisinú",
      detail: "Calculadora asistencial",
      logo: "/instituciones/medisinu.webp",
    },
  ],

  /** Aviso obligatorio, tomado literal de `static/instrucciones.md`. */
  disclaimer:
    "Esto es solo una herramienta; úsela como una guía. No es una prueba válida para diagnosticar cáncer de pulmón.",

  cta: {
    title: "¿Quiere implementar el tamizaje por riesgo en su institución?",
    body: "Adaptamos la calculadora a la identidad y los flujos de su organización, con tablero de seguimiento de la recolección.",
    label: "Hablemos del proyecto",
  },
} as const;

export const navigation = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Servicios", href: "/#servicios" },
  { label: "Equipo", href: "/#lideres" },
  { label: "Calculadora CaP", href: "/calculadora-cancer-pulmon" },
  { label: "Calidad", href: "/calidad" },
  { label: "Contáctenos", href: "/#contacto" },
] as const;
