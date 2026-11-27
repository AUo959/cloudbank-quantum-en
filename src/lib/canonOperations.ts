import { z } from 'zod';

const sha256 = z.string().regex(/^[a-f0-9]{64}$/);
const commit = z.string().regex(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/);
const text = z.string().min(1);

const source = z.object({
  repository: z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/),
  commit,
  path: text,
  sha256,
});

const record = z.object({
  id: text,
  kind: z.enum(['forecast', 'mediation', 'canonrec', 'run', 'chronicle', 'outcome', 'reconciliation']),
  title: text,
  summary: text,
  actor: text,
  layer: z.enum(['L1', 'L2', 'L3']),
  timestamp: z.string().datetime({ offset: true }),
  status: text,
  classification: z.enum([
    'CANON', 'CANON_PROMOTE', 'STAGING', 'UNCONFIRMED', 'OPERATIONAL',
    'SIMULATION OUTPUT', 'ASSUMPTION', 'UNKNOWN', 'SUPERSEDED',
  ]),
  source,
  receipt_sha256: sha256,
  previous_record_id: text.optional(),
  assumptions: z.array(text).default([]),
  unknowns: z.array(text).default([]),
});

const branch = z.object({
  name: text,
  seed: z.number().int(),
  turns: z.number().int().positive(),
  replay: z.enum(['MATCHED', 'MISMATCH', 'UNVERIFIED']),
  receipt_sha256: sha256,
});

export const canonSnapshot = z.object({
  version: z.literal('1.0'),
  title: text,
  synthetic: z.boolean(),
  records: z.array(record).min(1),
  branches: z.array(branch),
}).superRefine((snapshot, ctx) => {
  const ids = new Set(snapshot.records.map((item) => item.id));
  if (ids.size !== snapshot.records.length) {
    ctx.addIssue({ code: 'custom', path: ['records'], message: 'Record identities must be unique.' });
  }
  for (const [index, item] of snapshot.records.entries()) {
    if (item.previous_record_id && !ids.has(item.previous_record_id)) {
      ctx.addIssue({ code: 'custom', path: ['records', index], message: 'The superseded record is absent.' });
    }
    if (item.classification === 'CANON' && (item.kind !== 'canonrec' || item.source.repository !== 'AUo959/CanonRec')) {
      ctx.addIssue({ code: 'custom', path: ['records', index], message: 'Canonical status requires a CanonRec record.' });
    }
  }
});

export type CanonSnapshot = z.infer<typeof canonSnapshot>;
export type CanonRecord = CanonSnapshot['records'][number];
