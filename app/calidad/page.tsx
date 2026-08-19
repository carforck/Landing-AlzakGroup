import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { DocumentsPreview } from "../../src/components/DocumentsPreview";
import { Reveal } from "../../src/components/Reveal";
import { quality } from "../../src/content/site";

export const metadata: Metadata = {
  title: "Sistema de Gestión de Calidad",
  description:
    "ALZAK Consulting & Research cuenta con certificación ISO 9001:2015 otorgada por Bureau Veritas para servicios de consultoría e investigación en salud pública, economía de la salud y epidemiología.",
  alternates: { canonical: "/calidad" },
};

export default function CalidadPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-hairline">
        <div aria-hidden className="grid-veil pointer-events-none absolute inset-0" />
        <div className="shell relative py-20 lg:py-28">
          <Reveal>
            <p className="eyebrow">Calidad</p>
            <h1 className="display mt-6 max-w-3xl text-[2.75rem] sm:text-[3.5rem]">
              {quality.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft dark:text-body">
              Certificados bajo la norma ISO 9001:2015 por Bureau Veritas desde el 27 de
              septiembre de 2021.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="shell grid gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div className="space-y-6 text-base leading-relaxed text-ink-soft dark:text-body lg:text-lg">
            {quality.paragraphs.map((paragraph, i) => (
              <Reveal key={paragraph.slice(0, 24)} delay={i * 0.06}>
                <p>{paragraph}</p>
              </Reveal>
            ))}

            <Reveal delay={0.24}>
              <div className="!mt-12 rounded-2xl border border-hairline bg-surface-muted p-7 lg:p-9">
                <h2 className="text-lg font-semibold">
                  Pilares de la norma ISO 9001:2015
                </h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {quality.pillars.map((pillar) => (
                    <li key={pillar} className="flex items-center gap-2.5 text-base text-heading">
                      <Check className="size-4 shrink-0 text-menta-400" strokeWidth={2.5} />
                      {pillar}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <div className="space-y-10">
            <Reveal>
              <Image
                src={quality.certificate.image}
                alt={quality.certificate.alt}
                width={350}
                height={249}
                className="w-full max-w-[20rem]"
              />
            </Reveal>

            <Reveal delay={0.1}>
              <div>
                <h2 className="text-xs font-semibold tracking-[0.18em] text-ink-soft uppercase">
                  Documentos del sistema
                </h2>
                <DocumentsPreview documents={quality.documents} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-hairline bg-gris-800 py-20 text-white">
        <div className="shell flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <h2 className="display max-w-xl text-[1.75rem] text-white sm:text-[2.25rem]">
            ¿Necesita un estudio ejecutado bajo estándares certificados?
          </h2>
          <Link
            href="/#contacto"
            className="btn btn-dark shrink-0"
          >
            Contáctenos
            <ArrowRight className="btn-arrow size-4" strokeWidth={2.5} />
          </Link>
        </div>
      </section>
    </>
  );
}
