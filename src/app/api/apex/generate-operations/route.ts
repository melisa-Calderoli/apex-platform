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
    .from("diagnostics").select("*").eq("company_id", companyId).eq("status", "completed").maybeSingle();
  const { data: strategicPlan } = await supabase
    .from("strategic_plans").select("*").eq("company_id", companyId).maybeSingle();

  if (!company || !strategicPlan) {
    return NextResponse.json({ error: "Falta plan estrategico" }, { status: 400 });
  }

  const anthropic = getAnthropicClient();

  const userMessage = `Basandote en el plan estrategico de "${company.name}", genera:
1. Plan operativo para el EQUIPO CONSULTOR (internal): acciones concretas con owner, fecha y prioridad
2. Plan operativo para el EQUIPO DEL CLIENTE (client): acciones claras, sin jerga
3. Objetivos SMART (uno por area estrategica: comercial, marketing, contenido, marca, operaciones)
4. Acciones concretas vinculadas a cada objetivo

RESPONDE SOLO JSON:
{
  "internal_plan": {
    "overview": "resumen del plan interno",
    "actions": [
      {"title": "titulo", "description": "desc", "owner": "rol del equipo", "priority": "high", "sequence": 1}
    ]
  },
  "client_plan": {
    "overview": "resumen del plan cliente",
    "actions": [
      {"title": "titulo", "description": "desc sin jerga", "owner": "quien", "priority": "high"}
    ]
  },
  "objectives": [
    {
      "title": "objetivo",
      "specific": "especifico",
      "measurable": "medible",
      "achievable": "alcanzable",
      "relevant": "relevante",
      "time_bound": "YYYY-MM-DD",
      "kpi": "kpi",
      "target_value": "valor target",
      "owner": "responsable"
    }
  ],
  "actions": [
    {
      "title": "accion concreta",
      "description": "descripcion",
      "owner": "responsable",
      "due_date": "YYYY-MM-DD",
      "priority": "low|medium|high|critical",
      "category": "marketing|comercial|operaciones|marca|contenido",
      "objective_index": 0
    }
  ]
}

SOLO JSON.`;

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
