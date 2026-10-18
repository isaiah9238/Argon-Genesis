/**
 * Pure computational, thermodynamic, biophysical, and historical models
 * for "The Genesis of Machine Cognition".
 */

export const BOLTZMANN_CONSTANT_J_PER_K = 1.38e-23;
export const JOULES_PER_EV = 1.602176634e-19;
export const LN2 = Math.LN2;

export interface MCPInput {
  id: string;
  label: string;
  active: boolean;
  type: 'excitatory' | 'inhibitory';
}

export interface MCPEvaluationResult {
  excitatorySum: number;
  hasActiveInhibitory: boolean;
  threshold: number;
  fired: 0 | 1;
  stateLabel: string;
  equationText: string;
}

/**
 * Evaluates a McCulloch-Pitts (1943) binary logic neuron:
 * - Any active inhibitory input suppresses firing completely (output = 0).
 * - Otherwise, sums excitatory inputs g(x) = sum(x_i) and fires 1 iff g(x) >= theta.
 */
export function evaluateMCPNeuron(inputs: MCPInput[], threshold: number): MCPEvaluationResult {
  const hasActiveInhibitory = inputs.some((inp) => inp.type === 'inhibitory' && inp.active);
  const excitatorySum = inputs.filter((inp) => inp.type === 'excitatory' && inp.active).length;

  let fired: 0 | 1 = 0;
  let stateLabel = 'SUPPRESSED (BELOW THRESHOLD)';

  if (hasActiveInhibitory) {
    fired = 0;
    stateLabel = 'VETOED (INHIBITORY ACTIVE)';
  } else if (excitatorySum >= threshold) {
    fired = 1;
    stateLabel = 'ACTION POTENTIAL FIRED (1)';
  }

  const equationText = hasActiveInhibitory
    ? `Inhibitory Veto Active -> Output y = 0`
    : `g(x) = ${excitatorySum} ${excitatorySum >= threshold ? '>=' : '<'} θ (${threshold}) -> Output y = ${fired}`;

  return {
    excitatorySum,
    hasActiveInhibitory,
    threshold,
    fired,
    stateLabel,
    equationText,
  };
}

/**
 * Computes Spike-Timing-Dependent Plasticity (STDP) synaptic weight change (%)
 * based on deltaT = t_post - t_pre (in milliseconds).
 * Pre-before-Post (deltaT > 0) induces Long-Term Potentiation (LTP, Hebbian strengthening).
 * Post-before-Pre (deltaT < 0) induces Long-Term Depression (LTD, weakening).
 */
export function calculateSTDPWeightDelta(deltaTMs: number): {
  deltaWeightPercent: number;
  regime: 'LTP (Hebbian Strengthening)' | 'LTD (Synaptic Weakening)' | 'Neutral Coincidence';
} {
  if (Math.abs(deltaTMs) < 0.5) {
    return { deltaWeightPercent: 0, regime: 'Neutral Coincidence' };
  }
  const tauPlus = 20; // ms
  const tauMinus = 20; // ms
  const aPlus = 45; // max % potentiation
  const aMinus = -35; // max % depression

  if (deltaTMs > 0) {
    const val = aPlus * Math.exp(-deltaTMs / tauPlus);
    return {
      deltaWeightPercent: Number(val.toFixed(2)),
      regime: 'LTP (Hebbian Strengthening)',
    };
  } else {
    const val = aMinus * Math.exp(deltaTMs / tauMinus);
    return {
      deltaWeightPercent: Number(val.toFixed(2)),
      regime: 'LTD (Synaptic Weakening)',
    };
  }
}

export interface ActionPotentialPoint {
  timeMs: number;
  voltageMv: number;
  phase: 'Resting (-70mV)' | 'Depolarization (Na+ Influx)' | 'Repolarization (K+ Efflux)' | 'Hyperpolarization';
}

/**
 * Generates a biophysical membrane voltage trace (in mV over 5ms)
 * modeling Na+/K+ pump resting potential (-70mV) and voltage-gated ion channel kinetics.
 */
export function generateActionPotentialTrace(stimulated: boolean): ActionPotentialPoint[] {
  const points: ActionPotentialPoint[] = [];
  for (let i = 0; i <= 50; i++) {
    const t = Number((i * 0.1).toFixed(1));
    if (!stimulated) {
      // Sub-threshold graded potential bump that decays back to -70mV
      const bump = t >= 1.0 && t <= 3.0 ? 8 * Math.sin(((t - 1.0) / 2.0) * Math.PI) : 0;
      points.push({
        timeMs: t,
        voltageMv: Number((-70 + bump).toFixed(1)),
        phase: 'Resting (-70mV)',
      });
      continue;
    }

    let v = -70;
    let phase: ActionPotentialPoint['phase'] = 'Resting (-70mV)';
    if (t < 1.0) {
      v = -70 + t * 5;
      phase = 'Resting (-70mV)';
    } else if (t >= 1.0 && t < 1.8) {
      // Rapid Na+ influx depolarization from -55mV threshold to +40mV peak
      const norm = (t - 1.0) / 0.8;
      v = -55 + 95 * Math.sin(norm * (Math.PI / 2));
      phase = 'Depolarization (Na+ Influx)';
    } else if (t >= 1.8 && t < 3.2) {
      // K+ efflux repolarization from +40mV down to -82mV undershoot
      const norm = (t - 1.8) / 1.4;
      v = 40 - 122 * Math.sin(norm * (Math.PI / 2));
      phase = 'Repolarization (K+ Efflux)';
    } else if (t >= 3.2 && t < 4.4) {
      // Refractory hyperpolarization recovery via 3Na+/2K+ ATPase pump
      const norm = (t - 3.2) / 1.2;
      v = -82 + 12 * norm;
      phase = 'Hyperpolarization';
    } else {
      v = -70;
      phase = 'Resting (-70mV)';
    }

    points.push({
      timeMs: t,
      voltageMv: Number(v.toFixed(1)),
      phase,
    });
  }
  return points;
}

