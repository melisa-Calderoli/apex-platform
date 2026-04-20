"use client";

interface PlanAction {
  title: string;
  description?: string;
  owner?: string;
  priority?: string;
  sequence?: number;
}

interface PlanContent {
  overview?: string;
  actions?: PlanAction[];
}

export default function OperationalPlanView({ content, type }: { content: unknown; type: "internal" | "client" }) {
  const plan = content as PlanContent;

  if (!plan || typeof plan !== "object") {
    return (
      <div className="bg-white border border-[#e5e5e0] rounded-xl p-12 text-center">
        <p className="text-[#6b7280]">No hay plan {type === "internal" ? "interno" : "del cliente"} disponible.</p>
      </div>
    );
  }

  const priorityColor: Record<string, string> = {
    critical: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-700",
    medium: "bg-blue-100 text-blue-700",
    low: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="space-y-6">
      {plan.overview && (
        <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
          <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#f97316] mb-3">
            {type === "internal" ? "Plan para el Equipo Consultor" : "Plan del Cliente"}
          </h3>
          <p className="text-black leading-relaxed whitespace-pre-wrap">{plan.overview}</p>
        </div>
      )}

      {plan.actions && plan.actions.length > 0 && (
        <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
          <h3 className="font-medium text-black mb-4">
            Acciones ({plan.actions.length})
          </h3>
          <div className="space-y-3">
            {plan.actions.map((action, i) => (
              <div key={i} className="flex gap-3 p-4 bg-[#fafaf7] rounded-lg border-l-2 border-[#f97316]">
                <span className="text-[#f97316] font-bold shrink-0">{action.sequence || i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-medium text-black">{action.title}</p>
                    {action.priority && (
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${priorityColor[action.priority.toLowerCase()] || "bg-slate-100 text-slate-600"}`}>
                        {action.priority}
                      </span>
                    )}
                  </div>
                  {action.description && (
                    <p className="text-sm text-[#6b7280] mb-2">{action.description}</p>
                  )}
                  {action.owner && (
                    <p className="text-xs text-[#6b7280]">
                      Responsable: <span className="text-black font-medium">{action.owner}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!plan.overview && !plan.actions && (
        <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
          <pre className="text-sm text-black whitespace-pre-wrap font-sans leading-relaxed">
            {JSON.stringify(plan, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
