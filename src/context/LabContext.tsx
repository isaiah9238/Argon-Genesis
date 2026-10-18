import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  BLUEPRINT_CONSTRAINTS,
  sanitizeString,
} from '../firebase';

export interface ExperimentRecord {
  id: string;
  ownerId: string;
  title: string;
  moduleType: 'mcp_spiking' | 'thermodynamics' | 'lithography' | 'agi_stack';
  summary: string;
  parameters: Record<string, number | string | boolean>;
  status: 'active' | 'archived';
  createdAtLabel: string;
}

export interface ResearchNoteRecord {
  id: string;
  ownerId: string;
  topic: string;
  modelUsed: string;
  content: string;
  createdAtLabel: string;
}

export interface ChatSessionRecord {
  id: string;
  ownerId: string;
  title: string;
  persona: string;
  model: string;
  lastMessagePreview: string;
  messageCount: number;
  createdAtLabel: string;
}

const INITIAL_SEED_EXPERIMENTS: ExperimentRecord[] = [
  {
    id: 'seed_exp_mcp_and',
    ownerId: 'local_seed',
    title: 'McCulloch-Pitts 2-Input AND Gate (θ = 2)',
    moduleType: 'mcp_spiking',
    summary: 'g(x) = 2 >= θ (2) -> Action Potential Fired (1) · Peak +40.0 mV · STDP LTP +27.3%',
    parameters: { threshold: 2, excitatoryActive: 2, inhibitoryActive: 0, stdpDeltaMs: 10 },
    status: 'active',
    createdAtLabel: 'Baseline Seed',
  },
  {
    id: 'seed_exp_landauer_300k',
    ownerId: 'local_seed',
    title: 'Room-Temp Landauer Limit vs. IBM NorthPole',
    moduleType: 'thermodynamics',
    summary: 'T = 300 K · Landauer Min = 0.0179 eV (2.87e-21 J) · NorthPole 73× Bus Efficiency',
    parameters: { temperatureK: 300, wireLengthMm: 12, documentsMillions: 1.5 },
    status: 'active',
    createdAtLabel: 'Baseline Seed',
  },
];

const INITIAL_SEED_NOTES: ResearchNoteRecord[] = [
  {
    id: 'seed_note_lovelace_turing',
    ownerId: 'local_seed',
    topic: 'Lady Lovelace’s Objection vs. Turing’s Emergent Surprise',
    modelUsed: 'gemini-4-argon (High Thinking)',
    content:
      'In Note G (1843), Ada Lovelace posited that the Analytical Engine has no pretensions to originate anything beyond what humans order it to perform. In 1950, Alan Turing countered that deterministic machines routinely exhibit emergent behaviors their programmers cannot calculate in advance—a tension formalized in the 2001 Lovelace Test and demonstrated in 2023 GPT-4 Theory of Mind experiments.',
    createdAtLabel: 'Baseline Seed',
  },
];

interface LabContextValue {
  user: User | null;
  authReady: boolean;
  authError: string | null;
  experiments: ExperimentRecord[];
  notes: ResearchNoteRecord[];
  sessions: ChatSessionRecord[];
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  saveExperiment: (input: {
    title: string;
    moduleType: ExperimentRecord['moduleType'];
    summary: string;
    parameters: Record<string, number | string | boolean>;
  }) => Promise<void>;
  archiveExperiment: (id: string) => Promise<void>;
  deleteExperiment: (id: string) => Promise<void>;
  saveResearchNote: (input: { topic: string; modelUsed: string; content: string }) => Promise<void>;
  deleteResearchNote: (id: string) => Promise<void>;
  saveChatSessionSummary: (input: {
    title: string;
    persona: string;
    model: string;
    lastMessagePreview: string;
    messageCount: number;
  }) => Promise<void>;
}

const LabContext = createContext<LabContextValue | null>(null);

