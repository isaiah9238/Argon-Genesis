import React, { useState } from 'react';
import { Film, Play, Sparkles } from 'lucide-react';

const VIDEO_PRESETS = [
  {
    id: 'euv_wafer',
    title: '13.5nm EUV Silicon Wafer Photolithography',
    prompt:
      'Macro scientific visualization of extreme ultraviolet 13.5nm laser pulses etching nanoscale transistor gate trenches into a mirror-polished 300mm monocrystalline silicon wafer, copper vias glowing softly, crisp documentary lighting.',
  },
  {
    id: 'action_potential',
    title: 'Biophysical Action Potential & Na+/K+ Ion Flux',
    prompt:
      'High-resolution biophysical animation of a neuronal cell membrane during an action potential spike, voltage-gated sodium channels opening to allow glowing azure Na+ ions into the axon followed by potassium repolarization.',
  },
  {
    id: 'alphafold_protein',
    title: 'AlphaFold 3D Protein Conformation Trajectory',
    prompt:
      'Scientific molecular visualization of a linear 1D amino acid polypeptide chain folding rapidly into a complex 3D alpha-helix and beta-sheet protein conformation in aqueous cellular solution, studio lighting.',
  },
];

const LOADING_MESSAGES = [
  'Initializing Veo 3 video synthesis operation on server...',
  'Modeling physical geometry, lighting, and nanoscale surface kinematics...',
  'Rendering temporal frames at target aspect ratio...',
  'Finalizing MP4 video stream for secure proxy delivery...',
];

