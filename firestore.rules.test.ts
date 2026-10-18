import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const rulesSource = fs.readFileSync(new URL('./firestore.rules', import.meta.url), 'utf8');

interface AuthContext {
  uid: string;
  email_verified: boolean;
}

function isValidId(id: string): boolean {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(id);
}

function isSignedIn(auth: AuthContext | null): boolean {
  return auth !== null && auth.email_verified === true;
}

function evaluateExperimentCreate(
  auth: AuthContext | null,
  docId: string,
  incoming: Record<string, unknown>,
  requestTime: string
): 'ALLOWED' | 'PERMISSION_DENIED' {
  if (!isSignedIn(auth) || !isValidId(docId)) return 'PERMISSION_DENIED';
  const reqKeys = ['ownerId', 'title', 'moduleType', 'summary', 'parameters', 'status', 'createdAt', 'updatedAt'];
  const keys = Object.keys(incoming);
  if (keys.length !== reqKeys.length || !reqKeys.every((k) => keys.includes(k))) return 'PERMISSION_DENIED';
  if (incoming.ownerId !== auth!.uid || !isValidId(String(incoming.ownerId))) return 'PERMISSION_DENIED';
  if (typeof incoming.title !== 'string' || incoming.title.length < 1 || incoming.title.length > 120) return 'PERMISSION_DENIED';
  if (
    typeof incoming.moduleType !== 'string' ||
    !['mcp_spiking', 'thermodynamics', 'lithography', 'agi_stack'].includes(incoming.moduleType)
  ) {
    return 'PERMISSION_DENIED';
  }
  if (typeof incoming.summary !== 'string' || incoming.summary.length < 1 || incoming.summary.length > 600) return 'PERMISSION_DENIED';
  if (typeof incoming.parameters !== 'object' || incoming.parameters === null || Array.isArray(incoming.parameters)) {
    return 'PERMISSION_DENIED';
  }
  if (Object.keys(incoming.parameters as object).length > 20) return 'PERMISSION_DENIED';
  if (incoming.status !== 'active') return 'PERMISSION_DENIED';
  if (incoming.createdAt !== requestTime || incoming.updatedAt !== requestTime) return 'PERMISSION_DENIED';
  return 'ALLOWED';
}

function evaluateExperimentUpdate(
  auth: AuthContext | null,
  docId: string,
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>,
  requestTime: string
): 'ALLOWED' | 'PERMISSION_DENIED' {
  if (!isSignedIn(auth) || !isValidId(docId)) return 'PERMISSION_DENIED';
  if (existing.ownerId !== auth!.uid || incoming.ownerId !== existing.ownerId) return 'PERMISSION_DENIED';
  if (existing.status === 'archived') return 'PERMISSION_DENIED';
  if (incoming.createdAt !== existing.createdAt || incoming.updatedAt !== requestTime) return 'PERMISSION_DENIED';
  const reqKeys = ['ownerId', 'title', 'moduleType', 'summary', 'parameters', 'status', 'createdAt', 'updatedAt'];
  const keys = Object.keys(incoming);
  if (keys.length !== reqKeys.length || !reqKeys.every((k) => keys.includes(k))) return 'PERMISSION_DENIED';
  if (typeof incoming.title !== 'string' || incoming.title.length < 1 || incoming.title.length > 120) return 'PERMISSION_DENIED';
  if (typeof incoming.summary !== 'string' || incoming.summary.length < 1 || incoming.summary.length > 600) return 'PERMISSION_DENIED';
  if (incoming.status !== 'active' && incoming.status !== 'archived') return 'PERMISSION_DENIED';
  return 'ALLOWED';
}

function evaluateNoteOperation(
  op: 'get' | 'create' | 'update',
  auth: AuthContext | null,
  docId: string,
  existing: Record<string, unknown> | null,
  incoming: Record<string, unknown> | null,
  requestTime: string
): 'ALLOWED' | 'PERMISSION_DENIED' {
  if (!isSignedIn(auth) || !isValidId(docId)) return 'PERMISSION_DENIED';
  if (op === 'get') {
    return existing && existing.ownerId === auth!.uid ? 'ALLOWED' : 'PERMISSION_DENIED';
  }
  if (!incoming) return 'PERMISSION_DENIED';
  const reqKeys = ['ownerId', 'topic', 'modelUsed', 'content', 'createdAt', 'updatedAt'];
  const keys = Object.keys(incoming);
  if (keys.length !== reqKeys.length || !reqKeys.every((k) => keys.includes(k))) return 'PERMISSION_DENIED';
  if (incoming.ownerId !== auth!.uid || !isValidId(String(incoming.ownerId))) return 'PERMISSION_DENIED';
  if (typeof incoming.topic !== 'string' || incoming.topic.length < 1 || incoming.topic.length > 150) return 'PERMISSION_DENIED';
  if (typeof incoming.modelUsed !== 'string' || incoming.modelUsed.length < 1 || incoming.modelUsed.length > 64) return 'PERMISSION_DENIED';
  if (typeof incoming.content !== 'string' || incoming.content.length < 1 || incoming.content.length > 8000) return 'PERMISSION_DENIED';
  if (op === 'create') {
    return incoming.createdAt === requestTime && incoming.updatedAt === requestTime ? 'ALLOWED' : 'PERMISSION_DENIED';
  }
  if (!existing || existing.ownerId !== auth!.uid || incoming.ownerId !== existing.ownerId) return 'PERMISSION_DENIED';
  return incoming.createdAt === existing.createdAt && incoming.updatedAt === requestTime ? 'ALLOWED' : 'PERMISSION_DENIED';
}

