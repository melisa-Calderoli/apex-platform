import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Check admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const body = await request.json();
  const { company, user: clientUser } = body;

  if (!company?.name || !clientUser?.email || !clientUser?.password) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  // Use service role to create user without email confirmation
  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // 1. Create company
  const { data: newCompany, error: companyError } = await admin
    .from("companies")
    .insert(company)
    .select()
    .single();

  if (companyError || !newCompany) {
    return NextResponse.json(
      { error: `Error creando empresa: ${companyError?.message}` },
      { status: 500 }
    );
  }

  // 2. Create auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: clientUser.email,
    password: clientUser.password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    // Rollback company
    await admin.from("companies").delete().eq("id", newCompany.id);
    return NextResponse.json(
      { error: `Error creando usuario: ${authError?.message}` },
      { status: 500 }
    );
  }

  // 3. Create profile linked to company
  const { error: profileError } = await admin.from("profiles").insert({
    id: authData.user.id,
    company_id: newCompany.id,
    role: "client",
    full_name: clientUser.full_name,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    await admin.from("companies").delete().eq("id", newCompany.id);
    return NextResponse.json(
      { error: `Error creando perfil: ${profileError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ company: newCompany, userId: authData.user.id });
}
