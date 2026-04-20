"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Diagnostic, DiagnosticAnalysis } from "@/lib/types";
import { AlertCircle, CheckCircle, TrendingUp, Target, Edit2, Save, X } from "lucide-react";
import BackButton from "@/components/BackButton";

export default function DiagnosticResults({ diagnostic, isAdmin = false }: { diagnostic: Diagnostic; isAdmin?: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState<DiagnosticAnalysis>(
    diagnostic.ai_analysis as DiagnosticAnalysis
  );

  async function saveChanges() {
    setSaving(true);
    const res = await fetch("/api/diagnostics/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diagnosticId: diagnostic.id, analysis }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  function cancelEdit() {
    setAnalysis(diagnostic.ai_analysis as DiagnosticAnalysis);
    setEditing(false);
  }

  const a = analysis;
  if (!a) return null;

  const companyId = diagnostic.company_id;

  return (
    <div className="space-y-6 max-w-6xl">
      <BackButton href={`/client/${companyId}/dashboard`} label="Volver al Dashboard" />

      <div className="flex justify-end gap-2">
        {!editing ? (
          isAdmin && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 text-sm text-[#f97316] hover:text-[#ea580c] bg-[#f97316]/10 px-4 py-2 rounded-lg"
            >
              <Edit2 size={14} />
              Editar diagnostico
            </button>
          )
        ) : (
          <>
            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-black px-4 py-2 rounded-lg"
            >
              <X size={14} />
              Cancelar
            </button>
            <button
              onClick={saveChanges}
              disabled={saving}
              className="flex items-center gap-2 text-sm text-white bg-[#f97316] hover:bg-[#ea580c] px-4 py-2 rounded-lg disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </>
        )}
      </div>

      <section className="bg-white border border-[#e5e5e0] rounded-xl p-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#f97316] mb-3">
          Resumen Ejecutivo
        </h2>
        {editing ? (
          <textarea
            value={a.executive_summary}
            onChange={(e) => setAnalysis({ ...a, executive_summary: e.target.value })}
            rows={6}
            className="w-full bg-[#fafaf7] border border-[#e5e5e0] rounded-lg px-3 py-2 text-black focus:border-[#f97316] outline-none"
          />
        ) : (
          <p className="text-black leading-relaxed">{a.executive_summary}</p>
        )}
      </section>

      <section className="bg-white border border-[#e5e5e0] rounded-xl p-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#f97316] mb-4">
          Score por Area
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {Object.entries(a.scores).map(([area, data]) => (
            <div key={area} className="bg-[#fafaf7] rounded-lg p-4">
              <p className="text-xs uppercase text-[#6b7280] mb-1">{area}</p>
              <div className="flex items-baseline gap-1 mb-2">
                {editing ? (
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={data.score}
                    onChange={(e) =>
                      setAnalysis({
                        ...a,
                        scores: { ...a.scores, [area]: { ...data, score: parseFloat(e.target.value) || 0 } },
                      })
                    }
                    className="w-16 text-xl font-bold text-[#f97316] bg-white border border-[#e5e5e0] rounded px-1"
                  />
                ) : (
                  <span className="text-3xl font-bold font-[family-name:var(--font-playfair)] text-[#f97316]">
                    {data.score}
                  </span>
                )}
                <span className="text-[#6b7280]">/10</span>
              </div>
              {editing ? (
                <textarea
                  value={data.justification}
                  onChange={(e) =>
                    setAnalysis({
                      ...a,
                      scores: { ...a.scores, [area]: { ...data, justification: e.target.value } },
                    })
                  }
                  rows={2}
                  className="w-full text-xs bg-white border border-[#e5e5e0] rounded p-1"
                />
              ) : (
                <p className="text-xs text-[#6b7280] leading-relaxed">{data.justification}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FodaBox title="Fortalezas" items={a.foda.fortalezas} color="green" editing={editing}
          onChange={(items) => setAnalysis({ ...a, foda: { ...a.foda, fortalezas: items } })} />
        <FodaBox title="Oportunidades" items={a.foda.oportunidades} color="blue" editing={editing}
          onChange={(items) => setAnalysis({ ...a, foda: { ...a.foda, oportunidades: items } })} />
        <FodaBox title="Debilidades" items={a.foda.debilidades} color="amber" editing={editing}
          onChange={(items) => setAnalysis({ ...a, foda: { ...a.foda, debilidades: items } })} />
        <FodaBox title="Amenazas" items={a.foda.amenazas} color="red" editing={editing}
          onChange={(items) => setAnalysis({ ...a, foda: { ...a.foda, amenazas: items } })} />
      </section>

      <section className="bg-white border border-[#e5e5e0] rounded-xl p-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#f97316] mb-4 flex items-center gap-2">
          <AlertCircle size={20} />
          Hallazgos Criticos
        </h2>
        <div className="space-y-3">
          {a.key_findings.map((f, i) => (
            <div key={i} className="flex gap-3 p-4 bg-[#fafaf7] rounded-lg">
              <span className="text-[#f97316] font-bold">{i + 1}.</span>
              <div className="flex-1">
                {editing ? (
                  <>
                    <input
                      value={f.title}
                      onChange={(e) => {
                        const arr = [...a.key_findings];
                        arr[i] = { ...f, title: e.target.value };
                        setAnalysis({ ...a, key_findings: arr });
                      }}
                      className="w-full font-medium bg-white border border-[#e5e5e0] rounded px-2 py-1 mb-1"
                    />
                    <textarea
                      value={f.description}
                      onChange={(e) => {
                        const arr = [...a.key_findings];
                        arr[i] = { ...f, description: e.target.value };
                        setAnalysis({ ...a, key_findings: arr });
                      }}
                      rows={2}
                      className="w-full text-sm bg-white border border-[#e5e5e0] rounded px-2 py-1 mt-1"
                    />
                  </>
                ) : (
                  <>
                    <p className="font-medium text-black">{f.title}</p>
                    <p className="text-sm text-[#6b7280] mt-1">{f.description}</p>
                    <p className="text-xs text-red-400 mt-2">Impacto: {f.impact}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-[#e5e5e0] rounded-xl p-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#f97316] mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          Oportunidades Identificadas
        </h2>
        <div className="space-y-3">
          {a.opportunities.map((o, i) => (
            <div key={i} className="p-4 bg-[#fafaf7] rounded-lg border-l-2 border-[#f97316]">
              {editing ? (
                <>
                  <input
                    value={o.title}
                    onChange={(e) => {
                      const arr = [...a.opportunities];
                      arr[i] = { ...o, title: e.target.value };
                      setAnalysis({ ...a, opportunities: arr });
                    }}
                    className="w-full font-medium text-black bg-white border border-[#e5e5e0] rounded px-2 py-1 mb-1"
                  />
                  <textarea
                    value={o.description}
                    onChange={(e) => {
                      const arr = [...a.opportunities];
                      arr[i] = { ...o, description: e.target.value };
                      setAnalysis({ ...a, opportunities: arr });
                    }}
                    rows={2}
                    className="w-full text-sm bg-white border border-[#e5e5e0] rounded px-2 py-1 mt-1"
                  />
                  <input
                    value={o.actionable}
                    onChange={(e) => {
                      const arr = [...a.opportunities];
                      arr[i] = { ...o, actionable: e.target.value };
                      setAnalysis({ ...a, opportunities: arr });
                    }}
                    className="w-full text-sm text-[#f97316] bg-white border border-[#e5e5e0] rounded px-2 py-1 mt-1"
                  />
                </>
              ) : (
                <>
                  <p className="font-medium text-black">{o.title}</p>
                  <p className="text-sm text-[#6b7280] mt-1">{o.description}</p>
                  <p className="text-sm text-[#f97316] mt-2 flex items-start gap-2">
                    <Target size={14} className="mt-0.5 shrink-0" />
                    {o.actionable}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-[#e5e5e0] rounded-xl p-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#f97316] mb-3">
          Analisis de Mercado
        </h2>
        {editing ? (
          <textarea
            value={a.market_analysis}
            onChange={(e) => setAnalysis({ ...a, market_analysis: e.target.value })}
            rows={8}
            className="w-full bg-[#fafaf7] border border-[#e5e5e0] rounded-lg px-3 py-2 text-black focus:border-[#f97316] outline-none"
          />
        ) : (
          <p className="text-black leading-relaxed whitespace-pre-wrap">{a.market_analysis}</p>
        )}
      </section>
    </div>
  );
}

function FodaBox({
  title,
  items,
  color,
  editing,
  onChange,
}: {
  title: string;
  items: string[];
  color: string;
  editing: boolean;
  onChange: (items: string[]) => void;
}) {
  const colorMap: Record<string, string> = {
    green: "border-green-500/30 text-green-600",
    blue: "border-blue-500/30 text-blue-600",
    amber: "border-amber-500/30 text-amber-600",
    red: "border-red-500/30 text-red-600",
  };
  return (
    <div className={`bg-white border ${colorMap[color]} rounded-xl p-5`}>
      <h3 className={`font-semibold mb-3 ${colorMap[color]}`}>{title}</h3>
      {editing ? (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={item}
                onChange={(e) => {
                  const arr = [...items];
                  arr[i] = e.target.value;
                  onChange(arr);
                }}
                className="flex-1 text-sm bg-[#fafaf7] border border-[#e5e5e0] rounded px-2 py-1"
              />
              <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 px-2">
                <X size={14} />
              </button>
            </div>
          ))}
          <button onClick={() => onChange([...items, ""])} className="text-xs text-[#f97316] hover:text-[#ea580c]">
            + Agregar
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-black flex gap-2">
              <CheckCircle size={14} className={`${colorMap[color]} mt-0.5 shrink-0`} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
