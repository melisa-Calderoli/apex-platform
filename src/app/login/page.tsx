"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a18] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a18] via-[#14142b] to-[#0a0a18]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#c9a84c] opacity-[0.03] blur-3xl rounded-full" />

      <div className="relative w-full max-w-md px-6">
        <div className="bg-[#1a1a35] border border-[#2a2a4d] rounded-2xl p-10 shadow-2xl">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[#c9a84c] to-[#9e8139] rounded-xl p-2.5">
                <Sparkles size={24} className="text-[#0a0a18]" />
              </div>
              <div>
                <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#f1f1f5]">
                  APEX
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a84c]">
                  Strategic Platform
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#8b8ba7] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0a0a18] border border-[#2a2a4d] rounded-lg px-4 py-2.5 text-[#f1f1f5] focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] outline-none transition"
                placeholder="tu@empresa.com"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#8b8ba7] mb-2">
                Contrasena
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#0a0a18] border border-[#2a2a4d] rounded-lg px-4 py-2.5 text-[#f1f1f5] focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] outline-none transition"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#c9a84c] to-[#9e8139] text-[#0a0a18] font-semibold py-2.5 rounded-lg hover:from-[#e3c670] hover:to-[#c9a84c] transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <p className="text-xs text-[#8b8ba7] text-center mt-6">
            Plataforma privada. Acceso por invitacion.
          </p>
        </div>
      </div>
    </div>
  );
}
