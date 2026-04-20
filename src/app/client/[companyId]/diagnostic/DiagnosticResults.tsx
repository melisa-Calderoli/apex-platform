"use client";

import type { Diagnostic } from "@/lib/types";
import { AlertCircle, CheckCircle, TrendingUp, Target } from "lucide-react";

export default function DiagnosticResults({ diagnostic }: { diagnostic: Diagnostic }) {
  const a = diagnostic.ai_analysis;
  if (!a) return null;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Executive Summary */}
      <section className="bg-[#1a1a35] border border-[#2a2a4d] rounded-xl p-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#c9a84c] mb-3">
          Resumen Ejecutivo
        </h2>
        <p className="text-[#f1f1f5] leading-relaxed">{a.executive_summary}</p>
      </section>

      {/* Scores */}
      <section className="bg-[#1a1a35] border border-[#2a2a4d] rounded-xl p-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#c9a84c] mb-4">
          Score por Area
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {Object.entries(a.scores).map(([area, data]) => (
            <div key={area} className="bg-[#0a0a18] rounded-lg p-4">
              <p className="text-xs uppercase text-[#8b8ba7] mb-1">{area}</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold font-[family-name:var(--font-playfair)] text-[#c9a84c]">
                  {data.score}
                </span>
                <span className="text-[#8b8ba7]">/10</span>
              </div>
              <p className="text-xs text-[#8b8ba7] leading-relaxed">{data.justification}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FODA */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FodaBox title="Fortalezas" items={a.foda.fortalezas} color="green" />
        <FodaBox title="Oportunidades" items={a.foda.oportunidades} color="blue" />
        <FodaBox title="Debilidades" items={a.foda.debilidades} color="amber" />
        <FodaBox title="Amenazas" items={a.foda.amenazas} color="red" />
      </section>

      {/* Key Findings */}
      <section className="bg-[#1a1a35] border border-[#2a2a4d] rounded-xl p-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#c9a84c] mb-4 flex items-center gap-2">
          <AlertCircle size={20} />
          Hallazgos Criticos
        </h2>
        <div className="space-y-3">
          {a.key_findings.map((f, i) => (
            <div key={i} className="flex gap-3 p-4 bg-[#0a0a18] rounded-lg">
              <span className="text-[#c9a84c] font-bold">{i + 1}.</span>
              <div className="flex-1">
                <p className="font-medium text-[#f1f1f5]">{f.title}</p>
                <p className="text-sm text-[#8b8ba7] mt-1">{f.description}</p>
                <p className="text-xs text-red-400 mt-2">Impacto: {f.impact}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Opportunities */}
      <section className="bg-[#1a1a35] border border-[#2a2a4d] rounded-xl p-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#c9a84c] mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          Oportunidades Identificadas
        </h2>
        <div className="space-y-3">
          {a.opportunities.map((o, i) => (
            <div key={i} className="p-4 bg-[#0a0a18] rounded-lg border-l-2 border-[#c9a84c]">
              <p className="font-medium text-[#f1f1f5]">{o.title}</p>
              <p className="text-sm text-[#8b8ba7] mt-1">{o.description}</p>
              <p className="text-sm text-[#c9a84c] mt-2 flex items-start gap-2">
                <Target size={14} className="mt-0.5 shrink-0" />
                {o.actionable}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Market Analysis */}
      <section className="bg-[#1a1a35] border border-[#2a2a4d] rounded-xl p-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#c9a84c] mb-3">
          Analisis de Mercado
        </h2>
        <p className="text-[#f1f1f5] leading-relaxed whitespace-pre-wrap">{a.market_analysis}</p>
      </section>
    </div>
  );
}

function FodaBox({ title, items, color }: { title: string; items: string[]; color: string }) {
  const colorMap: Record<string, string> = {
    green: "border-green-500/30 text-green-400",
    blue: "border-blue-500/30 text-blue-400",
    amber: "border-amber-500/30 text-amber-400",
    red: "border-red-500/30 text-red-400",
  };
  return (
    <div className={`bg-[#1a1a35] border ${colorMap[color]} rounded-xl p-5`}>
      <h3 className={`font-semibold mb-3 ${colorMap[color]}`}>{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-[#f1f1f5] flex gap-2">
            <CheckCircle size={14} className={`${colorMap[color]} mt-0.5 shrink-0`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
