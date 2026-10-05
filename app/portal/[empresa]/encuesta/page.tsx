import { FormEncuesta } from "../../../../src/components/portal/FormEncuesta";
import { puedeEscribir } from "../../../../src/lib/encuesta-db";
import { exigirSesion } from "../../../../src/lib/sesion";

/**
 * Encuesta de tamizaje. Mismo flujo y mismas preguntas que las apps de Shiny
 * (ver FormEncuesta). Guardar sólo está habilitado donde la base lo admite:
 * hoy, la empresa de prueba «demo»; en las reales queda en consulta.
 */
export default async function EncuestaPage({ params }: { params: Promise<{ empresa: string }> }) {
  const { empresa: slug } = await params;
  const { empresa } = await exigirSesion(slug, "encuesta");
  const escritura = puedeEscribir(empresa);

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 lg:px-10 lg:py-10">
      <p className="text-sm text-ink-soft">{empresa.nombre}</p>
      <h1 className="display mt-1 text-[1.9rem]">Encuesta</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Calculadora para estimar el riesgo de cáncer de pulmón en adultos de {empresa.edadMin} a 80 años. Diligencie todos
        los campos y pulse «Calcular riesgo».
      </p>
      {!escritura ? (
        <p className="mt-4 rounded-lg border border-hairline bg-surface p-3 text-xs leading-relaxed text-ink-soft">
          Modo de consulta: el cálculo funciona, pero el registro de {empresa.nombre} todavía se guarda desde la aplicación actual.
        </p>
      ) : null}
      <div className="mt-6">
        <FormEncuesta slug={empresa.slug} empresa={empresa.nombre} edadMin={empresa.edadMin} geografia={empresa.geografia} escritura={escritura} />
      </div>
    </main>
  );
}
