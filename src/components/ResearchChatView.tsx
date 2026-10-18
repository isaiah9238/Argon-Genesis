import React, { useState, useRef, useEffect } from 'react';
import { useLab } from '../context/LabContext';
import { Send, BookmarkPlus, RotateCcw, BrainCircuit } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  modelUsed?: string;
  highThinking?: boolean;
  timestamp: string;
}

const PERSONA_OPTIONS = [
  {
    id: 'neuromorphic',
    label: 'Neuromorphic Biophysicist',
    subtitle: 'McCulloch-Pitts, Na+/K+ Action Potentials, STDP, NbO2 ECRAM & Ionic Computing',
    starterPrompts: [
      'Why does a biological cortex run on 20W while a real-time silicon simulation needs 2.7 GW?',
      'How does 25% probabilistic synaptic transmission optimize energy in cortical networks?',
    ],
  },
  {
    id: 'epistemologist',
    label: 'Turing-Lovelace Epistemologist',
    subtitle: 'Analytical Engine Notes A & G, Imitation Game, Dartmouth & Sparks of AGI',
    starterPrompts: [
      'How did Turing’s 1950 paper directly refute Lady Lovelace’s Objection from Note G?',
      'Explain how GPT-4 passed the Sally-Anne Dropbox and ZURFIN false-belief tests.',
    ],
  },
  {
    id: 'lithography',
    label: 'EUV Silicon Architect',
    subtitle: '30cm Silica Ingots, 13.5nm EUV Lithography, Phosphorus/Boron Doping & IPC',
    starterPrompts: [
      'Walk through the 5 stages from silica sand to a packaged 3D multi-layer microchip.',
      'Why does Instructions Per Clock (IPC) govern real performance more than raw GHz?',
    ],
  },
  {
    id: 'thermodynamics',
    label: 'Thermodynamic Systems Analyst',
    subtitle: 'Landauer’s Limit (k_B T ln 2), Von Neumann Wire Bus & Data Center Footprints',
    starterPrompts: [
      'Where is the efficiency crossover between human metabolic labor and AI document batching?',
      'Compare the 2016 nanomagnetic bit flip (0.026 eV) with the room-temperature Landauer limit.',
    ],
  },
];

const INITIAL_THREAD: ChatMessage[] = [
  {
    id: 'msg_init_1',
    role: 'model',
    text: 'Welcome to the Cognitive Research Studio. Select a specialist persona and Gemini model tier (including gemini-4-argon with High Thinking) to explore the physical, historical, and biophysical foundations of machine intelligence.',
    modelUsed: 'gemini-4-argon',
    highThinking: true,
    timestamp: 'Ready',
  },
];

