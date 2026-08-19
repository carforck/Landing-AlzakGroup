import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { brand, contact, navigation, site } from "../content/site";

export function Footer() {
  const year = new Date().getFullYear();
  const { width, height } = brand.logo.aspect;

  return (
    <footer className="bg-gris-800 text-white/70">
      <div className="shell grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Image
            src={brand.logo.white}
            alt={site.name}
            width={width}
            height={height}
            className="h-11 w-auto"
          />
          <p className="mt-6 max-w-sm text-sm leading-relaxed">
            {site.claim}. Consultoría e investigación en salud pública, economía de la
            salud y epidemiología. Empresa 100% colombiana con certificación ISO
            9001:2015.
          </p>
          <Image
            src="/cert-iso9001-bureau-veritas.webp"
            alt="Certificación ISO 9001:2015 por Bureau Veritas"
            width={350}
            height={249}
            className="mt-6 h-14 w-auto"
          />
        </div>

        <div>
          <h3 className="text-xs font-bold tracking-[0.2em] text-white/50 uppercase">
            Navegación
          </h3>
          <ul className="mt-5 space-y-3 text-sm">
            {navigation.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  target={"external" in item && item.external ? "_blank" : undefined}
                  rel={"external" in item && item.external ? "noreferrer" : undefined}
                  className="link-underline transition-colors duration-200 hover:text-menta-300"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/privacidad" className="link-underline transition-colors duration-200 hover:text-menta-300">
                Política de privacidad
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold tracking-[0.2em] text-white/50 uppercase">
            Contacto
          </h3>
          <ul className="mt-5 space-y-3 text-sm">
            {contact.phones.map((phone) => (
              <li key={phone} className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-menta-300" />
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                  className="link-underline transition-colors duration-200 hover:text-menta-300"
                >
                  {phone}
                </a>
              </li>
            ))}
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-menta-300" />
              <a
                href={`mailto:${contact.email}`}
                className="link-underline transition-colors duration-200 hover:text-menta-300"
              >
                {contact.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="size-4 shrink-0 text-menta-300" />
              {contact.city}
            </li>
          </ul>

          <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {contact.social.map((s) => (
              <li key={s.network}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="link-underline transition-colors duration-200 hover:text-menta-300"
                >
                  {s.network}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-2 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {site.foundedYear}–{year} {site.legalName} · Todos los derechos reservados.
          </p>
          <p>{contact.city}</p>
        </div>
      </div>
    </footer>
  );
}
