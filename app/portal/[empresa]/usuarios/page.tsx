import { listarUsuarios } from "../../../../src/lib/portal-db";
import { exigirSesion } from "../../../../src/lib/sesion";
import { ETIQUETA_ROL, type Rol } from "../../../../src/tenants/config";

export const dynamic = "force-dynamic";

/**
 * Usuarios de la empresa, en modo consulta. En Shiny esto vive en
 * Configuración y permite crear, editar y borrar; aquí sólo se lista porque el
 * portal es de solo lectura. Nunca se pide la columna `pwd`.
 */
export default async function UsuariosPage({ params }: { params: Promise<{ empresa: string }> }) {
  const { empresa: slug } = await params;
  const { empresa } = await exigirSesion(slug, "usuarios");
  const usuarios = await listarUsuarios(empresa);

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 lg:px-10 lg:py-10">
      <p className="text-sm text-ink-soft">{empresa.nombre}</p>
      <h1 className="display mt-1 text-[1.9rem]">Usuarios</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Consulta de las cuentas con acceso. La creación y edición de usuarios sigue haciéndose en la
        aplicación actual mientras el portal esté en modo de solo lectura.
      </p>

      <section className="mt-6 overflow-hidden rounded-2xl border border-hairline bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-xs text-ink-soft">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Usuario</th>
                {empresa.usuariosConFicha ? (
                  <>
                    <th scope="col" className="px-5 py-3 font-medium">Nombre</th>
                    <th scope="col" className="px-5 py-3 font-medium">Institución</th>
                    <th scope="col" className="px-5 py-3 font-medium">Área</th>
                  </>
                ) : null}
                <th scope="col" className="px-5 py-3 font-medium">Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {usuarios.map((u) => (
                <tr key={u.usuario}>
                  <td className="px-5 py-3 font-medium text-heading">{u.usuario}</td>
                  {empresa.usuariosConFicha ? (
                    <>
                      <td className="px-5 py-3 text-heading">{u.nombre ?? ""}</td>
                      <td className="px-5 py-3 text-ink-soft">{u.institucion ?? ""}</td>
                      <td className="px-5 py-3 text-ink-soft">{u.area ?? ""}</td>
                    </>
                  ) : null}
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-[var(--t-suave)] px-2.5 py-0.5 text-xs font-medium text-[var(--t-profundo)]">
                      {ETIQUETA_ROL[u.rol as Rol] ?? u.rol}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-hairline px-5 py-3 text-xs text-ink-soft">{usuarios.length} cuentas</p>
      </section>
    </main>
  );
}
