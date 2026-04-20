import { createClient } from "@/lib/supabase/server";
import OperationsView from "./OperationsView";

export default async function OperationsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const supabase = await createClient();

  const [{ data: plan }, { data: objectives }, { data: operationPlans }] = await Promise.all([
    supabase.from("strategic_plans").select("id").eq("company_id", companyId).maybeSingle(),
    supabase.from("smart_objectives").select("*").eq("company_id", companyId).order("created_at"),
    supabase.from("operation_plans").select("*").eq("company_id", companyId),
  ]);

  return (
    <div className="p-8">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#f1f1f5] mb-2">
        Plan de Operaciones
      </h1>
      <p className="text-[#8b8ba7] mb-8">
        Objetivos SMART y plan operativo para ejecutar la estrategia
      </p>

      <OperationsView
        companyId={companyId}
        hasStrategicPlan={!!plan}
        objectives={objectives || []}
        operationPlans={operationPlans || []}
      />
    </div>
  );
}
