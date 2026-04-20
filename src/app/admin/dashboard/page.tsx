import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Building2, TrendingUp, Users, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: companies } = await supabase
    .from("companies")
    .select("*, diagnostics(id, status), strategic_plans(id), actions(id, status)")
    .order("created_at", { ascending: false });

  const totalCompanies = companies?.length || 0;
  const withPlans = companies?.filter((c) => c.strategic_plans?.length > 0).length || 0;
  const totalActions = companies?.reduce((sum, c) => sum + (c.actions?.length || 0), 0) || 0;
  const overdueActions = 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-black">
            Dashboard
          </h1>
          <p className="text-[#6b7280] mt-1">Gestion global de clientes</p>
        </div>
        <Link
          href="/admin/clients/new"
          className="flex items-center gap-2 bg-[#f97316] text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-[#ea580c] transition shadow-sm"
        >
          <Plus size={18} />
          Nuevo Cliente
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Clientes activos" value={totalCompanies} icon={<Building2 size={20} />} color="text-[#f97316]" />
        <StatCard label="Planes en progreso" value={withPlans} icon={<TrendingUp size={20} />} color="text-[#fbbf24]" />
        <StatCard label="Acciones totales" value={totalActions} icon={<Users size={20} />} color="text-green-600" />
        <StatCard label="Acciones vencidas" value={overdueActions} icon={<AlertCircle size={20} />} color="text-red-500" />
      </div>

      <div className="bg-white border border-[#e5e5e0] rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#e5e5e0]">
          <h2 className="font-semibold text-black">Clientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e5e0] bg-[#fafaf7]">
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase">Empresa</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase">Industria</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase">Diagnostico</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase">Plan</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase">Creado</th>
              </tr>
            </thead>
            <tbody>
              {!companies || companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#6b7280] text-sm">
                    Todavia no hay clientes. Crea el primero con el boton "Nuevo Cliente".
                  </td>
                </tr>
              ) : (
                companies.map((c) => {
                  const hasDiagnostic = c.diagnostics?.some((d: { status: string }) => d.status === "completed");
                  const hasPlan = c.strategic_plans && c.strategic_plans.length > 0;
                  return (
                    <tr key={c.id} className="border-b border-[#e5e5e0] hover:bg-[#fafaf7]">
                      <td className="px-6 py-4">
                        <Link href={`/client/${c.id}/dashboard`} className="text-black hover:text-[#f97316] font-medium">
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6b7280]">{c.industry || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${hasDiagnostic ? "bg-green-100 text-green-700" : "bg-[#e5e5e0] text-[#6b7280]"}`}>
                          {hasDiagnostic ? "Completado" : "Pendiente"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${hasPlan ? "bg-[#f97316]/20 text-[#ea580c]" : "bg-[#e5e5e0] text-[#6b7280]"}`}>
                          {hasPlan ? "Activo" : "Sin plan"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6b7280]">{formatDate(c.created_at)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white border border-[#e5e5e0] rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#6b7280]">{label}</p>
          <p className="text-3xl font-bold text-black mt-2 font-[family-name:var(--font-playfair)]">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg bg-[#fafaf7] ${color}`}>{icon}</div>
      </div>
    </div>
  );
}
