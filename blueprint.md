# Genesis of Machine Cognition — Project Blueprint

## 1. Purpose & Capabilities Overview

**Genesis of Machine Cognition** is an interactive scientific simulation, historical archive, and multimodal AI research workbench that bridges physical electrical signals in nanoscale silicon, historical foundations of symbolic and connectionist logic, emergent capabilities and bottlenecks of modern autoregressive models, and the biophysical thermodynamics of neuromorphic and ionic computing.

### Core Capabilities
1. **Interactive Biophysical & Thermodynamic Sandbox (`/`)**:
   - **McCulloch-Pitts & Spiking Neural Lab**: Interactive binary logic unit ($g(x) = \sum x_i \ge \theta$), inhibitory veto gating, preset Boolean configurations (AND, OR, NOT), biophysical $Na^+/K^+$ action potential membrane voltage trace, and Spike-Timing-Dependent Plasticity (STDP) curve.
   - **Thermodynamics, Landauer's Principle & Von Neumann Bottleneck**: Interactive calculator for Landauer's theoretical erasure minimum ($E = k_B T \ln 2$), copper interconnect wire dissipation ($E \propto L$), IBM NorthPole ($73\times$ efficiency) vs. Von Neumann GPU comparison, and the Human Brain ($20\text{ W}$) vs. Supercomputer ($2.7\text{ GW}$) document-scaling crossover model.
   - **Silicon Photolithography & Nanoscale Scale Comparator**: 5-stage EUV wafer fabrication process explorer (Silica Ingot $\to$ Oxide Deposition $\to$ EUV Photolithography $\to$ Ion Doping & Etching $\to$ Vias & Tape-Out) and logarithmic scale comparator ($10\text{ nm}$ transistor gate to $300,000,000\text{ nm}$ silicon ingot), plus IPC vs. Clock Frequency throughput modeling.
   - **Sparks of AGI: Physical Commonsense & Theory of Mind**: Interactive 5-object physical stability stacker (Book, $3\times 3$ Eggs, Laptop, Bottle, Nail) evaluating center-of-mass and crush physics, paired with an epistemic state tracker for the digital Sally-Anne / Dropbox false-belief test and ZURFIN emotional attribution test.
2. **Historical & Scientific Chronicle (`/chronicle`)**:
   - Curated interactive modules covering Ada Lovelace's Notes A & G (1843), McCulloch & Pitts (1943), Alan Turing's Imitation Game (1950), the Dartmouth Summer Research Project (1956), Landauer's Principle (1961), AlphaFold & Levinthal's Paradox (2020), Sparks of AGI (2023), and Neuromorphic/Ionic Biophysics (2025+).
   - **Embedded Gemini Intelligence**: Instant analysis using `gemini-3.1-flash-lite` (Fast Triage), `gemini-3.8-flash` (General Synthesis), and `gemini-4-argon` with `ThinkingLevel.HIGH` (Deep Architectural & Thermodynamic Critique).
3. **Cognitive Research Chat Studio (`/chat`)**:
   - Multi-turn conversational interface powered by `gemini-4-argon` (with High Thinking mode `ThinkingLevel.HIGH`), `gemini-3.8-flash`, and `gemini-3.1-flash-lite`.
   - Configurable domain personas via `systemInstruction` (*Neuromorphic Biophysicist*, *Turing-Lovelace Epistemologist*, *EUV Silicon Architect*, *Thermodynamic Systems Analyst*).
   - Persistent conversation history stored in Cloud Firestore.
4. **Veo 3 Scientific Video Visualizer (`/video`)**:
   - Server-side 3-step video generation pipeline (`veo-3.1-fast-generate-preview` / `veo-3.1-lite-generate-preview`) supporting `16:9` (Landscape) and `9:16` (Portrait) aspect ratios.
   - Scientific visualization presets for nanoscale EUV lithography, synaptic ion channel depolarization, and protein folding conformations.
