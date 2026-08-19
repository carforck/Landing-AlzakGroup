"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Política de movimiento única para todo el sitio.
 *
 * `reducedMotion="user"` hace que framer-motion consulte
 * `prefers-reduced-motion` por su cuenta y descarte las animaciones de
 * transform, conservando las de opacidad y color. Es exactamente la regla que
 * globals.css ya aplica al CSS, así que las dos capas de movimiento —CSS y
 * framer— responden igual a la preferencia del sistema.
 *
 * Va aquí, en un proveedor, y no como un `if (reduceMotion)` en cada componente,
 * porque esa comprobación no se puede usar para decidir MARCADO: en el servidor
 * no hay `matchMedia`, así que devuelve `false`, y en el cliente devuelve `true`
 * para quien tenga la preferencia activada. Las dos ramas producían árboles
 * distintos y React abortaba la hidratación de la página entera con un
 * "Hydration failed" en consola. La preferencia decide cómo se anima, nunca qué
 * se renderiza.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
