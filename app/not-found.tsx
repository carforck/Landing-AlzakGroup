import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="shell flex min-h-[70vh] flex-col items-start justify-center py-24">
      <p className="eyebrow">Error 404</p>
      <h1 className="display mt-6 max-w-2xl text-[2.75rem] sm:text-[3.5rem]">
        No encontramos la página que busca
      </h1>
      <p className="mt-6 max-w-xl leading-relaxed text-ink-soft dark:text-body">
        Puede que el enlace haya cambiado con el rediseño del sitio. Desde el inicio
        encontrará nuestros estudios, el equipo y los datos de contacto.
      </p>
      <Link
        href="/"
        className="btn btn-primary mt-9"
      >
        <ArrowLeft className="btn-arrow size-4" strokeWidth={2.5} />
        Volver al inicio
      </Link>
    </section>
  );
}
