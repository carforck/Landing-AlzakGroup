import { NextResponse } from "next/server";
import { flattenError } from "zod";
import { contactSchema } from "../../../src/lib/contact-schema";
import { contact } from "../../../src/content/site";

// Node.js runtime: es el predeterminado sobre Fluid Compute y no necesitamos Edge.
export const runtime = "nodejs";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function POST(request: Request) {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { message: "La solicitud no tiene un cuerpo JSON válido." },
      { status: 400 },
    );
  }

  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Revise los datos del formulario.",
        errors: flattenError(parsed.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  const { fullName, email, organization, phone, message, website } = parsed.data;

  // Honeypot: respondemos 200 para no darle señal al bot, pero no enviamos nada.
  if (website) {
    return NextResponse.json({ message: "Mensaje enviado correctamente." });
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("[contact] Falta RESEND_API_KEY; no se pudo enviar el mensaje.");
    return NextResponse.json(
      {
        message:
          "El envío de correo no está configurado. Escríbanos directamente a " +
          contact.email,
      },
      { status: 503 },
    );
  }

  const from =
    process.env.CONTACT_FROM_EMAIL ?? "ALZAK Consulting & Research <no-reply@alzak.com.co>";
  const to = process.env.CONTACT_TO_EMAIL ?? contact.email;

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Nuevo mensaje de contacto · ${fullName}`,
        text: [
          "Nuevo mensaje desde el formulario de alzak.com.co",
          "",
          `Nombre:       ${fullName}`,
          `Correo:       ${email}`,
          `Teléfono:     ${phone || "No suministrado"}`,
          `Organización: ${organization || "No suministrada"}`,
          "",
          "Mensaje:",
          message,
        ].join("\n"),
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("[contact] Resend respondió con error:", response.status, detail);
      return NextResponse.json(
        {
          message:
            "No fue posible enviar el mensaje en este momento. Inténtelo de nuevo o escríbanos a " +
            contact.email,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ message: "Mensaje enviado correctamente." });
  } catch (error) {
    console.error("[contact] Error inesperado al enviar el mensaje:", error);
    return NextResponse.json(
      { message: "Ocurrió un error inesperado al procesar su solicitud." },
      { status: 500 },
    );
  }
}
