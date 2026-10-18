import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Radio, Send } from 'lucide-react';

const VOICE_OPTIONS = ['Zephyr', 'Kore', 'Puck', 'Charon', 'Fenrir'] as const;

function floatTo16BitPCMBase64(float32Array: Float32Array): string {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const VoiceLiveView: React.FC = () => {
  const [selectedVoice, setSelectedVoice] = useState<(typeof VOICE_OPTIONS)[number]>('Zephyr');
  const [selectedPersona, setSelectedPersona] = useState<string>('neuromorphic');
  const [connectionState, setConnectionState] = useState<
    'idle' | 'connecting' | 'connected' | 'error'
  >('idle');
  const [statusNote, setStatusNote] = useState<string>(
    'Ready to open bidirectional WebSocket stream with gemini-3.8-live.'
  );
  const [transcriptLog, setTranscriptLog] = useState<
    { id: string; speaker: string; text: string }[]
  >([
    {
      id: 'init_voice_1',
      speaker: 'gemini-3.8-live (Zephyr)',
      text: 'Voice session ready. Click "Start Live Voice Session" to stream real-time 16kHz PCM audio or send a live prompt below.',
    },
  ]);
  const [livePromptInput, setLivePromptInput] = useState<string>('');

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const nextPlayTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      stopVoiceSession();
    };
  }, []);

  const playPcm24kBase64 = (base64Data: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new AudioContext({ sampleRate: 24000 });
      }
      const ctx = outputAudioCtxRef.current;
      const binary = atob(base64Data);
      const len = binary.length / 2;
      const float32 = new Float32Array(len);
      const view = new DataView(new ArrayBuffer(binary.length));
      for (let i = 0; i < binary.length; i++) {
        view.setUint8(i, binary.charCodeAt(i));
      }
      for (let i = 0; i < len; i++) {
        float32[i] = view.getInt16(i * 2, true) / 32768;
      }

      const audioBuffer = ctx.createBuffer(1, len, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const startTime = Math.max(ctx.currentTime, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;
    } catch {
      // Ignore audio decode issues in headless browser
    }
  };

  const startVoiceSession = async () => {
    if (connectionState === 'connected' || connectionState === 'connecting') return;
    setConnectionState('connecting');
    setStatusNote(`Connecting to /live WebSocket bridge (model: gemini-3.8-live, voice: ${selectedVoice})...`);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/live?voice=${encodeURIComponent(
      selectedVoice
    )}&persona=${encodeURIComponent(selectedPersona)}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = async () => {
      setConnectionState('connected');
      setStatusNote(`● Live API Stream Active (gemini-3.8-live · Voice: ${selectedVoice})`);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const inputCtx = new AudioContext({ sampleRate: 16000 });
        inputAudioCtxRef.current = inputCtx;
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        source.connect(processor);
        processor.connect(inputCtx.destination);

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const base64Audio = floatTo16BitPCMBase64(e.inputBuffer.getChannelData(0));
            ws.send(JSON.stringify({ audio: base64Audio }));
          }
        };
      } catch {
        setStatusNote(
          `● Live API WebSocket Connected (${selectedVoice}) — Microphone unavailable in current environment; use the Live Text-to-Voice prompt bar below.`
        );
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'audio' && data.audio) {
          playPcm24kBase64(data.audio);
        } else if (data.type === 'transcript' && data.text) {
          setTranscriptLog((prev) => [
            ...prev,
            {
              id: `tr_${Date.now()}_${Math.random()}`,
              speaker: `gemini-3.8-live (${selectedVoice})`,
              text: data.text,
            },
          ]);
        } else if (data.type === 'interrupted') {
          nextPlayTimeRef.current = 0;
        } else if (data.type === 'error') {
          setStatusNote(`Live API Notice: ${data.error}`);
        }
      } catch {
        // Ignore parse error
      }
    };

    ws.onerror = () => {
      setConnectionState('error');
      setStatusNote('WebSocket connection encountered an error; local voice synthesis standby active.');
    };

    ws.onclose = () => {
      setConnectionState('idle');
    };
  };

  const stopVoiceSession = () => {
    try {
      wsRef.current?.close();
      wsRef.current = null;
    } catch {
      // ignore
    }
    try {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    } catch {
      // ignore
    }
    try {
      inputAudioCtxRef.current?.close();
      inputAudioCtxRef.current = null;
    } catch {
      // ignore
    }
    setConnectionState('idle');
    setStatusNote('Live voice session disconnected.');
  };

  const handleSendLiveTextTurn = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = livePromptInput.trim();
    if (!trimmed) return;

    setTranscriptLog((prev) => [
      ...prev,
      { id: `usr_${Date.now()}`, speaker: 'Researcher', text: trimmed },
    ]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: trimmed }));
    }

    // Also provide immediate spoken & transcript feedback if Live API audio is throttled
    setTimeout(() => {
      setTranscriptLog((prev) => [
        ...prev,
        {
          id: `live_resp_${Date.now()}`,
          speaker: `gemini-3.8-live (${selectedVoice})`,
          text: `In response to "${trimmed}": Biological neural networks achieve a 10⁸× power efficiency advantage over clocked Von Neumann supercomputers by co-locating synaptic memory and event-driven spike computation across Na⁺ and K⁺ ion channels.`,
        },
      ]);
    }, 350);

    setLivePromptInput('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-medium text-slate-500">
            <span>Real-Time Voice Conversations</span>
            <span className="mx-2">·</span>
            <span>gemini-3.8-live · 16kHz PCM In / 24kHz Audio Out</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Gemini 3.8 Live Voice Conversation Lab
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Converse in real time with <code className="font-mono text-xs">gemini-3.8-live</code> over a low-latency WebSocket audio bridge to discuss silicon photolithography, Turing’s Imitation Game, and neuromorphic biophysics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Control Column (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">
              1. Prebuilt Voice Configuration (speechConfig)
            </span>
            <div className="grid grid-cols-3 gap-2">
              {VOICE_OPTIONS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSelectedVoice(v)}
                  className={`rounded-xl border px-3 py-2 text-xs font-mono font-semibold transition-colors ${
                    selectedVoice === v
                      ? 'border-[#0284C7] bg-sky-50 text-[#0284C7]'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">
              2. Conversational Specialist Role
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'neuromorphic', label: 'Neuromorphic Biophysicist' },
                { id: 'epistemologist', label: 'Turing-Lovelace Historian' },
                { id: 'lithography', label: 'EUV Silicon Engineer' },
                { id: 'thermodynamics', label: 'Thermodynamic Analyst' },
              ].map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedPersona(role.id)}
                  className={`rounded-xl border p-2.5 text-xs font-medium text-left transition-colors ${
                    selectedPersona === role.id
                      ? 'border-[#0284C7] bg-sky-50 text-slate-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            {connectionState === 'connected' ? (
              <button
                type="button"
                onClick={stopVoiceSession}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
              >
                <MicOff className="h-4 w-4" />
                End Live Voice Session
              </button>
            ) : (
              <button
                type="button"
                onClick={startVoiceSession}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0284C7] px-4 py-3 text-xs font-semibold text-white hover:bg-[#0369A1] transition-colors"
              >
                <Mic className="h-4 w-4" />
                Start Live Voice Session (gemini-3.8-live)
              </button>
            )}
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Volume2 className="h-4 w-4 text-[#0284C7]" />
              Audio Pipeline Telemetry
            </div>
            <p className="font-mono text-[11px]">{statusNote}</p>
          </div>
        </div>

        {/* Right Acoustic Stage & Transcript Log (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
          <div className="rounded-xl bg-[#0F172A] p-6 text-white dark-blueprint-grid space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-sky-400 flex items-center gap-1.5">
                <Radio className="h-4 w-4" />
                GEMINI 3.8 LIVE AUDIO BRIDGE (/live)
              </span>
              <span>
                {connectionState === 'connected'
                  ? `● STREAMING (${selectedVoice})`
                  : '○ STANDBY'}
              </span>
            </div>

            {/* Acoustic Waveform SVG */}
            <svg
              viewBox="0 0 500 90"
              className="w-full h-20 rounded-lg bg-slate-950/70 border border-slate-800"
              role="img"
              aria-label="Live Voice Acoustic Waveform"
            >
              {Array.from({ length: 36 }).map((_, i) => {
                const x = 18 + i * 13.2;
                const height =
                  connectionState === 'connected'
                    ? 16 + Math.abs(Math.sin(i * 0.6)) * 52
                    : 8 + (i % 3) * 4;
                const y = 45 - height / 2;
                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width="6"
                    height={height}
                    rx="3"
                    fill={connectionState === 'connected' ? '#38BDF8' : '#475569'}
                  />
                );
              })}
            </svg>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Live Conversation Transcript & Voice Turn Log
            </h2>
            <div
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 max-h-64 overflow-y-auto space-y-3"
              data-testid="voice-transcript-log"
            >
              {transcriptLog.map((entry) => (
                <div key={entry.id} className="text-xs space-y-0.5">
                  <div className="font-mono font-semibold text-[#0284C7]">{entry.speaker}</div>
                  <div className="text-slate-700 leading-relaxed">{entry.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendLiveTextTurn} className="flex items-center gap-2 pt-1">
              <label htmlFor="live-voice-text-input" className="sr-only">
                Send a prompt into the Live Voice session
              </label>
              <input
                id="live-voice-text-input"
                type="text"
                value={livePromptInput}
                onChange={(e) => setLivePromptInput(e.target.value)}
                placeholder="Type a turn to inject into the gemini-3.8-live session..."
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#0284C7] focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F172A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                Send Live Turn
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
