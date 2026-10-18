import React, { useState } from 'react';
import {
  evaluateMCPNeuron,
  calculateSTDPWeightDelta,
  generateActionPotentialTrace,
  calculateThermodynamicMetrics,
  evaluatePhysicalStack,
  NANOSCALE_BENCHMARKS,
  MCPInput,
  StackItem,
} from '../utils/cognitionPhysics';
import { useLab } from '../context/LabContext';
import { ArrowUp, ArrowDown, RotateCcw, BookmarkPlus } from 'lucide-react';

const LITHOGRAPHY_STAGES = [
  {
    step: 1,
    title: '01. Silica Sand melted into Pure Silicon Ingot (30cm)',
    substrate: 'Monocrystalline Czochralski Silicon Rod (300,000,000 nm diameter)',
    physics:
      'High-purity quartzite sand is melted and drawn into a single-crystal cylindrical silicon ingot up to 30 cm in diameter. Unlike copper, silicon offers native semi-conductive resistance.',
    dopantState: 'Intrinsic Un-doped Crystal Lattice',
  },
  {
    step: 2,
    title: '02. Slicing into Substrate Wafers & Deposition of Oxides',
    substrate: 'Ultra-flat Wafer + Insulating SiO2 Thin Film',
    physics:
      'The ingot is diamond-sliced into mirror-polished substrate wafers. Thin insulating layers of silicon dioxide (SiO2) are deposited to isolate future nanoscale channels.',
    dopantState: 'Dielectric Oxide Barrier Formed',
  },
  {
    step: 3,
    title: '03. Photolithography (Photoresist Coating & EUV Exposure)',
    substrate: 'Light-Sensitive Photoresist + Circuit Mask Stencil',
    physics:
      'Wafers are spin-coated with light-sensitive photoresist and exposed to Extreme Ultraviolet (EUV, 13.5 nm wavelength) light through a circuit-patterned stencil mask.',
    dopantState: 'Photochemical Cross-Linking in Exposed Zones',
  },
  {
    step: 4,
    title: '04. Chemical Etching of Nano-channels & Ion-Doping',
    substrate: '10–30 nm Transistor Gate Channels + Phosphorus/Boron Dopants',
    physics:
      'Reactive plasma etches away exposed oxide to carve 10–30 nm trenches. Phosphorus (n-type) or Boron (p-type) ions are implanted to modulate electrical conductivity dynamically.',
    dopantState: 'N-Type (Phosphorus) & P-Type (Boron) Wells Active',
  },
  {
    step: 5,
    title: '05. Multilayer Interconnect Deposition & Tape-Out Packaging',
    substrate: '3D Lattice of Copper/Titanium Vias & Packaged Die',
    physics:
      'Vertical cylindrical pathways (vias) of aluminum, titanium, and copper link billions of logic gates across vertical layers. The verified design completes Tape-Out into a packaged IC.',
    dopantState: 'Billions of Synchronized CMOS Switches (0 / 1)',
  },
];

