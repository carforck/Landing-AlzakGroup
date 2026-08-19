import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  lead?: string;
  align?: "left" | "center";
};

/**
 * Cabecera de sección. Sin animación de entrada: el contenido está visible
 * desde el primer pintado y el movimiento del sitio se reserva para el feedback
 * de interacción y para la única lista que entra escalonada.
 */
export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = "left",
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="display mt-5 text-[2rem] sm:text-[2.5rem] lg:text-[3rem]">
        {title}
      </h2>
      {lead ? (
        <p className="mt-5 leading-relaxed text-ink-soft sm:text-lg dark:text-body">
          {lead}
        </p>
      ) : null}
    </div>
  );
}
