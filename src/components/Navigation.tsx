"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { brand, navigation, site } from "../content/site";

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Evita el scroll del documento mientras el menú móvil está abierto.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const { width, height } = brand.logo.aspect;

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-hairline bg-surface/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="shell flex h-20 items-center justify-between gap-6">
        <Link href="/" className="shrink-0" aria-label={`${site.name} · Inicio`}>
          <Image
            src={brand.logo.color}
            alt={site.name}
            width={width}
            height={height}
            priority
            className="h-10 w-auto dark:hidden"
          />
          <Image
            src={brand.logo.white}
            alt={site.name}
            width={width}
            height={height}
            priority
            className="hidden h-10 w-auto dark:block"
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegación principal">
          {navigation.slice(0, -1).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              target={"external" in item && item.external ? "_blank" : undefined}
              rel={"external" in item && item.external ? "noreferrer" : undefined}
              className="group inline-flex items-center gap-1 text-sm text-body transition-colors duration-200 hover:text-menta-600 dark:hover:text-menta-300"
            >
              <span className="link-underline">{item.label}</span>
              {"external" in item && item.external ? (
                <ArrowUpRight className="size-3.5 opacity-50 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.5} />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="#contacto"
            className="btn btn-primary hidden lg:inline-flex"
          >
            Contáctenos
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="inline-flex size-12 items-center justify-center rounded-full border border-hairline text-heading transition-colors duration-200 hover:border-menta-400 hover:text-menta-600 lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="menu-movil" className="border-t border-hairline bg-surface lg:hidden">
          <nav className="shell flex flex-col py-4" aria-label="Navegación principal móvil">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target={"external" in item && item.external ? "_blank" : undefined}
                rel={"external" in item && item.external ? "noreferrer" : undefined}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-hairline py-4 text-lg text-heading last:border-b-0"
              >
                {item.label}
                {"external" in item && item.external ? (
                  <ArrowUpRight className="size-4 text-menta-500" strokeWidth={2.5} />
                ) : null}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
