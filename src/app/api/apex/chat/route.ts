import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, buildSystemPrompt, MODEL } from "@/lib/apex";
import type { ClientContext } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY no configurada" },
      { status: 500 }
    );
  }

  const { companyId, messages } = await request.json();

  // Build context
  const [{ data: company }, { data: diagnostic }, { data: strategicPlan }, { data: actions }] =
    await Promise.all([
      supabase.from("companies").select("*").eq("id", companyId).single(),
      supabase
        .from("diagnostics")
        .select("*")
        .eq("company_id", companyId)
        .eq("status", "completed")
        .maybeSingle(),
      supabase.from("strategic_plans").select("*").eq("company_id", companyId).maybeSingle(),
      supabase
        .from("actions")
        .select("*")
        .eq("company_id", companyId)
        .in("status", ["todo", "in_progress", "review", "blocked"]),
    ]);

  if (!company) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  }

  const context: ClientContext = {
    company,
    ...(diagnostic && { diagnostic }),
    ...(strategicPlan && { strategicPlan }),
    ...(actions && actions.length > 0 && { openActions: actions }),
  };

  const anthropic = getAnthropicClient();

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: buildSystemPrompt(context),
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "Respuesta invalida" }, { status: 500 });
    }

    return NextResponse.json({ response: textBlock.text });
  } catch (e) {
    console.error("APEX chat error:", e);
    return NextResponse.json(
      { error: `Error en chat: ${(e as Error).message}` },
      { status: 500 }
    );
  }
}
