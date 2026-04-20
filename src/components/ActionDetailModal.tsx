"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Action } from "@/lib/types";
import { X, Send, Loader2, MessageSquare } from "lucide-react";

interface Comment {
  id: string;
  author_name: string;
  author_role: string;
  content: string;
  created_at: string;
}

interface Props {
  action: Action;
  isAdmin: boolean;
  onClose: () => void;
}

const STATUSES = [
  { id: "todo", label: "Pendiente", color: "bg-[#fafaf7] text-[#6b7280]" },
  { id: "in_progress", label: "En progreso", color: "bg-blue-50 text-blue-600" },
  { id: "review", label: "En revision", color: "bg-purple-50 text-purple-600" },
  { id: "done", label: "Completada", color: "bg-green-50 text-green-600" },
  { id: "blocked", label: "Bloqueada", color: "bg-red-50 text-red-600" },
];

export default function ActionDetailModal({ action, isAdmin, onClose }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(action.status);
  const [savingStatus, setSavingStatus] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    loadComments();
  }, []);

  async function loadComments() {
    setLoadingComments(true);
    const res = await fetch(`/api/actions/comments?actionId=${action.id}`);
    const data = await res.json();
    setComments(data.comments || []);
    setLoadingComments(false);
  }

  async function changeStatus(newStatus: string) {
    setSavingStatus(true);
    setStatus(newStatus as typeof status);
    await fetch("/api/actions/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionId: action.id, status: newStatus }),
    });
    setSavingStatus(false);
    router.refresh();
  }

  async function sendComment() {
    if (!newComment.trim() || sendingComment) return;
    setSendingComment(true);
    const res = await fetch("/api/actions/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionId: action.id, content: newComment }),
    });
    setSendingComment(false);
    if (res.ok) {
      setNewComment("");
      loadComments();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#e5e5e0] flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-black mb-1">
              {action.title}
            </h3>
            {action.description && (
              <p className="text-sm text-[#6b7280]">{action.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-[#6b7280]">
              {action.owner && <span>Owner: {action.owner}</span>}
              {action.due_date && <span>• Vence: {action.due_date}</span>}
              {action.category && <span>• {action.category}</span>}
              {action.priority && <span>• Prioridad: {action.priority}</span>}
            </div>
          </div>
          <button onClick={onClose} className="text-[#6b7280] hover:text-black">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#6b7280] mb-2 font-medium">Estado</h4>
            {isAdmin ? (
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => changeStatus(s.id)}
                    disabled={savingStatus}
                    className={`text-xs px-3 py-1.5 rounded-full transition ${
                      status === s.id
                        ? s.color + " ring-2 ring-[#f97316]"
                        : "bg-[#fafaf7] text-[#6b7280] hover:bg-[#e5e5e0]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            ) : (
              <span className={`inline-block text-xs px-3 py-1.5 rounded-full ${
                STATUSES.find((s) => s.id === status)?.color || "bg-[#fafaf7] text-[#6b7280]"
              }`}>
                {STATUSES.find((s) => s.id === status)?.label || status}
              </span>
            )}
          </div>

          {/* Comments */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#6b7280] mb-3 font-medium flex items-center gap-2">
              <MessageSquare size={12} />
              Comentarios ({comments.length})
            </h4>
            <div className="space-y-3 mb-4">
              {loadingComments ? (
                <Loader2 size={20} className="animate-spin text-[#f97316] mx-auto" />
              ) : comments.length === 0 ? (
                <p className="text-sm text-[#6b7280] text-center py-3">No hay comentarios todavia.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="bg-[#fafaf7] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-black">
                        {c.author_name}
                        <span className={`ml-2 text-[10px] uppercase px-2 py-0.5 rounded-full ${
                          c.author_role === "admin" ? "bg-[#f97316]/20 text-[#f97316]" : "bg-blue-100 text-blue-600"
                        }`}>
                          {c.author_role === "admin" ? "Consultor" : "Cliente"}
                        </span>
                      </span>
                      <span className="text-xs text-[#6b7280]">
                        {new Date(c.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm text-black whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* New comment */}
            <div className="flex gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    sendComment();
                  }
                }}
                rows={2}
                placeholder="Agregar comentario..."
                className="flex-1 bg-[#fafaf7] border border-[#e5e5e0] rounded-lg px-3 py-2 text-sm text-black focus:border-[#f97316] outline-none resize-none"
              />
              <button
                onClick={sendComment}
                disabled={!newComment.trim() || sendingComment}
                className="bg-[#f97316] text-white px-4 rounded-lg hover:bg-[#ea580c] disabled:opacity-50 transition self-end py-2"
              >
                {sendingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <p className="text-[10px] text-[#6b7280] mt-1">Ctrl/Cmd + Enter para enviar</p>
          </div>
        </div>
      </div>
    </div>
  );
}
