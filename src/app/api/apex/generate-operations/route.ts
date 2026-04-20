import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, buildSystemPrompt, MODEL } from "@/lib/apex";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

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
    .from("diagnostics").select("*").eq("company_id", companyId).eq("status", "completed").maybeSingle();
  const { data: strategicPlan } = await supabase
    .from("strategic_plans").select("*").eq("company_id", companyId).maybeSingle();

  if (!company || !strategicPlan) {
    return NextResponse.json({ error: "Falta plan estrategico" }, { status: 400 });
  }

  const anthropic = getAnthropicClient();

  const userMessage = `Basandote en el plan estrategico de "${company.name}", genera un plan operativo COMPACTO.

IMPORTANTE: Se breve. Maximo:
- 5 acciones internas (para el equipo consultor)
- 5 acciones cliente
- 5 objetivos SMART (uno por area)
- 10 acciones vinculadas a objetivos

RESPONDE SOLO JSON VALIDO (sin markdown, sin texto extra):
{
  "internal_plan": {
    "overview": "2-3 lineas resumen plan interno",
    "actions": [
      {"title": "titulo corto", "description": "1 linea", "owner": "rol", "priority": "high", "sequence": 1}
    ]
  },
  "client_plan": {
    "overview": "2-3 lineas resumen plan cliente",
    "actions": [
      {"title": "titulo corto", "description": "1 linea sin jerga", "owner": "quien", "priority": "high"}
    ]
  },
  "objectives": [
    {
      "title": "objetivo corto",
      "specific": "1 linea",
      "measurable": "1 linea",
      "achievable": "1 linea",
      "relevant": "1 linea",
      "time_bound": "YYYY-MM-DD",
      "kpi": "nombre kpi",
      "target_value": "valor",
      "owner": "rol"
    }
  ],
  "actions": [
    {
      "title": "accion concreta",
      "description": "1 linea",
      "owner": "rol",
      "due_date": "YYYY-MM-DD",
      "priority": "medium",
      "category": "marketing",
      "objective_index": 0
    }
  ]
}`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: buildSystemPrompt({ company, ...(diagnostic && { diagnostic }), strategicPlan }),
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
    const data = JSON.parse(jsonText.trim());

    // Insert internal and client operation plans
    await supabase.from("operation_plans").insert([
      {
        company_id: companyId,
        strategic_plan_id: strategicPlan.id,
        type: "internal",
        content: data.internal_plan,
      },
      {
        company_id: companyId,
        strategic_plan_id: strategicPlan.id,
        type: "client",
        content: data.client_plan,
      },
    ]);

    // Insert objectives
    const { data: insertedObjectives } = await supabase
      .from("smart_objectives")
      .insert(
        data.objectives.map((o: Record<string, unknown>) => ({
          company_id: companyId,
          plan_id: strategicPlan.id,
          ...o,
        }))
      )
      .select();

    // Insert actions linked to objectives
    if (data.actions && insertedObjectives) {
      await supabase.from("actions").insert(
        data.actions.map((a: { objective_index?: number; [k: string]: unknown }) => {
          const objective = insertedObjectives[a.objective_index ?? 0];
          return {
            company_id: companyId,
            objective_id: objective?.id || null,
            title: a.title,
            description: a.description,
            owner: a.owner,
            due_date: a.due_date,
            priority: a.priority || "medium",
            category: a.category,
            status: "todo",
          };
        })
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("APEX operations error:", e);
    return NextResponse.json(
      { error: `Error generando operaciones: ${(e as Error).message}` },
      { status: 500 }
    );
  }
}
