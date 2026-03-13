export type ViewId = 'chat' | 'simulation' | 'forecast' | 'knowledge' | 'network';

export interface ChatMessage {
  id: string;
  role: 'user' | 'aurora' | 'system';
  content: string;
  timestamp: Date;
}

export interface ConstellationNode {
  designation: string;
  repo: string;
  role: 'hub' | 'spoke';
  stack: string[];
  status: 'active' | 'degraded' | 'offline';
  description: string;
  lastSync: Date;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  domain: string;
  wordCount: number;
  summary: string;
  tags: string[];
  source: string;
  path?: string;
  lastUpdated?: string;
}

export interface ForecastInput {
  scenario: string;
  region: string;
  timeframeMonths: number;
  confidenceThreshold: number;
  includeCascades: boolean;
}

export interface ForecastResult {
  scenario: string;
  region: string;
  timeframe: string;
  confidence: number;
  primaryOutcome: string;
  cascadeEffects: string[];
  keyIndicators: { label: string; value: string; trend: 'up' | 'down' | 'stable' }[];
  riskFactors: string[];
  timestamp: Date;
}

export interface ConstellationEvent {
  id: string;
  type: 'sync' | 'alert' | 'update' | 'query';
  node: string;
  message: string;
  timestamp: Date;
}
