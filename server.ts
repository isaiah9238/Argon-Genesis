import 'dotenv/config';
import express from 'express';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { GoogleGenAI, ThinkingLevel, Modality, GenerateVideosOperation, LiveServerMessage } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const PERSONA_INSTRUCTIONS: Record<string, string> = {
  neuromorphic:
    'You are a Principal Neuromorphic Biophysicist and Computing Architect. You specialize in McCulloch-Pitts neural logic, Hodgkin-Huxley / Na+-K+ action potentials, Spike-Timing-Dependent Plasticity (STDP), NbO2 ECRAM synapses, LLNL ionic computing, and overcoming the von Neumann bottleneck. Cite concrete numbers (e.g., 20W human brain vs 2.7GW supercomputer, 25% probabilistic synaptic transmission, IBM NorthPole 73x efficiency). Keep responses rigorous, clear, and well-structured.',
  epistemologist:
    "You are a Historian and Philosopher of Computation specializing in Ada Lovelace's Notes A & G (1843), the Lovelace Test (Bringsjord et al. 2001), Alan Turing's 1950 Imitation Game, the 1956 Dartmouth Summer Research Project, and Bubeck et al.'s 2023 'Sparks of AGI' experiments (Theory of Mind, Sally-Anne / Dropbox false belief, ZURFIN emotional attribution, and autoregressive token prediction constraints).",
  lithography:
    'You are a Senior Nanoscale Silicon & EUV Photolithography Engineer. You specialize in Czochralski monocrystalline silicon ingots (300mm), phosphorus/boron ion doping, EUV photoresist etching at 10-30nm gate features, copper vias, Instructions Per Clock (IPC), the silicon lottery, and mixed-signal / analog / digital IC topologies.',
  thermodynamics:
    "You are a Computational Thermodynamicist and Infrastructure Systems Analyst. You specialize in Landauer's Principle (k_B T ln 2 = 0.018 eV at 300K), 2016 nanomagnetic bit erasure (0.026 eV), wire capacitance dissipation (E ~ L), data center thermal rack densities (20-100 kW Direct Liquid Cooling), IEA energy projections, global water footprints (4.2-6.6B m³ by 2027), and the document-processing efficiency crossover between human labor (8 MWh/M docs) and AI (2-5 MWh/M docs).",
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const server = http.createServer(app);

  // 1. Gemini Intelligence Analysis Route (Fast / General / High Thinking)
  app.post('/api/gemini/analyze', async (req, res) => {
    try {
      const { prompt, mode = 'general', contextTopic = 'The Genesis of Machine Cognition' } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'A valid prompt string is required.' });
        return;
      }

      const ai = getAiClient();
      let model = 'gemini-3.8-flash';
      const config: Record<string, unknown> = {
        systemInstruction:
          'You are an expert research synthesizer for "The Genesis of Machine Cognition", connecting nanoscale silicon physics, historical foundations (Lovelace, Turing, McCulloch-Pitts, Dartmouth), emergent AGI capabilities, and thermodynamic/neuromorphic biophysics. Provide concise, quantitatively grounded analysis.',
      };

      if (mode === 'fast') {
        model = 'gemini-3.1-flash-lite';
      } else if (mode === 'deep_thinking') {
        model = 'gemini-4-argon';
        config.thinkingConfig = {
          thinkingLevel: ThinkingLevel.HIGH,
        };
      } else {
        model = 'gemini-3.8-flash';
      }

      const response = await ai.models.generateContent({
        model,
        contents: `Topic Context: ${contextTopic}\n\nResearch Query / Task:\n${prompt}`,
        config,
      });

      res.json({
        text: response.text || 'No response text generated.',
        modelUsed: model,
        thinkingLevel: mode === 'deep_thinking' ? 'HIGH' : 'STANDARD',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });

  // 2. Multi-Turn Gemini Chatbot Route
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const {
        messages = [],
        persona = 'neuromorphic',
        modelTier = 'gemini-3.8-flash',
        highThinking = false,
      } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: 'Messages array is required.' });
        return;
      }

      const ai = getAiClient();
      const selectedModel = highThinking
        ? 'gemini-4-argon'
        : ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'].includes(modelTier)
          ? modelTier
          : 'gemini-3.8-flash';

      const systemInstruction = PERSONA_INSTRUCTIONS[persona] || PERSONA_INSTRUCTIONS.neuromorphic;

      const formattedContents = messages.map((msg: { role: string; text: string }) => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(msg.text || '') }],
      }));

      const config: Record<string, unknown> = {
        systemInstruction,
      };

      if (selectedModel === 'gemini-4-argon' && highThinking) {
        config.thinkingConfig = {
          thinkingLevel: ThinkingLevel.HIGH,
        };
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: formattedContents,
        config,
      });

      res.json({
        text: response.text || 'No response generated.',
        modelUsed: selectedModel,
        highThinking: selectedModel === 'gemini-4-argon' && highThinking,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });

  // 3. Veo 3 Video Generation Routes (3-Step Pattern: Start -> Poll -> Download)
  app.post('/api/generate-video', async (req, res) => {
    try {
      const {
        prompt,
        aspectRatio = '16:9',
        resolution = '720p',
        model = 'veo-3.1-fast-generate-preview',
      } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'A video prompt is required.' });
        return;
      }

      const validAspectRatio = aspectRatio === '9:16' ? '9:16' : '16:9';
      const validResolution = resolution === '1080p' ? '1080p' : '720p';
      const ai = getAiClient();

      let operation;
      try {
        operation = await ai.models.generateVideos({
          model: model || 'veo-3.1-fast-generate-preview',
          prompt,
          config: {
            numberOfVideos: 1,
            resolution: validResolution,
            aspectRatio: validAspectRatio,
          },
        });
      } catch (err) {
        // Fallback to canonical alias veo-3.1-lite-generate-preview if preview alias differs
        operation = await ai.models.generateVideos({
          model: 'veo-3.1-lite-generate-preview',
          prompt,
          config: {
            numberOfVideos: 1,
            resolution: validResolution,
            aspectRatio: validAspectRatio,
          },
        });
      }

      res.json({ operationName: operation.name });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/video-status', async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName || typeof operationName !== 'string') {
        res.status(400).json({ error: 'operationName is required.' });
        return;
      }

      const ai = getAiClient();
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });

      res.json({
        done: Boolean(updated.done),
        error: updated.error ? JSON.stringify(updated.error) : null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/video-download', async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName || typeof operationName !== 'string') {
        res.status(400).json({ error: 'operationName is required.' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
        return;
      }

      const ai = getAiClient();
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

      if (!uri) {
        res.status(404).json({ error: 'Generated video URI is not available yet.' });
        return;
      }

      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': apiKey },
      });

      if (!videoRes.ok || !videoRes.body) {
        res.status(502).json({ error: `Failed to stream video asset (${videoRes.status}).` });
        return;
      }

      res.setHeader('Content-Type', 'video/mp4');
      await videoRes.body.pipeTo(
        new WritableStream({
          write(chunk) {
            res.write(chunk);
          },
          close() {
            res.end();
          },
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!res.headersSent) {
        res.status(500).json({ error: message });
      }
    }
  });

  // 4. WebSocket Bridge for Gemini Live API (gemini-3.8-live)
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`).pathname;
    if (pathname === '/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', async (clientWs, request) => {
    const url = new URL(request.url || '/live', `http://${request.headers.host || 'localhost'}`);
    const voiceName = url.searchParams.get('voice') || 'Zephyr';
    const persona = url.searchParams.get('persona') || 'neuromorphic';
    const systemInstruction =
      PERSONA_INSTRUCTIONS[persona] ||
      'You are an articulate scientific research partner discussing The Genesis of Machine Cognition—from silicon photolithography and Turing machines to Landauer thermodynamics and neuromorphic spiking neural networks.';

    let liveSession: Awaited<ReturnType<GoogleGenAI['live']['connect']>> | null = null;

    try {
      const ai = getAiClient();
      liveSession = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
          systemInstruction,
        },
        callbacks: {
          onopen: () => {
            if (clientWs.readyState === clientWs.OPEN) {
              clientWs.send(JSON.stringify({ type: 'connected', model: 'gemini-3.8-live', voiceName }));
            }
          },
          onmessage: (message: LiveServerMessage) => {
            if (clientWs.readyState !== clientWs.OPEN) return;
            const parts = message.serverContent?.modelTurn?.parts || [];
            for (const part of parts) {
              if (part.inlineData?.data) {
                clientWs.send(
                  JSON.stringify({
                    type: 'audio',
                    audio: part.inlineData.data,
                  })
                );
              }
              if (part.text) {
                clientWs.send(
                  JSON.stringify({
                    type: 'transcript',
                    text: part.text,
                  })
                );
              }
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: 'interrupted' }));
            }
          },
          onerror: (err: unknown) => {
            if (clientWs.readyState === clientWs.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: 'error',
                  error: err instanceof Error ? err.message : 'Gemini Live API stream error.',
                })
              );
            }
          },
          onclose: () => {
            if (clientWs.readyState === clientWs.OPEN) {
              clientWs.send(JSON.stringify({ type: 'closed' }));
            }
          },
        },
      });
    } catch (err) {
      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: 'error',
            error: err instanceof Error ? err.message : 'Unable to initialize Gemini 3.8 Live session.',
          })
        );
      }
      clientWs.close();
      return;
    }

    clientWs.on('message', (raw) => {
      try {
        const payload = JSON.parse(raw.toString());
        if (payload.audio && liveSession) {
          liveSession.sendRealtimeInput({
            audio: {
              data: payload.audio,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        } else if (payload.text && liveSession) {
          liveSession.sendClientContent({
            turns: [{ role: 'user', parts: [{ text: String(payload.text) }] }],
            turnComplete: true,
          });
        }
      } catch {
        // Ignore malformed packets
      }
    });

    clientWs.on('close', () => {
      try {
        liveSession?.close();
      } catch {
        // Ignore close errors
      }
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Genesis of Machine Cognition server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