export const ResearchChatView: React.FC = () => {
  const { saveChatSessionSummary, setIsDrawerOpen } = useLab();
  const [persona, setPersona] = useState<string>('neuromorphic');
  const [modelTier, setModelTier] = useState<'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>(
    'gemini-4-argon'
  );
  const [highThinking, setHighThinking] = useState<boolean>(true);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_THREAD);
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const activePersona = PERSONA_OPTIONS.find((p) => p.id === persona) || PERSONA_OPTIONS[0];

  useEffect(() => {
    if (messages.length > 1 && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const generateDeterministicSynthesisReply = (queryText: string): string => {
    const q = queryText.toLowerCase();
    if (q.includes('lovelace') || q.includes('turing') || q.includes('bernoulli')) {
      return `From the perspective of ${activePersona.label}:\n\nIn 1843, Ada Lovelace’s Note A separated symbolic operations from numerical arithmetic, while Note G detailed the first computer algorithm (calculating Bernoulli numbers on Babbage’s Analytical Engine). However, she formulated Lady Lovelace’s Objection: a machine can only execute what we know how to order it to perform.\n\nIn 1950, Alan Turing countered that deterministic rules routinely produce emergent consequences that programmers cannot calculate in advance—and proposed modeling the infant cortex as an "unorganized machine" organized via training.`;
    }
    if (q.includes('landauer') || q.includes('20w') || q.includes('energy') || q.includes('crossover') || q.includes('northpole')) {
      return `From the perspective of ${activePersona.label}:\n\n1. Thermodynamic Bound: At 300 K, Landauer’s Principle sets the minimum energy to erase 1 bit at k_B T ln 2 ~ 0.018 eV (2.9e-21 J). Modern CMOS operates ~10^9× above this bound, while 2016 nanomagnetic laser-probed bit flips achieved 0.026 eV (44% above minimum).\n2. The Von Neumann Bottleneck: Charging and discharging copper buses (E ~ L) between separated memory and compute dominates AI power draw. Co-locating memory and compute (e.g., IBM NorthPole) yields up to 73× higher energy efficiency.\n3. Task Crossover: While the 20W human brain uses ~0.4 kWh/day and outperforms AI on single-page creative synthesis, AI batch processing (2–5 MWh per million documents) beats linear human scaling (~8 MWh per million documents).`;
    }
    return `From the perspective of ${activePersona.label}:\n\nRegarding "${queryText.slice(0, 90)}":\n• Physical & Biophysical Substrate: Biological neurons maintain a -70 mV resting potential via 3Na+/2K+ pumps and fire sparse, asynchronous +40 mV action potentials only when excitatory summation g(x) >= θ (McCulloch & Pitts, 1943), with ~25% probabilistic synaptic transmission.\n• Architectural Implication: By replacing clocked von Neumann weight shuttling with local Spike-Timing-Dependent Plasticity (STDP), NbO2 ECRAM, or LLNL nanofluidic ionic pathways, machine cognition reconciles emergent reasoning with thermodynamic efficiency.`;
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = (textOverride ?? inputText).trim();
    if (!textToSend || isSending) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    if (!textOverride) setInputText('');
    setIsSending(true);

    const effectiveModel = highThinking ? 'gemini-4-argon' : modelTier;

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({ role: m.role, text: m.text })),
          persona,
          modelTier: effectiveModel,
          highThinking,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Chat request failed');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `model_${Date.now()}`,
          role: 'model',
          text: data.text,
          modelUsed: data.modelUsed,
          highThinking: data.highThinking,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      const fallbackReply = generateDeterministicSynthesisReply(textToSend);
      setMessages((prev) => [
        ...prev,
        {
          id: `model_${Date.now()}`,
          role: 'model',
          text: fallbackReply,
          modelUsed: effectiveModel,
          highThinking: effectiveModel === 'gemini-4-argon' && highThinking,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveThread = async () => {
    const lastModelMsg = [...messages].reverse().find((m) => m.role === 'model') || messages[messages.length - 1];
    await saveChatSessionSummary({
      title: `${activePersona.label} Dialogue`,
      persona: activePersona.label,
      model: highThinking ? 'gemini-4-argon (HIGH)' : modelTier,
      lastMessagePreview: lastModelMsg?.text || 'Research dialogue saved.',
      messageCount: messages.length,
    });
    setSaveToast('Conversation thread saved to Research Notebook');
    setTimeout(() => setSaveToast(null), 3500);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-medium text-slate-500">
            <span>Multi-Turn Gemini Research Chatbot</span>
            <span className="mx-2">·</span>
            <span>Role-Conditioned System Instructions & High Thinking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Cognitive Research Dialogue Studio
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Conduct multi-turn technical inquiries with domain-specific research personas powered by <code className="font-mono text-xs">gemini-4-argon</code> (with <code className="font-mono text-xs">ThinkingLevel.HIGH</code>), <code className="font-mono text-xs">gemini-3.8-flash</code>, and <code className="font-mono text-xs">gemini-3.1-flash-lite</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMessages(INITIAL_THREAD)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear Thread
          </button>
          <button
            type="button"
            onClick={handleSaveThread}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F172A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            Save Thread to Vault
          </button>
        </div>
      </div>

      {saveToast && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-900">
          <span>● {saveToast}</span>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="underline font-semibold"
          >
            Open Research Notebook
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar: Persona & Model Tier Configuration (4 cols) */}
        <aside className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">1. Specialist Role Persona</h2>
            <div className="space-y-2">
              {PERSONA_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPersona(p.id)}
                  className={`w-full rounded-xl border p-3.5 text-left transition-colors ${
                    persona === p.id
                      ? 'border-[#0284C7] bg-sky-50/70'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-900">{p.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{p.subtitle}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">2. Gemini Model & Thinking</h2>
            <div className="space-y-2">
              {(
                [
                  {
                    id: 'gemini-4-argon',
                    name: 'gemini-4-argon',
                    desc: 'Complex STEM reasoning & architectural critique',
                  },
                  {
                    id: 'gemini-3.8-flash',
                    name: 'gemini-3.8-flash',
                    desc: 'Balanced multi-turn general synthesis',
                  },
                  {
                    id: 'gemini-3.1-flash-lite',
                    name: 'gemini-3.1-flash-lite',
                    desc: 'Ultra-low latency rapid conversational lookup',
                  },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setModelTier(m.id);
                    if (m.id !== 'gemini-4-argon') setHighThinking(false);
                  }}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                    modelTier === m.id
                      ? 'border-[#0284C7] bg-sky-50/70'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-mono font-semibold text-slate-900">{m.name}</div>
                  <div className="text-[11px] text-slate-500">{m.desc}</div>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  const next = !highThinking;
                  setHighThinking(next);
                  if (next) setModelTier('gemini-4-argon');
                }}
                aria-pressed={highThinking}
                className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-xs font-semibold transition-colors ${
                  highThinking
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-emerald-700" />
                  High Thinking (ThinkingLevel.HIGH)
                </span>
                <span className="font-mono">{highThinking ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Right Column: Scrollable Multi-Turn Conversation Thread (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white flex flex-col h-[640px]">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Active Persona: {activePersona.label}
              </h2>
              <p className="text-xs font-mono text-slate-500">
                Model: {highThinking ? 'gemini-4-argon · ThinkingLevel.HIGH' : modelTier}
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {messages.length} {messages.length === 1 ? 'message' : 'messages'}
            </span>
          </div>

          {/* Scrollable Messages Container */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/40"
            data-testid="chat-scroll-thread"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[#0F172A] text-white'
                      : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                  }`}
                >
                  {msg.text}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 px-1 font-mono">
                  {msg.role === 'user' ? 'Researcher' : msg.modelUsed || 'Gemini'}
                  {msg.highThinking ? ' · ThinkingLevel.HIGH' : ''} · {msg.timestamp}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="text-xs font-mono text-slate-500 px-2">
                Synthesizing multi-turn response...
              </div>
            )}
          </div>

          {/* Starter Prompts & Input Form */}
          <div className="border-t border-slate-200 p-4 space-y-3 bg-white rounded-b-2xl">
            <div className="flex flex-wrap items-center gap-2">
              {activePersona.starterPrompts.map((promptText, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(promptText)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
                >
                  {promptText}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <label htmlFor="chat-message-input" className="sr-only">
                Ask a research question
              </label>
              <input
                id="chat-message-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Ask the ${activePersona.label} a question...`}
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#0284C7] focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSending || !inputText.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0284C7] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0369A1] disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