export interface ThermodynamicMetrics {
  temperatureK: number;
  landauerJoules: number;
  landauerEv: number;
  nanomagnetic2016Ev: number;
  cmosSiliconJoules: number;
  cmosToLandauerRatio: number;
  vonNeumannBusEnergyPj: number;
  northPoleEnergyPj: number;
  documentBatchAiMwh: number;
  documentBatchHumanMwh: number;
  crossoverEfficientSystem: 'AI Supercomputer (Batch Scale)' | 'Human Brain (Low Volume Metabolic)';
}

/**
 * Computes Landauer's Principle minimum bit erasure energy (E = k_B * T * ln(2)),
 * copper interconnect bus energy (E ~ L), IBM NorthPole 73x efficiency comparison,
 * and the human vs. AI document batch processing crossover.
 */
export function calculateThermodynamicMetrics(
  temperatureK: number,
  wireLengthMm: number,
  documentsMillions: number
): ThermodynamicMetrics {
  const safeTemp = Math.max(1, temperatureK);
  const safeWire = Math.max(0.1, wireLengthMm);
  const safeDocs = Math.max(0.001, documentsMillions);

  const landauerJoules = BOLTZMANN_CONSTANT_J_PER_K * safeTemp * LN2;
  const landauerEv = landauerJoules / JOULES_PER_EV;

  // 2016 laser probe nanomagnetic bit flip was 0.026 eV at 300K (~44% above Landauer limit)
  const nanomagnetic2016Ev = landauerEv * 1.44;

  // Modern CMOS silicon uses ~1e9 times Landauer limit at 300K (~2.9e-12 J)
  const cmosSiliconJoules = 2.87e-12;
  const cmosToLandauerRatio = cmosSiliconJoules / landauerJoules;

  // Von Neumann bus energy proportional to wire length L (in pJ per access)
  const vonNeumannBusEnergyPj = Number((safeWire * 1.85).toFixed(2));
  // IBM NorthPole co-located memory architecture achieves up to 73x energy efficiency
  const northPoleEnergyPj = Number((vonNeumannBusEnergyPj / 73).toFixed(4));

  // Document batch scaling: AI uses ~3.5 MWh per million docs (2-5 MWh range) + fixed amortised inference setup,
  // whereas human labor scales linearly at ~8 MWh per million documents.
  const documentBatchAiMwh = Number((0.05 + safeDocs * 3.5).toFixed(3));
  const documentBatchHumanMwh = Number((safeDocs * 8.0).toFixed(3));

  const crossoverEfficientSystem =
    documentBatchAiMwh < documentBatchHumanMwh
      ? 'AI Supercomputer (Batch Scale)'
      : 'Human Brain (Low Volume Metabolic)';

  return {
    temperatureK: safeTemp,
    landauerJoules,
    landauerEv,
    nanomagnetic2016Ev,
    cmosSiliconJoules,
    cmosToLandauerRatio,
    vonNeumannBusEnergyPj,
    northPoleEnergyPj,
    documentBatchAiMwh,
    documentBatchHumanMwh,
    crossoverEfficientSystem,
  };
}

export interface StackItem {
  id: 'book' | 'eggs' | 'laptop' | 'bottle' | 'nail';
  label: string;
  massGrams: number;
  contactAreaCm2: number;
  crushLimitGrams: number;
}

export const STACK_ITEMS_CATALOG: Record<StackItem['id'], StackItem> = {
  book: { id: 'book', label: 'Hardcover Book (Flat Base)', massGrams: 850, contactAreaCm2: 450, crushLimitGrams: 50000 },
  eggs: { id: 'eggs', label: '9 Eggs in 3×3 Grid', massGrams: 540, contactAreaCm2: 27, crushLimitGrams: 3500 },
  laptop: { id: 'laptop', label: 'Closed Aluminum Laptop', massGrams: 1400, contactAreaCm2: 650, crushLimitGrams: 15000 },
  bottle: { id: 'bottle', label: 'Empty Sealed Bottle (Upright)', massGrams: 220, contactAreaCm2: 38, crushLimitGrams: 8000 },
  nail: { id: 'nail', label: 'Iron Nail (Balanced on Cap)', massGrams: 12, contactAreaCm2: 0.4, crushLimitGrams: 20000 },
};

