"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewClientPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      industry: form.get("industry") as string,
      size: form.get("size") as string,
      country: form.get("country") as string,
      website: form.get("website") as string,
      admin_notes: form.get("admin_notes") as string,
    };

    // Call API route that uses service role key to create user and profile
    const res = await fetch("/api/admin/create-client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: data,
        user: {
          email: form.get("email") as string,
          password: form.get("password") as string,
          full_name: form.get("full_name") as string,
        },
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.error || "Error al crear cliente");
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
  }

  return (
    <div className="p-8 max-w-3xl">
      <Link
        href="/admin/dashboard"
        className="flex items-center gap-2 text-[#6b7280] hover:text-[#f97316] text-sm mb-4"
      >
        <ArrowLeft size={16} />
        Volver
      </Link>

      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-black mb-8">
        Nuevo Cliente
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Datos de la empresa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="name" label="Nombre empresa *" required />
            <FormField name="industry" label="Industria" placeholder="Ej: Construccion, Retail..." />
            <FormField name="size" label="Tamano">
              <select name="size" className={inputCls}>
                <option value="">Seleccionar...</option>
                <option value="1-10">1-10 empleados</option>
                <option value="11-50">11-50 empleados</option>
                <option value="51-200">51-200 empleados</option>
                <option value="201-500">201-500 empleados</option>
                <option value="500+">500+ empleados</option>
              </select>
            </FormField>
            <FormField name="country" label="Pais / Mercado" />
            <FormField name="website" label="Website" type="url" placeholder="https://..." />
          </div>
          <div className="mt-4">
            <label className={labelCls}>Notas internas (solo admin)</label>
            <textarea name="admin_notes" rows={3} className={inputCls} />
          </div>
        </div>

        <div className="bg-white border border-[#e5e5e0] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Usuario del cliente</h2>
          <p className="text-xs text-[#6b7280] mb-4">
            Se crea el usuario para que el cliente acceda a su panel.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="full_name" label="Nombre completo *" required />
            <FormField name="email" label="Email *" type="email" required />
            <FormField name="password" label="Contrasena temporal *" type="password" required />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/dashboard"
            className="px-5 py-2.5 border border-[#e5e5e0] text-[#6b7280] rounded-lg hover:bg-white"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[#f97316] text-[#0a0a18] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#ea580c] transition disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? "Creando..." : "Crear Cliente"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full bg-[#fafaf7] border border-[#e5e5e0] rounded-lg px-3 py-2 text-sm text-black focus:border-[#f97316] focus:ring-1 focus:ring-[#c9a84c] outline-none";
const labelCls = "block text-xs uppercase tracking-wider text-[#6b7280] mb-1.5";

function FormField({
  name,
  label,
  type = "text",
  required,
  placeholder,
  children,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children || (
        <input
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          className={inputCls}
        />
      )}
    </div>
  );
}
