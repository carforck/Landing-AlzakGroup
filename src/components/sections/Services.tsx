import { SectionHeader } from "../SectionHeader";
import { ServicesBento } from "../ServicesBento";

export function Services() {
  return (
    <section id="servicios" className="border-t border-hairline py-24 lg:py-32">
      <div className="shell">
        <SectionHeader title="Nuestros servicios" />

        {/*
          Bento con una ilustración animada por línea de trabajo. Sustituye a la
          cuadrícula uniforme de doce tarjetas con icono: ver ServicesBento.
        */}
        <ServicesBento />
      </div>
    </section>
  );
}
