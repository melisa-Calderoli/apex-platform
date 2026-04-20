import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { companyId, formData, diagnosticId } = await request.json();

  if (diagnosticId) {
    const { error } = await supabase
      .from("diagnostics")
      .update({ form_data: formData, updated_at: new Date().toISOString() })
      .eq("id", diagnosticId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase
      .from("diagnostics")
      .insert({ company_id: companyId, form_data: formData, status: "in_progress" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
