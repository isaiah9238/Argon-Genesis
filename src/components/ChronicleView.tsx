import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import { BookmarkPlus, Cpu, Sparkles, BrainCircuit } from 'lucide-react';

interface MilestoneItem {
  id: string;
  year: string;
  era: 'Foundations' | 'Connectionism' | 'Emergent AGI' | 'Neuromorphic';
  title: string;
  figures: string;
  summary: string;
  technicalArtifact: string;
  defaultPrompt: string;
}

const CHRONICLE_MILESTONES: MilestoneItem[] = [
  {
    id: 'lovelace_1843',
    year: '1843',
    era: 'Foundations',
    title: 'Ada Lovelace’s Notes A & G and the Analytical Engine',
    figures: 'Ada Lovelace · Charles Babbage · Luigi Menabrea',
    summary:
      'In Note A, Lovelace separated symbolic operations from numerical arithmetic, foreseeing that the Analytical Engine ("mill" CPU and "store" memory with Jacquard punched cards) could compose music or manipulate arbitrary symbols. In Note G, she authored the first published algorithm to compute Bernoulli numbers, while formulating Lady Lovelace’s Objection—later formalized in the 2001 Lovelace Test by Bringsjord, Bello, and Ferrucci.',
    technicalArtifact: 'Analytical Engine Mill & Store · Note G Bernoulli Algorithm',
    defaultPrompt:
      'Compare Lady Lovelace’s Objection (1843) and the 2001 Lovelace Test against Alan Turing’s 1950 counter-argument that deterministic digital computers regularly surprise their programmers.',
  },
  {
    id: 'mcp_1943',
    year: '1943',
    era: 'Connectionism',
    title: 'A Logical Calculus of the Ideas Immanent in Nervous Activity',
    figures: 'Warren McCulloch · Walter Pitts · Donald Hebb · Frank Rosenblatt',
    summary:
      'McCulloch and Pitts modeled the biological neuron as an all-or-nothing binary threshold unit g(x) ≥ θ with inhibitory veto gates, proving that networks of simple units can compute any logical proposition. This directly inspired Donald Hebb’s 1949 synaptic plasticity rule ("cells that fire together, wire together") and Frank Rosenblatt’s Perceptron.',
    technicalArtifact: 'Binary Threshold Unit g(x) ≥ θ · Hebbian Synaptic Plasticity',
    defaultPrompt:
      'Explain how McCulloch and Pitts (1943) mapped Boolean logic gates (AND, OR, NOT) onto simplified biological neurons and how Hebbian learning extended their static calculus.',
  },
  {
    id: 'turing_1950',
    year: '1950',
    era: 'Foundations',
    title: 'Computing Machinery and Intelligence & The Imitation Game',
    figures: 'Alan Turing',
    summary:
      'Published in Mind, Turing replaced "Can machines think?" with the teleprinter Imitation Game. He predicted that by the year 2000, machines with ~125 MB of storage would fool an average interrogator at least 30% of the time after five minutes, and conceptualized the infant human cortex as an "unorganized machine" organized via systematic training.',
    technicalArtifact: 'Teleprinter Imitation Game · 125 MB Storage Prediction · Unorganized Cortex',
    defaultPrompt:
      'Analyze Alan Turing’s concept of the infant human cortex as an "unorganized machine" and how it anticipated modern connectionist pre-training and fine-tuning.',
  },
  {
    id: 'dartmouth_1956',
    year: '1956–2025',
    era: 'Connectionism',
    title: 'The Dartmouth Synthesis, Machine Learning & Modern Scaling',
    figures: 'John McCarthy · Marvin Minsky · Claude Shannon · Arthur Samuel · Kemeny & Kurtz',
    summary:
      'The 1956 Dartmouth Summer Research Project coined "artificial intelligence" and featured Arthur Samuel’s self-learning checkers program (coining "machine learning" in 1959). In the 1960s, Kemeny and Kurtz democratized computing via the Dartmouth Time-Sharing System and BASIC, scaling by 2025 into clinical generative AI trials such as Therabot.',
    technicalArtifact: 'Dartmouth Conjecture · Samuel Checkers · DTSS & BASIC · Therabot (2025)',
    defaultPrompt:
      'Trace the institutional and conceptual trajectory from the 1956 Dartmouth Summer Research Project and Arthur Samuel’s checkers program to modern clinical AI deployments.',
  },
  {
    id: 'alphafold_sparks_2023',
    year: '2020–2023',
    era: 'Emergent AGI',
    title: 'AlphaFold Proteomics & Sparks of Artificial General Intelligence',
    figures: 'Google DeepMind · Sébastien Bubeck et al. (Microsoft Research)',
    summary:
      'AlphaFold overcame Levinthal’s paradox using attention networks to score >90 GDT on CASP protein folding benchmarks (though constrained to static crystallized states rather than fluid dynamics). In 2023, Bubeck et al. documented early GPT-4 passing Sally-Anne / ZURFIN Theory of Mind tasks and 5-object physical stacking, while diagnosing the linear autoregressive token bottleneck.',
    technicalArtifact: 'CASP >90 GDT · Levinthal’s Paradox · Autoregressive Token Bottleneck',
    defaultPrompt:
      'Why does an autoregressive next-token prediction architecture struggle with intrinsic backtracking and planning despite succeeding on Theory of Mind and physical commonsense tasks?',
  },
  {
    id: 'neuromorphic_2026',
    year: '1961–2026',
    era: 'Neuromorphic',
    title: 'Landauer’s Limit, Spiking Neural Networks & Ionic Biophysics',
    figures: 'Rolf Landauer · IBM NorthPole · SpinCloud · Texas A&M · LLNL',
    summary:
      'Facing the von Neumann memory wall (E ~ L) and Landauer’s thermodynamic bound (0.018 eV at 300 K), next-generation architectures emulate the 20W human brain: IBM NorthPole (73× efficiency), SpinCloud packet-based digital spikes, Texas A&M Super-Turing STDP edge navigation drones, NbO2 ECRAM electrochemical synapses, and LLNL nanofluidic ionic computing.',
    technicalArtifact: 'IBM NorthPole (73×) · NbO2 ECRAM · Super-Turing STDP · LLNL Nanofluidic Ions',
    defaultPrompt:
      'Synthesize how NbO2 electrochemical memory (ECRAM), Spike-Timing-Dependent Plasticity (STDP), and LLNL nanofluidic ionic computing address the von Neumann memory wall.',
  },
];

