"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Target } from "lucide-react";
import type { SmartObjective } from "@/lib/types";

interface Props {
  companyId: string;
  hasStrategicPlan: boolean;
  objectives: SmartObjective[];
  operationPlans: { type: string; content: Record<string, unknown> }[];
}

export default function OperationsView({
  companyId,
  hasStrategicPlan,
  objectives,
  operationPlans,
}: Props) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [tab, setTab] = useState<"internal" | "client">("client");
  const [error, setError] = useState("");

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
      <div className="bg-[#1a1a35] border border-[#2a2a4d] rounded-xl p-12 text-center">
        <p className="text-[#8b8ba7]">Necesitas el plan estrategico antes de generar operaciones.</p>
      </div>
    );
  }

  if (objectives.length === 0 && operationPlans.length === 0) {
    return (
      <div className="bg-[#1a1a35] border border-[#2a2a4d] rounded-xl p-12 text-center">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}
        <button
          onClick={generateOperations}
          disabled={generating}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c9a84c] to-[#9e8139] text-[#0a0a18] font-semibold px-6 py-3 rounded-lg hover:from-[#e3c670] hover:to-[#c9a84c] transition disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              APEX generando operaciones...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generar Plan Operativo con APEX
            </>
          )}
        </button>
      </div>
    );
  }

  const currentPlan = operationPlans.find((p) => p.type === tab);

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#2a2a4d]">
        <button
          onClick={() => setTab("client")}
          className={`px-4 py-2 text-sm transition ${
            tab === "client"
              ? "text-[#c9a84c] border-b-2 border-[#c9a84c]"
              : "text-[#8b8ba7] hover:text-[#f1f1f5]"
          }`}
        >
          Plan del Cliente
        </button>
        <button
          onClick={() => setTab("internal")}
          className={`px-4 py-2 text-sm transition ${
            tab === "internal"
              ? "text-[#c9a84c] border-b-2 border-[#c9a84c]"
              : "text-[#8b8ba7] hover:text-[#f1f1f5]"
          }`}
        >
          Plan Interno (Consultor)
        </button>
      </div>

      {/* Plan content */}
      {currentPlan && (
        <div className="bg-[#1a1a35] border border-[#2a2a4d] rounded-xl p-6 mb-6">
          <pre className="text-sm text-[#f1f1f5] whitespace-pre-wrap font-sans leading-relaxed">
            {JSON.stringify(currentPlan.content, null, 2)}
          </pre>
        </div>
      )}

      {/* Objectives */}
      <div>
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#c9a84c] mb-4 flex items-center gap-2">
          <Target size={20} />
          Objetivos SMART ({objectives.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {objectives.map((obj) => (
            <div key={obj.id} className="bg-[#1a1a35] border border-[#2a2a4d] rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-[#f1f1f5]">{obj.title}</h3>
                <StatusBadge status={obj.status} />
              </div>
              {obj.kpi && (
                <p className="text-xs text-[#8b8ba7] mb-1">
                  KPI: <span className="text-[#f1f1f5]">{obj.kpi}</span>
                </p>
              )}
              {obj.target_value && (
                <p className="text-xs text-[#8b8ba7] mb-1">
                  Target: <span className="text-[#c9a84c]">{obj.target_value}</span>
                </p>
              )}
              {obj.time_bound && (
                <p className="text-xs text-[#8b8ba7]">
                  Plazo: <span className="text-[#f1f1f5]">{obj.time_bound}</span>
                </p>
              )}
              {obj.specific && (
                <p className="text-sm text-[#8b8ba7] mt-3 pt-3 border-t border-[#2a2a4d]">
                  {obj.specific}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-[#2a2a4d] text-[#8b8ba7]",
    in_progress: "bg-[#c9a84c]/20 text-[#c9a84c]",
    completed: "bg-green-500/20 text-green-400",
    at_risk: "bg-red-500/20 text-red-400",
  };
  return <span className={`text-xs px-2 py-1 rounded-full ${map[status] || map.pending}`}>{status}</span>;
}
