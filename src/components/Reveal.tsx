"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Retardo en segundos; útil para escalonar tarjetas dentro de una grilla. */
  delay?: number;
  className?: string;
};

/**
 * Aparición sutil al entrar en viewport. Una sola primitiva para todo el sitio,
 * de modo que el movimiento se sienta como un sistema y no como efectos sueltos.
 *
 * `prefers-reduced-motion` lo resuelve MotionProvider: la entrada se queda en el
 * fundido y pierde el desplazamiento vertical. Antes se hacía devolviendo un
 * `<div>` pelado cuando la preferencia estaba activa, y eso rompía la
 * hidratación —el servidor no puede saber la preferencia, así que renderizaba la
 * otra rama—.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