export const LabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [localExperiments, setLocalExperiments] = useState<ExperimentRecord[]>(INITIAL_SEED_EXPERIMENTS);
  const [cloudExperiments, setCloudExperiments] = useState<ExperimentRecord[]>([]);
  const [localNotes, setLocalNotes] = useState<ResearchNoteRecord[]>(INITIAL_SEED_NOTES);
  const [cloudNotes, setCloudNotes] = useState<ResearchNoteRecord[]>([]);
  const [localSessions, setLocalSessions] = useState<ChatSessionRecord[]>([]);
  const [cloudSessions, setCloudSessions] = useState<ChatSessionRecord[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady || !user) {
      setCloudExperiments([]);
      setCloudNotes([]);
      setCloudSessions([]);
      return;
    }

    const expQuery = query(collection(db, 'experiments'), where('ownerId', '==', user.uid));
    const unsubExp = onSnapshot(
      expQuery,
      (snap) => {
        const items: ExperimentRecord[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ownerId: String(data.ownerId || user.uid),
            title: String(data.title || 'Untitled Experiment'),
            moduleType: (data.moduleType as ExperimentRecord['moduleType']) || 'mcp_spiking',
            summary: String(data.summary || ''),
            parameters: (data.parameters as Record<string, number | string | boolean>) || {},
            status: data.status === 'archived' ? 'archived' : 'active',
            createdAtLabel: 'Cloud Synced',
          };
        });
        setCloudExperiments(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'experiments');
      }
    );

    const notesQuery = query(collection(db, 'notes'), where('ownerId', '==', user.uid));
    const unsubNotes = onSnapshot(
      notesQuery,
      (snap) => {
        const items: ResearchNoteRecord[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ownerId: String(data.ownerId || user.uid),
            topic: String(data.topic || 'Untitled Note'),
            modelUsed: String(data.modelUsed || 'gemini-3.8-flash'),
            content: String(data.content || ''),
            createdAtLabel: 'Cloud Synced',
          };
        });
        setCloudNotes(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'notes');
      }
    );

    const sessionsQuery = query(collection(db, 'sessions'), where('ownerId', '==', user.uid));
    const unsubSessions = onSnapshot(
      sessionsQuery,
      (snap) => {
        const items: ChatSessionRecord[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ownerId: String(data.ownerId || user.uid),
            title: String(data.title || 'Research Thread'),
            persona: String(data.persona || 'neuromorphic'),
            model: String(data.model || 'gemini-3.8-flash'),
            lastMessagePreview: String(data.lastMessagePreview || ''),
            messageCount: Number(data.messageCount || 1),
            createdAtLabel: 'Cloud Synced',
          };
        });
        setCloudSessions(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'sessions');
      }
    );

    return () => {
      unsubExp();
      unsubNotes();
      unsubSessions();
    };
  }, [authReady, user]);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Google Sign-In was cancelled or blocked.');
    }
  };

  const signOut = async () => {
    setAuthError(null);
    await firebaseSignOut(auth);
  };

  const saveExperiment: LabContextValue['saveExperiment'] = async ({
    title,
    moduleType,
    summary,
    parameters,
  }) => {
    const cleanId = `exp_${Date.now()}`;
    const safeTitle = sanitizeString(title, BLUEPRINT_CONSTRAINTS.EXPERIMENT_TITLE_MAX, 'Simulation Snapshot');
    const safeSummary = sanitizeString(summary, BLUEPRINT_CONSTRAINTS.EXPERIMENT_SUMMARY_MAX, 'Telemetry recorded');

    if (user && user.emailVerified) {
      const path = `experiments/${cleanId}`;
      try {
        await setDoc(doc(db, 'experiments', cleanId), {
          ownerId: user.uid,
          title: safeTitle,
          moduleType,
          summary: safeSummary,
          parameters,
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }

    setLocalExperiments((prev) => [
      {
        id: cleanId,
        ownerId: user?.uid || 'local_session',
        title: safeTitle,
        moduleType,
        summary: safeSummary,
        parameters,
        status: 'active',
        createdAtLabel: 'Just now',
      },
      ...prev,
    ]);
  };

  const archiveExperiment = async (id: string) => {
    if (user && cloudExperiments.some((e) => e.id === id)) {
      const path = `experiments/${id}`;
      try {
        await updateDoc(doc(db, 'experiments', id), {
          status: 'archived',
          updatedAt: serverTimestamp(),
        });
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
    setLocalExperiments((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'archived' } : e))
    );
  };

  const deleteExperiment = async (id: string) => {
    if (user && cloudExperiments.some((e) => e.id === id)) {
      const path = `experiments/${id}`;
      try {
        await deleteDoc(doc(db, 'experiments', id));
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
    setLocalExperiments((prev) => prev.filter((e) => e.id !== id));
  };

  const saveResearchNote: LabContextValue['saveResearchNote'] = async ({
    topic,
    modelUsed,
    content,
  }) => {
    const cleanId = `note_${Date.now()}`;
    const safeTopic = sanitizeString(topic, BLUEPRINT_CONSTRAINTS.NOTE_TOPIC_MAX, 'Research Synthesis');
    const safeModel = sanitizeString(modelUsed, BLUEPRINT_CONSTRAINTS.NOTE_MODEL_MAX, 'gemini-3.8-flash');
    const safeContent = sanitizeString(content, BLUEPRINT_CONSTRAINTS.NOTE_CONTENT_MAX, 'Analysis complete.');

    if (user && user.emailVerified) {
      const path = `notes/${cleanId}`;
      try {
        await setDoc(doc(db, 'notes', cleanId), {
          ownerId: user.uid,
          topic: safeTopic,
          modelUsed: safeModel,
          content: safeContent,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }

    setLocalNotes((prev) => [
      {
        id: cleanId,
        ownerId: user?.uid || 'local_session',
        topic: safeTopic,
        modelUsed: safeModel,
        content: safeContent,
        createdAtLabel: 'Just now',
      },
      ...prev,
    ]);
  };

  const deleteResearchNote = async (id: string) => {
    if (user && cloudNotes.some((n) => n.id === id)) {
      const path = `notes/${id}`;
      try {
        await deleteDoc(doc(db, 'notes', id));
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
    setLocalNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const saveChatSessionSummary: LabContextValue['saveChatSessionSummary'] = async ({
    title,
    persona,
    model,
    lastMessagePreview,
    messageCount,
  }) => {
    const cleanId = `sess_${Date.now()}`;
    const safeTitle = sanitizeString(title, BLUEPRINT_CONSTRAINTS.SESSION_TITLE_MAX, 'Cognitive Research Dialogue');
    const safePersona = sanitizeString(persona, 64, 'neuromorphic');
    const safeModel = sanitizeString(model, 64, 'gemini-3.8-flash');
    const safePreview = sanitizeString(lastMessagePreview, BLUEPRINT_CONSTRAINTS.SESSION_PREVIEW_MAX, 'Dialogue saved.');
    const safeCount = Math.min(100, Math.max(1, Math.round(messageCount)));

    if (user && user.emailVerified) {
      const path = `sessions/${cleanId}`;
      try {
        await setDoc(doc(db, 'sessions', cleanId), {
          ownerId: user.uid,
          title: safeTitle,
          persona: safePersona,
          model: safeModel,
          lastMessagePreview: safePreview,
          messageCount: safeCount,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }

    setLocalSessions((prev) => [
      {
        id: cleanId,
        ownerId: user?.uid || 'local_session',
        title: safeTitle,
        persona: safePersona,
        model: safeModel,
        lastMessagePreview: safePreview,
        messageCount: safeCount,
        createdAtLabel: 'Just now',
      },
      ...prev,
    ]);
  };

  const experiments = [...cloudExperiments, ...localExperiments];
  const notes = [...cloudNotes, ...localNotes];
  const sessions = [...cloudSessions, ...localSessions];

  return (
    <LabContext.Provider
      value={{
        user,
        authReady,
        authError,
        experiments,
        notes,
        sessions,
        isDrawerOpen,
        setIsDrawerOpen,
        signInWithGoogle,
        signOut,
        saveExperiment,
        archiveExperiment,
        deleteExperiment,
        saveResearchNote,
        deleteResearchNote,
        saveChatSessionSummary,
      }}
    >
      {children}
    </LabContext.Provider>
  );
};

export function useLab(): LabContextValue {
  const ctx = useContext(LabContext);
  if (!ctx) {
    throw new Error('useLab must be used inside a LabProvider');
  }
  return ctx;
}
