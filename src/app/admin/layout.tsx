import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getUserProfile();
  if (!auth) redirect("/login");
  if (auth.profile.role !== "admin") {
    redirect(`/client/${auth.profile.company_id}/dashboard`);
  }

  return (
    <div className="min-h-screen">
      <Sidebar
        role="admin"
        companyName="Panel Admin"
        userName={auth.profile.full_name || auth.user.email || "Admin"}
      />
      <main className="ml-64 min-h-screen">{children}</main>
    </div>
  );
}
