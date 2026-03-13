import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  FileText,
  Tag,
  ChevronDown,
  ChevronUp,
  Loader2,
  Database,
  X,
} from 'lucide-react';
import { fetchKnowledgeIndexes } from '@/lib/constellation';
import { cn } from '@/lib/utils';
import type { KnowledgeDocument } from '@/lib/types';

export function KnowledgeView() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchKnowledgeIndexes()
      .then((docs) => {
        setDocuments(docs);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const domains = useMemo(() => {
    const set = new Set(documents.map((d) => d.domain).filter(Boolean));
    return Array.from(set).sort();
  }, [documents]);

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        !search ||
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.summary.toLowerCase().includes(search.toLowerCase()) ||
        doc.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesDomain = !selectedDomain || doc.domain === selectedDomain;
      return matchesSearch && matchesDomain;
    });
  }, [documents, search, selectedDomain]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-space-border shrink-0">
        <div className="flex items-center gap-3">
          <Database size={18} className="text-plasma" />
          <h1 className="text-sm font-semibold text-space-text">Knowledge Index</h1>
          <span className="text-[10px] font-mono text-space-text-muted px-2 py-0.5 rounded-full bg-space-surface-2 border border-space-border">
            QGIA-CORPUS + QGIA-SPINE
          </span>
        </div>
        {!loading && (
          <span className="text-[11px] font-mono text-space-text-muted">
            {filtered.length} of {documents.length} documents
          </span>
        )}
      </div>

      {/* Search + Filters */}
      <div className="px-6 py-4 border-b border-space-border space-y-3 shrink-0">
        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-space-text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents, tags, summaries..."
            data-testid="knowledge-search"
            className="w-full bg-space-surface border border-space-border rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-space-text placeholder:text-space-text-muted focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-space-text-muted hover:text-space-text"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Domain Chips */}
        {domains.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDomain(null)}
              className={cn(
                'text-[10px] font-mono px-2.5 py-1 rounded-full border transition-colors',
                !selectedDomain
                  ? 'bg-teal/15 text-teal border-teal/30'
                  : 'bg-space-surface text-space-text-muted border-space-border hover:text-space-text hover:border-space-border-bright'
              )}
            >
              All
            </button>
            {domains.map((domain) => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(selectedDomain === domain ? null : domain)}
                data-testid={`filter-${domain}`}
                className={cn(
                  'text-[10px] font-mono px-2.5 py-1 rounded-full border transition-colors',
                  selectedDomain === domain
                    ? 'bg-plasma/15 text-plasma-bright border-plasma/30'
                    : 'bg-space-surface text-space-text-muted border-space-border hover:text-space-text hover:border-space-border-bright'
                )}
              >
                {domain}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4 space-y-3">
        {loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 size={28} className="text-teal animate-spin" />
            <p className="text-[13px] text-space-text-secondary">
              Fetching knowledge indexes from QGIA repositories...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-status-error/10 border border-status-error/20 rounded-xl p-4 text-center">
            <p className="text-[13px] text-status-error">Failed to load knowledge indexes</p>
            <p className="text-[11px] text-space-text-muted mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <BookOpen size={32} className="text-space-text-muted" />
            <p className="text-[13px] text-space-text-secondary">
              No documents match your search criteria.
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {filtered.map((doc, i) => {
            const isExpanded = expandedId === doc.id;
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                data-testid={`knowledge-card-${doc.id}`}
                className="bg-space-surface border border-space-border rounded-xl overflow-hidden hover:border-space-border-bright transition-colors"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                  className="w-full text-left px-4 py-3.5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <FileText size={13} className="text-teal shrink-0" />
                        <h3 className="text-[13px] font-medium text-space-text truncate">
                          {doc.title}
                        </h3>
                        {doc.wordCount > 0 && (
                          <span className="text-[9px] font-mono text-space-text-muted shrink-0">
                            {doc.wordCount.toLocaleString()} words
                          </span>
                        )}
                      </div>
                      {doc.summary && (
                        <p
                          className={cn(
                            'text-[12px] text-space-text-secondary leading-relaxed',
                            !isExpanded && 'line-clamp-2'
                          )}
                        >
                          {doc.summary}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {doc.domain && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-plasma/10 text-plasma-bright border border-plasma/15">
                          {doc.domain}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp size={14} className="text-space-text-muted" />
                      ) : (
                        <ChevronDown size={14} className="text-space-text-muted" />
                      )}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3.5 pt-0 border-t border-space-border/50">
                        <div className="grid grid-cols-2 gap-3 mt-3 text-[11px]">
                          {doc.wordCount > 0 && (
                            <div>
                              <span className="text-space-text-muted">Word Count</span>
                              <p className="font-mono text-space-text tabular-nums">
                                {doc.wordCount.toLocaleString()}
                              </p>
                            </div>
                          )}
                          <div>
                            <span className="text-space-text-muted">Source</span>
                            <p className="font-mono text-teal">{doc.source}</p>
                          </div>
                          {doc.path && (
                            <div className="col-span-2">
                              <span className="text-space-text-muted">Path</span>
                              <p className="font-mono text-space-text-secondary truncate">
                                {doc.path}
                              </p>
                            </div>
                          )}
                        </div>
                        {doc.tags.length > 0 && (
                          <div className="mt-3">
                            <span className="text-[10px] text-space-text-muted flex items-center gap-1 mb-1.5">
                              <Tag size={10} /> Tags
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {doc.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[9px] font-mono px-2 py-0.5 rounded bg-teal/10 text-teal border border-teal/15"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <div className="h-4" />
      </div>
    </div>
  );
}
