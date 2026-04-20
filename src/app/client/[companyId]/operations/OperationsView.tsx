"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Target, CheckCircle2, Circle, Clock, AlertTriangle, Calendar, MessageSquare } from "lucide-react";
import type { SmartObjective, Action } from "@/lib/types";
import ActionDetailModal from "@/components/ActionDetailModal";

interface Props {
  companyId: string;
  hasStrategicPlan: boolean;
  objectives: SmartObjective[];
  operationPlans: { type: string; content: Record<string, unknown> }[];
  actions: Action[];
  isAdmin?: boolean;
}

export default function OperationsView({
  companyId,
  hasStrategicPlan,
  objectives,
  operationPlans,
  actions,
  isAdmin = false,
}: Props) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [tab, setTab] = useState<"timeline" | "gantt" | "client" | "internal" | "objectives">("timeline");
  const [error, setError] = useState("");
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  async function generateOperations() {
    setGenerating(true);
    setError("");
    const res = await fetch("/api/apex/generate-operations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Error");
      setGenerating(false);
      return;
    }
    router.refresh();
  }

  if (!hasStrategicPlan) {
    return (
      <div className="bg-white border border-[#e5e5e0] rounded-xl p-12 text-center">
        <p className="text-[#6b7280]">Necesitas el plan estrategico antes de generar operaciones.</p>
      </div>
    );
  }

  if (objectives.length === 0 && operationPlans.length === 0) {
    return (
      <div className="bg-white border border-[#e5e5e0] rounded-xl p-12 text-center">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}
        {isAdmin ? (
          <button
            onClick={generateOperations}
            disabled={generating}
            className="inline-flex items-center gap-2 bg-[#f97316] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#ea580c] transition disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Melisa generando operaciones...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generar Plan Operativo con Melisa
              </>
            )}
          </button>
        ) : (
          <p className="text-[#6b7280]">
            Tu consultora esta preparando el plan operativo. Volve pronto.
          </p>
        )}
      </div>
    );
  }

  const clientPlan = operationPlans.find((p) => p.type === "client");
  const internalPlan = operationPlans.find((p) => p.type === "internal");

  const completed = actions.filter((a) => a.status === "done").length;
  const inProgress = actions.filter((a) => a.status === "in_progress" || a.status === "review").length;
  const pending = actions.filter((a) => a.status === "todo").length;
  const blocked = actions.filter((a) => a.status === "blocked").length;
  const total = actions.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-[#e5e5e0] overflow-x-auto">
        <TabButton active={tab === "timeline"} onClick={() => setTab("timeline")}>Cronograma</TabButton>
        <TabButton active={tab === "gantt"} onClick={() => setTab("gantt")}>Vista Timeline</TabButton>
        <TabButton active={tab === "objectives"} onClick={() => setTab("objectives")}>Objetivos SMART</TabButton>
        <TabButton active={tab === "client"} onClick={() => setTab("client")}>Plan del Cliente</TabButton>
        <TabButton active={tab === "internal"} onClick={() => setTab("internal")}>Plan Interno</TabButton>
      </div>

      {tab === "timeline" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatBox label="Progreso" value={`${percent}%`} color="text-[#f97316]" bg="bg-[#f97316]/10" />
            <StatBox label="Completadas" value={completed} color="text-green-600" bg="bg-green-50" icon={<CheckCircle2 size={16} />} />
            <StatBox label="En progreso" value={inProgress} color="text-blue-600" bg="bg-blue-50" icon={<Clock size={16} />} />
            <StatBox label="Pendientes" value={pending} color="text-[#6b7280]" bg="bg-[#fafaf7]" icon={<Circle size={16} />} />
            <StatBox label="Bloqueadas" value={blocked} color="text-red-600" bg="bg-red-50" icon={<AlertTriangle size={16} />} />
          </div>

          <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
            <h3 className="font-medium text-black mb-4">Progreso general</h3>
            <div className="h-3 bg-[#fafaf7] rounded-full overflow-hidden">
              <div className="h-full bg-[#f97316] transition-all duration-500" style={{ width: `${percent}%` }} />
            </div>
            <p className="text-sm text-[#6b7280] mt-2">{completed} de {total} acciones completadas</p>
          </div>

          <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
            <h3 className="font-medium text-black mb-4">
              Acciones ({isAdmin ? "Click para editar" : "Click para ver detalle y comentar"})
            </h3>
            {actions.length === 0 ? (
              <p className="text-sm text-[#6b7280]">No hay acciones registradas.</p>
            ) : (
              <div className="space-y-2">
                {actions.map((action) => (
                  <ActionRow key={action.id} action={action} onClick={() => setSelectedAction(action)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "gantt" && (
        <GanttView actions={actions} onActionClick={setSelectedAction} />
      )}

      {tab === "objectives" && (
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#f97316] mb-4 flex items-center gap-2">
            <Target size={20} />
            Objetivos SMART ({objectives.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {objectives.map((obj) => (
              <div key={obj.id} className="bg-white border border-[#e5e5e0] rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-black">{obj.title}</h3>
                  <StatusBadge status={obj.status} />
                </div>
                {obj.kpi && <p className="text-xs text-[#6b7280] mb-1">KPI: <span className="text-black">{obj.kpi}</span></p>}
                {obj.target_value && <p className="text-xs text-[#6b7280] mb-1">Target: <span className="text-[#f97316]">{obj.target_value}</span></p>}
                {obj.time_bound && <p className="text-xs text-[#6b7280]">Plazo: <span className="text-black">{obj.time_bound}</span></p>}
                {obj.specific && <p className="text-sm text-[#6b7280] mt-3 pt-3 border-t border-[#e5e5e0]">{obj.specific}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "client" && clientPlan && (
        <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
          <pre className="text-sm text-black whitespace-pre-wrap font-sans leading-relaxed">
            {JSON.stringify(clientPlan.content, null, 2)}
          </pre>
        </div>
      )}

      {tab === "internal" && internalPlan && (
        <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
          <pre className="text-sm text-black whitespace-pre-wrap font-sans leading-relaxed">
            {JSON.stringify(internalPlan.content, null, 2)}
          </pre>
        </div>
      )}

      {selectedAction && (
        <ActionDetailModal
          action={selectedAction}
          isAdmin={isAdmin}
          onClose={() => setSelectedAction(null)}
        />
      )}
    </div>
  );
}

function GanttView({ actions, onActionClick }: { actions: Action[]; onActionClick: (a: Action) => void }) {
  // Agrupar por mes
  const withDates = actions.filter((a) => a.due_date);
  if (withDates.length === 0) {
    return (
      <div className="bg-white border border-[#e5e5e0] rounded-xl p-12 text-center">
        <Calendar size={32} className="text-[#6b7280] mx-auto mb-3" />
        <p className="text-[#6b7280]">No hay acciones con fecha asignada todavia.</p>
      </div>
    );
  }

  // Ordenar por fecha
  const sorted = [...withDates].sort(
    (a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
  );

  // Agrupar por mes
  const byMonth: Record<string, Action[]> = {};
  for (const a of sorted) {
    const date = new Date(a.due_date!);
    const key = date.toLocaleDateString("es-AR", { year: "numeric", month: "long" });
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(a);
  }

  const statusColor: Record<string, string> = {
    todo: "bg-[#e5e5e0]",
    in_progress: "bg-blue-400",
    review: "bg-purple-400",
    done: "bg-green-500",
    blocked: "bg-red-400",
  };

  return (
    <div className="space-y-6">
      {Object.entries(byMonth).map(([month, monthActions]) => (
        <div key={month} className="bg-white border border-[#e5e5e0] rounded-xl p-6">
          <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#f97316] mb-4 capitalize">
            {month}
          </h3>
          <div className="space-y-2">
            {monthActions.map((a) => (
              <button
                key={a.id}
                onClick={() => onActionClick(a)}
                className="w-full text-left flex items-center gap-3 p-3 hover:bg-[#fafaf7] rounded-lg transition"
              >
                <div className="w-12 text-xs text-[#6b7280] text-right shrink-0">
                  {new Date(a.due_date!).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                </div>
                <div className={`w-2 h-8 rounded-full ${statusColor[a.status]}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${a.status === "done" ? "text-[#6b7280] line-through" : "text-black"}`}>
                    {a.title}
                  </p>
                  <p className="text-xs text-[#6b7280]">
                    {a.owner} {a.category && `• ${a.category}`}
                  </p>
                </div>
                <MessageSquare size={14} className="text-[#6b7280] shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 text-sm whitespace-nowrap transition ${
      active ? "text-[#f97316] border-b-2 border-[#f97316]" : "text-[#6b7280] hover:text-black"
    }`}>
      {children}
    </button>
  );
}

function StatBox({ label, value, color, bg, icon }: { label: string; value: string | number; color: string; bg: string; icon?: React.ReactNode }) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <div className={`flex items-center gap-1 ${color} mb-1`}>
        {icon}
        <p className="text-xs uppercase tracking-wider">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${color} font-[family-name:var(--font-playfair)]`}>{value}</p>
    </div>
  );
}

function ActionRow({ action, onClick }: { action: Action; onClick: () => void }) {
  const statusMap: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
    done: { icon: <CheckCircle2 size={16} />, color: "text-green-600", bg: "bg-green-50", label: "Completada" },
    in_progress: { icon: <Clock size={16} />, color: "text-blue-600", bg: "bg-blue-50", label: "En progreso" },
    review: { icon: <Clock size={16} />, color: "text-purple-600", bg: "bg-purple-50", label: "En revision" },
    todo: { icon: <Circle size={16} />, color: "text-[#6b7280]", bg: "bg-[#fafaf7]", label: "Pendiente" },
    blocked: { icon: <AlertTriangle size={16} />, color: "text-red-600", bg: "bg-red-50", label: "Bloqueada" },
  };
  const s = statusMap[action.status];

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-start gap-3 p-3 border border-[#e5e5e0] rounded-lg hover:bg-[#fafaf7] hover:border-[#f97316]/30 transition"
    >
      <div className={`${s.color} shrink-0 mt-0.5`}>{s.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className={`font-medium ${action.status === "done" ? "text-[#6b7280] line-through" : "text-black"}`}>
            {action.title}
          </p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${s.bg} ${s.color} shrink-0`}>{s.label}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#6b7280]">
          {action.owner && <span>{action.owner}</span>}
          {action.due_date && <span>• Vence: {action.due_date}</span>}
          {action.category && <span>• {action.category}</span>}
        </div>
      </div>
      <MessageSquare size={14} className="text-[#6b7280] shrink-0 mt-1" />
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-[#e5e5e0] text-[#6b7280]",
    in_progress: "bg-[#f97316]/20 text-[#f97316]",
    completed: "bg-green-100 text-green-700",
    at_risk: "bg-red-100 text-red-700",
  };
  return <span className={`text-xs px-2 py-1 rounded-full ${map[status] || map.pending}`}>{status}</span>;
}
