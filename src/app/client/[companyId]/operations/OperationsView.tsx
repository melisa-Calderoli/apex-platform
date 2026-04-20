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
      <div className="bg-white border border-[#e5e5e0] rounded-xl p-12 text-center">
        <p className="text-[#6b7280]">Necesitas el plan estrategico antes de generar operaciones.</p>
      </div>
    );
  }

  if (objectives.length === 0 && operationPlans.length === 0) {
    return (
      <div className="bg-white border border-[#e5e5e0] rounded-xl p-12 text-center">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}
        <button
          onClick={generateOperations}
          disabled={generating}
          className="inline-flex items-center gap-2 bg-[#f97316] text-[#0a0a18] font-semibold px-6 py-3 rounded-lg hover:bg-[#ea580c] transition disabled:opacity-50"
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
      <div className="flex gap-2 mb-6 border-b border-[#e5e5e0]">
        <button
          onClick={() => setTab("client")}
          className={`px-4 py-2 text-sm transition ${
            tab === "client"
              ? "text-[#f97316] border-b-2 border-[#f97316]"
              : "text-[#6b7280] hover:text-black"
          }`}
        >
          Plan del Cliente
        </button>
        <button
          onClick={() => setTab("internal")}
          className={`px-4 py-2 text-sm transition ${
            tab === "internal"
              ? "text-[#f97316] border-b-2 border-[#f97316]"
              : "text-[#6b7280] hover:text-black"
          }`}
        >
          Plan Interno (Consultor)
        </button>
      </div>

      {/* Plan content */}
      {currentPlan && (
        <div className="bg-white border border-[#e5e5e0] rounded-xl p-6 mb-6">
          <pre className="text-sm text-black whitespace-pre-wrap font-sans leading-relaxed">
            {JSON.stringify(currentPlan.content, null, 2)}
          </pre>
        </div>
      )}

      {/* Objectives */}
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
              {obj.kpi && (
                <p className="text-xs text-[#6b7280] mb-1">
                  KPI: <span className="text-black">{obj.kpi}</span>
                </p>
              )}
              {obj.target_value && (
                <p className="text-xs text-[#6b7280] mb-1">
                  Target: <span className="text-[#f97316]">{obj.target_value}</span>
                </p>
              )}
              {obj.time_bound && (
                <p className="text-xs text-[#6b7280]">
                  Plazo: <span className="text-black">{obj.time_bound}</span>
                </p>
              )}
              {obj.specific && (
                <p className="text-sm text-[#6b7280] mt-3 pt-3 border-t border-[#e5e5e0]">
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
    pending: "bg-[#e5e5e0] text-[#6b7280]",
    in_progress: "bg-[#f97316]/20 text-[#f97316]",
    completed: "bg-green-500/20 text-green-400",
    at_risk: "bg-red-500/20 text-red-400",
  };
  return <span className={`text-xs px-2 py-1 rounded-full ${map[status] || map.pending}`}>{status}</span>;
}
