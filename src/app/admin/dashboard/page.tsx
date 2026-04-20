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
  const overdueActions = 0; // TODO calcular

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#f1f1f5]">
            Dashboard Admin
          </h1>
          <p className="text-[#8b8ba7] mt-1">Gestion global de clientes</p>
        </div>
        <Link
          href="/admin/clients/new"
          className="flex items-center gap-2 bg-gradient-to-r from-[#c9a84c] to-[#9e8139] text-[#0a0a18] font-semibold px-5 py-2.5 rounded-lg hover:from-[#e3c670] hover:to-[#c9a84c] transition"
        >
          <Plus size={18} />
          Nuevo Cliente
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Clientes activos"
          value={totalCompanies}
          icon={<Building2 size={20} />}
          color="from-blue-500/20 to-blue-600/20 text-blue-400"
        />
        <StatCard
          label="Planes en progreso"
          value={withPlans}
          icon={<TrendingUp size={20} />}
          color="from-[#c9a84c]/20 to-[#9e8139]/20 text-[#c9a84c]"
        />
        <StatCard
          label="Acciones totales"
          value={totalActions}
          icon={<Users size={20} />}
          color="from-green-500/20 to-green-600/20 text-green-400"
        />
        <StatCard
          label="Acciones vencidas"
          value={overdueActions}
          icon={<AlertCircle size={20} />}
          color="from-red-500/20 to-red-600/20 text-red-400"
        />
      </div>

      {/* Clients list */}
      <div className="bg-[#1a1a35] border border-[#2a2a4d] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a4d]">
          <h2 className="font-semibold text-[#f1f1f5]">Clientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a4d]">
                <th className="text-left px-6 py-3 text-xs font-medium text-[#8b8ba7] uppercase">Empresa</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#8b8ba7] uppercase">Industria</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#8b8ba7] uppercase">Diagnostico</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#8b8ba7] uppercase">Plan</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#8b8ba7] uppercase">Creado</th>
              </tr>
            </thead>
            <tbody>
              {!companies || companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#8b8ba7] text-sm">
                    Todavia no hay clientes. Crea el primero con el boton "Nuevo Cliente".
                  </td>
                </tr>
              ) : (
                companies.map((c) => {
                  const hasDiagnostic = c.diagnostics?.some((d: { status: string }) => d.status === "completed");
                  const hasPlan = c.strategic_plans && c.strategic_plans.length > 0;
                  return (
                    <tr key={c.id} className="border-b border-[#2a2a4d] hover:bg-[#14142b]">
                      <td className="px-6 py-4">
                        <Link
                          href={`/client/${c.id}/dashboard`}
                          className="text-[#f1f1f5] hover:text-[#c9a84c] font-medium"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#8b8ba7]">{c.industry || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          hasDiagnostic
                            ? "bg-green-500/20 text-green-400"
                            : "bg-[#2a2a4d] text-[#8b8ba7]"
                        }`}>
                          {hasDiagnostic ? "Completado" : "Pendiente"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          hasPlan
                            ? "bg-[#c9a84c]/20 text-[#c9a84c]"
                            : "bg-[#2a2a4d] text-[#8b8ba7]"
                        }`}>
                          {hasPlan ? "Activo" : "Sin plan"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#8b8ba7]">{formatDate(c.created_at)}</td>
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

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-[#1a1a35] border border-[#2a2a4d] rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#8b8ba7]">{label}</p>
          <p className="text-3xl font-bold text-[#f1f1f5] mt-2 font-[family-name:var(--font-playfair)]">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${color}`}>{icon}</div>
      </div>
    </div>
  );
}
