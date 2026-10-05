import { exigirSesion } from "../../../../src/lib/sesion";
import { lungCalculator as c } from "../../../../src/content/site";

/** Créditos y bibliografía, como la pestaña "Acerca de" de Shiny. */
export default async function AcercaPage({ params }: { params: Promise<{ empresa: string }> }) {
  const { empresa: slug } = await params;
  const { empresa } = await exigirSesion(slug);

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 lg:px-10 lg:py-10">
      <p className="text-sm text-ink-soft">{empresa.nombre}</p>
      <h1 className="display mt-1 text-[1.9rem]">Acerca de</h1>
      <div className="mt-6 rounded-2xl border border-hairline bg-surface p-8">
        <p className="leading-relaxed text-heading">
          La calculadora estima el riesgo a 6 años de desarrollar cáncer de pulmón con el modelo
          PLCOm2012noRace, extendido con exposición ambiental y ocupacional. Es una herramienta de
          apoyo: úsela como guía, no como diagnóstico.
        </p>
        <p className="mt-4 text-sm text-ink-soft">Desarrollo de ALZAK para {empresa.nombre}.</p>

        <h2 className="mt-8 text-sm font-semibold text-heading">Bibliografía</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
          {c.references.map((r, i) => (
            <li key={i}>{r.cite}</li>
          ))}
        </ol>
      </div>
    </main>
  );
}
