import { clients, contact, leaders, services, site, stats } from "../content/site";

/**
 * Datos estructurados schema.org. Ayudan a que los buscadores entiendan qué es
 * ALZAK, dónde opera, qué servicios ofrece y quién lo respalda.
 */
export function OrganizationJsonLd() {
  const publications = stats.find((s) => s.value === "200+");

  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    legalName: site.legalName,
    alternateName: site.shortName,
    slogan: site.claim,
    url: site.url,
    logo: `${site.url}/brand/logo-alzak.png`,
    description: site.description,
    foundingDate: String(site.foundedYear),
    email: contact.email,
    telephone: contact.phones,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cartagena de Indias",
      addressRegion: "Bolívar",
      addressCountry: "CO",
    },
    sameAs: contact.social.map((s) => s.href),
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      name: "ISO 9001:2015",
      credentialCategory: "certification",
      recognizedBy: { "@type": "Organization", name: "Bureau Veritas" },
    },
    employee: leaders.map((leader) => ({
      "@type": "Person",
      name: `${leader.firstName} ${leader.lastName}`,
      honorificSuffix: leader.credentials,
      jobTitle: leader.role,
    })),
    knowsAbout: [
      "Salud pública",
      "Economía de la salud",
      "Epidemiología",
      "Evaluación económica de tecnologías sanitarias",
      "Real world evidence",
    ],
    makesOffer: services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.title,
        description: service.description,
      },
    })),
    // Clientes declarados en el material corporativo de la compañía.
    client: clients.map((c) => ({ "@type": "Organization", name: c.name })),
    ...(publications
      ? {
          subjectOf: {
            "@type": "CreativeWork",
            name: `${publications.value} ${publications.label}`,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      // El JSON se construye desde contenido estático propio, no de entrada de usuario.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
