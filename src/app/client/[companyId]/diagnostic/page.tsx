import { createClient, getUserProfile } from "@/lib/supabase/server";
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
  const auth = await getUserProfile();
  const isAdmin = auth?.profile.role === "admin";

  const { data: diagnostic } = await supabase
    .from("diagnostics")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const completed = diagnostic?.status === "completed" && diagnostic.ai_analysis;

  return (
    <div className="p-8">
      <BackButton href={`/client/${companyId}/dashboard`} label="Volver al Dashboard" />
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-black">
          Diagnostico
        </h1>
        <p className="text-[#6b7280] mt-1">
          {completed
            ? "Analisis estrategico realizado por tu consultora"
            : isAdmin
              ? "Completa el diagnostico para que Melisa genere el analisis estrategico"
              : "Tu consultora esta trabajando en el diagnostico. Volve pronto."}
        </p>
      </div>

      {completed ? (
        <DiagnosticResults diagnostic={diagnostic} isAdmin={isAdmin} />
      ) : isAdmin ? (
        <DiagnosticForm companyId={companyId} existing={diagnostic} />
      ) : (
        <div className="bg-white border border-[#e5e5e0] rounded-xl p-12 text-center">
          <p className="text-[#6b7280]">El diagnostico todavia no esta listo.</p>
        </div>
      )}
    </div>
  );
}
