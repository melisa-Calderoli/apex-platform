import { createClient } from "@/lib/supabase/server";
import StrategicPlanView from "./StrategicPlanView";

export default async function StrategicPlanPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const supabase = await createClient();

  const [{ data: diagnostic }, { data: plan }] = await Promise.all([
    supabase
      .from("diagnostics")
      .select("id")
      .eq("company_id", companyId)
      .eq("status", "completed")
      .maybeSingle(),
    supabase
      .from("strategic_plans")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <div className="p-8">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-black mb-2">
        Plan Estrategico
      </h1>
      <p className="text-[#6b7280] mb-8">
        Estrategia integral generada por APEX a partir del diagnostico
      </p>

      <StrategicPlanView
        companyId={companyId}
        plan={plan}
        hasDiagnostic={!!diagnostic}
      />
    </div>
  );
}
