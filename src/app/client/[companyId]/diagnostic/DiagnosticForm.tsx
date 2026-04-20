"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

interface Props {
  companyId: string;
  existing?: { id: string; form_data: Record<string, string> } | null;
}

const SECTIONS = [
  {
    id: "general",
    title: "A. Informacion General",
    fields: [
      { name: "revenue_range", label: "Facturacion aproximada (rangos anuales)", type: "text", placeholder: "Ej: < 1M, 1-5M, 5-20M..." },
      { name: "business_model", label: "Modelo de negocio", type: "select", options: ["B2B", "B2C", "B2B2C", "Ambos"] },
      { name: "main_products", label: "Productos/servicios principales", type: "textarea" },
      { name: "value_proposition", label: "Como describis tu propuesta de valor hoy?", type: "textarea" },
    ],
  },
  {
    id: "comercial",
    title: "B. Diagnostico Comercial",
    fields: [
      { name: "acquisition_channels", label: "Como consiguen clientes hoy? (canales actuales)", type: "textarea" },
      { name: "monthly_leads", label: "Cantidad de leads mensuales aproximada", type: "text" },
      { name: "conversion_rate", label: "Tasa de conversion aproximada (%)", type: "text" },
      { name: "avg_ticket", label: "Ticket promedio", type: "text" },
      { name: "sales_process", label: "Proceso de ventas: definido o informal? Describilo", type: "textarea" },
      { name: "crm_used", label: "Usan CRM? Cual?", type: "text" },
      { name: "main_objection", label: "Principal objecion de venta que enfrentan", type: "textarea" },
      { name: "ideal_vs_real", label: "Cual es el cliente ideal vs el cliente real?", type: "textarea" },
    ],
  },
  {
    id: "marketing",
    title: "C. Marketing y Comunicacion",
    fields: [
      { name: "digital_presence", label: "Presencia digital: web, redes sociales activas", type: "textarea" },
      { name: "content_frequency", label: "Publican contenido regularmente? Frecuencia", type: "text" },
      { name: "paid_ads", label: "Publicidad paga? En que canales? Budget aproximado", type: "textarea" },
      { name: "brand_positioning", label: "Conocen su posicionamiento de marca? Como lo describirian?", type: "textarea" },
      { name: "nps", label: "NPS o satisfaccion de clientes (si lo miden)", type: "text" },
      { name: "differentiator", label: "Principal diferenciador percibido vs competencia", type: "textarea" },
    ],
  },
  {
    id: "operations",
    title: "D. Diagnostico Operativo",
    fields: [
      { name: "processes_documented", label: "Procesos documentados o todo informal?", type: "textarea" },
      { name: "bottlenecks", label: "Principales cuellos de botella operativos", type: "textarea" },
      { name: "tools", label: "Herramientas que usan (CRM, ERP, gestion, etc.)", type: "textarea" },
      { name: "team_structure", label: "Estructura del equipo (roles principales)", type: "textarea" },
      { name: "time_wasters", label: "Que consume mas tiempo del que deberia?", type: "textarea" },
      { name: "capacity", label: "Capacidad actual vs capacidad maxima", type: "text" },
    ],
  },
  {
    id: "market",
    title: "E. Analisis de Mercado",
    fields: [
      { name: "competitors", label: "Competidores principales (3-5)", type: "textarea" },
      { name: "differentiation", label: "En que se diferencian de ellos segun el cliente?", type: "textarea" },
      { name: "trends", label: "Tendencias del mercado que percibe", type: "textarea" },
      { name: "main_threat", label: "Principal amenaza externa", type: "textarea" },
      { name: "main_opportunity", label: "Principal oportunidad no aprovechada", type: "textarea" },
    ],
  },
  {
    id: "objectives",
    title: "F. Objetivos y Situacion",
    fields: [
      { name: "goals_12m", label: "Que quiere lograr en los proximos 12 meses?", type: "textarea" },
      { name: "past_attempts", label: "Que intentaron antes que no funciono?", type: "textarea" },
      { name: "budget", label: "Presupuesto disponible para marketing/comercial (rangos)", type: "text" },
      { name: "growth_blocker", label: "Principal freno de crecimiento a su criterio", type: "textarea" },
    ],
  },
];

export default function DiagnosticForm({ companyId, existing }: Props) {
  const router = useRouter();
  const [section, setSection] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>(existing?.form_data || {});
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  function updateField(name: string, value: string) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function saveProgress() {
    setSaving(true);
    const res = await fetch("/api/diagnostics/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, formData, diagnosticId: existing?.id }),
    });
    setSaving(false);
    return res.ok;
  }

  async function generateAnalysis() {
    setGenerating(true);
    setError("");

    // Save first
    const saved = await saveProgress();
    if (!saved) {
      setError("Error al guardar. Intenta de nuevo.");
      setGenerating(false);
      return;
    }

    // Generate
    const res = await fetch("/api/apex/generate-diagnostic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error generando diagnostico");
      setGenerating(false);
      return;
    }

    router.refresh();
  }

  const currentSection = SECTIONS[section];
  const progress = ((section + 1) / SECTIONS.length) * 100;

  return (
    <div className="max-w-4xl">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-[#6b7280]">
            Seccion {section + 1} de {SECTIONS.length}
          </p>
          <p className="text-sm text-[#f97316]">{Math.round(progress)}%</p>
        </div>
        <div className="h-2 bg-white rounded-full overflow-hidden">
          <div
            className="h-full bg-[#f97316] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="bg-white border border-[#e5e5e0] rounded-xl p-8">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-black mb-6">
          {currentSection.title}
        </h2>

        <div className="space-y-5">
          {currentSection.fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm text-black mb-2">{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  value={formData[field.name] || ""}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  rows={3}
                  className="w-full bg-[#fafaf7] border border-[#e5e5e0] rounded-lg px-3 py-2 text-black focus:border-[#f97316] focus:ring-1 focus:ring-[#c9a84c] outline-none"
                />
              ) : field.type === "select" ? (
                <select
                  value={formData[field.name] || ""}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  className="w-full bg-[#fafaf7] border border-[#e5e5e0] rounded-lg px-3 py-2 text-black focus:border-[#f97316] outline-none"
                >
                  <option value="">Seleccionar...</option>
                  {field.options?.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData[field.name] || ""}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full bg-[#fafaf7] border border-[#e5e5e0] rounded-lg px-3 py-2 text-black focus:border-[#f97316] outline-none"
                />
              )}
            </div>
          ))}
        </div>

        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#e5e5e0]">
          <button
            type="button"
            onClick={() => setSection(Math.max(0, section - 1))}
            disabled={section === 0}
            className="px-4 py-2 text-[#6b7280] hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          <button
            type="button"
            onClick={saveProgress}
            disabled={saving}
            className="px-4 py-2 text-[#f97316] hover:text-[#e3c670] disabled:opacity-50 text-sm"
          >
            {saving ? "Guardando..." : "Guardar progreso"}
          </button>

          {section < SECTIONS.length - 1 ? (
            <button
              type="button"
              onClick={() => setSection(section + 1)}
              className="px-5 py-2 bg-[#e5e5e0] text-black rounded-lg hover:bg-[#d4d4d0]"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="button"
              onClick={generateAnalysis}
              disabled={generating}
              className="flex items-center gap-2 bg-[#f97316] text-[#0a0a18] font-semibold px-5 py-2 rounded-lg hover:bg-[#ea580c] transition disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Melisa analizando...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generar con Melisa
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
