import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, buildSystemPrompt, MODEL } from "@/lib/apex";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Solo admin puede generar" }, { status: 403 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY no configurada" }, { status: 500 });
  }

  const { companyId } = await request.json();

  const { data: company } = await supabase.from("companies").select("*").eq("id", companyId).single();
  const { data: diagnostic } = await supabase
    .from("diagnostics")
    .select("*")
    .eq("company_id", companyId)
    .eq("status", "completed")
    .maybeSingle();

  if (!company || !diagnostic) {
    return NextResponse.json({ error: "Falta diagnostico completo" }, { status: 400 });
  }

  const anthropic = getAnthropicClient();

  const userMessage = `Basandote en el diagnostico completo de "${company.name}", genera el plan estrategico integral.

RESPONDE SOLO EN JSON VALIDO con esta estructura:
{
  "positioning": "donde debe jugar la empresa y como ganar, 5-8 lineas de estrategia clara",
  "segmentation": "quien es el cliente ideal real (no el que creen), con criterios demograficos, psicograficos y conductuales",
  "value_proposition": "como debe comunicar lo que hace, con framing claro",
  "strategies": {
    "comercial": "estrategia comercial y de ventas detallada",
    "marketing": "estrategia de marketing y comunicacion",
    "content": "estrategia de contenido y redes sociales",
    "brand": "estrategia de marca",
    "operations": "estrategia operativa"
  },
  "competitive_analysis": "analisis competitivo con posicionamiento vs cada competidor principal",
  "roadmap": {
    "phase_1": {"period": "0-3 meses", "focus": "foco principal", "actions": ["accion 1", "accion 2", "accion 3", "accion 4", "accion 5"]},
    "phase_2": {"period": "3-6 meses", "focus": "foco principal", "actions": ["accion 1", "accion 2", "accion 3", "accion 4", "accion 5"]},
    "phase_3": {"period": "6-12 meses", "focus": "foco principal", "actions": ["accion 1", "accion 2", "accion 3", "accion 4", "accion 5"]}
  },
  "kpis": [
    {"name": "nombre KPI", "target": "valor objetivo", "rationale": "por que este KPI"},
    ... (8-10 KPIs)
  ]
}

SOLO JSON, SIN TEXTO EXTRA.`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: buildSystemPrompt({ company, diagnostic }),
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "Respuesta invalida" }, { status: 500 });
    }

    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith("```json")) jsonText = jsonText.slice(7);
    if (jsonText.startsWith("```")) jsonText = jsonText.slice(3);
    if (jsonText.endsWith("```")) jsonText = jsonText.slice(0, -3);
    jsonText = jsonText.trim();

    const content = JSON.parse(jsonText);

    const { data: newPlan, error } = await supabase
      .from("strategic_plans")
      .insert({
        company_id: companyId,
        diagnostic_id: diagnostic.id,
        content,
        status: "active",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, plan: newPlan });
  } catch (e) {
    console.error("APEX plan error:", e);
    return NextResponse.json(
      { error: `Error generando plan: ${(e as Error).message}` },
      { status: 500 }
    );
  }
}
