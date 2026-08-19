"use client";

import { useState } from "react";
import { ArrowRight, CircleCheck, LoaderCircle, Mail, MapPin, Phone } from "lucide-react";
import { flattenError } from "zod";
import { contact } from "../../content/site";
import { contactSchema, type ContactFieldErrors } from "../../lib/contact-schema";
import { DriftingMotif } from "../DriftingMotif";

type Status = "idle" | "sending" | "sent" | "error";

/*
 * El formulario no va dentro de una tarjeta: se apoya en la retícula de la
 * sección, separado por un hairline. Los campos son la única caja que hace
 * falta, y el foco los delimita con el mismo anillo menta del resto del sitio.
 */
const fieldClass =
  "w-full min-h-12 rounded-lg border border-hairline bg-surface px-4 py-3 text-sm text-heading transition-colors duration-200 placeholder:text-ink-soft hover:border-gris-300 focus:border-menta-400 focus:outline-none";

const labelClass =
  "mb-2 block text-[0.6875rem] font-bold tracking-[0.14em] text-ink-soft uppercase";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    // Validamos en el cliente con el mismo esquema del servidor: feedback
    // inmediato sin duplicar reglas.
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      setErrors(flattenError(parsed.error).fieldErrors as ContactFieldErrors);
      setStatus("idle");
      setFeedback("");
      return;
    }

    setErrors({});
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const payload = (await response.json()) as {
        message?: string;
        errors?: ContactFieldErrors;
      };

      if (!response.ok) {
        setErrors(payload.errors ?? {});
        setStatus("error");
        setFeedback(payload.message ?? "No fue posible enviar el mensaje.");
        return;
      }

      form.reset();
      setStatus("sent");
      setFeedback(payload.message ?? "Mensaje enviado correctamente.");
    } catch {
      setStatus("error");
      setFeedback(`Falló la conexión. Escríbanos directamente a ${contact.email}.`);
    }
  }

  return (
    <section
      id="contacto"
      className="relative isolate overflow-hidden border-t border-hairline bg-surface-muted py-24 lg:py-32"
    >
      <DriftingMotif className="-top-8 right-0 w-64 opacity-[0.12] lg:w-96" />
      <div className="shell relative grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <p className="eyebrow">Contacto</p>
          <h2 className="display mt-6 text-[2rem] sm:text-[2.5rem]">{contact.title}</h2>
          <p className="mt-5 leading-relaxed text-ink-soft dark:text-body">
            {contact.subtitle}
          </p>

          <dl className="mt-10 space-y-6 text-sm">
            <div>
              <dt className={labelClass}>Teléfonos</dt>
              <dd className="space-y-2">
                {contact.phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                    className="flex items-center gap-2.5 text-heading transition-colors duration-200 hover:text-menta-600"
                  >
                    <Phone className="size-4 text-menta-500" />
                    <span className="link-underline">{phone}</span>
                  </a>
                ))}
              </dd>
            </div>
            <div>
              <dt className={labelClass}>E-mail</dt>
              <dd>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-2.5 text-heading transition-colors duration-200 hover:text-menta-600"
                >
                  <Mail className="size-4 text-menta-500" />
                  <span className="link-underline">{contact.email}</span>
                </a>
              </dd>
            </div>
            <div>
              <dt className={labelClass}>Ubicación</dt>
              <dd className="flex items-center gap-2.5 text-heading">
                <MapPin className="size-4 text-menta-500" />
                {contact.city}
              </dd>
            </div>
          </dl>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="relative border-t border-hairline pt-10 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-20"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              name="fullName"
              label="Nombre"
              placeholder="Nombre y apellido"
              required
              errors={errors.fullName}
            />
            <Field
              name="email"
              label="Correo electrónico"
              type="email"
              placeholder="nombre@empresa.com"
              required
              errors={errors.email}
            />
            <Field
              name="organization"
              label="Organización"
              placeholder="Opcional"
              errors={errors.organization}
            />
            <Field
              name="phone"
              label="Teléfono"
              type="tel"
              placeholder="Opcional"
              errors={errors.phone}
            />
          </div>

          <div className="mt-5">
            <label className={labelClass} htmlFor="message">
              Mensaje <span className="text-menta-600">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              placeholder="Cuéntenos qué tipo de estudio necesita"
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "message-error" : undefined}
              className={`${fieldClass} resize-y`}
            />
            {errors.message ? (
              <p id="message-error" className="mt-2 text-xs text-red-700">
                {errors.message[0]}
              </p>
            ) : null}
          </div>

          {/* Honeypot: oculto para personas, visible para bots. */}
          <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="website">No completar</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="btn btn-primary mt-7 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Enviando…
              </>
            ) : (
              <>
                Enviar
                <ArrowRight className="btn-arrow size-4" strokeWidth={2.5} />
              </>
            )}
          </button>

          {/* aria-live para que un lector de pantalla anuncie el resultado */}
          {feedback ? (
            <p
              aria-live="polite"
              className={`mt-5 flex items-start gap-2 text-sm ${
                status === "sent" ? "text-menta-700" : "text-red-700"
              }`}
            >
              {status === "sent" ? (
                <CircleCheck className="mt-0.5 size-4 shrink-0" strokeWidth={2.5} />
              ) : null}
              {feedback}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}

type FieldProps = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  errors?: string[];
};

function Field({ name, label, type = "text", placeholder, required, errors }: FieldProps) {
  const errorId = `${name}-error`;

  return (
    <div>
      <label className={labelClass} htmlFor={name}>
        {label} {required ? <span className="text-menta-600">*</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(errors)}
        aria-describedby={errors ? errorId : undefined}
        className={fieldClass}
      />
      {errors ? (
        <p id={errorId} className="mt-2 text-xs text-red-700">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}