5. **Live API Real-Time Voice Lab (`/voice`)**:
   - Real-time bidirectional voice conversation with `gemini-3.8-live` over WebSocket (`/live`), featuring 16kHz PCM microphone capture, 24kHz audio playback, selectable voice personas (`Zephyr`, `Kore`, `Puck`, `Charon`, `Fenrir`), and live audio waveform telemetry.
6. **Firebase Authentication & Cloud Firestore Persistence**:
   - Google Sign-In (`signInWithPopup`) via Firebase Auth.
   - Persistent storage of Experiment Snapshots (`/experiments/{experimentId}`), Research Notes (`/notes/{noteId}`), and Chat Sessions (`/sessions/{sessionId}`) governed by Zero-Trust Attribute-Based Access Control (ABAC) Firestore Security Rules.

---

## 2. Design System, Architecture & Visual Specification

- **Aesthetic Direction**: Scientific Instrument & Editorial Simulation Sandbox following the 60-30-10 color allocation rule:
  - **60% Dominant Neutral Canvas**: Crisp Alabaster (`#F8FAFC`) with subtle technical coordinate grid and tactile surface hierarchy.
  - **30% Structural Surfaces**: Pure White (`#FFFFFF`) and Slate (`#F1F5F9`) panels with `1px solid #E2E8F0` hairline dividers.
  - **10% Semantic Focal Accents**: Cerulean Azure (`#0284C7`) for nominal/excitatory states, Emerald (`#059669`) for biophysical efficiency, Amber (`#D97706`) for thermal load, and Coral Red (`#DC2626`) for inhibitory/bottleneck alerts—always paired with explicit text labels and glyphs.
- **Typography (2+1 Font Rule)**:
  - **Display / Editorial Titles**: `Fraunces` (serif) for historical chapters and primary scientific headings.
  - **UI & Body Prose**: `Plus Jakarta Sans` for crisp legibility across controls and narrative explanations.
  - **Data, Equations & Telemetry**: `IBM Plex Mono` with `tabular-nums` for all numeric readouts, nanoscale tables, and thermodynamic equations.
- **Top Bar Contract**:
  - Single-row 3-zone header: Brand Wordmark (`Genesis of Machine Cognition`) | 5 single-line navigation links (`Simulations`, `Chronicle`, `Research Chat`, `Video Lab`, `Voice Live`) | 1 Primary Auth/Lab Action (`Sign In` or User Profile & Saved Lab drawer trigger).

---

## 3. Implementation Plan & Execution Steps

1. **Configuration & Schema Setup**:
   - Configure `.idx/mcp.json`, `metadata.json`, `index.html`, and `firebase-blueprint.json`.
   - Author `security_spec.md`, `firestore.rules.test.ts`, and hardened `firestore.rules`, validate with `@firebase/eslint-plugin-security-rules`, and deploy via `DeployRules` RPC.
2. **Core Physics & Biophysical Engine (`src/utils/cognitionPhysics.ts`)**:
   - Implement pure, unit-tested calculations for McCulloch-Pitts logic gates, STDP weight updates, Landauer's limit, Von Neumann bus dissipation, action potential membrane kinetics, nanoscale ratio scaling, and physical stack stability.
   - Verify with `node --test` (`src/utils/cognitionPhysics.test.ts`).
3. **Full-Stack Express + Gemini + WebSocket Server (`server.ts`)**:
   - Implement `/api/gemini/analyze`, `/api/gemini/chat`, `/api/generate-video`, `/api/video-status`, `/api/video-download`, and the `/live` WebSocket bridge for `gemini-3.8-live`.
4. **Modular React Frontend (`src/components/*`)**:
   - Build `FirebaseProvider` with connection test (`getDocFromServer`) and structured `handleFirestoreError` reporting.
   - Build the 5 primary routes using `react-router-dom` (`SimulationsView`, `ChronicleView`, `ResearchChatView`, `VideoLabView`, `VoiceLiveView`) and the persistent `SavedLabDrawer`.
5. **End-to-End Verification**:
   - Run unit tests (`node --test`), TypeScript lint (`lint_applet`), production build (`compile_applet`), and live browser verification via `playwright-cli` across desktop (`1440x900`) and mobile (`390x844`) viewports.
