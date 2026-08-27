/**
 * Fondo de la pantalla de ingreso: una banda que cruza en diagonal desde la
 * esquina inferior izquierda hasta la superior derecha.
 *
 * El contorno NO es una sinusoide. Se genera sumando una onda larga, que da el
 * vaivén general, y dos armónicos desfasados que forman los lóbulos; una
 * envolvente los hace crecer hacia el centro y aplanarse en los extremos, para
 * que la banda toque los dos vértices limpiamente. Esa irregularidad es lo que
 * hace que el borde se lea como nubes y no como una ola repetida.
 *
 * La referencia era azul (#124add a #1cb6f6). Aquí el degradado va del menta
 * oscuro al menta oficial: la misma progresión de un solo tono que usa el
 * medidor de riesgo, de modo que un menta profundo significa lo mismo en todo
 * el proyecto.
 *
 * `preserveAspectRatio="none"` deja que la diagonal siga uniendo las dos
 * esquinas sea cual sea la proporción de la pantalla. Los lóbulos se ensanchan
 * al estirarse, y eso favorece al efecto: quedan más tendidos, más de nube.
 */
export function LoginBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="hidden h-full w-full lg:block"
      >
        <defs>
          <linearGradient id="onda-login" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#285c6d" />
            <stop offset="55%" stopColor="#2f8ba3" />
            <stop offset="100%" stopColor="#5dc3da" />
          </linearGradient>
        </defs>
        <path d="M0 100 C0.7 99.5 2.9 97.8 4.4 96.7 C5.8 95.6 7.3 94.5 8.7 93.3 C10.2 92.2 11.7 91.1 13.1 90 C14.5 88.8 15.9 87.7 17.2 86.4 C18.5 85.2 19.7 83.8 20.9 82.4 C22.1 81.1 23.1 79.6 24.3 78.2 C25.5 76.8 26.7 75.4 28 74.1 C29.3 72.9 30.7 71.8 32.2 70.7 C33.7 69.6 35.4 68.7 36.9 67.6 C38.3 66.5 39.9 65.5 41.1 64.2 C42.3 62.9 43.4 61.3 44.2 59.6 C44.9 57.8 45.4 55.6 45.8 53.5 C46.2 51.3 46.2 48.8 46.6 46.6 C46.9 44.4 47.2 42.1 47.9 40.2 C48.6 38.3 49.5 36.7 50.8 35.4 C52 34.1 53.7 33.2 55.5 32.4 C57.2 31.6 59.3 31.1 61.3 30.5 C63.2 29.9 65.3 29.4 67.2 28.7 C69 28 70.8 27.2 72.4 26.3 C74.1 25.4 75.6 24.3 77.1 23.2 C78.6 22.2 80 21 81.4 19.9 C82.8 18.7 84.3 17.6 85.7 16.4 C87.1 15.3 88.5 14.1 89.8 12.9 C91.1 11.6 92.4 10.3 93.6 9 C94.8 7.6 95.9 6.1 96.9 4.6 C98 3.1 99.5 0.8 100 0 L100 100 L0 100 Z" fill="url(#onda-login)" />
      </svg>

      {/* En móvil la diagonal no cabe: la banda se tumba y queda arriba. */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full lg:hidden"
      >
        <defs>
          <linearGradient id="onda-login-movil" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#285c6d" />
            <stop offset="55%" stopColor="#2f8ba3" />
            <stop offset="100%" stopColor="#5dc3da" />
          </linearGradient>
        </defs>
        <path
          d="M0 26 C7 24 11 29 18 30 C26 31 31 25 39 25 C47 25 52 31 60 32 C68 33 73 27 81 26 C88 25 94 29 100 28 L100 0 L0 0 Z"
          fill="url(#onda-login-movil)"
        />
      </svg>
    </div>
  );
}
