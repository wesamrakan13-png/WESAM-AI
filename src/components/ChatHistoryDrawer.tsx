import React, { useState } from 'react';
import {
  History,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
  X,
  Search,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Bot
} from 'lucide-react';
import { ChatSession } from '../types';
import { TranslationDictionary } from '../i18n';

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAllSessions: () => void;
  t: TranslationDictionary;
  dir: 'rtl' | 'ltr';
}

export const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAllSessions,
  t,
  dir
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState<boolean>(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredSessions = sessions.filter(session => {
    const titleMatch = session.title.toLowerCase().includes(searchTerm.toLowerCase());
    const msgMatch = session.messages.some(m => m.text.toLowerCase().includes(searchTerm.toLowerCase()));
    return titleMatch || msgMatch;
  });

  const handleExportSession = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    const formatted = session.messages
      .map(m => `[${m.timestamp}] ${m.sender === 'user' ? '👤 المستخدم' : '🤖 WESAM AI'}:\n${m.text}\n`)
      .join('\n---\n\n');

    navigator.clipboard.writeText(formatted);
    setCopiedSessionId(session.id);
    setTimeout(() => setCopiedSessionId(null), 2500);

    const blob = new Blob([formatted], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WESAM_AI_Chat_${session.title.slice(0, 20).replace(/[^\w\u0600-\u06FF]/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Side-Sheet Drawer Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        dir={dir}
        className={`w-full max-w-[340px] sm:max-w-[380px] bg-[#0c0c10] border-neutral-800 h-full flex flex-col shadow-2xl transition-transform duration-300 ${
          dir === 'rtl'
            ? 'mr-auto border-r rounded-r-none'
            : 'ml-auto border-l rounded-l-none'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-850 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white">
                  {t.historyTitle || "سجل المحادثات"}
                </h3>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                  محفوظ تلقائياً
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                {sessions.length} محادثة محفوظة في الذاكرة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-850 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Primary Action */}
        <div className="p-3 border-b border-neutral-850">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 hover:border-amber-500/50 text-neutral-100 font-bold text-xs flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer group shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-neutral-950 transition">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>محادثة جديدة</span>
            </div>
            <span className="text-[10px] text-neutral-500 group-hover:text-amber-400 font-mono">
              + New
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 py-2 border-b border-neutral-850 bg-neutral-950/40">
          <div className="relative">
            <Search className={`w-3.5 h-3.5 text-neutral-500 absolute top-2.5 ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث في المحادثات..."
              className={`w-full bg-neutral-900 border border-neutral-800 rounded-xl py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 ${
                dir === 'rtl' ? 'pr-8 pl-3' : 'pl-8 pr-3'
              }`}
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-10 px-3">
              <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mx-auto mb-2.5">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-neutral-300">
                {searchTerm ? "لا توجد نتائج مطابقة" : "لا توجد محادثات سابقة"}
              </h4>
              <p className="text-[11px] text-neutral-500 mt-1">
                كل استفساراتك يتم حفظها تلقائياً هنا
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const dateStr = new Date(session.updatedAt || session.createdAt).toLocaleDateString([], {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              const msgCount = session.messages.filter(m => m.sender !== 'system').length;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                    isActive
                      ? "bg-neutral-850 border-amber-500/50 text-white shadow-sm ring-1 ring-amber-500/20"
                      : "bg-neutral-900/40 border-neutral-850/80 text-neutral-300 hover:border-neutral-750 hover:bg-neutral-850/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-amber-400" : "text-neutral-500 group-hover:text-neutral-300"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold truncate group-hover:text-amber-300 transition">
                          {session.title || "محادثة جديدة"}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-0.5">
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span>{msgCount} رسائل</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      title="تصدير المحادثة"
                      onClick={(e) => handleExportSession(session, e)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 transition"
                    >
                      {copiedSessionId === session.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {sessionToDelete === session.id ? (
                      <div className="flex items-center gap-1 bg-red-950/80 border border-red-500/40 p-0.5 rounded-lg">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteSession(session.id);
                            setSessionToDelete(null);
                          }}
                          className="px-1.5 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[9px] font-bold"
                        >
                          حذف
                        </button>
                        <button
                          type="button"
                          onClick={() => setSessionToDelete(null)}
                          className="p-0.5 text-neutral-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        title="حذف المحادثة"
                        onClick={() => setSessionToDelete(session.id)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/30 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-850 bg-neutral-950/80 flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>حفظ سحابي ومحلي دائم</span>
          </div>

          {confirmClearAll ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  onClearAllSessions();
                  setConfirmClearAll(false);
                }}
                className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold"
              >
                تأكيد الكل
              </button>
              <button
                type="button"
                onClick={() => setConfirmClearAll(false)}
                className="p-0.5 text-neutral-400"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            sessions.length > 1 && (
              <button
                type="button"
                onClick={() => setConfirmClearAll(true)}
                className="text-neutral-500 hover:text-red-400 text-[10.5px]"
              >
                مسح الكل
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
