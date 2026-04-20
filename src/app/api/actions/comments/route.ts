import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const actionId = searchParams.get("actionId");

  const { data, error } = await supabase
    .from("action_comments")
    .select("*")
    .eq("action_id", actionId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data || [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { actionId, content } = await request.json();
  if (!content?.trim()) return NextResponse.json({ error: "Comentario vacio" }, { status: 400 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const { error } = await supabase.from("action_comments").insert({
    action_id: actionId,
    user_id: user.id,
    author_name: profile?.full_name || user.email || "Usuario",
    author_role: profile?.role || "client",
    content: content.trim(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
