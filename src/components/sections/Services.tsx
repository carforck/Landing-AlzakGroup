import { SectionHeader } from "../SectionHeader";
import { ServicesBento } from "../ServicesBento";

export function Services() {
  return (
    <section id="servicios" className="border-t border-hairline py-24 lg:py-32">
      <div className="shell">
        <SectionHeader
          eyebrow="Nuestros servicios"
          title="Doce líneas de trabajo, un mismo estándar de calidad"
          lead="Cada proyecto se ejecuta bajo protocolos reproducibles y control documental del Sistema de Gestión de Calidad certificado."
        />

        {/*
          Bento con una ilustración animada por línea de trabajo. Sustituye a la
          cuadrícula uniforme de doce tarjetas con icono: ver ServicesBento.
        */}
        <ServicesBento />
      </div>
    </section>
  );
}
