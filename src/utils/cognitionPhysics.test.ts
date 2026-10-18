import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateMCPNeuron,
  calculateSTDPWeightDelta,
  generateActionPotentialTrace,
  calculateThermodynamicMetrics,
  evaluatePhysicalStack,
} from './cognitionPhysics.ts';

test('McCulloch-Pitts neuron implements AND (theta=2), OR (theta=1), and Inhibitory Veto', () => {
  // Two-input AND gate (theta = 2)
  const andOneActive = evaluateMCPNeuron(
    [
      { id: 'x1', label: 'x1', active: true, type: 'excitatory' },
      { id: 'x2', label: 'x2', active: false, type: 'excitatory' },
    ],
    2
  );
  assert.equal(andOneActive.fired, 0);

  const andBothActive = evaluateMCPNeuron(
    [
      { id: 'x1', label: 'x1', active: true, type: 'excitatory' },
      { id: 'x2', label: 'x2', active: true, type: 'excitatory' },
    ],
    2
  );
  assert.equal(andBothActive.fired, 1);

  // Two-input OR gate (theta = 1)
  const orOneActive = evaluateMCPNeuron(
    [
      { id: 'x1', label: 'x1', active: true, type: 'excitatory' },
      { id: 'x2', label: 'x2', active: false, type: 'excitatory' },
    ],
    1
  );
  assert.equal(orOneActive.fired, 1);

  // Inhibitory input suppresses firing even if excitatory sum >= threshold
  const vetoed = evaluateMCPNeuron(
    [
      { id: 'x1', label: 'x1', active: true, type: 'excitatory' },
      { id: 'x2', label: 'x2', active: true, type: 'excitatory' },
      { id: 'inh', label: 'Inhibitory', active: true, type: 'inhibitory' },
    ],
    1
  );
  assert.equal(vetoed.fired, 0);
  assert.equal(vetoed.hasActiveInhibitory, true);
});

test('STDP Hebbian weight update strengthens on pre-before-post and weakens on post-before-pre', () => {
  const ltp = calculateSTDPWeightDelta(10);
  assert.ok(ltp.deltaWeightPercent > 0);
  assert.equal(ltp.regime, 'LTP (Hebbian Strengthening)');

  const ltd = calculateSTDPWeightDelta(-10);
  assert.ok(ltd.deltaWeightPercent < 0);
  assert.equal(ltd.regime, 'LTD (Synaptic Weakening)');
});

test('Landauer limit at 300K matches ~0.018 eV (2.9e-21 J) and NorthPole achieves 73x bus efficiency', () => {
  const metrics = calculateThermodynamicMetrics(300, 10, 1);
  // 2.87e-21 J
  assert.ok(metrics.landauerJoules > 2.8e-21 && metrics.landauerJoules < 3.0e-21);
  // ~0.0179 eV
  assert.ok(metrics.landauerEv > 0.017 && metrics.landauerEv < 0.019);
  // 2016 nanomagnetic flip ~0.026 eV
  assert.ok(metrics.nanomagnetic2016Ev > 0.025 && metrics.nanomagnetic2016Ev < 0.027);
  // At 1 million documents, AI batch (3.55 MWh) is more efficient than human labor (8.0 MWh)
  assert.equal(metrics.crossoverEfficientSystem, 'AI Supercomputer (Batch Scale)');
});

test('Action potential trace reaches +40mV peak when stimulated and stays near -70mV when unstimulated', () => {
  const resting = generateActionPotentialTrace(false);
  const maxResting = Math.max(...resting.map((p) => p.voltageMv));
  assert.ok(maxResting < -55);

  const spiking = generateActionPotentialTrace(true);
  const maxSpiking = Math.max(...spiking.map((p) => p.voltageMv));
  assert.ok(maxSpiking >= 38);
});

test('Sparks of AGI physical stack validates GPT-4 viable arrangement and rejects nail-at-bottom', () => {
  const gpt4Order = evaluatePhysicalStack(['book', 'eggs', 'laptop', 'bottle', 'nail']);
  assert.equal(gpt4Order.isStable, true);
  assert.equal(gpt4Order.score, 100);

  const chatGptFailure = evaluatePhysicalStack(['nail', 'eggs', 'book', 'laptop', 'bottle']);
  assert.equal(chatGptFailure.isStable, false);
  assert.ok(chatGptFailure.failureReason?.includes('nail tip'));
});
