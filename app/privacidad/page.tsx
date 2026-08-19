import type { Metadata } from "next";
import { contact, site } from "../../src/content/site";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Política de privacidad y tratamiento de datos personales de ALZAK GROUP S.A.S. (ALZAK Consulting & Research).",
  alternates: { canonical: "/privacidad" },
  robots: { index: true, follow: true },
};

/**
 * Contenido adaptado del sitio anterior. La versión original de alzak.com.co
 * arrastraba el nombre de otra empresa ("Carbo Sostenible S.A.S.") por venir de
 * una plantilla; aquí se corrigió por la razón social real y se ajustó a la Ley
 * 1581 de 2012. Conviene que el área jurídica lo revise antes de publicar.
 */
const sections = [
  {
    heading: "Información que es recogida",
    body: [
      `Nuestro sitio web podrá recoger información personal como: nombre, información de contacto (por ejemplo su dirección de correo electrónico y número telefónico) y datos de la organización que representa. Así mismo, cuando sea necesario podrá ser requerida información específica para atender una solicitud, elaborar una propuesta de servicios o emitir facturación.`,
    ],
  },
  {
    heading: "Uso de la información recogida",
    body: [
      `Empleamos la información con el fin de atender las solicitudes recibidas a través del formulario de contacto, mantener un registro de comunicaciones con clientes y prospectos, y mejorar nuestros servicios de consultoría e investigación.`,
      `Es posible que se envíen correos electrónicos con información institucional o técnica que consideremos relevante para usted. Estos correos se enviarán únicamente a la dirección que usted proporcione y podrá cancelar su recepción en cualquier momento escribiendo a ${contact.email}.`,
      `${site.legalName} está comprometido con mantener su información segura y aplica los controles definidos en su Política de seguridad y privacidad de la información (CAL-POL-002), documento del Sistema de Gestión de Calidad certificado bajo la norma ISO 9001:2015.`,
    ],
  },
  {
    heading: "Cookies",
    body: [
      `Una cookie es un archivo que un sitio web solicita almacenar en su dispositivo. Las cookies permiten obtener información sobre el tráfico web y facilitan las visitas posteriores.`,
      `Este sitio emplea cookies únicamente para identificar las páginas visitadas y su frecuencia, con fines de análisis estadístico agregado. Usted puede aceptar o rechazar el uso de cookies y eliminarlas en cualquier momento desde la configuración de su navegador. Si las rechaza, es posible que algunas funciones del sitio no operen correctamente.`,
    ],
  },
  {
    heading: "Enlaces a terceros",
    body: [
      `Este sitio web puede contener enlaces a otros sitios que pudieran ser de su interés. Una vez que usted haga clic en dichos enlaces y abandone nuestra página, no tenemos control sobre el sitio al que es redirigido y, por lo tanto, no somos responsables de sus términos, de sus políticas de privacidad ni de la protección de sus datos en esos sitios de terceros. Le recomendamos consultar las políticas de cada sitio.`,
    ],
  },
  {
    heading: "Control de su información personal",
    body: [
      `En cualquier momento usted puede restringir la recopilación o el uso de la información personal proporcionada a través de este sitio web. Conforme a la Ley 1581 de 2012 y sus decretos reglamentarios, usted tiene derecho a conocer, actualizar, rectificar y solicitar la supresión de sus datos personales, así como a revocar la autorización otorgada para su tratamiento.`,
      `Para ejercer estos derechos puede escribirnos a ${contact.email}. Atenderemos su solicitud dentro de los plazos previstos por la normativa vigente.`,
      `${site.legalName} no venderá, cederá ni distribuirá la información personal recopilada sin su consentimiento, salvo requerimiento de autoridad judicial o administrativa competente.`,
    ],
  },
  {
    heading: "Cambios en esta política",
    body: [
      `${site.legalName} se reserva el derecho de modificar los términos de la presente política de privacidad en cualquier momento. Le recomendamos revisar esta página periódicamente para conocer las actualizaciones.`,
    ],
  },
] as const;

export default function PrivacidadPage() {
  return (
    <article className="shell max-w-3xl py-20 lg:py-28">
      <p className="eyebrow">Legal</p>
      <h1 className="display mt-6 text-[2.75rem] sm:text-[3.5rem]">
        Política de privacidad
      </h1>

      <p className="mt-8 leading-relaxed text-ink-soft dark:text-body">
        La presente política de privacidad establece los términos en que{" "}
        {site.legalName} ({site.name}) usa y protege la información proporcionada por sus
        usuarios al utilizar este sitio web. Estamos comprometidos con la seguridad de los
        datos de nuestros usuarios: cuando le solicitamos completar campos con información
        personal, lo hacemos asegurando que sólo se empleará de acuerdo con los términos de
        este documento.
      </p>

      <div className="mt-14 space-y-12">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            <div className="mt-4 space-y-4 leading-relaxed text-ink-soft dark:text-body">
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <hr className="mt-16 border-hairline" />
      <p className="mt-6 text-sm text-ink-soft">
        Responsable del tratamiento: {site.legalName} · {contact.city} ·{" "}
        <a href={`mailto:${contact.email}`} className="text-menta-500 hover:underline">
          {contact.email}
        </a>
      </p>
    </article>
  );
}
