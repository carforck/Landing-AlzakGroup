"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { AlertTriangle, Calculator, CheckCircle2, Loader2, RotateCcw, Save, Table2 } from "lucide-react";
import { BLOQUES, DETALLE, edadDesde, esquemaEncuesta, num, SI_NO, TIPOS_DOC, type ClaveSiNo } from "../../lib/encuesta";
import { calcularRiesgoCaPulmon, type ResultadoRiesgo } from "../../lib/lung-risk";
import { DIVIPOLA } from "../../lib/divipola";
import { guardar } from "../../../app/portal/[empresa]/encuesta/actions";

/**
 * Encuesta de tamizaje, con el mismo flujo de las apps de Shiny:
 * diligenciar → «Calcular riesgo» → ventana con nivel, probabilidad y
 * recomendación → «Guardar registro» o «Nuevo cálculo».
 *
 * El cálculo corre aquí, en el navegador, con el mismo modelo que Shiny
 * (lung-risk.ts, verificado contra risk_ca_pulmon.py en 5.000 casos sin una
 * sola diferencia de clase). Al guardar, el servidor valida y recalcula todo.
 *
 * Guardar sólo está disponible donde la base admite escritura (hoy, la demo).
 * En las empresas reales el botón se muestra desactivado y lo explica.
 */

type Campos = Record<string, string>;
const VACIO: Campos = {};

const campo =
  "h-11 w-full rounded-lg border bg-surface px-3 text-sm text-heading outline-none transition-colors focus:border-[var(--t-primario)]";

