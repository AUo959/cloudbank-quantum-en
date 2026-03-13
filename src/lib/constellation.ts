import type { ConstellationNode, ConstellationEvent, KnowledgeDocument, ForecastResult } from './types';

export const CONSTELLATION_NODES: ConstellationNode[] = [
  {
    designation: 'CONSTELLATION-PRIME',
    repo: 'aurora-cloudbank-symbolic',
    role: 'hub',
    stack: ['Python', 'JavaScript'],
    status: 'active',
    description: 'Central orchestration hub. Manages constellation topology, contract schemas, and cross-node synchronization protocols.',
    lastSync: new Date(Date.now() - 120000),
  },
  {
    designation: 'AURORA-RUNTIME',
    repo: 'AuroraOS',
    role: 'spoke',
    stack: ['TypeScript', 'Mastra'],
    status: 'active',
    description: 'MCP-based runtime engine. Provides tool orchestration, LLM integration, and constellation status endpoints.',
    lastSync: new Date(Date.now() - 45000),
  },
  {
    designation: 'QUANTUM-VAULT',
    repo: 'cloudbank-quantum-en',
    role: 'spoke',
    stack: ['TypeScript', 'React'],
    status: 'active',
    description: 'Frontend interface and quantum-encoded data vault. Secure document management with visualization layer.',
    lastSync: new Date(Date.now() - 300000),
  },
  {
    designation: 'QGIA-CORPUS',
    repo: 'qgia-knowledge-library',
    role: 'spoke',
    stack: ['Markdown'],
    status: 'active',
    description: 'Primary knowledge corpus containing geopolitical intelligence documents, analytical frameworks, and research papers.',
    lastSync: new Date(Date.now() - 180000),
  },
  {
    designation: 'QGIA-SPINE',
    repo: 'qgia-knowledge-spine',
    role: 'spoke',
    stack: ['Markdown'],
    status: 'active',
    description: 'Structural knowledge index and taxonomy. Maintains cross-reference mappings and document classification hierarchies.',
    lastSync: new Date(Date.now() - 90000),
  },
  {
    designation: 'ZIPWIZ-ENGINE',
    repo: 'zip_wizard',
    role: 'spoke',
    stack: ['TypeScript', 'React'],
    status: 'active',
    description: 'Utility engine for compressed data operations. File packaging, archive management, and batch processing workflows.',
    lastSync: new Date(Date.now() - 600000),
  },
];

export const CONSTELLATION_EVENTS: ConstellationEvent[] = [
  { id: 'evt-001', type: 'sync', node: 'QGIA-CORPUS', message: 'Knowledge index synchronized — 14 documents indexed', timestamp: new Date(Date.now() - 30000) },
  { id: 'evt-002', type: 'update', node: 'AURORA-RUNTIME', message: 'MCP tool registry updated — 11 tools registered', timestamp: new Date(Date.now() - 120000) },
  { id: 'evt-003', type: 'query', node: 'CONSTELLATION-PRIME', message: 'Contract schema validation completed — 6 schemas active', timestamp: new Date(Date.now() - 300000) },
  { id: 'evt-004', type: 'sync', node: 'QGIA-SPINE', message: 'Spine index refreshed — taxonomy updated', timestamp: new Date(Date.now() - 450000) },
  { id: 'evt-005', type: 'update', node: 'QUANTUM-VAULT', message: 'Frontend build deployed — v2.4.1', timestamp: new Date(Date.now() - 600000) },
  { id: 'evt-006', type: 'alert', node: 'CONSTELLATION-PRIME', message: 'Orion Station reality anchor stability: 99.7%', timestamp: new Date(Date.now() - 900000) },
  { id: 'evt-007', type: 'sync', node: 'ZIPWIZ-ENGINE', message: 'Batch processing queue cleared — 0 pending operations', timestamp: new Date(Date.now() - 1200000) },
  { id: 'evt-008', type: 'query', node: 'AURORA-RUNTIME', message: 'QSFE forecast engine initialized — ready for submissions', timestamp: new Date(Date.now() - 1800000) },
  { id: 'evt-009', type: 'update', node: 'QGIA-CORPUS', message: 'New document ingested: regional-expertise/indo-pacific-security.md', timestamp: new Date(Date.now() - 2400000) },
  { id: 'evt-010', type: 'sync', node: 'CONSTELLATION-PRIME', message: 'Full constellation health check passed — all 6 nodes reporting', timestamp: new Date(Date.now() - 3600000) },
];

