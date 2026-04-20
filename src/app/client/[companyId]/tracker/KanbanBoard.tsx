"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Action } from "@/lib/types";
import { Calendar, User, ChevronRight } from "lucide-react";

const COLUMNS = [
  { id: "todo", label: "Por hacer", color: "border-t-[#8b8ba7]" },
  { id: "in_progress", label: "En progreso", color: "border-t-blue-400" },
  { id: "review", label: "En revision", color: "border-t-purple-400" },
  { id: "done", label: "Completado", color: "border-t-green-400" },
  { id: "blocked", label: "Bloqueado", color: "border-t-red-400" },
];

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-500/20 text-slate-400",
  medium: "bg-blue-500/20 text-blue-400",
  high: "bg-amber-500/20 text-amber-400",
  critical: "bg-red-500/20 text-red-400",
};

export default function KanbanBoard({ actions: initial, companyId: _companyId }: { actions: Action[]; companyId: string }) {
  const [actions, setActions] = useState(initial);
  const [dragged, setDragged] = useState<string | null>(null);
  const supabase = createClient();

  async function moveAction(actionId: string, newStatus: string) {
    setActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status: newStatus as Action["status"] } : a))
    );

    await supabase
      .from("actions")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", actionId);
  }

  if (actions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1a1a35] border border-[#2a2a4d] rounded-xl">
        <div className="text-center">
          <p className="text-[#8b8ba7] mb-2">No hay acciones registradas</p>
          <p className="text-sm text-[#8b8ba7]">Genera el plan operativo desde el modulo Operaciones</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colActions = actions.filter((a) => a.status === col.id);
        return (
          <div
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragged) {
                moveAction(dragged, col.id);
                setDragged(null);
              }
            }}
            className={`min-w-[280px] flex-1 bg-[#14142b] rounded-xl border-t-4 ${col.color} flex flex-col`}
          >
            <div className="p-3 border-b border-[#2a2a4d]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#f1f1f5]">{col.label}</h3>
                <span className="text-xs bg-[#0a0a18] px-2 py-0.5 rounded-full text-[#8b8ba7]">
                  {colActions.length}
                </span>
              </div>
            </div>

            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
              {colActions.length === 0 ? (
                <p className="text-xs text-center text-[#8b8ba7] py-4">Sin acciones</p>
              ) : (
                colActions.map((action) => (
                  <div
                    key={action.id}
                    draggable
                    onDragStart={() => setDragged(action.id)}
                    className="bg-[#1a1a35] rounded-lg p-3 border border-[#2a2a4d] hover:border-[#c9a84c]/30 transition cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm text-[#f1f1f5] font-medium line-clamp-2">{action.title}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${PRIORITY_COLORS[action.priority]}`}>
                        {action.priority}
                      </span>
                    </div>

                    {action.description && (
                      <p className="text-xs text-[#8b8ba7] mb-2 line-clamp-2">{action.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-[#8b8ba7]">
                      {action.owner && (
                        <span className="flex items-center gap-1">
                          <User size={10} />
                          {action.owner}
                        </span>
                      )}
                      {action.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {action.due_date}
                        </span>
                      )}
                    </div>

                    {action.category && (
                      <div className="mt-2 flex">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0a0a18] text-[#c9a84c] uppercase tracking-wider">
                          {action.category}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function _NoopChevron() {
  return <ChevronRight size={12} />;
}
