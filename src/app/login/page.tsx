"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoText } from "@/components/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, company_id")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "admin") {
        router.push("/admin/dashboard");
      } else if (profile?.company_id) {
        router.push(`/client/${profile.company_id}/dashboard`);
      } else {
        router.push("/");
      }
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf7] relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f97316] opacity-[0.06] blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#fbbf24] opacity-[0.05] blur-3xl rounded-full" />

      <div className="relative w-full max-w-md px-6">
        <div className="bg-white border border-[#e5e5e0] rounded-2xl p-10 shadow-lg">
          <div className="flex items-center justify-center mb-8">
            <LogoText size="lg" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#6b7280] mb-2 font-medium">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#fafaf7] border border-[#e5e5e0] rounded-lg px-4 py-2.5 text-black focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] outline-none transition"
                placeholder="tu@empresa.com"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#6b7280] mb-2 font-medium">
                Contrasena
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#fafaf7] border border-[#e5e5e0] rounded-lg px-4 py-2.5 text-black focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] outline-none transition"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f97316] text-white font-semibold py-2.5 rounded-lg hover:bg-[#ea580c] transition disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-sm"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <p className="text-xs text-[#6b7280] text-center mt-6">
            Plataforma privada. Acceso por invitacion.
          </p>
        </div>
      </div>
    </div>
  );
}
