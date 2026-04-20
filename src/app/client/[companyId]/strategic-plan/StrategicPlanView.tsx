"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Target, Users, Megaphone, Award, Cog } from "lucide-react";
import type { StrategicPlan } from "@/lib/types";

interface Props {
  companyId: string;
  plan: StrategicPlan | null;
  hasDiagnostic: boolean;
}

export default function StrategicPlanView({ companyId, plan, hasDiagnostic }: Props) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("positioning");

  async function generatePlan() {
    setGenerating(true);
    setError("");

    const res = await fetch("/api/apex/generate-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error generando plan");
      setGenerating(false);
      return;
    }

    router.refresh();
  }

  if (!hasDiagnostic) {
    return (
      <div className="bg-white border border-[#e5e5e0] rounded-xl p-12 text-center">
        <p className="text-[#6b7280] mb-4">
          Necesitas completar el diagnostico antes de generar el plan estrategico.
        </p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="bg-white border border-[#e5e5e0] rounded-xl p-12 text-center">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}
        <div className="mb-6">
          <div className="inline-flex bg-[#f97316] rounded-2xl p-4 mb-4">
            <Target size={32} className="text-[#0a0a18]" />
          </div>
          <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-black mb-2">
            Generar Plan Estrategico
          </h3>
          <p className="text-[#6b7280] max-w-md mx-auto">
            APEX va a analizar el diagnostico y generar un plan estrategico completo con
            posicionamiento, estrategias por area, analisis competitivo, roadmap y KPIs.
          </p>
        </div>
        <button
          onClick={generatePlan}
          disabled={generating}
          className="inline-flex items-center gap-2 bg-[#f97316] text-[#0a0a18] font-semibold px-6 py-3 rounded-lg hover:bg-[#ea580c] transition disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              APEX generando plan...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generar Plan con APEX
            </>
          )}
        </button>
      </div>
    );
  }

  const c = plan.content;
  const sections = [
    { id: "positioning", label: "Posicionamiento", icon: Target },
    { id: "segmentation", label: "Segmentacion", icon: Users },
    { id: "value_proposition", label: "Propuesta de Valor", icon: Award },
    { id: "strategies", label: "Estrategias", icon: Megaphone },
    { id: "competitive", label: "Analisis Competitivo", icon: Cog },
    { id: "roadmap", label: "Roadmap", icon: Target },
    { id: "kpis", label: "KPIs", icon: Target },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar navigation */}
      <aside className="lg:col-span-1">
        <div className="bg-white border border-[#e5e5e0] rounded-xl p-3 sticky top-6">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition ${
                  activeSection === s.id
                    ? "bg-[#f97316]/10 text-[#f97316]"
                    : "text-[#6b7280] hover:bg-white"
                }`}
              >
                <Icon size={14} />
                {s.label}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Content */}
      <div className="lg:col-span-3 space-y-6">
        {activeSection === "positioning" && (
          <Section title="Posicionamiento Estrategico" content={c.positioning} />
        )}
        {activeSection === "segmentation" && (
          <Section title="Segmentacion y Target" content={c.segmentation} />
        )}
        {activeSection === "value_proposition" && (
          <Section title="Propuesta de Valor" content={c.value_proposition} />
        )}
        {activeSection === "strategies" && (
          <div className="space-y-4">
            <Section title="Estrategia Comercial" content={c.strategies.comercial} />
            <Section title="Estrategia de Marketing" content={c.strategies.marketing} />
            <Section title="Estrategia de Contenido" content={c.strategies.content} />
            <Section title="Estrategia de Marca" content={c.strategies.brand} />
            <Section title="Estrategia Operativa" content={c.strategies.operations} />
          </div>
        )}
        {activeSection === "competitive" && (
          <Section title="Analisis Competitivo" content={c.competitive_analysis} />
        )}
        {activeSection === "roadmap" && (
          <div className="space-y-4">
            <PhaseCard phase="Fase 1" data={c.roadmap.phase_1} />
            <PhaseCard phase="Fase 2" data={c.roadmap.phase_2} />
            <PhaseCard phase="Fase 3" data={c.roadmap.phase_3} />
          </div>
        )}
        {activeSection === "kpis" && (
          <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#f97316] mb-4">
              KPIs Estrategicos
            </h2>
            <div className="space-y-3">
              {c.kpis.map((kpi, i) => (
                <div key={i} className="p-4 bg-[#fafaf7] rounded-lg border-l-2 border-[#f97316]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-black">{kpi.name}</p>
                    <span className="text-sm text-[#f97316]">Target: {kpi.target}</span>
                  </div>
                  <p className="text-sm text-[#6b7280]">{kpi.rationale}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
      <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#f97316] mb-3">
        {title}
      </h2>
      <p className="text-black leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}

function PhaseCard({ phase, data }: { phase: string; data: { period: string; focus: string; actions: string[] } }) {
  return (
    <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="bg-[#f97316] text-[#0a0a18] text-xs font-bold px-2 py-1 rounded">
          {phase}
        </span>
        <p className="text-sm text-[#6b7280]">{data.period}</p>
      </div>
      <p className="font-medium text-black mb-3">{data.focus}</p>
      <ul className="space-y-2">
        {data.actions.map((a, i) => (
          <li key={i} className="text-sm text-[#6b7280] flex gap-2">
            <span className="text-[#f97316]">→</span>
            {a}
          </li>
        ))}
      </ul>
    </div>
  );
}