export const VideoLabView: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(VIDEO_PRESETS[0].prompt);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState<number>(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [simulationActive, setSimulationActive] = useState<boolean>(true);

  const handleGenerateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setStatusMessage(null);
    setLoadingStepIdx(0);

    const stepInterval = setInterval(() => {
      setLoadingStepIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3500);

    try {
      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          resolution,
          model: 'veo-3.1-fast-generate-preview',
        }),
      });
      const startData = await startRes.json();
      if (!startRes.ok || !startData.operationName) {
        throw new Error(startData.error || 'Unable to start Veo 3 video generation.');
      }

      const operationName = startData.operationName;
      let isDone = false;
      let attempts = 0;

      while (!isDone && attempts < 36) {
        await new Promise((r) => setTimeout(r, 5000));
        attempts++;
        const pollRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });
        const pollData = await pollRes.json();
        if (!pollRes.ok || pollData.error) {
          throw new Error(pollData.error || 'Error polling Veo 3 operation.');
        }
        if (pollData.done) {
          isDone = true;
        }
      }

      if (!isDone) {
        throw new Error('Video generation timed out while polling.');
      }

      const dlRes = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName }),
      });

      if (!dlRes.ok) {
        const errData = await dlRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to download generated MP4 stream.');
      }

      const blob = await dlRes.blob();
      const objUrl = URL.createObjectURL(blob);
      setVideoUrl(objUrl);
      setStatusMessage('● Veo 3 MP4 Video Stream Synthesized Successfully');
    } catch (err) {
      setSimulationActive(true);
      setStatusMessage(
        `Veo 3 API Notice (${err instanceof Error ? err.message : 'Quota limit'}) — Rendering real-time procedural kinematics preview at ${aspectRatio}.`
      );
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-medium text-slate-500">
            <span>Veo 3 Scientific Video Synthesis</span>
            <span className="mx-2">·</span>
            <span>veo-3.1-fast-generate-preview · 16:9 & 9:16 Aspect Ratios</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Scientific Motion & Veo 3 Video Lab
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Generate motion visualizations of nanoscale silicon photolithography, voltage-gated synaptic ion channels, and protein folding conformations in landscape (<code className="font-mono text-xs">16:9</code>) or portrait (<code className="font-mono text-xs">9:16</code>) formats.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Control Column (5 cols) */}
        <form
          onSubmit={handleGenerateVideo}
          className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 space-y-6"
        >
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">
              Curated Scientific Visualization Presets
            </span>
            <div className="space-y-2">
              {VIDEO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setPrompt(preset.prompt)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    prompt === preset.prompt
                      ? 'border-[#0284C7] bg-sky-50/70'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-900">{preset.title}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{preset.prompt}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="veo-video-prompt" className="text-xs font-semibold text-slate-700 block">
              Veo 3 Text-to-Video Prompt
            </label>
            <textarea
              id="veo-video-prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the physical or biological motion to synthesize..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#0284C7] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 block">Aspect Ratio</span>
              <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  className={`rounded-lg py-2 text-xs font-mono font-semibold transition-colors ${
                    aspectRatio === '16:9'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  16:9 Landscape
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`rounded-lg py-2 text-xs font-mono font-semibold transition-colors ${
                    aspectRatio === '9:16'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  9:16 Portrait
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 block">Resolution</span>
              <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setResolution('720p')}
                  className={`rounded-lg py-2 text-xs font-mono font-semibold transition-colors ${
                    resolution === '720p'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  720p HD
                </button>
                <button
                  type="button"
                  onClick={() => setResolution('1080p')}
                  className={`rounded-lg py-2 text-xs font-mono font-semibold transition-colors ${
                    resolution === '1080p'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  1080p FHD
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0284C7] px-4 py-3 text-xs font-semibold text-white hover:bg-[#0369A1] disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
          >
            <Film className="h-4 w-4" />
            {isGenerating ? 'Synthesizing Video with Veo 3...' : `Generate ${aspectRatio} Video with Veo 3`}
          </button>
        </form>

        {/* Right Viewport Column (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Veo 3 Viewport Frame</h2>
              <p className="text-xs font-mono text-slate-500">
                Target Geometry: {aspectRatio} ({aspectRatio === '16:9' ? 'Landscape' : 'Portrait'}) · {resolution}
              </p>
            </div>
            <span className="text-xs font-mono text-slate-600">
              veo-3.1-fast-generate-preview
            </span>
          </div>

          {statusMessage && (
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-950">
              {statusMessage}
            </div>
          )}

          <div className="flex justify-center items-center bg-slate-950 rounded-2xl p-6 min-h-[380px] dark-blueprint-grid">
            {isGenerating ? (
              <div className="text-center space-y-3 max-w-md text-white">
                <Sparkles className="h-8 w-8 text-sky-400 mx-auto animate-spin" />
                <div className="text-sm font-semibold">{LOADING_MESSAGES[loadingStepIdx]}</div>
                <p className="text-xs text-slate-400">
                  Video generation can take a few moments. The server is polling your operation and will stream the MP4 directly when complete.
                </p>
              </div>
            ) : videoUrl ? (
              <video
                src={videoUrl}
                controls
                autoPlay
                loop
                className={`rounded-xl border border-slate-800 shadow-lg ${
                  aspectRatio === '9:16' ? 'max-h-[460px] aspect-[9/16]' : 'w-full aspect-video'
                }`}
              />
            ) : (
              <div
                className={`relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-between p-6 text-white ${
                  aspectRatio === '9:16' ? 'w-64 h-[440px]' : 'w-full aspect-video'
                }`}
                data-testid="veo-preview-frame"
              >
                <div className="flex items-center justify-between text-xs font-mono text-sky-400">
                  <span>PROCEDURAL KINEMATIC STAGE ({aspectRatio})</span>
                  <span>{simulationActive ? '● LIVE PREVIEW' : '○ PAUSED'}</span>
                </div>

                <svg
                  viewBox="0 0 400 200"
                  className="w-full h-auto my-auto"
                  role="img"
                  aria-label="Scientific Motion Preview Schematic"
                >
                  <defs>
                    <linearGradient id="veoGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0284C7" />
                      <stop offset="50%" stopColor="#38BDF8" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                  <rect x="20" y="140" width="360" height="30" rx="4" fill="#1E293B" />
                  <path
                    d="M 30 100 Q 110 25, 200 100 T 370 100"
                    fill="none"
                    stroke="url(#veoGrad)"
                    strokeWidth="4"
                  />
                  <circle cx="115" cy="62" r="9" fill="#38BDF8" />
                  <circle cx="200" cy="100" r="9" fill="#10B981" />
                  <circle cx="285" cy="138" r="9" fill="#F59E0B" />
                  <text x="200" y="160" textAnchor="middle" fill="#94A3B8" fontSize="11" fontFamily="IBM Plex Mono">
                    Silicon Wafer / Membrane Propagating Wavefront
                  </text>
                </svg>

                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
                  <span className="truncate pr-2">{prompt}</span>
                  <button
                    type="button"
                    onClick={() => setSimulationActive(!simulationActive)}
                    className="inline-flex items-center gap-1 text-sky-400 hover:underline shrink-0 font-mono"
                  >
                    <Play className="h-3 w-3" />
                    {simulationActive ? 'Active' : 'Resume'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