export function FormEncuesta({
  slug,
  empresa,
  edadMin,
  geografia,
  escritura,
}: {
  slug: string;
  empresa: string;
  edadMin: number;
  geografia: boolean;
  escritura: boolean;
}) {
  const [v, setV] = useState<Campos>(VACIO);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<ResultadoRiesgo | null>(null);
  const [guardado, setGuardado] = useState<{ fecha: string } | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
  const [guardando, iniciar] = useTransition();
  const [intentado, setIntentado] = useState(false);

  const esquema = useMemo(() => esquemaEncuesta({ edadMin, geografia }), [edadMin, geografia]);
  const edad = v.fecha_nac ? edadDesde(v.fecha_nac) : null;
  const municipios = DIVIPOLA.find((d) => d.valor === v.departamento)?.municipios ?? [];

  const validar = (datos: Campos) => {
    const r = esquema.safeParse(datos);
    const e: Record<string, string> = {};
    if (!r.success) for (const i of r.error.issues) e[String(i.path[0])] ??= i.message;
    return { ok: r.success, e };
  };

  const poner = (k: string, valor: string) => {
    const siguiente = { ...v, [k]: valor };
    if (k === "departamento") siguiente.municipio = "";
    setV(siguiente);
    if (intentado) setErrores(validar(siguiente).e);
    // Igual que Shiny: quien ya tiene cáncer de pulmón no puede seguir.
    if (k === "ca_pulmon" && valor === "Sí") {
      setAviso("Esta herramienta sólo permite calcular el riesgo en personas sin diagnóstico de cáncer de pulmón. Por favor revise antes de continuar.");
      setV({ ...siguiente, ca_pulmon: "" });
    }
    if (k === "fecha_nac") {
      const e = edadDesde(valor);
      if (e !== null && e > 0 && (e < edadMin || e > 80))
        setAviso(`La edad calculada es ${e} años. El protocolo de detección es para personas entre ${edadMin} y 80 años.`);
    }
  };

  const calcular = () => {
    setIntentado(true);
    const { ok, e } = validar(v);
    setErrores(e);
    if (!ok) {
      setAviso("Existen campos sin diligenciar o por corregir. Por favor revise antes de continuar.");
      document.querySelector(`[data-campo="${Object.keys(e)[0]}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const s = (k: string) => v[k] === "Sí";
    setResultado(
      calcularRiesgoCaPulmon({
        edad: edad ?? 0,
        sexo: v.sexo as "M" | "F",
        epoc: s("epoc"),
        caAnt: s("ca_ant"),
        caPulmonFam: s("ca_pulmon_fam"),
        fumador: s("fumador"),
        fumadorYear: num(v.fumador_year),
        nCigarrillosDia: num(v.n_cigarrillos_dia),
        fumadorPasivo: s("fumador_pasivo"),
        fumadorPasivoYear: num(v.fumador_pasivo_year),
        hap: s("hap"),
        hapYear: num(v.hap_year),
        asbesto: s("asbesto"),
        asbestoYear: num(v.asbesto_year),
        edadInicioAsbesto: num(v.edad_inicio_asbesto),
        diesel: s("diesel"),
        dieselYear: num(v.diesel_year),
        edadInicioDiesel: num(v.edad_inicio_diesel),
        pintura: s("pintura"),
        pinturaYear: num(v.pintura_year),
        edadInicioPintura: num(v.edad_inicio_pintura),
      }),
    );
    setGuardado(null);
    setErrorGuardar(null);
  };

  const guardarRegistro = () =>
    iniciar(async () => {
      if (guardado) return; // Shiny también impide guardar dos veces el mismo cálculo.
      const r = await guardar(slug, v);
      if (r.ok) setGuardado({ fecha: r.fecha });
      else {
        setErrorGuardar(r.error);
        if (r.campos) setErrores(r.campos);
      }
    });

  const nuevo = () => {
    setV(VACIO);
    setErrores({});
    setResultado(null);
    setGuardado(null);
    setErrorGuardar(null);
    setIntentado(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const err = (k: string) =>
    errores[k] ? (
      <p className="mt-1.5 flex items-start gap-1.5 text-xs text-riesgo-alto">
        <AlertTriangle className="mt-px size-3.5 shrink-0" strokeWidth={2.25} />
        {errores[k]}
      </p>
    ) : null;
  const borde = (k: string) => (errores[k] ? "border-riesgo-alto" : "border-hairline");

  const siNo = (k: ClaveSiNo) => (
    <fieldset key={k} data-campo={k} className="rounded-xl border border-hairline p-4 sm:p-5">
      <legend className="sr-only">{SI_NO[k]}</legend>
      <p className="text-sm leading-relaxed text-heading" aria-hidden>
        {SI_NO[k]}
      </p>
      <div className="mt-3 flex gap-2">
        {(["Sí", "No"] as const).map((op) => {
          const activo = v[k] === op;
          return (
            <label
              key={op}
              className={`inline-flex h-10 min-w-20 cursor-pointer items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors ${
                activo ? "border-[var(--t-primario)] bg-[var(--t-primario)] text-white" : `${borde(k)} bg-surface text-heading hover:border-[var(--t-primario)]`
              }`}
            >
              <input type="radio" name={k} value={op} checked={activo} onChange={() => poner(k, op)} className="sr-only" />
              {op}
            </label>
          );
        })}
      </div>
      {err(k)}
      {Object.entries(DETALLE)
        .filter(([, d]) => d.depende === k && v[k] === "Sí")
        .map(([dk, d]) => (
          <label key={dk} data-campo={dk} className="mt-4 block">
            <span className="text-sm text-ink-soft">{d.texto}</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={120}
              value={v[dk] ?? ""}
              onChange={(e) => poner(dk, e.target.value)}
              className={`${campo} ${borde(dk)} mt-1.5 max-w-40`}
            />
            {err(dk)}
          </label>
        ))}
    </fieldset>
  );

  return (
    <div>
      <section className="rounded-2xl border border-hairline bg-surface p-5 sm:p-7">
        <h2 className="text-lg font-bold text-heading">Información personal</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label data-campo="nombre" className="block">
            <span className="text-sm text-ink-soft">Nombres</span>
            <input value={v.nombre ?? ""} onChange={(e) => poner("nombre", e.target.value)} className={`${campo} ${borde("nombre")} mt-1.5`} autoComplete="off" />
            {err("nombre")}
          </label>
          <label data-campo="apellido" className="block">
            <span className="text-sm text-ink-soft">Apellidos</span>
            <input value={v.apellido ?? ""} onChange={(e) => poner("apellido", e.target.value)} className={`${campo} ${borde("apellido")} mt-1.5`} autoComplete="off" />
            {err("apellido")}
          </label>
          <label data-campo="tipo_doc" className="block">
            <span className="text-sm text-ink-soft">Tipo de documento</span>
            <select value={v.tipo_doc ?? ""} onChange={(e) => poner("tipo_doc", e.target.value)} className={`${campo} ${borde("tipo_doc")} mt-1.5`}>
              <option value="">Seleccione…</option>
              {TIPOS_DOC.map((t) => (
                <option key={t.codigo} value={t.codigo}>
                  {t.nombre}
                </option>
              ))}
            </select>
            {err("tipo_doc")}
          </label>
          <label data-campo="documento" className="block">
            <span className="text-sm text-ink-soft">Documento de identidad</span>
            <input inputMode="numeric" value={v.documento ?? ""} onChange={(e) => poner("documento", e.target.value.replace(/\D/g, ""))} className={`${campo} ${borde("documento")} mt-1.5`} autoComplete="off" />
            {err("documento")}
          </label>
          <label data-campo="fecha_nac" className="block">
            <span className="text-sm text-ink-soft">Fecha de nacimiento</span>
            <input type="date" max={new Date().toISOString().slice(0, 10)} min="1900-01-01" value={v.fecha_nac ?? ""} onChange={(e) => poner("fecha_nac", e.target.value)} className={`${campo} ${borde("fecha_nac")} mt-1.5`} />
            {err("fecha_nac")}
          </label>
          <div className="block">
            <span className="text-sm text-ink-soft">Edad actual (calculada)</span>
            <p className="mt-1.5 flex h-11 items-center rounded-lg border border-dashed border-hairline bg-surface-muted px-3 text-sm tabular-nums text-heading">
              {edad !== null && edad >= 0 ? `${edad} años` : "Se calcula desde la fecha de nacimiento"}
            </p>
          </div>
          <fieldset data-campo="sexo" className="sm:col-span-2">
            <legend className="text-sm text-ink-soft">Sexo biológico</legend>
            <div className="mt-1.5 flex gap-2">
              {[
                ["M", "Hombre"],
                ["F", "Mujer"],
              ].map(([val, txt]) => (
                <label
                  key={val}
                  className={`inline-flex h-10 min-w-24 cursor-pointer items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors ${
                    v.sexo === val ? "border-[var(--t-primario)] bg-[var(--t-primario)] text-white" : `${borde("sexo")} bg-surface text-heading hover:border-[var(--t-primario)]`
                  }`}
                >
                  <input type="radio" name="sexo" value={val} checked={v.sexo === val} onChange={() => poner("sexo", val)} className="sr-only" />
                  {txt}
                </label>
              ))}
            </div>
            {err("sexo")}
          </fieldset>
          {geografia ? (
            <>
              <label data-campo="departamento" className="block">
                <span className="text-sm text-ink-soft">Departamento de residencia</span>
                <select value={v.departamento ?? ""} onChange={(e) => poner("departamento", e.target.value)} className={`${campo} ${borde("departamento")} mt-1.5`}>
                  <option value="">Seleccione…</option>
                  {DIVIPOLA.map((d) => (
                    <option key={d.valor} value={d.valor}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
                {err("departamento")}
              </label>
              <label data-campo="municipio" className="block">
                <span className="text-sm text-ink-soft">Municipio de residencia</span>
                <select value={v.municipio ?? ""} onChange={(e) => poner("municipio", e.target.value)} disabled={!v.departamento} className={`${campo} ${borde("municipio")} mt-1.5 disabled:opacity-50`}>
                  <option value="">{v.departamento ? "Seleccione…" : "Elija primero el departamento"}</option>
                  {municipios.map((m) => (
                    <option key={m.valor} value={m.valor}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
                {err("municipio")}
              </label>
            </>
          ) : null}
        </div>
      </section>

      {BLOQUES.map((b) => (
        <section key={b.titulo} className="mt-5 rounded-2xl border border-hairline bg-surface p-5 sm:p-7">
          <h2 className="text-lg font-bold text-heading">{b.titulo}</h2>
          <div className="mt-5 space-y-4">
            {b.preguntas.map((k) => siNo(k))}
          </div>
        </section>
      ))}

      <div className="sticky bottom-4 z-20 mt-6 flex justify-end">
        <button
          type="button"
          onClick={calcular}
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-[var(--t-primario)] px-6 text-sm font-semibold text-white shadow-lg hover:opacity-95"
        >
          <Calculator className="size-4" strokeWidth={2.25} />
          Calcular riesgo
        </button>
      </div>

      {/* Avisos: campos pendientes, edad fuera de protocolo, diagnóstico previo. */}
      {aviso ? (
        <Modal titulo="Información" onCerrar={() => setAviso(null)}>
          <p className="leading-relaxed text-heading">{aviso}</p>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => setAviso(null)} className="h-11 rounded-lg bg-[var(--t-primario)] px-5 text-sm font-semibold text-white">
              Entendido
            </button>
          </div>
        </Modal>
      ) : null}

      {resultado ? (
        <Modal titulo="Resultado de la calculadora de riesgo" onCerrar={guardado ? nuevo : undefined}>
          <div className={`rounded-xl p-5 text-white ${{ "Riesgo bajo": "bg-riesgo-bajo", "Riesgo moderado": "bg-riesgo-moderado", "Riesgo alto": "bg-riesgo-alto" }[resultado.claseRiesgo]}`}>
            <p className="text-sm opacity-90">Puntaje calculado</p>
            <p className="mt-1 text-2xl font-bold">
              {resultado.claseRiesgo} · {(resultado.prob * 100).toFixed(2).replace(".", ",")} %
            </p>
            <p className="mt-1 text-sm opacity-90">de desarrollar cáncer de pulmón en los próximos 6 años</p>
          </div>
          <h3 className="mt-5 text-sm font-semibold text-heading">Recomendación</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft dark:text-body">{resultado.recomendacion}</p>

          {guardado ? (
            <p className="mt-5 flex items-start gap-2 rounded-lg bg-riesgo-bajo-suave p-3 text-sm text-heading">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-riesgo-bajo" />
              <span>
                El registro fue guardado ({guardado.fecha}, hora de Colombia).{" "}
                <Link href={`/portal/${slug}/registros`} className="font-semibold text-[var(--t-primario)] underline">
                  Verlo en Registros
                </Link>
              </span>
            </p>
          ) : null}
          {errorGuardar ? <p className="mt-5 rounded-lg bg-riesgo-alto-suave p-3 text-sm text-heading">{errorGuardar}</p> : null}
          {!escritura ? (
            <p className="mt-5 rounded-lg bg-surface-muted p-3 text-xs leading-relaxed text-ink-soft">
              El portal está en modo de consulta para {empresa}: el cálculo es válido, pero el registro todavía se guarda desde la aplicación actual.
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button type="button" onClick={nuevo} className="inline-flex h-11 items-center gap-2 rounded-lg border border-hairline px-4 text-sm font-medium text-heading hover:bg-surface-muted">
              <RotateCcw className="size-4" />
              Nuevo cálculo
            </button>
            {guardado ? (
              <Link href={`/portal/${slug}/registros`} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--t-primario)] px-5 text-sm font-semibold text-white">
                <Table2 className="size-4" />
                Ver registros
              </Link>
            ) : (
              <button
                type="button"
                onClick={guardarRegistro}
                disabled={!escritura || guardando}
                title={escritura ? undefined : "Disponible cuando se habilite la escritura en esta base"}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--t-primario)] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                {guardando ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Guardar registro
              </button>
            )}
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function Modal({ titulo, children, onCerrar }: { titulo: string; children: React.ReactNode; onCerrar?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={titulo}>
      <button type="button" aria-label="Cerrar" onClick={onCerrar} className="absolute inset-0 cursor-default bg-black/45" disabled={!onCerrar} />
      <div className="relative w-full max-w-lg rounded-2xl bg-surface p-6 shadow-2xl sm:p-7">
        <h2 className="text-lg font-bold text-heading">{titulo}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
