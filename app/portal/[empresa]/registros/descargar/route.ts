import { NextResponse, type NextRequest } from "next/server";
import { exportarRegistros, leerFiltros } from "../../../../../src/lib/portal-db";
import { leerSesion } from "../../../../../src/lib/sesion";
import { empresaPorSlug, puede } from "../../../../../src/tenants/config";

export const dynamic = "force-dynamic";

/**
 * Descarga de lo filtrado en el visor, con todas las columnas de `data`.
 *
 * CSV con BOM y punto y coma: así Excel en español lo abre con tildes y en
 * columnas sin pasar por el asistente de importación. Shiny entregaba .xlsx;
 * generar xlsx exigiría una dependencia más y el contenido es el mismo.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ empresa: string }> }) {
  const { empresa: slug } = await ctx.params;
  const sesion = await leerSesion(slug);
  // Mismas reglas que las páginas: la empresa sale de la sesión, no de la URL.
  if (!sesion || sesion.empresa !== slug || !puede(sesion.rol, "registros")) {
    return new NextResponse("No autorizado", { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const empresa = empresaPorSlug(sesion.empresa)!;

  const sp = Object.fromEntries(req.nextUrl.searchParams);
  const filas = await exportarRegistros(empresa, leerFiltros(sp, empresa));

  const columnas = filas.length ? Object.keys(filas[0]) : [];
  const celda = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = v instanceof Date ? v.toISOString().slice(0, 10) : String(v);
    // Comillas siempre que haga falta, y neutralizar fórmulas: un nombre que
    // empiece por "=" se ejecutaría al abrir el archivo en Excel.
    const seguro = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return /[;"\n\r]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
  };
  const cuerpo = [columnas.join(";"), ...filas.map((f) => columnas.map((c) => celda(f[c])).join(";"))].join("\r\n");

  const sello = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return new NextResponse(`﻿${cuerpo}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="registros_${empresa.slug}_${sello}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
