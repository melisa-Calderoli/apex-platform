import { createClient } from "@/lib/supabase/server";
import KanbanBoard from "./KanbanBoard";
import BackButton from "@/components/BackButton";

export default async function TrackerPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const supabase = await createClient();

  const { data: actions } = await supabase
    .from("actions")
    .select("*")
    .eq("company_id", companyId)
    .order("priority", { ascending: false })
    .order("due_date", { ascending: true });

  return (
    <div className="p-8 h-screen flex flex-col">
      <BackButton href={`/client/${companyId}/dashboard`} label="Volver al Dashboard" />
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-black">
          Tracker
        </h1>
        <p className="text-[#6b7280] mt-1">
          Seguimiento de acciones del plan
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard actions={actions || []} companyId={companyId} />
      </div>
    </div>
  );
}
