"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { AlertCircle, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { access, brand, site } from "../content/site";
import { ingresar, type EstadoIngreso } from "../../app/acceso/actions";

const INICIAL: EstadoIngreso = { error: null, usuario: "" };

/**
 * Formulario de acceso al aplicativo.
 *
 * Tres decisiones que conviene no revertir sin pensarlo:
 *
 *  1. NO hay selector de institución. Hoy cada institución entra por su propia
 *     dirección y su base va fijada en el despliegue, así que nadie ve la lista
 *     de clientes. Un desplegable de empresas publicaría esa cartera entera.
 *     La institución sale del propio usuario: el servidor lo busca en las
 *     cinco bases y lleva a cada quien a la vista de la suya.
 *  2. El error es el mismo exista o no el usuario, para no confirmar cuentas.
 *  3. La clave viaja sólo en el POST de la acción de servidor; no se guarda en
 *     estado más allá del campo, y tras un error se vacía.
 */
export function LoginForm() {
  const [estado, enviar, enviando] = useActionState(ingresar, INICIAL);
  const [verClave, setVerClave] = useState(false);
  const [olvido, setOlvido] = useState(false);

  return (
    <div className="w-full max-w-md">
      {/*
        Sin tarjeta ni sombra: el formulario ya ocupa su propia columna sobre
        fondo claro, y una caja dentro de otra sólo añadía ruido. El panel de
        marca de al lado pone el color.
      */}
      <form action={enviar}>
        {/*
          El logotipo va sobre el formulario, en la misma superficie donde se
          teclea la contraseña: es lo que confirma al visitante que está en el
          sitio correcto y no en una copia. Nada flota encima de él.
        */}
        <Image
          src={brand.logo.color}
          alt={site.name}
          width={brand.logo.aspect.width}
          height={brand.logo.aspect.height}
          priority
          className="h-9 w-auto dark:hidden"
        />
        <Image
          src={brand.logo.white}
          alt={site.name}
          width={brand.logo.aspect.width}
          height={brand.logo.aspect.height}
          priority
          className="hidden h-9 w-auto dark:block"
        />

        <p className="eyebrow mt-10">{access.eyebrow}</p>
        <h1 className="display mt-4 text-[1.75rem] text-heading sm:text-[2.125rem]">
          {access.title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft dark:text-body">
          {access.lead}
        </p>

        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-heading">
              {access.fields.user.label}
            </span>
            <div className="relative mt-2">
              <UserRound
                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-soft"
                strokeWidth={2}
              />
              <input
                type="text"
                name="usuario"
                autoComplete="username"
                required
                defaultValue={estado.usuario}
                placeholder={access.fields.user.placeholder}
                className="h-12 w-full rounded-xl border border-hairline bg-surface pr-4 pl-11 text-sm text-heading transition-colors duration-200 outline-none placeholder:text-ink-soft focus:border-menta-500 focus:ring-3 focus:ring-menta-400/20"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-heading">
              {access.fields.password.label}
            </span>
            <div className="relative mt-2">
              <LockKeyhole
                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-soft"
                strokeWidth={2}
              />
              <input
                type={verClave ? "text" : "password"}
                name="clave"
                autoComplete="current-password"
                required
                placeholder={access.fields.password.placeholder}
                className="h-12 w-full rounded-xl border border-hairline bg-surface pr-12 pl-11 text-sm text-heading transition-colors duration-200 outline-none placeholder:text-ink-soft focus:border-menta-500 focus:ring-3 focus:ring-menta-400/20"
              />
              {/*
                El botón queda fuera del orden de tabulación con tabIndex -1: al
                pasar de la contraseña al botón de ingresar, nadie espera un salto
                intermedio que además revela la clave en pantalla.
              */}
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setVerClave((v) => !v)}
                aria-label={
                  verClave ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                aria-pressed={verClave}
                className="absolute top-1/2 right-2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-soft transition-colors duration-200 hover:text-menta-600 dark:hover:text-menta-300"
              >
                {verClave ? (
                  <EyeOff className="size-4" strokeWidth={2} />
                ) : (
                  <Eye className="size-4" strokeWidth={2} />
                )}
              </button>
            </div>
          </label>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setOlvido((v) => !v)}
            aria-expanded={olvido}
            className="text-sm text-ink-soft transition-colors duration-200 hover:text-menta-600 dark:hover:text-menta-300"
          >
            <span className="link-underline">{access.forgot}</span>
          </button>
        </div>
        {olvido ? (
          <p className="mt-3 rounded-xl bg-surface-muted p-4 text-xs leading-relaxed text-ink-soft dark:text-body">
            {access.forgotHint}
          </p>
        ) : null}

        {estado.error ? (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-700 dark:text-red-300" strokeWidth={2.25} />
            <p className="text-sm text-red-900 dark:text-red-200">{estado.error}</p>
          </div>
        ) : null}

        {/*
          Azul petróleo (menta-800) y no el gris del resto del sitio: es el tono
          del panel de marca, y el blanco sobre él supera 7:1 de contraste.
        */}
        <button
          type="submit"
          disabled={enviando}
          className="btn mt-6 h-12 w-full justify-center bg-menta-800 text-white hover:bg-menta-700 disabled:cursor-wait disabled:opacity-70"
        >
          {enviando ? "Verificando…" : access.submit}
        </button>
      </form>
    </div>
  );
}
