import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminSidebar } from "../../src/components/admin/AdminSidebar";

export const metadata: Metadata = {
  // Nunca en buscadores: aquí se ve el reparto real por institución.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Envoltura de la vista de administración.
 *
 * La cabecera y el pie del sitio se ocultan desde `ChromeGate`: quien entra aquí
 * viene a operar y el menú corporativo no le sirve. En su lugar manda la barra
 * lateral, que en escritorio queda fija y en móvil se despliega.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100svh] bg-surface-muted">
      <AdminSidebar />
      <div className="admin-contenido">{children}</div>
    </div>
  );
}
