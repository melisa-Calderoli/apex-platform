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
  Building2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { LogoText } from "./Logo";

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

  const baseUrl = role === "admin" ? "/admin" : `/client/${companyId}`;

  const navItems =
    role === "admin"
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
          { label: "Chat", href: `${baseUrl}/chat`, icon: MessageSquare },
        ];

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-64 h-screen bg-white border-r border-[#e5e5e0] flex flex-col fixed left-0 top-0 z-30">
      <div className="p-5 border-b border-[#e5e5e0]">
        <LogoText size="md" />
      </div>

      {companyName && (
        <div className="px-5 py-4 border-b border-[#e5e5e0]">
          <p className="text-[10px] uppercase tracking-wider text-[#6b7280] mb-1 font-medium">
            {role === "admin" ? "Administrador" : "Cliente"}
          </p>
          <p className="text-sm font-medium text-black truncate">{companyName}</p>
        </div>
      )}

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
                  ? "bg-[#f97316]/10 text-[#ea580c] border border-[#f97316]/20"
                  : "text-[#6b7280] hover:bg-[#fafaf7] hover:text-black"
              )}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#e5e5e0]">
        {userName && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#f97316] flex items-center justify-center text-white text-sm font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-black truncate">{userName}</p>
              <p className="text-[10px] uppercase text-[#6b7280]">{role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#6b7280] hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}
