import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ClipboardCheck, Target, ListTodo, MessageSquare, ArrowRight, Calendar } from "lucide-react";

export default async function ClientDashboardPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const supabase = await createClient();

  const [diagnosticRes, planRes, objectivesRes, actionsRes] = await Promise.all([
    supabase.from("diagnostics").select("*").eq("company_id", companyId).eq("status", "completed").maybeSingle(),
    supabase.from("strategic_plans").select("*").eq("company_id", companyId).maybeSingle(),
    supabase.from("smart_objectives").select("*").eq("company_id", companyId),
    supabase.from("actions").select("*").eq("company_id", companyId),
  ]);

  const diagnostic = diagnosticRes.data;
  const plan = planRes.data;
  const objectives = objectivesRes.data || [];
  const actions = actionsRes.data || [];

  const actionsTotal = actions.length;
  const actionsDone = actions.filter((a) => a.status === "done").length;
  const actionsProgress = actionsTotal > 0 ? Math.round((actionsDone / actionsTotal) * 100) : 0;

  const critical = actions
    .filter((a) => a.status !== "done" && (a.priority === "critical" || a.priority === "high"))
    .slice(0, 5);

  return (
    <div className="p-8">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-black mb-8">
        Dashboard
      </h1>

      {/* Progress ring + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-[#e5e5e0] rounded-xl p-6 text-center">
          <p className="text-xs uppercase tracking-wider text-[#6b7280] mb-4">Progreso del Plan</p>
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="#2a2a4d" strokeWidth="8" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#c9a84c"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - actionsProgress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-[#f97316] font-[family-name:var(--font-playfair)]">
                {actionsProgress}%
              </span>
            </div>
          </div>
          <p className="text-xs text-[#6b7280] mt-3">
            {actionsDone} de {actionsTotal} acciones completadas
          </p>
        </div>

        <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
          <p className="text-xs uppercase tracking-wider text-[#6b7280] mb-2">Objetivos SMART</p>
          <p className="text-4xl font-bold text-black font-[family-name:var(--font-playfair)]">
            {objectives.length}
          </p>
          <div className="mt-4 space-y-2">
            <StatRow label="Completados" value={objectives.filter((o) => o.status === "completed").length} color="text-green-400" />
            <StatRow label="En progreso" value={objectives.filter((o) => o.status === "in_progress").length} color="text-[#f97316]" />
            <StatRow label="En riesgo" value={objectives.filter((o) => o.status === "at_risk").length} color="text-red-400" />
          </div>
        </div>

        <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
          <p className="text-xs uppercase tracking-wider text-[#6b7280] mb-2">Estado</p>
          <div className="space-y-3">
            <StatusItem label="Diagnostico" done={!!diagnostic} />
            <StatusItem label="Plan Estrategico" done={!!plan} />
            <StatusItem label="Operaciones" done={objectives.length > 0} />
            <StatusItem label="Acciones" done={actions.length > 0} />
          </div>
        </div>
      </div>

      {/* Quick access */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <QuickCard
          href={`/client/${companyId}/diagnostic`}
          label="Diagnostico"
          icon={<ClipboardCheck size={20} />}
          description={diagnostic ? "Ver analisis" : "Iniciar diagnostico"}
        />
        <QuickCard
          href={`/client/${companyId}/strategic-plan`}
          label="Plan Estrategico"
          icon={<Target size={20} />}
          description={plan ? "Ver plan" : "Generar plan"}
          disabled={!diagnostic}
        />
        <QuickCard
          href={`/client/${companyId}/operations`}
          label="Operaciones"
          icon={<Calendar size={20} />}
          description="Plan y cronograma"
          disabled={!plan}
        />
        <QuickCard
          href={`/client/${companyId}/tracker`}
          label="Tracker"
          icon={<ListTodo size={20} />}
          description="Seguimiento"
        />
        <QuickCard
          href={`/client/${companyId}/chat`}
          label="Chat Melisa"
          icon={<MessageSquare size={20} />}
          description="Consultar"
        />
      </div>

      {/* Critical actions */}
      <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#f97316] mb-4">
          Acciones Criticas
        </h2>
        {critical.length === 0 ? (
          <p className="text-[#6b7280] text-sm">No hay acciones criticas pendientes</p>
        ) : (
          <div className="space-y-2">
            {critical.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 bg-[#fafaf7] rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  a.priority === "critical" ? "bg-red-400" : "bg-amber-400"
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-black">{a.title}</p>
                  <p className="text-xs text-[#6b7280]">
                    {a.owner || "Sin asignar"} {a.due_date && `— Vence: ${a.due_date}`}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-[#e5e5e0] rounded text-[#6b7280]">{a.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#6b7280]">{label}</span>
      <span className={color + " font-medium"}>{value}</span>
    </div>
  );
}

function StatusItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${done ? "bg-green-400" : "bg-[#e5e5e0]"}`} />
      <span className={done ? "text-black" : "text-[#6b7280]"}>{label}</span>
    </div>
  );
}

function QuickCard({
  href,
  label,
  icon,
  description,
  disabled,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div className="bg-white border border-[#e5e5e0] rounded-xl p-5 opacity-40">
        <div className="text-[#6b7280] mb-2">{icon}</div>
        <p className="text-black font-medium">{label}</p>
        <p className="text-xs text-[#6b7280] mt-1">Bloqueado</p>
      </div>
    );
  }
  return (
    <Link
      href={href}
      className="group bg-white border border-[#e5e5e0] rounded-xl p-5 hover:border-[#f97316]/40 transition"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-[#f97316]">{icon}</div>
        <ArrowRight size={16} className="text-[#6b7280] group-hover:text-[#f97316] group-hover:translate-x-1 transition" />
      </div>
      <p className="text-black font-medium">{label}</p>
      <p className="text-xs text-[#6b7280] mt-1">{description}</p>
    </Link>
  );
}
