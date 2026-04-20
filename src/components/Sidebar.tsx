"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  ClipboardCheck,
  Target,
  ListTodo,
  Kanban,
  MessageSquare,
  Users,
  LogOut,
  Building2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: "admin" | "client";
  companyId?: string;
  companyName?: string;
  userName?: string;
}

export default function Sidebar({
  role,
  companyId,
  companyName,
  userName,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const baseUrl = role === "admin"
    ? "/admin"
    : `/client/${companyId}`;

  const navItems = role === "admin"
    ? [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Clientes", href: "/admin/clients", icon: Building2 },
      ]
    : [
        { label: "Dashboard", href: `${baseUrl}/dashboard`, icon: LayoutDashboard },
        { label: "Diagnostico", href: `${baseUrl}/diagnostic`, icon: ClipboardCheck },
        { label: "Plan Estrategico", href: `${baseUrl}/strategic-plan`, icon: Target },
        { label: "Operaciones", href: `${baseUrl}/operations`, icon: ListTodo },
        { label: "Tracker", href: `${baseUrl}/tracker`, icon: Kanban },
        { label: "Chat APEX", href: `${baseUrl}/chat`, icon: MessageSquare },
      ];

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-64 h-screen bg-[#14142b] border-r border-[#2a2a4d] flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-5 border-b border-[#2a2a4d]">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#c9a84c] to-[#9e8139] rounded-lg p-2">
            <Sparkles size={20} className="text-[#0a0a18]" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#f1f1f5]">
              APEX
            </h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#c9a84c]">
              Strategic
            </p>
          </div>
        </div>
      </div>

      {/* Company badge */}
      {companyName && (
        <div className="px-5 py-4 border-b border-[#2a2a4d]">
          <p className="text-[10px] uppercase tracking-wider text-[#8b8ba7] mb-1">
            {role === "admin" ? "Administrador" : "Cliente"}
          </p>
          <p className="text-sm font-medium text-[#f1f1f5] truncate">
            {companyName}
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20"
                  : "text-[#8b8ba7] hover:bg-[#1a1a35] hover:text-[#f1f1f5]"
              )}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-[#2a2a4d]">
        {userName && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#9e8139] flex items-center justify-center text-[#0a0a18] text-sm font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#f1f1f5] truncate">{userName}</p>
              <p className="text-[10px] uppercase text-[#8b8ba7]">{role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#8b8ba7] hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}
