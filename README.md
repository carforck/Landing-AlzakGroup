# ALZAK Consulting & Research: Landing

Rediseño del sitio corporativo [alzak.com.co](https://alzak.com.co) (WordPress + Divi)
sobre el mismo stack que el landing de ALZAK Foundation, alineado con el Manual de
Identidad Corporativa.

## Stack

| Pieza | Versión / elección |
| --- | --- |
| Framework | Next.js 16.2.1 · App Router |
| UI | React 19.2 |
| Lenguaje | TypeScript 5 (`strict`) |
| Estilos | Tailwind CSS v4 (`@theme` en `app/globals.css`) |
| Animación | CSS (transiciones y keyframes) + framer-motion 12 |
| Iconos | Phosphor Icons (`@phosphor-icons/react`, entrypoint `/dist/ssr`) |
| Validación | Zod 4 (esquema compartido cliente/servidor) |
| Correo | Resend vía Route Handler (`app/api/contact`) |
| Deploy | Vercel (`output: "standalone"`) |

## Comandos

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Identidad visual

Paleta y tipografía tomadas de `brand-source/Manual de imagen corporativa.pdf`.

### Colores corporativos

El manual es explícito: *"son los dos colores principales y los que deben predominar"*.

| Token | Hex | CMYK | Uso |
| --- | --- | --- | --- |
| `menta-400` | `#5DC3DA` | 61/0/14/0 | Color de marca · acentos, bloque de calidad |
| `gris-500` | `#54504F` | 59/52/50/46 | Texto, botones, footer |

### Colores secundarios

| Token | Hex | CMYK |
| --- | --- | --- |
| `verde` | `#C8DABB` | 27/5/33/0 |
| `azul` | `#6EA1BA` | 60/24/20/3 |

Las escalas `50`–`900` de `menta` y `gris` se derivan de los dos colores oficiales
por ajuste de luminosidad. Existen para dar estados (hover, bordes, fondos suaves)
sin introducir tintes ajenos a la marca. **No hay ningún color fuera de esta
derivación**: el tema oscuro también se construye sobre `gris`, no sobre un negro
neutro.

> **Regla de contraste importante.** El menta `#5DC3DA` es un color *claro*:
> el blanco sobre él sólo alcanza **2.04:1** y es ilegible. Sobre menta va siempre
> gris corporativo (`gris-800` → 7.09:1). Está documentado en
> `src/components/sections/QualityTeaser.tsx`.

### Iconografía

**Phosphor Icons** (9.000+ iconos, 6 pesos), no un set de trazo único. El peso se
elige por rol, no por icono:

| Peso | Uso |
| --- | --- |
| `light` | iconos expresivos de sección y servicio (20–24 px) |
| `regular` | iconos de apoyo en listas de contacto y UI (16–20 px) |
| `bold` | flechas y checks, que necesitan presencia a tamaño pequeño |

El trazo fino de `light` es el que se corresponde con los iconos del propio
material corporativo. Se importa desde `@phosphor-icons/react/dist/ssr` para que
funcione en Server Components; el tipo `Icon` viene de la raíz del paquete como
import de tipo, que se borra al compilar.

### Tipografía

| Rol | Manual | Implementación web |
| --- | --- | --- |
| Texto | **Helvetica**, *"de uso genérico y obligada en todos los soportes"* | Stack `"Helvetica Neue", Helvetica, Arial` con **Inter** detrás vía `next/font`. Helvetica real en Apple, Arial (métricamente compatible) en Windows, Inter como respaldo consistente. |
| Titulares | Romano de trazo fino del logotipo | **Inter Tight** con `letter-spacing: -0.03em`, aplicado con la clase `.display`. |

Se probó un romano tipo Didone para los titulares y se descartó: sus numerales
*old-style* restaban legibilidad a las cifras y el conjunto se alejaba del
carácter geométrico del logotipo.

## Estructura

```
app/
  layout.tsx            Metadata global, fuentes, Navigation + Footer
  page.tsx              Home (compone las secciones)
  globals.css           Tokens de marca y sistema de diseño
  calidad/page.tsx      Sistema de Gestión de Calidad ISO 9001:2015
  privacidad/page.tsx   Política de privacidad
  api/contact/route.ts  Envío del formulario
  robots.ts sitemap.ts  SEO
src/
  content/site.ts       ★ TODO el texto del sitio vive aquí
  components/           Navigation, Footer, Reveal, SectionHeader, JSON-LD,
                        BrandMotif, DriftingMotif, HeroBackdrop, WhatsAppButton
  components/sections/  Hero, MissionVision, Services, Differentiators,
                        History, Leaders, Clients, QualityTeaser, Contact
  lib/contact-schema.ts Esquema Zod compartido
public/
  brand/                Logotipos oficiales (color, blanco, menta, negro)
  hero/                 Tres fotografías del fondo del hero (WebP, 1200×800)
  team/ logos/ docs/    Fotos del equipo, 16 logos de clientes, PDFs del SGC
brand-source/           Material fuente: NO se publica (fuera de public/)
```

## Contenido

Todo el texto editorial está centralizado en [`src/content/site.ts`](src/content/site.ts),
con la procedencia de cada dato anotada. Jerarquía de fuentes:

1. `brand-source/Sobre ALZAK.pdf`: material corporativo más reciente. Manda sobre
   el sitio web cuando discrepan.
2. `brand-source/Manual de imagen corporativa.pdf`: marca, paleta, tipografía.
3. `alzak.com.co`: historia y datos de contacto.

### Diferencias frente al sitio anterior

- **Servicios: 9 → 12.** El deck incorpora líneas que la web no mencionaba
  (RWE, modelos y rutas integrales de atención, tableros de control de costos,
  predicción de riesgo, formación de talento humano).
- **Clientes: 5 → 16.** Logos extraídos del deck.
- **Visión.** El deck dice *"referencia nacional"*; la web decía *"nacional y regional"*.
- **Credenciales.** Nelson J. Alvis Zakzuk es `Ph.D (c)` (candidato), no `(e)`.
  María Carrasquilla figura como `Eco. MSc. Ph.D (c)` con el cargo
  *Líder Modelación Económica* (la web decía `Eco. Eps. MSc.` / *Investigadora Líder*).
- **Nuevos bloques.** Promesa de valor, "¿Qué nos hace diferentes?", índices H del
  equipo y las cifras 70+ / 200+ / 13.
- **Índices H y perfiles.** Cada líder enlaza a su CvLAC de Minciencias y a su
  Google Scholar, comprobados uno a uno contra nombre y afiliación. Los índices
  vienen de Scholar (19 de agosto de 2026), no del deck, que se había quedado
  corto en los cuatro casos.
- **Claim.** *"Aportamos valor al sistema de salud"* pasa a ser el titular del hero.

Esa estructura centralizada es la que permite añadir la versión en inglés (`/en`)
duplicando el objeto bajo una clave de idioma, sin refactorizar componentes.

## Variables de entorno

Copie `.env.example` a `.env.local`. Sin `RESEND_API_KEY` el sitio funciona
completo, pero `/api/contact` responde `503` y el formulario indica al visitante
que escriba a `info@alzak.com.co`.

## Redirecciones del sitio anterior

`next.config.ts` mapea las rutas del WordPress para no perder posicionamiento:

- `/sobre-nosotros` → `/#historia`
- `/estudios` → `/#servicios`
- `/sistema-de-gestion` → `/calidad`
- `/politica-de-privacidad` → `/privacidad`
- `/en/home` → `/` (temporal, hasta publicar la versión en inglés)

## Notas de implementación

- **El hero se renderiza estático a propósito** (sin `Reveal`): es el elemento LCP
  y animarlo desde `opacity: 0` retrasaría la pintura del titular.
- **Tema claro por defecto.** No sigue `prefers-color-scheme`: la marca es clara
  (fondo blanco, menta y gris) igual que todo el material corporativo. El tema
  oscuro queda implementado y se activa añadiendo la clase `.dark` en `<html>`
  si algún día se ofrece un selector.
- **Fotos del equipo** normalizadas a 900×1200 (3:4) en WebP, con los fondos
  retocados para que las cuatro tarjetas lean igual.
- **Logos de clientes** venían del deck con fondos opacos y proporciones dispares;
  se recortaron a su contenido y se normalizan en celdas iguales con
  `object-contain`. En reposo van desaturados y recuperan color al pasar el cursor.

### Fondos con movimiento

- **Hero.** Las tres fotografías se montan como franjas verticales, **una imagen
  por franja** (una sola etiqueta `<img>` en cada una), separadas por un hairline
  en menta, cada una con una deriva lenta y desfasada (26 / 32 / 29 s, `alternate`).

  El giro replica el del hero de Foundation cada 8 s, con puntos indicadores
  clicables pero rota la *asignación*: en la posición `offset` del ciclo, la
  franja `i` muestra `heroImages[(i + offset) % 3]`. Como hay tantas franjas como
  imágenes, cada vuelta es una permutación: siempre se ven las tres fotografías y
  ninguna se repite.

  El cambio va en **dos fases** atenuar, cambiar de foto, volver en lugar de un
  fundido cruzado, precisamente para que nunca se solapen dos imágenes en una
  misma franja.

  Encima van dos velos blancos: uno plano al 30 % y otro en degradado horizontal
  que cubre sólo la columna del texto (opaco hasta el 28 % del ancho, transparente
  al 62 %). La fotografía se ve con fuerza a la derecha y el titular conserva más
  de **10:1** de contraste.
- **Diferenciadores y Contacto.** El mosaico de triángulos de la marca
  (`BrandMotif`, tomado de las láminas corporativas) deriva muy despacio (40 s)
  al 10–12 % de opacidad.

Ambos usan **sólo `transform`** y se **pausan cuando la sección sale de
pantalla** (`IntersectionObserver` → `data-animate`), para no gastar batería
animando lo que nadie ve. `prefers-reduced-motion` los congela en su encuadre
inicial en lugar de ocultarlos.

No hay degradados difusos ni destellos decorativos: el motivo geométrico dice
algo sobre esta marca en concreto.

### Página de la calculadora de cáncer de pulmón

`/calculadora-cancer-pulmon` presenta el proyecto CAPULMON como servicio. Es la
única página con una pieza interactiva, y por eso conviene dejar por escrito qué
decisiones se tomaron y contra qué regla.

- **El modelo corre en el navegador.** `src/lib/lung-risk.ts` es un port a
  TypeScript del PLCOm2012noRace + riesgo ambiental y ocupacional de las apps
  Shiny. Se verificó paridad exacta contra el Python en producción sobre ocho
  perfiles (Δ < 1e-10). No hay petición de red: son datos de salud y la
  demostración no persiste nada, a diferencia de la app clínica.
- **El riesgo se pinta con una rampa secuencial, no con un semáforo.** El riesgo
  es una magnitud, así que le corresponde un solo tono de claro a oscuro:
  `menta-400` → `menta-600` → `menta-800`. Se validó con el script de paleta:
  monotonía de luminosidad correcta y los tres pasos dentro de la banda
  L 0.43–0.77. Se descartó verde/ámbar/rojo porque introduce tres tintes ajenos
  a la marca, y el manual es explícito en que menta y gris deben predominar.
- **El color nunca carga solo con el estado.** `menta-400` sobre superficie clara
  queda en 1.99:1, por debajo de 3:1. El nivel de riesgo lleva siempre icono y
  etiqueta de texto, y la cifra grande está siempre visible.
- **Sin animaciones de entrada por scroll.** La página se rige por la misma regla
  que el home: todo visible desde el primer pintado. El único movimiento es el
  del medidor al mover un control (feedback, no decoración) con la curva y las
  duraciones del sistema.
- **La demostración va dentro de un marco de ventana** (`BrowserFrame`) sobre
  fondo `gris-900`. La calculadora es software, no una ilustración, y encuadrarla
  así lo dice sin explicarlo. La barra **no lleva una dirección web**: inventar
  una URL daría a entender que la herramienta está publicada en abierto, y no lo
  está, así que identifica el modelo que corre dentro. Los tres puntos van en
  gris neutro y el menta queda para el indicador de ejecución. El contenido de la
  ventana usa `surface-muted` porque la tarjeta de resultado es blanca y sobre
  blanco perdía su sombra.

- **Fondo de la portada: `DriftingMotif`**, no un degradado. Es la misma decisión
  documentada en `BrandMotif`.
- **Lottie en el hero** (`public/riskapplottie/paru-paru.json`, 1200×890, 4 s).
  Es la única animación decorativa del sitio y se paga con cuidado:
  `LottieHero` importa el runtime con `import()` dinámico y sólo cuando el
  contenedor va a entrar en pantalla, usa el build `light` y con
  `prefers-reduced-motion` no carga nada. El hueco reserva la proporción del
  lienzo para que no haya salto de layout.

  Dos cosas a saber del archivo: **no es vectorial** (lleva dos PNG incrustados
  en base64) y **la capa de pulmones no se anima**: sólo se mueve la lupa
  (posición y escala). El coste es 133 KB gzip del JSON más 45 KB del runtime.
  El mismo resultado se obtiene con los dos PNG sueltos convertidos a WebP y seis
  líneas de `@keyframes`, sin runtime y por una fracción del peso; queda anotado
  por si se quiere recuperar ese presupuesto.

  La ilustración es coral y amarilla, fuera de la paleta corporativa. Se acepta
  como excepción consciente, igual que el verde de WhatsApp.

- **Botón principal del hero.** `btn-primary` es `gris-500` y sobre el hero
  `gris-900` se pierde: el botón secundario pesaba más que el principal. Se usa
  menta con texto `gris-800`, el par que el manual documenta en 7.09:1, el mismo
  de `QualityTeaser` invertido sobre fondo oscuro.

- **Logos de las cinco instituciones** (`public/instituciones/`). Extraídos de
  cada app de CAPULMON, blanqueados a alfa, recortados a su contenido y
  normalizados en altura; los apilados (Biotórax, Medisinú) se exportan al doble
  de resolución porque su marca denominativa va debajo del símbolo y no al lado.
  Mismo tratamiento que el muro del home: desaturados en reposo, a color en hover.

### Movimiento

Un solo presupuesto de movimiento, gastado en feedback antes que en decoración:

| Duración | Uso |
| --- | --- |
| 120 ms | feedback inmediato (color, opacidad) |
| 200 ms | cambio de estado rutinario (hover, focus) |
| 380 ms | capas y cambios de layout |

Curva única `cubic-bezier(0.16, 1, 0.3, 1)`; nunca rebote ni elástico. **No hay
animaciones de entrada por scroll** salvo una: la retícula de servicios, que se
lee como lista y aparece escalonada con un retardo total acotado a 120 ms. Todo
lo demás está visible desde el primer pintado, así que un fallo de JavaScript no
oculta la página. `prefers-reduced-motion` elimina el desplazamiento espacial
pero conserva los cambios de color y opacidad, que son los que confirman una
acción.

Gestos de interacción, uno por tipo de elemento:

- **Botones**: la flecha avanza 4 px; el fondo cambia de gris a menta.
- **Enlaces**: subrayado que crece desde la izquierda (`.link-underline`).
- **Filas de servicio**: barra menta de 2 px que entra desde arriba, más fondo `menta-50`.
- **Fotos del equipo**: escala 1.04 sobre `overflow: hidden`.
- **Logos de clientes**: desaturado → color.
- **Botón de WhatsApp**: burbuja de invitación que aparece una vez a los 4 s y
  se puede cerrar; sin puntos parpadeantes ni mensajes rotativos. El verde
  `#25D366` es el de la plataforma y es el único color fuera de la paleta
  corporativa en todo el sitio.

Áreas táctiles de 48 px de alto como mínimo (por encima del mínimo de 44 px).

## Pendientes conocidos

- **El README y el código discrepan en iconografía.** Esta sección y la tabla de
  stack documentan Phosphor Icons, pero `package.json` sólo declara
  `lucide-react`, `next.config.ts` optimiza ese barrel y todos los componentes
  importan de ahí. `@phosphor-icons` sigue en `node_modules` sin estar declarado.
  Hay que decidir cuál manda y alinear documentación o código.

- **Redes sociales**: las URLs en `src/content/site.ts` se infirieron; el sitio
  original sólo tenía iconos sin enlace resuelto. Verificar antes de publicar.
- **Política de privacidad**: el texto original nombraba a otra empresa
  ("Carbo Sostenible S.A.S.") por venir de una plantilla. Se corrigió la razón
  social y se alineó con la Ley 1581 de 2012; requiere visto bueno jurídico.
- **Ropa institucional**: dos fotos del equipo llevan polos de *ALZAK Foundation*
  visibles en un sitio de *Consulting & Research*.
- **Versión en inglés**: pendiente (ver sección Contenido).
