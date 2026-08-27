/**
 * Esqueleto mientras la consulta viaja a la base.
 *
 * Next lo muestra automáticamente al navegar entre secciones de administración.
 * Reproduce la silueta real de la pantalla (cabecera, tres tarjetas, rejilla y
 * gráfica) en lugar de un girador centrado: así el contenido aterriza donde ya
 * estaba el hueco y la página no da un salto al llegar los datos.
 *
 * Importa porque estas consultas no son instantáneas: son cinco esquemas en un
 * servidor de un núcleo.
 */
function Bloque({ className = "" }: { className?: string }) {
  return <div className={`admin-esqueleto rounded-xl ${className}`} />;
}

export default function CargandoAdmin() {
  return (
    <div className="px-5 py-10 lg:px-10 lg:py-14" aria-busy="true" aria-live="polite">
      <span className="sr-only">Consultando los datos de los centros…</span>

      <div className="mx-auto max-w-6xl">
        <Bloque className="h-3.5 w-32" />
        <Bloque className="mt-5 h-10 w-80 max-w-full" />
        <Bloque className="mt-5 h-4 w-full max-w-2xl" />
        <Bloque className="mt-2 h-4 w-2/3 max-w-lg" />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-hairline bg-surface p-6">
              <div className="flex items-center gap-3">
                <Bloque className="size-10 rounded-xl" />
                <Bloque className="h-3.5 w-28" />
              </div>
              <Bloque className="mt-4 h-9 w-24" />
              <Bloque className="mt-3 h-3 w-32" />
            </div>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-hairline bg-surface">
          <div className="border-b border-hairline px-6 py-5">
            <Bloque className="h-4 w-48" />
          </div>
          <div className="grid gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface p-5">
                <div className="flex items-center justify-between gap-3">
                  <Bloque className="h-4 w-24" />
                  <Bloque className="h-5 w-16 rounded-full" />
                </div>
                <Bloque className="mt-3 h-3 w-36" />
                <div className="mt-3 flex gap-1.5">
                  <Bloque className="h-6 w-16 rounded-full" />
                  <Bloque className="h-6 w-20 rounded-full" />
                  <Bloque className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-hairline bg-surface p-7">
          <Bloque className="h-4 w-40" />
          <Bloque className="mt-5 h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
