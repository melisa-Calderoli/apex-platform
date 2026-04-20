import { createClient } from "@/lib/supabase/server";
import DiagnosticForm from "./DiagnosticForm";
import DiagnosticResults from "./DiagnosticResults";
import BackButton from "@/components/BackButton";

export default async function DiagnosticPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const supabase = await createClient();

  const { data: diagnostic } = await supabase
    .from("diagnostics")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="p-8">
      <BackButton href={`/client/${companyId}/dashboard`} label="Volver al Dashboard" />
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-black">
          Diagnostico
        </h1>
        <p className="text-[#6b7280] mt-1">
          Completa el diagnostico para que Melisa genere el analisis estrategico
        </p>
      </div>

      {diagnostic?.status === "completed" && diagnostic.ai_analysis ? (
        <DiagnosticResults diagnostic={diagnostic} />
      ) : (
        <DiagnosticForm companyId={companyId} existing={diagnostic} />
      )}
    </div>
  );
}