export interface StackValidationResult {
  isStable: boolean;
  score: number;
  failureReason: string | null;
  layerAnalysis: {
    itemId: StackItem['id'];
    label: string;
    massAboveGrams: number;
    status: 'STABLE' | 'UNSTABLE_GEOMETRY' | 'CRUSHED';
    note: string;
  }[];
}

/**
 * Evaluates the GPT-4 "Sparks of AGI" physical commonsense vertical stack challenge
 * from bottom (index 0) to top (index 4).
 * Optimal viable order: ['book', 'eggs', 'laptop', 'bottle', 'nail'].
 */
export function evaluatePhysicalStack(bottomToTopOrder: StackItem['id'][]): StackValidationResult {
  if (bottomToTopOrder.length !== 5) {
    return {
      isStable: false,
      score: 0,
      failureReason: 'Stack must include all 5 physical objects.',
      layerAnalysis: [],
    };
  }

  let failureReason: string | null = null;
  const layerAnalysis: StackValidationResult['layerAnalysis'] = [];

  for (let i = 0; i < bottomToTopOrder.length; i++) {
    const currentId = bottomToTopOrder[i];
    const currentItem = STACK_ITEMS_CATALOG[currentId];
    const itemsAbove = bottomToTopOrder.slice(i + 1).map((id) => STACK_ITEMS_CATALOG[id]);
    const massAboveGrams = itemsAbove.reduce((acc, item) => acc + item.massGrams, 0);
    const immediateAbove = i < bottomToTopOrder.length - 1 ? STACK_ITEMS_CATALOG[bottomToTopOrder[i + 1]] : null;

    let status: 'STABLE' | 'UNSTABLE_GEOMETRY' | 'CRUSHED' = 'STABLE';
    let note = `Supports ${massAboveGrams}g load safely.`;

    if (currentId === 'nail' && immediateAbove) {
      status = 'UNSTABLE_GEOMETRY';
      note = `Cannot balance ${immediateAbove.label} on a 0.4 cm² nail tip (ChatGPT classic failure).`;
      if (!failureReason) failureReason = note;
    } else if (currentId === 'bottle' && immediateAbove && immediateAbove.id !== 'nail') {
      status = 'UNSTABLE_GEOMETRY';
      note = `Narrow bottle cap cannot stably support ${immediateAbove.label} without tipping.`;
      if (!failureReason) failureReason = note;
    } else if (currentId === 'eggs' && immediateAbove && immediateAbove.id === 'bottle') {
      status = 'CRUSHED';
      note = `Point load of bottle base fractures curved eggshells without a flat distributor (laptop/book).`;
      if (!failureReason) failureReason = note;
    } else if (massAboveGrams > currentItem.crushLimitGrams) {
      status = 'CRUSHED';
      note = `Load above (${massAboveGrams}g) exceeds structural limit (${currentItem.crushLimitGrams}g).`;
      if (!failureReason) failureReason = note;
    } else if (currentId === 'eggs' && immediateAbove) {
      note = `3×3 egg array distributes ${massAboveGrams}g evenly (${(massAboveGrams / 9).toFixed(0)}g per egg).`;
    }

    layerAnalysis.push({
      itemId: currentId,
      label: currentItem.label,
      massAboveGrams,
      status,
      note,
    });
  }

  const stableCount = layerAnalysis.filter((l) => l.status === 'STABLE').length;
  const isStable = failureReason === null && stableCount === 5;
  const score = isStable ? 100 : Math.max(10, stableCount * 18);

  return {
    isStable,
    score,
    failureReason,
    layerAnalysis,
  };
}

export interface ScaleComparisonItem {
  id: string;
  name: string;
  nanometers: number;
  displayValue: string;
  category: 'Semiconductor' | 'Biological';
  roleDescription: string;
}

export const NANOSCALE_BENCHMARKS: ScaleComparisonItem[] = [
  {
    id: 'transistor_gate',
    name: 'Advanced Microchip Circuit Feature',
    nanometers: 20,
    displayValue: '~10 to 30 nm',
    category: 'Semiconductor',
    roleDescription: 'Minimum physical dimension of modern EUV photolithography transistor gates.',
  },
  {
    id: 'influenza_virus',
    name: 'Influenza Virus Diameter',
    nanometers: 100,
    displayValue: '~100 nm',
    category: 'Biological',
    roleDescription: 'Standard biological benchmark for sub-micron physical scale.',
  },
  {
    id: 'red_blood_cell',
    name: 'Human Red Blood Cell Diameter',
    nanometers: 7000,
    displayValue: '~7,000 nm',
    category: 'Biological',
    roleDescription: 'Cellular scale benchmark illustrating semiconductor physical precision.',
  },
  {
    id: 'silicon_ingot',
    name: 'Monocrystalline Silicon Ingot Diameter',
    nanometers: 300000000,
    displayValue: '300,000,000 nm (30 cm)',
    category: 'Semiconductor',
    roleDescription: 'Maximum physical scale of purified Czochralski silicon rods sliced into wafers.',
  },
];
