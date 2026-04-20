"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Target, Users, Megaphone, Award, Cog, Edit2, Save, X } from "lucide-react";
import type { StrategicPlan, StrategicPlanContent } from "@/lib/types";
import BackButton from "@/components/BackButton";

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
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<StrategicPlanContent | null>(
    plan?.content as StrategicPlanContent | null
  );

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

  async function saveChanges() {
    if (!plan || !content) return;
    setSaving(true);
    await fetch("/api/strategic-plan/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: plan.id, content }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (!hasDiagnostic) {
    return (
      <>
        <BackButton href={`/client/${companyId}/dashboard`} label="Volver al Dashboard" />
        <div className="bg-white border border-[#e5e5e0] rounded-xl p-12 text-center">
          <p className="text-[#6b7280] mb-4">
            Necesitas completar el diagnostico antes de generar el plan estrategico.
          </p>
        </div>
      </>
    );
  }

  if (!plan || !content) {
    return (
      <>
        <BackButton href={`/client/${companyId}/dashboard`} label="Volver al Dashboard" />
        <div className="bg-white border border-[#e5e5e0] rounded-xl p-12 text-center">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}
          <div className="mb-6">
            <div className="inline-flex bg-[#f97316] rounded-2xl p-4 mb-4">
              <Target size={32} className="text-black" />
            </div>
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-black mb-2">
              Generar Plan Estrategico
            </h3>
            <p className="text-[#6b7280] max-w-md mx-auto">
              Melisa va a analizar el diagnostico y generar un plan estrategico completo con
              posicionamiento, estrategias por area, analisis competitivo, roadmap y KPIs.
            </p>
          </div>
          <button
            onClick={generatePlan}
            disabled={generating}
            className="inline-flex items-center gap-2 bg-[#f97316] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#ea580c] transition disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Melisa generando plan...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generar Plan con Melisa
              </>
            )}
          </button>
        </div>
      </>
    );
  }

  const c = content;
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
    <>
      <BackButton href={`/client/${companyId}/dashboard`} label="Volver al Dashboard" />

      <div className="flex justify-end gap-2 mb-4">
        {!editing ? (
          <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-sm text-[#f97316] hover:text-[#ea580c] bg-[#f97316]/10 px-4 py-2 rounded-lg">
            <Edit2 size={14} />
            Editar plan
          </button>
        ) : (
          <>
            <button onClick={() => { setContent(plan.content as StrategicPlanContent); setEditing(false); }} className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-black px-4 py-2 rounded-lg">
              <X size={14} />
              Cancelar
            </button>
            <button onClick={saveChanges} disabled={saving} className="flex items-center gap-2 text-sm text-white bg-[#f97316] hover:bg-[#ea580c] px-4 py-2 rounded-lg disabled:opacity-50">
              <Save size={14} />
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <div className="bg-white border border-[#e5e5e0] rounded-xl p-3 sticky top-6">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition ${
                    activeSection === s.id ? "bg-[#f97316]/10 text-[#f97316]" : "text-[#6b7280] hover:bg-[#fafaf7]"
                  }`}
                >
                  <Icon size={14} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-6">
          {activeSection === "positioning" && (
            <EditableSection title="Posicionamiento Estrategico" content={c.positioning} editing={editing}
              onChange={(v) => setContent({ ...c, positioning: v })} />
          )}
          {activeSection === "segmentation" && (
            <EditableSection title="Segmentacion y Target" content={c.segmentation} editing={editing}
              onChange={(v) => setContent({ ...c, segmentation: v })} />
          )}
          {activeSection === "value_proposition" && (
            <EditableSection title="Propuesta de Valor" content={c.value_proposition} editing={editing}
              onChange={(v) => setContent({ ...c, value_proposition: v })} />
          )}
          {activeSection === "strategies" && (
            <div className="space-y-4">
              <EditableSection title="Estrategia Comercial" content={c.strategies.comercial} editing={editing}
                onChange={(v) => setContent({ ...c, strategies: { ...c.strategies, comercial: v } })} />
              <EditableSection title="Estrategia de Marketing" content={c.strategies.marketing} editing={editing}
                onChange={(v) => setContent({ ...c, strategies: { ...c.strategies, marketing: v } })} />
              <EditableSection title="Estrategia de Contenido" content={c.strategies.content} editing={editing}
                onChange={(v) => setContent({ ...c, strategies: { ...c.strategies, content: v } })} />
              <EditableSection title="Estrategia de Marca" content={c.strategies.brand} editing={editing}
                onChange={(v) => setContent({ ...c, strategies: { ...c.strategies, brand: v } })} />
              <EditableSection title="Estrategia Operativa" content={c.strategies.operations} editing={editing}
                onChange={(v) => setContent({ ...c, strategies: { ...c.strategies, operations: v } })} />
            </div>
          )}
          {activeSection === "competitive" && (
            <EditableSection title="Analisis Competitivo" content={c.competitive_analysis} editing={editing}
              onChange={(v) => setContent({ ...c, competitive_analysis: v })} />
          )}
          {activeSection === "roadmap" && (
            <div className="space-y-4">
              <PhaseCard phase="Fase 1" data={c.roadmap.phase_1} editing={editing}
                onChange={(d) => setContent({ ...c, roadmap: { ...c.roadmap, phase_1: d } })} />
              <PhaseCard phase="Fase 2" data={c.roadmap.phase_2} editing={editing}
                onChange={(d) => setContent({ ...c, roadmap: { ...c.roadmap, phase_2: d } })} />
              <PhaseCard phase="Fase 3" data={c.roadmap.phase_3} editing={editing}
                onChange={(d) => setContent({ ...c, roadmap: { ...c.roadmap, phase_3: d } })} />
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
                    {editing ? (
                      <>
                        <input value={kpi.name} onChange={(e) => {
                          const arr = [...c.kpis];
                          arr[i] = { ...kpi, name: e.target.value };
                          setContent({ ...c, kpis: arr });
                        }} className="w-full font-medium text-black bg-white border border-[#e5e5e0] rounded px-2 py-1 mb-1" />
                        <input value={kpi.target} onChange={(e) => {
                          const arr = [...c.kpis];
                          arr[i] = { ...kpi, target: e.target.value };
                          setContent({ ...c, kpis: arr });
                        }} className="w-full text-sm text-[#f97316] bg-white border border-[#e5e5e0] rounded px-2 py-1 mt-1 mb-1" />
                        <textarea value={kpi.rationale} onChange={(e) => {
                          const arr = [...c.kpis];
                          arr[i] = { ...kpi, rationale: e.target.value };
                          setContent({ ...c, kpis: arr });
                        }} rows={2} className="w-full text-sm bg-white border border-[#e5e5e0] rounded px-2 py-1" />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-black">{kpi.name}</p>
                          <span className="text-sm text-[#f97316]">Target: {kpi.target}</span>
                        </div>
                        <p className="text-sm text-[#6b7280]">{kpi.rationale}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function EditableSection({ title, content, editing, onChange }: {
  title: string; content: string; editing: boolean; onChange: (v: string) => void;
}) {
  return (
    <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
      <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#f97316] mb-3">
        {title}
      </h2>
      {editing ? (
        <textarea value={content} onChange={(e) => onChange(e.target.value)} rows={8}
          className="w-full bg-[#fafaf7] border border-[#e5e5e0] rounded-lg px-3 py-2 text-black focus:border-[#f97316] outline-none" />
      ) : (
        <p className="text-black leading-relaxed whitespace-pre-wrap">{content}</p>
      )}
    </div>
  );
}

function PhaseCard({ phase, data, editing, onChange }: {
  phase: string;
  data: { period: string; focus: string; actions: string[] };
  editing: boolean;
  onChange: (d: { period: string; focus: string; actions: string[] }) => void;
}) {
  return (
    <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="bg-[#f97316] text-white text-xs font-bold px-2 py-1 rounded">{phase}</span>
        {editing ? (
          <input value={data.period} onChange={(e) => onChange({ ...data, period: e.target.value })}
            className="text-sm text-[#6b7280] bg-white border border-[#e5e5e0] rounded px-2 py-0.5" />
        ) : (
          <p className="text-sm text-[#6b7280]">{data.period}</p>
        )}
      </div>
      {editing ? (
        <input value={data.focus} onChange={(e) => onChange({ ...data, focus: e.target.value })}
          className="w-full font-medium text-black bg-white border border-[#e5e5e0] rounded px-2 py-1 mb-3" />
      ) : (
        <p className="font-medium text-black mb-3">{data.focus}</p>
      )}
      <ul className="space-y-2">
        {data.actions.map((a, i) => (
          <li key={i} className="text-sm text-[#6b7280] flex gap-2 items-start">
            <span className="text-[#f97316] mt-0.5">→</span>
            {editing ? (
              <div className="flex gap-1 flex-1">
                <input value={a} onChange={(e) => {
                  const arr = [...data.actions];
                  arr[i] = e.target.value;
                  onChange({ ...data, actions: arr });
                }} className="flex-1 bg-white border border-[#e5e5e0] rounded px-2 py-1" />
                <button onClick={() => onChange({ ...data, actions: data.actions.filter((_, idx) => idx !== i) })}
                  className="text-red-400 hover:text-red-600 px-1">
                  <X size={14} />
                </button>
              </div>
            ) : (
              a
            )}
          </li>
        ))}
      </ul>
      {editing && (
        <button onClick={() => onChange({ ...data, actions: [...data.actions, ""] })}
          className="text-xs text-[#f97316] hover:text-[#ea580c] mt-2">
          + Agregar accion
        </button>
      )}
    </div>
  );
}
