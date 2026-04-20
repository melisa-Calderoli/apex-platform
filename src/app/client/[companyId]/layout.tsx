import { redirect, notFound } from "next/navigation";
import { createClient, getUserProfile } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const auth = await getUserProfile();
  if (!auth) redirect("/login");

  // Check access: admin can see any, client only their own
  if (auth.profile.role !== "admin" && auth.profile.company_id !== companyId) {
    redirect(`/client/${auth.profile.company_id}/dashboard`);
  }

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .single();

  if (!company) notFound();

  return (
    <div className="min-h-screen">
      <Sidebar
        role={auth.profile.role}
        companyId={companyId}
        companyName={company.name}
        userName={auth.profile.full_name || auth.user.email || "Usuario"}
      />
      <main className="ml-64 min-h-screen">{children}</main>
    </div>
  );
}
