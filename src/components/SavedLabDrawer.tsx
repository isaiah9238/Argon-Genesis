import React, { useState } from 'react';
import { X, LogIn, LogOut, Trash2, Archive } from 'lucide-react';
import { useLab } from '../context/LabContext';

export const SavedLabDrawer: React.FC = () => {
  const {
    user,
    authError,
    experiments,
    notes,
    sessions,
    isDrawerOpen,
    setIsDrawerOpen,
    signInWithGoogle,
    signOut,
    archiveExperiment,
    deleteExperiment,
    deleteResearchNote,
  } = useLab();

  const [activeTab, setActiveTab] = useState<'experiments' | 'notes' | 'sessions'>('experiments');

  if (!isDrawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Research Notebook and Firebase Cloud Persistence"
    >
      <div className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl border-l border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Research Notebook & Cloud Vault</h2>
            <p className="text-xs text-slate-500">
              {user
                ? `Authenticated as ${user.email || user.displayName || 'Researcher'} · Cloud Firestore Active`
                : 'Local Session Active · Sign in with Google to persist across devices'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close Research Notebook"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between gap-4">
          {user ? (
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-slate-700">
                <span className="font-medium text-emerald-700">● Cloud Sync Connected</span>
                <span className="mx-2 text-slate-300">·</span>
                <span className="font-mono">{user.email}</span>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full gap-3">
              <span className="text-xs text-slate-600">
                Connect Google Account to sync snapshots and Gemini syntheses to Firestore.
              </span>
              <button
                type="button"
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0284C7] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0369A1] transition-colors whitespace-nowrap shrink-0"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign In with Google
              </button>
            </div>
          )}
        </div>

        {authError && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 text-xs text-red-700">
            Authentication Notice: {authError}
          </div>
        )}

        <div className="px-6 pt-4 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('experiments')}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'experiments'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Snapshots ({experiments.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'notes'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Research Notes ({notes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sessions')}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'sessions'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chat Threads ({sessions.length})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'experiments' && (
            <>
              {experiments.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">
                  No simulation snapshots saved yet. Use "Save Experiment Snapshot" in the Sandbox.
                </p>
              ) : (
                experiments.map((exp) => (
                  <div
                    key={exp.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">{exp.title}</h3>
                        <div className="text-xs text-slate-500 mt-0.5">
                          <span>{exp.moduleType}</span>
                          <span className="mx-1.5">·</span>
                          <span>{exp.status === 'archived' ? '▲ Archived' : '● Active'}</span>
                          <span className="mx-1.5">·</span>
                          <span>{exp.createdAtLabel}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {exp.status !== 'archived' && (
                          <button
                            type="button"
                            onClick={() => archiveExperiment(exp.id)}
                            aria-label={`Archive '${exp.title}'`}
                            className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                            title="Lock & Archive Snapshot"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteExperiment(exp.id)}
                          aria-label={`Delete '${exp.title}'`}
                          className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete Snapshot"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs font-mono text-slate-700 bg-white border border-slate-200/80 rounded-lg p-2.5">
                      {exp.summary}
                    </p>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'notes' && (
            <>
              {notes.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">
                  No Gemini research syntheses saved yet.
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">{note.topic}</h3>
                        <div className="text-xs text-slate-500 mt-0.5">
                          <span className="font-mono">{note.modelUsed}</span>
                          <span className="mx-1.5">·</span>
                          <span>{note.createdAtLabel}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteResearchNote(note.id)}
                        aria-label={`Delete note '${note.topic}'`}
                        className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'sessions' && (
            <>
              {sessions.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">
                  No multi-turn chat sessions archived yet. Click "Save Thread to Vault" in the Research Chat.
                </p>
              ) : (
                sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">{sess.title}</h3>
                      <span className="text-xs font-mono text-slate-500 tabular-nums">
                        {sess.messageCount} msgs
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      <span>Persona: {sess.persona}</span>
                      <span className="mx-1.5">·</span>
                      <span className="font-mono">{sess.model}</span>
                      <span className="mx-1.5">·</span>
                      <span>{sess.createdAtLabel}</span>
                    </div>
                    <p className="text-xs text-slate-700 line-clamp-3 bg-white border border-slate-200/80 rounded-lg p-2.5">
                      {sess.lastMessagePreview}
                    </p>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