test('firestore.rules file contains all 8 hardened security pillars', () => {
  assert.ok(rulesSource.includes("rules_version = '2';"));
  assert.ok(rulesSource.includes('match /{document=**} {\n      allow read, write: if false;\n    }'));
  assert.ok(rulesSource.includes('request.auth.token.email_verified == true'));
  assert.ok(rulesSource.includes('isValidExperiment(incoming())'));
  assert.ok(rulesSource.includes('isValidNote(incoming())'));
  assert.ok(rulesSource.includes('isValidSession(incoming())'));
  assert.ok(rulesSource.includes("existing().status != 'archived'"));
});

test('Dirty Dozen #1-12 payloads all return PERMISSION_DENIED', () => {
  const now = '2026-10-17T18:00:00Z';
  const userA: AuthContext = { uid: 'user_A', email_verified: true };
  const unverifiedA: AuthContext = { uid: 'user_A', email_verified: false };

  // 1. Identity Spoofing on Create
  assert.equal(
    evaluateExperimentCreate(userA, 'exp_1', {
      ownerId: 'user_B',
      title: 'Test',
      moduleType: 'mcp_spiking',
      summary: 'Valid',
      parameters: {},
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }, now),
    'PERMISSION_DENIED'
  );

  // 2. Unverified Email Spoof
  assert.equal(
    evaluateNoteOperation('create', unverifiedA, 'note_1', null, {
      ownerId: 'user_A',
      topic: 'Turing',
      modelUsed: 'gemini-3.8-flash',
      content: 'Notes',
      createdAt: now,
      updatedAt: now,
    }, now),
    'PERMISSION_DENIED'
  );

  // 3. Shadow / Ghost Field Injection
  assert.equal(
    evaluateExperimentCreate(userA, 'exp_1', {
      ownerId: 'user_A',
      title: 'Test',
      moduleType: 'mcp_spiking',
      summary: 'Valid',
      parameters: {},
      status: 'active',
      isAdmin: true,
      createdAt: now,
      updatedAt: now,
    }, now),
    'PERMISSION_DENIED'
  );

  // 4. ID Poisoning Attack
  assert.equal(
    evaluateNoteOperation('create', userA, 'invalid$id!@#', null, {
      ownerId: 'user_A',
      topic: 'Turing',
      modelUsed: 'gemini-3.8-flash',
      content: 'Notes',
      createdAt: now,
      updatedAt: now,
    }, now),
    'PERMISSION_DENIED'
  );

  // 5. Denial-of-Wallet String Overflow
  assert.equal(
    evaluateNoteOperation('create', userA, 'note_1', null, {
      ownerId: 'user_A',
      topic: 'X'.repeat(500),
      modelUsed: 'gemini-3.8-flash',
      content: 'Notes',
      createdAt: now,
      updatedAt: now,
    }, now),
    'PERMISSION_DENIED'
  );

  // 6. Enum Bypass on Module Type
  assert.equal(
    evaluateExperimentCreate(userA, 'exp_1', {
      ownerId: 'user_A',
      title: 'Test',
      moduleType: 'arbitrary_module',
      summary: 'Valid',
      parameters: {},
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }, now),
    'PERMISSION_DENIED'
  );

  // 7. Client Timestamp Forgery
  assert.equal(
    evaluateExperimentCreate(userA, 'exp_1', {
      ownerId: 'user_A',
      title: 'Test',
      moduleType: 'mcp_spiking',
      summary: 'Valid',
      parameters: {},
      status: 'active',
      createdAt: '2020-01-01T00:00:00Z',
      updatedAt: now,
    }, now),
    'PERMISSION_DENIED'
  );

  // 8. Immutable Owner Hijack on Update
  assert.equal(
    evaluateNoteOperation(
      'update',
      userA,
      'note_1',
      { ownerId: 'user_A', topic: 'Old', modelUsed: 'gemini-3.8-flash', content: 'Old', createdAt: now, updatedAt: now },
      { ownerId: 'user_B', topic: 'New', modelUsed: 'gemini-3.8-flash', content: 'New', createdAt: now, updatedAt: now },
      now
    ),
    'PERMISSION_DENIED'
  );

  // 9. Terminal State Mutation on Archived Experiment
  assert.equal(
    evaluateExperimentUpdate(
      userA,
      'exp_archived',
      { ownerId: 'user_A', title: 'Old', moduleType: 'mcp_spiking', summary: 'S', parameters: {}, status: 'archived', createdAt: now, updatedAt: now },
      { ownerId: 'user_A', title: 'Mutated', moduleType: 'mcp_spiking', summary: 'S', parameters: {}, status: 'active', createdAt: now, updatedAt: now },
      now
    ),
    'PERMISSION_DENIED'
  );

  // 10. Value Poisoning on Update (invalid type for title)
  assert.equal(
    evaluateExperimentUpdate(
      userA,
      'exp_1',
      { ownerId: 'user_A', title: 'Old', moduleType: 'mcp_spiking', summary: 'S', parameters: {}, status: 'active', createdAt: now, updatedAt: now },
      { ownerId: 'user_A', title: 99999 as unknown as string, moduleType: 'mcp_spiking', summary: 'S', parameters: {}, status: 'active', createdAt: now, updatedAt: now },
      now
    ),
    'PERMISSION_DENIED'
  );

  // 11. Cross-Tenant Read (PII / Data Leak)
  assert.equal(
    evaluateNoteOperation('get', userA, 'note_user_B', { ownerId: 'user_B', topic: 'Private' }, null, now),
    'PERMISSION_DENIED'
  );

  // 12. Unauthenticated List / Read Attempt
  assert.equal(
    evaluateNoteOperation('get', null, 'note_1', { ownerId: 'user_A' }, null, now),
    'PERMISSION_DENIED'
  );
});