export const SimulationsView: React.FC = () => {
  const { saveExperiment, setIsDrawerOpen } = useLab();
  const [activeModule, setActiveModule] = useState<
    'mcp_spiking' | 'thermodynamics' | 'lithography' | 'agi_stack'
  >('mcp_spiking');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Module 1: McCulloch-Pitts & Spiking State
  const [mcpInputs, setMcpInputs] = useState<MCPInput[]>([
    { id: 'x1', label: 'Excitatory Synapse x1 (Sensory Afferent)', active: true, type: 'excitatory' },
    { id: 'x2', label: 'Excitatory Synapse x2 (Cortical Associative)', active: true, type: 'excitatory' },
    { id: 'x3', label: 'Excitatory Synapse x3 (Thalamic Relay)', active: false, type: 'excitatory' },
    { id: 'inh1', label: 'Inhibitory Interneuron I1 (GABAergic Veto)', active: false, type: 'inhibitory' },
  ]);
  const [mcpThreshold, setMcpThreshold] = useState<number>(2);
  const [stdpDeltaMs, setStdpDeltaMs] = useState<number>(12);

  // Module 2: Thermodynamics & Landauer State
  const [temperatureK, setTemperatureK] = useState<number>(300);
  const [wireLengthMm, setWireLengthMm] = useState<number>(15);
  const [documentsMillions, setDocumentsMillions] = useState<number>(1.0);

  // Module 3: Silicon Photolithography State
  const [lithoStep, setLithoStep] = useState<number>(3);
  const [icSignalingType, setIcSignalingType] = useState<'digital' | 'analog' | 'mixed'>('digital');
  const [clockGhz, setClockGhz] = useState<number>(4.2);
  const [ipcValue, setIpcValue] = useState<number>(5.8);

  // Module 4: Sparks of AGI Stack & Theory of Mind State
  const [stackOrder, setStackOrder] = useState<StackItem['id'][]>([
    'book',
    'eggs',
    'laptop',
    'bottle',
    'nail',
  ]);
  const [tomScenario, setTomScenario] = useState<'dropbox' | 'zurfin'>('dropbox');
  const [bobMovedFileSecretly, setBobMovedFileSecretly] = useState<boolean>(true);

  const mcpEval = evaluateMCPNeuron(mcpInputs, mcpThreshold);
  const stdpEval = calculateSTDPWeightDelta(stdpDeltaMs);
  const actionPotentialPoints = generateActionPotentialTrace(mcpEval.fired === 1);
  const thermoEval = calculateThermodynamicMetrics(temperatureK, wireLengthMm, documentsMillions);
  const stackEval = evaluatePhysicalStack(stackOrder);
  const currentLitho = LITHOGRAPHY_STAGES[lithoStep - 1] || LITHOGRAPHY_STAGES[0];
  const effectiveGips = Number((clockGhz * ipcValue).toFixed(2));

  const toggleMcpInput = (id: string) => {
    setMcpInputs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const applyMcpPreset = (preset: 'AND' | 'OR' | 'VETO') => {
    if (preset === 'AND') {
      setMcpThreshold(2);
      setMcpInputs([
        { id: 'x1', label: 'Excitatory Synapse x1 (Sensory Afferent)', active: true, type: 'excitatory' },
        { id: 'x2', label: 'Excitatory Synapse x2 (Cortical Associative)', active: true, type: 'excitatory' },
        { id: 'x3', label: 'Excitatory Synapse x3 (Thalamic Relay)', active: false, type: 'excitatory' },
        { id: 'inh1', label: 'Inhibitory Interneuron I1 (GABAergic Veto)', active: false, type: 'inhibitory' },
      ]);
    } else if (preset === 'OR') {
      setMcpThreshold(1);
      setMcpInputs([
        { id: 'x1', label: 'Excitatory Synapse x1 (Sensory Afferent)', active: true, type: 'excitatory' },
        { id: 'x2', label: 'Excitatory Synapse x2 (Cortical Associative)', active: false, type: 'excitatory' },
        { id: 'x3', label: 'Excitatory Synapse x3 (Thalamic Relay)', active: false, type: 'excitatory' },
        { id: 'inh1', label: 'Inhibitory Interneuron I1 (GABAergic Veto)', active: false, type: 'inhibitory' },
      ]);
    } else {
      setMcpThreshold(1);
      setMcpInputs([
        { id: 'x1', label: 'Excitatory Synapse x1 (Sensory Afferent)', active: true, type: 'excitatory' },
        { id: 'x2', label: 'Excitatory Synapse x2 (Cortical Associative)', active: true, type: 'excitatory' },
        { id: 'x3', label: 'Excitatory Synapse x3 (Thalamic Relay)', active: true, type: 'excitatory' },
        { id: 'inh1', label: 'Inhibitory Interneuron I1 (GABAergic Veto)', active: true, type: 'inhibitory' },
      ]);
    }
  };

  const moveStackItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= stackOrder.length) return;
    const copy = [...stackOrder];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    setStackOrder(copy);
  };

  const handleSaveCurrentSnapshot = async () => {
    if (activeModule === 'mcp_spiking') {
      await saveExperiment({
        title: `MCP Neuron (θ=${mcpThreshold}) & STDP (Δt=${stdpDeltaMs}ms)`,
        moduleType: 'mcp_spiking',
        summary: `${mcpEval.equationText} · ${stdpEval.regime} (${stdpEval.deltaWeightPercent > 0 ? '+' : ''}${stdpEval.deltaWeightPercent}%)`,
        parameters: {
          threshold: mcpThreshold,
          excitatorySum: mcpEval.excitatorySum,
          inhibitoryVeto: mcpEval.hasActiveInhibitory,
          stdpDeltaMs,
        },
      });
    } else if (activeModule === 'thermodynamics') {
      await saveExperiment({
        title: `Landauer Limit (${temperatureK} K) & Wire Bus (${wireLengthMm} mm)`,
        moduleType: 'thermodynamics',
        summary: `Landauer Min: ${thermoEval.landauerEv.toFixed(4)} eV · Bus: ${thermoEval.vonNeumannBusEnergyPj} pJ vs NorthPole ${thermoEval.northPoleEnergyPj} pJ`,
        parameters: {
          temperatureK,
          wireLengthMm,
          documentsMillions,
        },
      });
    } else if (activeModule === 'lithography') {
      await saveExperiment({
        title: `EUV Lithography Stage ${lithoStep} & ${icSignalingType.toUpperCase()} IC`,
        moduleType: 'lithography',
        summary: `${currentLitho.title} · Clock ${clockGhz} GHz × IPC ${ipcValue} = ${effectiveGips} GIPS`,
        parameters: {
          lithoStep,
          icSignalingType,
          clockGhz,
          ipcValue,
        },
      });
    } else {
      await saveExperiment({
        title: `AGI Physical Stack (${stackEval.isStable ? 'Viable' : 'Unstable'})`,
        moduleType: 'agi_stack',
        summary: `Order: ${stackOrder.join(' -> ')} · Stability Score: ${stackEval.score}/100`,
        parameters: {
          order: stackOrder.join(','),
          isStable: stackEval.isStable,
          score: stackEval.score,
        },
      });
    }

    setSaveFeedback('Snapshot saved to Research Notebook');
    setTimeout(() => setSaveFeedback(null), 3500);
  };

  // Build SVG path for Action Potential
  const svgPoints = actionPotentialPoints
    .map((pt, idx) => {
      const x = 40 + (idx / 50) * 520;
      const y = 210 - ((pt.voltageMv + 90) / 140) * 180;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="space-y-8">
      {/* Header & Single-Row Module Selector Bar */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-medium text-slate-500">
            <span>Interactive Biophysical & Thermodynamic Sandbox</span>
            <span className="mx-2">·</span>
            <span>4 Coupled Physical Models</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            From Silicon Switches to Biophysical Spikes
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Manipulate nanoscale lithography parameters, McCulloch-Pitts logical thresholds, Landauer thermodynamic limits, and emergent AGI physical reasoning in real time.
          </p>
        </div>

        <div
          className="grid grid-cols-2 sm:flex items-center gap-1 rounded-xl bg-slate-200/70 p-1 w-full sm:w-auto"
          role="tablist"
          aria-label="Simulation Modules"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeModule === 'mcp_spiking'}
            onClick={() => setActiveModule('mcp_spiking')}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeModule === 'mcp_spiking'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            01. McCulloch-Pitts
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeModule === 'thermodynamics'}
            onClick={() => setActiveModule('thermodynamics')}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeModule === 'thermodynamics'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            02. Landauer Limit
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeModule === 'lithography'}
            onClick={() => setActiveModule('lithography')}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeModule === 'lithography'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            03. Silicon Wafer
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeModule === 'agi_stack'}
            onClick={() => setActiveModule('agi_stack')}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeModule === 'agi_stack'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            04. Sparks of AGI
          </button>
        </div>
      </div>

      {/* Save Banner Feedback */}
      {saveFeedback && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-900">
          <span>● {saveFeedback}</span>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="underline font-semibold hover:text-emerald-700 whitespace-nowrap shrink-0"
          >
            View in Research Notebook
          </button>
        </div>
      )}

      {/* Two-Zone Sandbox Layout (65% Left Interactive Stage / 35% Right Control & Telemetry Deck) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT ZONE: Interactive Visual Stage (8 cols on 12-col grid = 66.7%) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 space-y-6">
          {activeModule === 'mcp_spiking' && (
            <div className="space-y-6" data-testid="stage-mcp-spiking">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    McCulloch-Pitts (1943) Calculus & Biophysical Action Potential
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    All-or-nothing binary logic unit coupled with voltage-gated Na+ / K+ membrane kinetics
                  </p>
                </div>
                <div className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 whitespace-nowrap shrink-0">
                  {mcpEval.fired === 1
                    ? '● OUTPUT y = 1 (SPIKE FIRED)'
                    : mcpEval.hasActiveInhibitory
                      ? '▲ OUTPUT y = 0 (INHIBITORY VETO)'
                      : '○ OUTPUT y = 0 (RESTING)'}
                </div>
              </div>

              {/* Interactive SVG Neural Gate & Action Potential Oscilloscope */}
              <div className="rounded-xl bg-[#0F172A] p-4 sm:p-6 text-white dark-blueprint-grid space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Left Diagram: MCP Logic Unit */}
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-slate-400">
                      LOGICAL CALCULUS TOPOLOGY · g(x) = sum(x_i) &gt;= θ
                    </div>
                    <svg
                      viewBox="0 0 360 220"
                      className="w-full h-auto rounded-lg bg-slate-950/60 border border-slate-800"
                      role="img"
                      aria-label="McCulloch-Pitts Neuron Logic Diagram"
                    >
                      {mcpInputs.map((inp, idx) => {
                        const yPos = 35 + idx * 48;
                        const strokeColor = inp.active
                          ? inp.type === 'inhibitory'
                            ? '#EF4444'
                            : '#38BDF8'
                          : '#334155';
                        return (
                          <g key={inp.id}>
                            <line
                              x1="45"
                              y1={yPos}
                              x2="175"
                              y2="110"
                              stroke={strokeColor}
                              strokeWidth={inp.active ? '3' : '1.5'}
                              strokeDasharray={inp.type === 'inhibitory' ? '5,4' : undefined}
                            />
                            <circle
                              cx="45"
                              cy={yPos}
                              r="14"
                              fill={inp.active ? strokeColor : '#1E293B'}
                              stroke={strokeColor}
                              strokeWidth="2"
                            />
                            <text
                              x="45"
                              y={yPos + 4}
                              textAnchor="middle"
                              fill="#F8FAFC"
                              fontSize="11"
                              fontFamily="IBM Plex Mono, monospace"
                            >
                              {inp.active ? '1' : '0'}
                            </text>
                            <text
                              x="68"
                              y={yPos - 8}
                              fill="#94A3B8"
                              fontSize="10"
                              fontFamily="Plus Jakarta Sans, sans-serif"
                            >
                              {inp.type === 'inhibitory' ? 'Inhibitory I1' : `Excitatory x${idx + 1}`}
                            </text>
                          </g>
                        );
                      })}

                      {/* Soma Aggregation Node */}
                      <circle
                        cx="195"
                        cy="110"
                        r="34"
                        fill={mcpEval.fired === 1 ? '#0284C7' : '#1E293B'}
                        stroke={
                          mcpEval.hasActiveInhibitory
                            ? '#EF4444'
                            : mcpEval.fired === 1
                              ? '#38BDF8'
                              : '#64748B'
                        }
                        strokeWidth="3"
                      />
                      <text
                        x="195"
                        y="105"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="12"
                        fontWeight="bold"
                        fontFamily="IBM Plex Mono, monospace"
                      >
                        g(x)={mcpEval.excitatorySum}
                      </text>
                      <text
                        x="195"
                        y="122"
                        textAnchor="middle"
                        fill="#CBD5E1"
                        fontSize="11"
                        fontFamily="IBM Plex Mono, monospace"
                      >
                        θ={mcpThreshold}
                      </text>

                      {/* Axon Output */}
                      <line
                        x1="229"
                        y1="110"
                        x2="310"
                        y2="110"
                        stroke={mcpEval.fired === 1 ? '#10B981' : '#475569'}
                        strokeWidth={mcpEval.fired === 1 ? '4' : '2'}
                      />
                      <circle
                        cx="322"
                        cy="110"
                        r="18"
                        fill={mcpEval.fired === 1 ? '#059669' : '#0F172A'}
                        stroke={mcpEval.fired === 1 ? '#34D399' : '#475569'}
                        strokeWidth="2.5"
                      />
                      <text
                        x="322"
                        y="115"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="13"
                        fontWeight="bold"
                        fontFamily="IBM Plex Mono, monospace"
                      >
                        y={mcpEval.fired}
                      </text>
                    </svg>
                  </div>

                  {/* Right Diagram: Membrane Voltage Trace */}
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-slate-400">
                      MEMBRANE POTENTIAL · 3Na+ OUT / 2K+ IN PUMP
                    </div>
                    <svg
                      viewBox="0 0 600 240"
                      className="w-full h-auto rounded-lg bg-slate-950/60 border border-slate-800"
                      role="img"
                      aria-label="Action Potential Oscilloscope Trace"
                    >
                      <line
                        x1="40"
                        y1="165"
                        x2="560"
                        y2="165"
                        stroke="#F59E0B"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                      />
                      <text x="45" y="159" fill="#F59E0B" fontSize="11" fontFamily="IBM Plex Mono">
                        Threshold (-55 mV)
                      </text>

                      <line
                        x1="40"
                        y1="184"
                        x2="560"
                        y2="184"
                        stroke="#64748B"
                        strokeWidth="1"
                        strokeDasharray="2,3"
                      />
                      <text x="45" y="198" fill="#94A3B8" fontSize="11" fontFamily="IBM Plex Mono">
                        Resting (-70 mV)
                      </text>

                      <line
                        x1="40"
                        y1="43"
                        x2="560"
                        y2="43"
                        stroke="#10B981"
                        strokeWidth="1"
                        strokeDasharray="3,3"
                      />
                      <text x="45" y="37" fill="#34D399" fontSize="11" fontFamily="IBM Plex Mono">
                        Depolarization Peak (+40 mV · Na+ Channels Open)
                      </text>

                      <path
                        d={svgPoints}
                        fill="none"
                        stroke={mcpEval.fired === 1 ? '#38BDF8' : '#94A3B8'}
                        strokeWidth="3.5"
                      />
                    </svg>
                  </div>
                </div>

                {/* Telemetry Readout Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800 text-xs font-mono tabular-nums">
                  <div>
                    <span className="text-slate-400 block">BOOLEAN CALCULUS</span>
                    <span className="text-white font-semibold">{mcpEval.equationText}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">HEBBIAN STDP PLASTICITY</span>
                    <span className="text-emerald-400 font-semibold">
                      {stdpEval.regime} ({stdpEval.deltaWeightPercent > 0 ? '+' : ''}
                      {stdpEval.deltaWeightPercent}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">CORTICAL SYNAPSE PROBABILITY</span>
                    <span className="text-sky-300 font-semibold">
                      p ~ 0.25 (25% Probabilistic Release)
                    </span>
                  </div>
                </div>
              </div>

              {/* Architectural Comparison Table from Specification */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Architectural Comparison: Von Neumann vs. Neuromorphic / Biological Substrates
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Architectural Feature</th>
                        <th className="py-3 px-4">Von Neumann Computing</th>
                        <th className="py-3 px-4">Neuromorphic / Biological Systems</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      <tr>
                        <td className="py-2.5 px-4 font-medium text-slate-900">Memory & Processing</td>
                        <td className="py-2.5 px-4">Physically separated (connected by a shared high-energy bus).</td>
                        <td className="py-2.5 px-4">Co-located (processing occurs directly in memory substrate).</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-medium text-slate-900">Signaling Paradigm</td>
                        <td className="py-2.5 px-4">Synchronous, clocked, continuous digital voltage states.</td>
                        <td className="py-2.5 px-4">Asynchronous, event-driven, sparse electrical spikes.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-medium text-slate-900">Learning Mechanism</td>
                        <td className="py-2.5 px-4">Offline backpropagation (computationally intensive).</td>
                        <td className="py-2.5 px-4">Local plasticity (Spike-Timing-Dependent Plasticity / STDP).</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-medium text-slate-900">Medium of Carrier</td>
                        <td className="py-2.5 px-4">Single carrier (electrons in doped silicon).</td>
                        <td className="py-2.5 px-4">Multiple carriers (Na+, K+, Ca2+ ions across membranes).</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeModule === 'thermodynamics' && (
            <div className="space-y-6" data-testid="stage-thermodynamics">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Landauer’s Principle (1961) & The Von Neumann Memory Wall
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thermodynamic minimum bit erasure energy (E = k_B T ln 2) and interconnect wire capacitance (E ~ L)
                  </p>
                </div>
                <div className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 whitespace-nowrap shrink-0">
                  ● T = {thermoEval.temperatureK} K · E_min = {thermoEval.landauerEv.toFixed(4)} eV
                </div>
              </div>

              {/* Interactive Von Neumann vs Co-Located Neuromorphic Diagram */}
              <div className="rounded-xl bg-[#0F172A] p-6 text-white dark-blueprint-grid space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                    <span>VON NEUMANN SHARED BUS DISSIPATION (L = {wireLengthMm} mm)</span>
                    <span className="text-amber-400">
                      ▲ {thermoEval.vonNeumannBusEnergyPj} pJ / weight transfer
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    <div className="md:col-span-3 rounded-lg border border-sky-500/40 bg-sky-950/40 p-3 text-center">
                      <div className="text-xs font-mono text-sky-300">PROCESSOR</div>
                      <div className="text-sm font-semibold">CPU / GPU Cores</div>
                    </div>
                    <div className="md:col-span-6 flex flex-col items-center justify-center space-y-1.5 px-2">
                      <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-transform"
                          style={{
                            width: `${Math.min(100, (wireLengthMm / 50) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="text-[11px] font-mono text-amber-300 text-center">
                        Charging & Discharging Copper Wire ({wireLengthMm} mm)
                      </div>
                    </div>
                    <div className="md:col-span-3 rounded-lg border border-indigo-500/40 bg-indigo-950/40 p-3 text-center">
                      <div className="text-xs font-mono text-indigo-300">OFF-CHIP MEMORY</div>
                      <div className="text-sm font-semibold">DRAM Weight Bank</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800 text-xs font-mono tabular-nums">
                  <div className="rounded-lg bg-slate-900/90 p-3.5 border border-slate-800">
                    <span className="text-slate-400 block">LANDAUER BIT ERASURE</span>
                    <span className="text-lg font-semibold text-white">
                      {thermoEval.landauerEv.toFixed(4)} eV
                    </span>
                    <span className="text-slate-400 block mt-0.5">
                      {thermoEval.landauerJoules.toExponential(2)} Joules
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-900/90 p-3.5 border border-slate-800">
                    <span className="text-slate-400 block">2016 NANOMAGNETIC BIT FLIP</span>
                    <span className="text-lg font-semibold text-emerald-400">
                      {thermoEval.nanomagnetic2016Ev.toFixed(4)} eV
                    </span>
                    <span className="text-slate-400 block mt-0.5">Only 44% above Landauer limit</span>
                  </div>
                  <div className="rounded-lg bg-slate-900/90 p-3.5 border border-slate-800">
                    <span className="text-slate-400 block">IBM NORTHPOLE CO-LOCATED</span>
                    <span className="text-lg font-semibold text-sky-400">
                      {thermoEval.northPoleEnergyPj} pJ
                    </span>
                    <span className="text-slate-400 block mt-0.5">73× more energy-efficient</span>
                  </div>
                </div>
              </div>

              {/* Resource Footprint & Output Efficiency Table */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Resource Footprint & Computational Crossover ({documentsMillions.toFixed(2)}M Documents)
                  </h3>
                  <span className="text-xs font-mono text-emerald-700 font-semibold">
                    Optimal at Current Scale: {thermoEval.crossoverEfficientSystem}
                  </span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs tabular-nums">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Resource Metric</th>
                        <th className="py-3 px-4">AI System / Supercomputer</th>
                        <th className="py-3 px-4">Biological Human Equivalent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      <tr>
                        <td className="py-2.5 px-4 font-medium text-slate-900">Real-Time Operating Power</td>
                        <td className="py-2.5 px-4 font-mono">~2,700,000,000 W (3 Nuclear Plants)</td>
                        <td className="py-2.5 px-4 font-mono">15 to 20 W (Metabolic Sweet Spot)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-medium text-slate-900">Model Training Energy Cost</td>
                        <td className="py-2.5 px-4 font-mono">~1,287 MWh (GPT-3 Training)</td>
                        <td className="py-2.5 px-4 font-mono">~0.4 kWh daily metabolic brain use</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-medium text-slate-900">Training Carbon Footprint</td>
                        <td className="py-2.5 px-4 font-mono">502 to 552 metric tons CO2</td>
                        <td className="py-2.5 px-4 font-mono">Near-zero per individual task</td>
                      </tr>
                      <tr className="bg-sky-50/60">
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          Batch Processing ({documentsMillions.toFixed(2)}M Docs)
                        </td>
                        <td className="py-2.5 px-4 font-mono font-semibold text-[#0284C7]">
                          {thermoEval.documentBatchAiMwh} MWh (2–5 MWh / 1M docs)
                        </td>
                        <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">
                          {thermoEval.documentBatchHumanMwh} MWh (~8 MWh / 1M docs)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeModule === 'lithography' && (
            <div className="space-y-6" data-testid="stage-lithography">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Nanoscale Silicon Fabrication & EUV Photolithography Pipeline
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    3D layered wafer engineering from 30cm silica ingots to 10–30 nm doped transistor gates
                  </p>
                </div>
                <div className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 whitespace-nowrap shrink-0">
                  ● Stage {lithoStep}/5 · Throughput: {effectiveGips} GIPS
                </div>
              </div>

              <div className="rounded-xl bg-[#0F172A] p-6 text-white dark-blueprint-grid space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  {LITHOGRAPHY_STAGES.map((st) => (
                    <button
                      key={st.step}
                      type="button"
                      onClick={() => setLithoStep(st.step)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-mono font-medium transition-colors whitespace-nowrap shrink-0 ${
                        lithoStep === st.step
                          ? 'bg-[#0284C7] text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Step 0{st.step}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-7 space-y-3">
                    <h3 className="text-lg font-semibold text-white">{currentLitho.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {currentLitho.physics}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                      <div className="rounded-lg bg-slate-900/90 p-3 border border-slate-800">
                        <span className="text-slate-400 block">SUBSTRATE STATE</span>
                        <span className="text-sky-300">{currentLitho.substrate}</span>
                      </div>
                      <div className="rounded-lg bg-slate-900/90 p-3 border border-slate-800">
                        <span className="text-slate-400 block">DOPING & EXPOSURE</span>
                        <span className="text-emerald-300">{currentLitho.dopantState}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-5">
                    <svg
                      viewBox="0 0 280 200"
                      className="w-full h-auto rounded-lg bg-slate-950/80 border border-slate-800"
                      role="img"
                      aria-label="Cross-section of silicon wafer fabrication"
                    >
                      <rect x="20" y="135" width="240" height="45" fill="#334155" rx="4" />
                      <text x="140" y="162" textAnchor="middle" fill="#F8FAFC" fontSize="11" fontFamily="IBM Plex Mono">
                        Monocrystalline Si Wafer
                      </text>

                      {lithoStep >= 2 && (
                        <g>
                          <rect x="20" y="110" width="240" height="25" fill="#0284C7" rx="2" />
                          <text x="140" y="126" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontFamily="IBM Plex Mono">
                            Insulating SiO2 Layer
                          </text>
                        </g>
                      )}

                      {lithoStep === 3 && (
                        <g>
                          <rect x="40" y="25" width="200" height="14" fill="#64748B" />
                          <text x="140" y="35" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontFamily="IBM Plex Mono">
                            Circuit Stencil Mask
                          </text>
                          <line x1="75" y1="42" x2="75" y2="95" stroke="#38BDF8" strokeWidth="3" strokeDasharray="3,3" />
                          <line x1="140" y1="42" x2="140" y2="95" stroke="#38BDF8" strokeWidth="3" strokeDasharray="3,3" />
                          <line x1="205" y1="42" x2="205" y2="95" stroke="#38BDF8" strokeWidth="3" strokeDasharray="3,3" />
                          <rect x="20" y="95" width="240" height="15" fill="#F59E0B" />
                        </g>
                      )}

                      {lithoStep >= 4 && (
                        <g>
                          <rect x="55" y="110" width="35" height="35" fill="#10B981" />
                          <rect x="190" y="110" width="35" height="35" fill="#10B981" />
                          <text x="72" y="132" textAnchor="middle" fill="#0F172A" fontSize="9" fontWeight="bold" fontFamily="IBM Plex Mono">
                            n+
                          </text>
                          <text x="207" y="132" textAnchor="middle" fill="#0F172A" fontSize="9" fontWeight="bold" fontFamily="IBM Plex Mono">
                            p+
                          </text>
                        </g>
                      )}

                      {lithoStep === 5 && (
                        <g>
                          <rect x="65" y="55" width="14" height="55" fill="#F59E0B" />
                          <rect x="200" y="55" width="14" height="55" fill="#F59E0B" />
                          <rect x="35" y="40" width="210" height="16" fill="#E2E8F0" rx="2" />
                          <text x="140" y="52" textAnchor="middle" fill="#0F172A" fontSize="9" fontWeight="bold" fontFamily="IBM Plex Mono">
                            Copper & Titanium Interconnect Vias
                          </text>
                        </g>
                      )}
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Physical & Biological Scale Metrics (Nanometers)
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs tabular-nums">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Scale Benchmark</th>
                        <th className="py-3 px-4">Measurement Value (nm)</th>
                        <th className="py-3 px-4">Functional Computing or Biological Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {NANOSCALE_BENCHMARKS.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-4 font-medium text-slate-900">{item.name}</td>
                          <td className="py-2.5 px-4 font-mono font-semibold text-[#0284C7]">
                            {item.displayValue}
                          </td>
                          <td className="py-2.5 px-4">{item.roleDescription}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeModule === 'agi_stack' && (
            <div className="space-y-6" data-testid="stage-agi-stack">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Sparks of AGI (2023): Physical Commonsense & Theory of Mind
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Interactive 5-object physical equilibrium test & Sally-Anne / ZURFIN false-belief attribution
                  </p>
                </div>
                <div
                  className={`text-xs font-mono font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
                    stackEval.isStable
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}
                >
                  {stackEval.isStable
                    ? `● VIABLE EQUILIBRIUM (${stackEval.score}/100)`
                    : `▲ STRUCTURAL FAILURE (${stackEval.score}/100)`}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-6 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                    <span className="font-semibold text-slate-700">Top of Stack (Layer 5)</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStackOrder(['book', 'eggs', 'laptop', 'bottle', 'nail'])}
                        className="text-[#0284C7] hover:underline font-medium"
                      >
                        GPT-4 Viable Order
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => setStackOrder(['nail', 'eggs', 'book', 'laptop', 'bottle'])}
                        className="text-amber-700 hover:underline font-medium"
                      >
                        ChatGPT Failure Order
                      </button>
                    </div>
                  </div>

                  {[...stackEval.layerAnalysis].reverse().map((layer, revIdx) => {
                    const actualIdx = stackOrder.length - 1 - revIdx;
                    return (
                      <div
                        key={layer.itemId}
                        className={`flex items-center justify-between rounded-xl border p-3 transition-colors ${
                          layer.status === 'STABLE'
                            ? 'border-slate-200 bg-slate-50/70'
                            : 'border-red-300 bg-red-50/70'
                        }`}
                      >
                        <div className="space-y-0.5 pr-2">
                          <div className="text-xs font-semibold text-slate-900">
                            Layer {actualIdx + 1}: {layer.label}
                          </div>
                          <div className="text-[11px] text-slate-600">{layer.note}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveStackItem(actualIdx, 1)}
                            disabled={actualIdx === stackOrder.length - 1}
                            aria-label={`Move ${layer.label} up`}
                            className="rounded p-1 text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveStackItem(actualIdx, -1)}
                            disabled={actualIdx === 0}
                            aria-label={`Move ${layer.label} down`}
                            className="rounded p-1 text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="text-xs font-semibold text-slate-700 pt-1">
                    Level Support Surface (Base Layer 1)
                  </div>
                </div>

                <div className="md:col-span-6 rounded-xl bg-[#0F172A] p-5 text-white space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-sky-400">
                      THEORY OF MIND & SOCIAL LOGIC
                    </span>
                    <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setTomScenario('dropbox')}
                        className={`px-2.5 py-1 rounded text-xs font-medium ${
                          tomScenario === 'dropbox' ? 'bg-[#0284C7] text-white' : 'text-slate-300'
                        }`}
                      >
                        Dropbox False-Belief
                      </button>
                      <button
                        type="button"
                        onClick={() => setTomScenario('zurfin')}
                        className={`px-2.5 py-1 rounded text-xs font-medium ${
                          tomScenario === 'zurfin' ? 'bg-[#0284C7] text-white' : 'text-slate-300'
                        }`}
                      >
                        ZURFIN Attribution
                      </button>
                    </div>
                  </div>

                  {tomScenario === 'dropbox' ? (
                    <div className="space-y-3 text-xs leading-relaxed">
                      <p className="text-slate-300">
                        <strong>Digital Sally-Anne Test:</strong> Alice places a tax document in{' '}
                        <code className="text-sky-300">/Shared/Taxes_2023</code> and goes offline. While she is away, Bob moves the file to{' '}
                        <code className="text-amber-300">/Archive/Processed</code>.
                      </p>
                      <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <span>Did Bob notify Alice of the move?</span>
                        <button
                          type="button"
                          onClick={() => setBobMovedFileSecretly(!bobMovedFileSecretly)}
                          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 font-mono text-sky-300"
                        >
                          {bobMovedFileSecretly ? 'No (Unnotified)' : 'Yes (Notified)'}
                        </button>
                      </div>
                      <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800 space-y-1 font-mono">
                        <div className="text-slate-400">EPISTEMIC BELIEF STATE DEDUCTION:</div>
                        <div className="text-emerald-400">
                          {bobMovedFileSecretly
                            ? '-> Alice searches /Shared/Taxes_2023 (She has no empirical basis to assume it moved).'
                            : '-> Alice searches /Archive/Processed (Updated belief state via notification).'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs leading-relaxed">
                      <p className="text-slate-300">
                        <strong>Nonsense-Word Emotional Attribution:</strong> Tom loses his{' '}
                        <code className="text-sky-300">ZURFIN</code> (coined to prevent training-set memorization) and becomes visibly sad when Adam boasts about his own ZURFIN.
                      </p>
                      <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800 space-y-1.5 font-mono">
                        <div className="text-sky-300">
                          1. Why is Tom sad? -&gt; Because he lost his own ZURFIN and is reminded of the loss.
                        </div>
                        <div className="text-emerald-400">
                          2. What does Adam believe? -&gt; Lacking knowledge of Tom’s loss, Adam assumes Tom is tired or unhappy for unrelated reasons.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT ZONE: Control & Concept Deck (4 cols on 12-col grid = 33.3%) */}
        <aside className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Parameter & Control Deck</h2>
              <p className="text-xs text-slate-500">Adjust variables to observe live state transitions</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setMcpThreshold(2);
                setStdpDeltaMs(12);
                setTemperatureK(300);
                setWireLengthMm(15);
                setDocumentsMillions(1.0);
                setLithoStep(3);
                setStackOrder(['book', 'eggs', 'laptop', 'bottle', 'nail']);
              }}
              aria-label="Reset Simulation Parameters"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          {activeModule === 'mcp_spiking' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">
                  Logic Gate Presets (McCulloch & Pitts, 1943)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyMcpPreset('AND')}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    AND (θ=2)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMcpPreset('OR')}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    OR (θ=1)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMcpPreset('VETO')}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    Inhibitory Veto
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">
                  Synaptic Binary Inputs (x_i in {'{0, 1}'})
                </span>
                <div className="space-y-2">
                  {mcpInputs.map((inp) => (
                    <button
                      key={inp.id}
                      type="button"
                      onClick={() => toggleMcpInput(inp.id)}
                      className={`w-full flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-colors ${
                        inp.active
                          ? inp.type === 'inhibitory'
                            ? 'border-red-300 bg-red-50 text-red-900'
                            : 'border-sky-300 bg-sky-50 text-sky-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate pr-2">{inp.label}</span>
                      <span className="font-mono font-bold shrink-0">
                        {inp.active ? 'ACTIVE (1)' : 'QUIET (0)'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="mcp-threshold-slider" className="font-semibold text-slate-700">
                    Activation Threshold (θ)
                  </label>
                  <span className="font-mono font-semibold text-[#0284C7] tabular-nums">
                    θ = {mcpThreshold}
                  </span>
                </div>
                <input
                  id="mcp-threshold-slider"
                  type="range"
                  min={1}
                  max={3}
                  step={1}
                  value={mcpThreshold}
                  onChange={(e) => setMcpThreshold(Number(e.target.value))}
                  className="w-full accent-[#0284C7]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="stdp-timing-slider" className="font-semibold text-slate-700">
                    STDP Spike Timing (Δt = t_post − t_pre)
                  </label>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {stdpDeltaMs > 0 ? `+${stdpDeltaMs}` : stdpDeltaMs} ms
                  </span>
                </div>
                <input
                  id="stdp-timing-slider"
                  type="range"
                  min={-40}
                  max={40}
                  step={2}
                  value={stdpDeltaMs}
                  onChange={(e) => setStdpDeltaMs(Number(e.target.value))}
                  className="w-full accent-[#0284C7]"
                />
                <p className="text-[11px] text-slate-500">
                  “Cells that fire together, wire together” (Hebb, 1949). Pre-before-Post (Δt &gt; 0) strengthens synaptic weights.
                </p>
              </div>
            </div>
          )}

          {activeModule === 'thermodynamics' && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="temp-kelvin-slider" className="font-semibold text-slate-700">
                    System Temperature (T)
                  </label>
                  <span className="font-mono font-semibold text-[#0284C7] tabular-nums">
                    {temperatureK} K
                  </span>
                </div>
                <input
                  id="temp-kelvin-slider"
                  type="range"
                  min={1}
                  max={400}
                  step={1}
                  value={temperatureK}
                  onChange={(e) => setTemperatureK(Number(e.target.value))}
                  className="w-full accent-[#0284C7]"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <button
                    type="button"
                    onClick={() => setTemperatureK(1)}
                    className="hover:text-slate-900 underline"
                  >
                    1 K (2018 Quantum Magnet)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemperatureK(300)}
                    className="hover:text-slate-900 underline"
                  >
                    300 K (Room Temp)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="wire-length-slider" className="font-semibold text-slate-700">
                    Copper Interconnect Length (L)
                  </label>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {wireLengthMm} mm
                  </span>
                </div>
                <input
                  id="wire-length-slider"
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={wireLengthMm}
                  onChange={(e) => setWireLengthMm(Number(e.target.value))}
                  className="w-full accent-[#0284C7]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="doc-batch-slider" className="font-semibold text-slate-700">
                    Workload Scale (Millions of Documents)
                  </label>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {documentsMillions.toFixed(2)}M docs
                  </span>
                </div>
                <input
                  id="doc-batch-slider"
                  type="range"
                  min={0.01}
                  max={5.0}
                  step={0.05}
                  value={documentsMillions}
                  onChange={(e) => setDocumentsMillions(Number(e.target.value))}
                  className="w-full accent-[#0284C7]"
                />
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs space-y-1.5 text-slate-600">
                <div className="font-semibold text-slate-900">Global Infrastructure Context</div>
                <p>
                  Global data centers consumed ~460 TWh in 2022, with rack thermal densities scaling from 20 kW to 100 kW (Direct Liquid Cooling) and projected AI water demand reaching 4.2–6.6 billion m³ by 2027.
                </p>
              </div>
            </div>
          )}

          {activeModule === 'lithography' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">
                  Integrated Circuit Signaling Topology
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['digital', 'analog', 'mixed'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setIcSignalingType(mode)}
                      className={`rounded-lg border px-2.5 py-2 text-xs font-medium capitalize transition-colors ${
                        icSignalingType === mode
                          ? 'border-[#0284C7] bg-sky-50 text-[#0284C7]'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {mode}-Signal
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  {icSignalingType === 'digital' &&
                    'Digital ICs process discontinuous binary signals (0 and 1) via high/low voltage thresholds across CPUs, GPUs, and logic boards.'}
                  {icSignalingType === 'analog' &&
                    'Analog ICs process continuous signals over a range of voltages for linear sensors, power management, and audio amplifiers.'}
                  {icSignalingType === 'mixed' &&
                    'Mixed-Signal ICs combine analog and digital circuitry to bridge physical continuous environments and digital systems (ADC / DAC).'}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="clock-ghz-slider" className="font-semibold text-slate-700">
                    System Clock Frequency
                  </label>
                  <span className="font-mono font-semibold text-[#0284C7] tabular-nums">
                    {clockGhz.toFixed(1)} GHz
                  </span>
                </div>
                <input
                  id="clock-ghz-slider"
                  type="range"
                  min={1.0}
                  max={6.0}
                  step={0.2}
                  value={clockGhz}
                  onChange={(e) => setClockGhz(Number(e.target.value))}
                  className="w-full accent-[#0284C7]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="ipc-slider" className="font-semibold text-slate-700">
                    Instructions Per Clock (IPC)
                  </label>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {ipcValue.toFixed(1)} IPC
                  </span>
                </div>
                <input
                  id="ipc-slider"
                  type="range"
                  min={1.0}
                  max={8.0}
                  step={0.2}
                  value={ipcValue}
                  onChange={(e) => setIpcValue(Number(e.target.value))}
                  className="w-full accent-[#0284C7]"
                />
              </div>
            </div>
          )}

          {activeModule === 'agi_stack' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs text-slate-700">
                <div className="font-semibold text-slate-900">
                  Autoregressive Constraints vs. Planning
                </div>
                <p className="leading-relaxed">
                  While GPT-4 solved the 5-object stack and Kandinsky <em>Composition 8</em> vector geometry, its next-token autoregressive architecture processes tokens linearly without intrinsic backtracking—highlighting the gap between statistical generation and biological goal-directed planning.
                </p>
              </div>
              {stackEval.failureReason && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900">
                  <strong>Failure Mode Detected:</strong> {stackEval.failureReason}
                </div>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSaveCurrentSnapshot}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-4 py-3 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <BookmarkPlus className="h-4 w-4" />
              Save Experiment Snapshot
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
