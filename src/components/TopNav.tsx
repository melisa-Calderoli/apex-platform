"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  Target,
  ListTodo,
  Kanban,
  MessageSquare,
  LogOut,
  Calendar,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { LogoText } from "./Logo";

interface TopNavProps {
  companyId: string;
  companyName: string;
  userName: string;
  isAdminViewing?: boolean;
}

export default function TopNav({
  companyId,
  companyName,
  userName,
  isAdminViewing,
}: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const baseUrl = `/client/${companyId}`;

  const navItems = [
    { label: "Dashboard", href: `${baseUrl}/dashboard`, icon: LayoutDashboard },
    { label: "Diagnostico", href: `${baseUrl}/diagnostic`, icon: ClipboardCheck },
    { label: "Plan", href: `${baseUrl}/strategic-plan`, icon: Target },
    { label: "Operaciones", href: `${baseUrl}/operations`, icon: Calendar },
    { label: "Tracker", href: `${baseUrl}/tracker`, icon: Kanban },
    { label: "Chat", href: `${baseUrl}/chat`, icon: MessageSquare },
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {isAdminViewing && (
        <div className="bg-[#fff7ed] border-b border-[#fed7aa] px-6 py-2 flex items-center justify-between">
          <p className="text-xs text-[#ea580c]">
            <strong>Vista de admin</strong> — Estás viendo el panel de <strong>{companyName}</strong>
          </p>
          <Link href="/admin/dashboard" className="text-xs text-[#f97316] hover:text-[#ea580c] font-medium">
            ← Volver al panel admin
          </Link>
        </div>
      )}

      <header className="bg-white border-b border-[#e5e5e0] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-6">
          {/* Logo + empresa */}
          <div className="flex items-center gap-4 py-3">
            <LogoText size="sm" />
            <div className="h-6 w-px bg-[#e5e5e0]" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#6b7280] leading-none mb-0.5">
                Empresa
              </p>
              <p className="text-sm font-medium text-black">{companyName}</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors",
                    active
                      ? "bg-[#f97316]/10 text-[#ea580c]"
                      : "text-[#6b7280] hover:bg-[#fafaf7] hover:text-black"
                  )}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#f97316] flex items-center justify-center text-white text-xs font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm text-black hidden lg:block">{userName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-[#6b7280] hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Cerrar sesion"
            >
              <LogOut size={16} />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden border-t border-[#e5e5e0] overflow-x-auto flex gap-1 px-4 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors",
                  active
                    ? "bg-[#f97316]/10 text-[#ea580c]"
                    : "text-[#6b7280] hover:bg-[#fafaf7]"
                )}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