export const EXAMPLE_FORECAST: ForecastResult = {
  scenario: 'Escalation in Taiwan Strait following increased PLA naval exercises and diplomatic signaling',
  region: 'Indo-Pacific',
  timeframe: '6-18 months',
  confidence: 0.73,
  primaryOutcome: 'Heightened military posturing without direct kinetic engagement. Increased gray-zone operations including ADIZ incursions, maritime militia deployments, and cyber operations against Taiwanese infrastructure. Economic coercion through selective trade restrictions targeting semiconductor supply chain dependencies.',
  cascadeEffects: [
    'AUKUS acceleration: Australia fast-tracks SSN acquisition timeline, increases defense spending to 2.5% GDP',
    'Japan constitutional reinterpretation: expanded collective self-defense scope, Okinawa base expansion',
    'Semiconductor supply chain restructuring: TSMC accelerates Arizona fab timeline, EU chips act funding increases 40%',
    'ASEAN hedging intensifies: Philippines deepens EDCA implementation, Indonesia maintains non-alignment',
    'Global shipping route recalculation: 15-20% increase in insurance premiums for Taiwan Strait transit',
  ],
  keyIndicators: [
    { label: 'PLA Naval Deployments', value: '+340%', trend: 'up' },
    { label: 'ADIZ Incursions (monthly)', value: '47', trend: 'up' },
    { label: 'Diplomatic Channels Active', value: '3/12', trend: 'down' },
    { label: 'Trade Flow Disruption', value: '12.4%', trend: 'up' },
    { label: 'Regional Stability Index', value: '0.34', trend: 'down' },
    { label: 'Deterrence Credibility', value: '0.67', trend: 'stable' },
  ],
  riskFactors: [
    'Miscalculation during naval encounter within 12nm territorial waters',
    'Domestic political pressure in Beijing ahead of Party Congress cycle',
    'US election cycle dynamics affecting alliance credibility signals',
    'Autonomous systems integration reducing human decision-making time',
  ],
  timestamp: new Date(Date.now() - 7200000),
};

const KNOWLEDGE_URLS = [
  'https://raw.githubusercontent.com/AUo959/qgia-knowledge-library/main/.aurora/knowledge-index.json',
  'https://raw.githubusercontent.com/AUo959/qgia-knowledge-spine/main/.aurora/knowledge-index.json',
];

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

export async function fetchKnowledgeIndexes(): Promise<KnowledgeDocument[]> {
  const results: KnowledgeDocument[] = [];

  for (const url of KNOWLEDGE_URLS) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      
      const source = url.includes('library') ? 'QGIA-CORPUS' : 'QGIA-SPINE';
      
      const docs = data.documents || data.entries || (Array.isArray(data) ? data : []);
      
      for (const doc of docs) {
        const rawSummary = doc.summary || doc.description || '';
        const cleanSummary = stripMarkdown(rawSummary);
        
        // Build a better description from available fields
        let displaySummary = cleanSummary;
        if (!displaySummary || displaySummary.length < 30) {
          // If summary is just an ID or very short, build from domain/path
          const parts: string[] = [];
          if (doc.domain) parts.push(`Domain: ${doc.domain.replace(/-/g, ' ')}`);
          if (doc.word_count || doc.wordCount) parts.push(`${(doc.word_count || doc.wordCount).toLocaleString()} words`);
          if (doc.path) parts.push(doc.path);
          displaySummary = parts.join(' · ');
        }
        
        results.push({
          id: doc.id || `${source}-${doc.path || doc.title || Math.random().toString(36).slice(2)}`,
          title: doc.title || doc.path || 'Untitled',
          domain: doc.domain || doc.category || 'general',
          wordCount: doc.word_count || doc.wordCount || 0,
          summary: displaySummary,
          tags: (doc.tags || doc.keywords || []).filter((t: string) => t && t.length < 60),
          source,
          path: doc.path,
          lastUpdated: doc.last_modified || doc.lastUpdated || doc.last_updated,
        });
      }
    } catch (err) {
      console.warn(`Failed to fetch knowledge index from ${url}:`, err);
    }
  }

  return results;
}
