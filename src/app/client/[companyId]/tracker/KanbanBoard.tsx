"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Action } from "@/lib/types";
import { Calendar, User, ChevronRight } from "lucide-react";

const COLUMNS = [
  { id: "todo", label: "Por hacer", color: "border-t-[#6b7280]" },
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
      <div className="flex items-center justify-center h-full bg-white border border-[#e5e5e0] rounded-xl">
        <div className="text-center">
          <p className="text-[#6b7280] mb-2">No hay acciones registradas</p>
          <p className="text-sm text-[#6b7280]">Genera el plan operativo desde el modulo Operaciones</p>
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
            className={`min-w-[280px] flex-1 bg-white rounded-xl border-t-4 ${col.color} flex flex-col`}
          >
            <div className="p-3 border-b border-[#e5e5e0]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-black">{col.label}</h3>
                <span className="text-xs bg-[#fafaf7] px-2 py-0.5 rounded-full text-[#6b7280]">
                  {colActions.length}
                </span>
              </div>
            </div>

            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
              {colActions.length === 0 ? (
                <p className="text-xs text-center text-[#6b7280] py-4">Sin acciones</p>
              ) : (
                colActions.map((action) => (
                  <div
                    key={action.id}
                    draggable
                    onDragStart={() => setDragged(action.id)}
                    className="bg-white rounded-lg p-3 border border-[#e5e5e0] hover:border-[#f97316]/30 transition cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm text-black font-medium line-clamp-2">{action.title}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${PRIORITY_COLORS[action.priority]}`}>
                        {action.priority}
                      </span>
                    </div>

                    {action.description && (
                      <p className="text-xs text-[#6b7280] mb-2 line-clamp-2">{action.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-[#6b7280]">
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
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fafaf7] text-[#f97316] uppercase tracking-wider">
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