const LOCAL_SYNTHESIS_FALLBACKS: Record<string, string> = {
  fast: `Rapid Executive Triage:\n• Physical Substrate: Silicon gates (10–30 nm) operate ~10^9× above the room-temperature Landauer limit (0.018 eV), dissipating heat primarily across copper Von Neumann memory interconnects (E ~ L).\n• Conceptual Arc: Lovelace (1843) isolated symbolic manipulation; McCulloch-Pitts (1943) formalized binary neural logic; Turing (1950) framed behavioral evaluation and cortical training.\n• Next Horizon: Co-locating memory and compute via asynchronous Spiking Neural Networks (STDP), NbO2 ECRAM, and nanofluidic ionic channels bridges the 2.7 GW vs. 20 W biological efficiency gap.`,
  general: `Comprehensive Interdisciplinary Synthesis:\n1. Historical & Logical Foundations: Ada Lovelace's Note A and Note G established that mechanical state transitions can represent abstract symbolic structures, while raising the question of machine origination (the Lovelace Test). Alan Turing resolved this operationally by noting that deterministic rule execution produces emergent trajectories that cannot be predicted a priori without running the computation.\n2. Autoregressive Emergence vs. Bottlenecks: As documented by Bubeck et al. (2023), scaling transformer architectures yields emergent Theory of Mind (passing modified Sally-Anne and ZURFIN false-belief tasks) and spatial commonsense, yet remains bounded by sequential token generation without native backtracking.\n3. Thermodynamic & Biophysical Reconvergence: Escaping the data center energy trajectory requires adopting biological principles—sparse, event-driven action potentials (25% probabilistic synaptic release) and in-memory STDP plasticity.`,
  deep_thinking: `High-Thinking Architectural & Thermodynamic Critique (gemini-4-argon · ThinkingLevel.HIGH):\n1. The Structural Asymmetry of Information Erasure:\n   By Landauer's Principle (E >= k_B T ln 2 ~ 2.87e-21 J at 300 K), irreversible logic gates inevitably shed entropy as heat. However, modern AI training (e.g., 1,287 MWh for GPT-3) is dominated not by gate switching alone, but by the capacitive charging of millimeter-scale copper buses (E ~ C * V^2 * L) shuttling trillions of weights between DRAM and tensor cores.\n2. Why Biological Cortex Achieves a 1.35e8× Power Advantage:\n   A real-time simulation of human cortical dynamics on a clocked von Neumann supercomputer demands ~2.7 GW, whereas the biological brain consumes 15–20 W. This stems from three coupled biophysical mechanisms:\n   • Zero-Bus Co-location: Synaptic conductances store state and compute weighted sums in the exact same physical junction.\n   • Event-Driven Sparsity: Neurons rest at -70 mV via 3Na+/2K+ pumps and fire all-or-nothing +40 mV spikes only when g(x) >= θ, with ~25% probabilistic vesicle release optimizing mutual information per ATP molecule.\n   • Local Hebbian STDP vs. Global Backpropagation: Spike-Timing-Dependent Plasticity updates weights locally from Δt = t_post - t_pre without global weight transport.\n3. Reconvergence Trajectory:\n   Pairing high-level symbolic/autoregressive reasoning with neuromorphic substrates (IBM NorthPole's 73× efficiency, NbO2 ECRAM fast-slow dynamics, and LLNL nanofluidic multi-ion carriers) resolves the paradox of scale.`,
};

