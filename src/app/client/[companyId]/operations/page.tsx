import { createClient, getUserProfile } from "@/lib/supabase/server";
import OperationsView from "./OperationsView";
import BackButton from "@/components/BackButton";

export default async function OperationsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const supabase = await createClient();
  const auth = await getUserProfile();
  const isAdmin = auth?.profile.role === "admin";

  const [{ data: plan }, { data: objectives }, { data: operationPlans }, { data: actions }] = await Promise.all([
    supabase.from("strategic_plans").select("id").eq("company_id", companyId).maybeSingle(),
    supabase.from("smart_objectives").select("*").eq("company_id", companyId).order("created_at"),
    supabase.from("operation_plans").select("*").eq("company_id", companyId),
    supabase.from("actions").select("*").eq("company_id", companyId).order("due_date", { ascending: true }),
  ]);

  return (
    <div className="p-8">
      <BackButton href={`/client/${companyId}/dashboard`} label="Volver al Dashboard" />
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-black mb-2">
        Plan de Operaciones
      </h1>
      <p className="text-[#6b7280] mb-8">
        Objetivos SMART, plan operativo y cronograma del equipo
      </p>

      <OperationsView
        companyId={companyId}
        hasStrategicPlan={!!plan}
        objectives={objectives || []}
        operationPlans={operationPlans || []}
        actions={actions || []}
        isAdmin={isAdmin}
      />
    </div>
  );
}
