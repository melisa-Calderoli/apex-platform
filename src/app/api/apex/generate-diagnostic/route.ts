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

  const { companyId } = await request.json();

  // Get company + last diagnostic
  const { data: company } = await supabase.from("companies").select("*").eq("id", companyId).single();
  if (!company) return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });

  const { data: diagnostic } = await supabase
    .from("diagnostics")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!diagnostic) {
    return NextResponse.json({ error: "No hay diagnostico en progreso" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY no configurada. Agrega la variable en .env" },
      { status: 500 }
    );
  }

  const anthropic = getAnthropicClient();

  const userMessage = `Analiza los siguientes datos del diagnostico de la empresa "${company.name}" (industria: ${company.industry || "no especificada"}, tamano: ${company.size || "no especificado"}, mercado: ${company.country || "no especificado"}) y genera un diagnostico ejecutivo completo.

DATOS DEL FORMULARIO:
${JSON.stringify(diagnostic.form_data, null, 2)}

GENERAR RESPUESTA EN JSON VALIDO con esta estructura exacta:
{
  "executive_summary": "parrafo de 4-6 lineas con la situacion real de la empresa",
  "foda": {
    "fortalezas": ["fortaleza 1", "fortaleza 2", "fortaleza 3", "fortaleza 4"],
    "oportunidades": ["oportunidad 1", "oportunidad 2", "oportunidad 3", "oportunidad 4"],
    "debilidades": ["debilidad 1", "debilidad 2", "debilidad 3", "debilidad 4"],
    "amenazas": ["amenaza 1", "amenaza 2", "amenaza 3", "amenaza 4"]
  },
  "key_findings": [
    {"title": "titulo", "impact": "critico/alto/medio", "description": "descripcion"},
    ... (5 hallazgos ordenados por impacto)
  ],
  "opportunities": [
    {"title": "titulo", "description": "descripcion", "actionable": "como aprovecharla"},
    ... (3 oportunidades)
  ],
  "market_analysis": "analisis macro y micro con lo que se sabe",
  "scores": {
    "comercial": {"score": 0-10, "justification": "razon"},
    "marketing": {"score": 0-10, "justification": "razon"},
    "operaciones": {"score": 0-10, "justification": "razon"},
    "marca": {"score": 0-10, "justification": "razon"},
    "digital": {"score": 0-10, "justification": "razon"}
  }
}

RESPONDE SOLO CON EL JSON, SIN TEXTO ADICIONAL.`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: buildSystemPrompt({ company, diagnostic }),
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "Respuesta invalida de APEX" }, { status: 500 });
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith("```json")) jsonText = jsonText.slice(7);
    if (jsonText.startsWith("```")) jsonText = jsonText.slice(3);
    if (jsonText.endsWith("```")) jsonText = jsonText.slice(0, -3);
    jsonText = jsonText.trim();

    const analysis = JSON.parse(jsonText);

    // Save analysis
    const { error } = await supabase
      .from("diagnostics")
      .update({
        ai_analysis: analysis,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", diagnostic.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, analysis });
  } catch (e) {
    console.error("APEX generation error:", e);
    return NextResponse.json(
      { error: `Error generando diagnostico: ${(e as Error).message}` },
      { status: 500 }
    );
  }
}