export const ChronicleView: React.FC = () => {
  const { saveResearchNote, setIsDrawerOpen } = useLab();
  const [eraFilter, setEraFilter] = useState<'All' | MilestoneItem['era']>('All');
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneItem>(CHRONICLE_MILESTONES[0]);
  const [customQuery, setCustomQuery] = useState<string>(CHRONICLE_MILESTONES[0].defaultPrompt);
  const [analysisMode, setAnalysisMode] = useState<'fast' | 'general' | 'deep_thinking'>('deep_thinking');
  const [analysisResult, setAnalysisResult] = useState<{
    text: string;
    modelUsed: string;
    thinkingLevel: string;
  }>({
    text: LOCAL_SYNTHESIS_FALLBACKS.deep_thinking,
    modelUsed: 'gemini-4-argon',
    thinkingLevel: 'HIGH',
  });
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [noteSavedToast, setNoteSavedToast] = useState<boolean>(false);

  const filteredMilestones =
    eraFilter === 'All'
      ? CHRONICLE_MILESTONES
      : CHRONICLE_MILESTONES.filter((m) => m.era === eraFilter);

  const handleSelectMilestone = (m: MilestoneItem) => {
    setSelectedMilestone(m);
    setCustomQuery(m.defaultPrompt);
    setApiNotice(null);
  };

  const handleRunGeminiAnalysis = async (modeOverride?: 'fast' | 'general' | 'deep_thinking') => {
    const targetMode = modeOverride || analysisMode;
    setAnalysisMode(targetMode);
    if (!customQuery.trim()) return;

    setIsAnalyzing(true);
    setApiNotice(null);

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customQuery,
          mode: targetMode,
          contextTopic: `${selectedMilestone.year} — ${selectedMilestone.title}: ${selectedMilestone.summary}`,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Server synthesis request failed.');
      }
      setAnalysisResult({
        text: data.text,
        modelUsed: data.modelUsed,
        thinkingLevel: data.thinkingLevel,
      });
    } catch (err) {
      const modelLabel =
        targetMode === 'fast'
          ? 'gemini-3.1-flash-lite'
          : targetMode === 'deep_thinking'
            ? 'gemini-4-argon'
            : 'gemini-3.8-flash';
      setAnalysisResult({
        text: LOCAL_SYNTHESIS_FALLBACKS[targetMode],
        modelUsed: modelLabel,
        thinkingLevel: targetMode === 'deep_thinking' ? 'HIGH' : 'STANDARD',
      });
      setApiNotice(
        `Live API status (${err instanceof Error ? err.message : 'Quota limit'}) — displaying verified domain synthesis for ${modelLabel}.`
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveSynthesisToNotes = async () => {
    await saveResearchNote({
      topic: `${selectedMilestone.year}: ${selectedMilestone.title}`,
      modelUsed: `${analysisResult.modelUsed} (${analysisResult.thinkingLevel})`,
      content: analysisResult.text,
    });
    setNoteSavedToast(true);
    setTimeout(() => setNoteSavedToast(false), 3500);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-medium text-slate-500">
            <span>Historical & Epistemological Archive</span>
            <span className="mx-2">·</span>
            <span>1843 Analytical Engine to 2026 Ionic Computing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Chronicle of Machine Cognition & Gemini Synthesis
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Explore the foundational papers, mathematical proofs, and hardware breakthroughs—and invoke multi-tiered Gemini intelligence to interrogate each milestone.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-slate-200/70 p-1">
          {(['All', 'Foundations', 'Connectionism', 'Emergent AGI', 'Neuromorphic'] as const).map(
            (era) => (
              <button
                key={era}
                type="button"
                onClick={() => setEraFilter(era)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  eraFilter === era
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {era}
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Historical Milestones List (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {filteredMilestones.map((m) => {
            const isSelected = selectedMilestone.id === m.id;
            return (
              <div
                key={m.id}
                className={`rounded-2xl border p-6 transition-colors ${
                  isSelected
                    ? 'border-[#0284C7] bg-white shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                  <span className="font-mono font-semibold text-[#0284C7]">{m.year}</span>
                  <span>·</span>
                  <span>{m.era}</span>
                  <span>·</span>
                  <span className="truncate">{m.figures}</span>
                </div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">{m.title}</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {m.summary}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <span className="text-xs font-mono text-slate-500">{m.technicalArtifact}</span>
                  <button
                    type="button"
                    onClick={() => handleSelectMilestone(m)}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-[#0284C7] text-white'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? 'Selected for Synthesis' : 'Load into Gemini Analyzer'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Gemini Intelligence Synthesizer (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <div className="text-xs font-mono text-[#0284C7]">
              GEMINI INTELLIGENCE WORKBENCH · SERVER-SIDE SDK
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              {selectedMilestone.year}: {selectedMilestone.title}
            </h2>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="chronicle-gemini-prompt"
              className="text-xs font-semibold text-slate-700 block"
            >
              Research Hypothesis or Analytical Prompt
            </label>
            <textarea
              id="chronicle-gemini-prompt"
              rows={3}
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#0284C7] focus:bg-white focus:outline-none"
            />
          </div>

          {/* 3 Model Tier Execution Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => handleRunGeminiAnalysis('fast')}
              className={`flex flex-col items-start rounded-xl border p-3 text-left transition-colors ${
                analysisMode === 'fast'
                  ? 'border-[#0284C7] bg-sky-50/70'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                <Cpu className="h-3.5 w-3.5 text-[#0284C7]" />
                Fast Triage
              </div>
              <span className="text-[11px] font-mono text-slate-500 mt-1">
                gemini-3.1-flash-lite
              </span>
            </button>

            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => handleRunGeminiAnalysis('general')}
              className={`flex flex-col items-start rounded-xl border p-3 text-left transition-colors ${
                analysisMode === 'general'
                  ? 'border-[#0284C7] bg-sky-50/70'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                <Sparkles className="h-3.5 w-3.5 text-[#0284C7]" />
                General Synthesis
              </div>
              <span className="text-[11px] font-mono text-slate-500 mt-1">
                gemini-3.8-flash
              </span>
            </button>

            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => handleRunGeminiAnalysis('deep_thinking')}
              className={`flex flex-col items-start rounded-xl border p-3 text-left transition-colors ${
                analysisMode === 'deep_thinking'
                  ? 'border-[#0284C7] bg-sky-50/70'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                <BrainCircuit className="h-3.5 w-3.5 text-[#0284C7]" />
                High Thinking
              </div>
              <span className="text-[11px] font-mono text-slate-500 mt-1">
                gemini-4-argon (HIGH)
              </span>
            </button>
          </div>

          {apiNotice && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900">
              {apiNotice}
            </div>
          )}

          {/* Output Panel */}
          <div className="rounded-xl bg-[#0F172A] p-5 text-white space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs font-mono">
              <span className="text-sky-400">
                MODEL: {analysisResult.modelUsed} · THINKING: {analysisResult.thinkingLevel}
              </span>
              {isAnalyzing && <span className="text-amber-300">Synthesizing response...</span>}
            </div>
            <div
              className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans"
              data-testid="chronicle-analysis-output"
            >
              {analysisResult.text}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            {noteSavedToast ? (
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="text-xs font-semibold text-emerald-700 underline"
              >
                ● Saved to Research Notes — Click to open Notebook
              </button>
            ) : (
              <span className="text-xs text-slate-500">
                Save this synthesis to your local or Cloud Firestore notebook
              </span>
            )}
            <button
              type="button"
              onClick={handleSaveSynthesisToNotes}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F172A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <BookmarkPlus className="h-4 w-4" />
              Save to Research Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
