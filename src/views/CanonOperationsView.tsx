import { useRef, useState } from 'react';
import type { ChangeEvent, Dispatch } from 'react';
import { ArrowUpRight, FileCheck2, Info, Lock, Upload } from 'lucide-react';
import syntheticFixture from '@/fixtures/canon-operations-synthetic.json';
import { canonSnapshot } from '@/lib/canonOperations';
import type { CanonRecord, CanonSnapshot } from '@/lib/canonOperations';
import { cn } from '@/lib/utils';

const PANEL = 'rounded-lg border border-space-border-bright bg-[#101923]';
const HEADING = 'text-base font-semibold text-space-text';
const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal';
const INITIAL_SNAPSHOT = canonSnapshot.parse(syntheticFixture);

function statusClass(value: CanonRecord['classification']) {
  if (value === 'STAGING' || value === 'OPERATIONAL') return 'border-teal/50 text-teal';
  if (value === 'CANON' || value === 'CANON_PROMOTE') return 'border-plasma/55 text-space-text';
  return 'border-space-border-bright text-space-text-secondary';
}

function Status({ value }: { value: CanonRecord['classification'] }) {
  return <span className={cn('rounded border px-2 py-1 font-mono text-[10px] font-medium', statusClass(value))}>{value}</span>;
}

function Timeline({ records, selected, onSelect }: {
  records: CanonRecord[];
  selected: string;
  onSelect: Dispatch<string>;
}) {
  return (
    <section className={PANEL} aria-labelledby="canon-timeline">
      <h2 id="canon-timeline" className={cn(HEADING, 'px-4 py-3 border-b border-space-border-bright')}>Chain timeline</h2>
      <ol className="divide-y divide-space-border mx-4">
        {records.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              aria-pressed={selected === item.id}
              aria-controls="canon-record"
              onClick={() => { onSelect(item.id); }}
              className={cn(FOCUS, 'w-full rounded-sm text-left grid gap-2 p-3 sm:grid-cols-[102px_minmax(0,1fr)] hover:bg-space-surface-2',
                selected === item.id && 'bg-space-surface-2')}
            >
              <time dateTime={item.timestamp} className="font-mono text-xs text-space-text-secondary sm:border-r sm:border-space-border-bright sm:pr-2">
                {item.timestamp.slice(0, 10)}{' '}<br className="hidden sm:block" />{item.timestamp.slice(11)}
              </time>
              <div className="min-w-0 sm:pl-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-space-text">{item.title}</span>
                  <Status value={item.classification} />
                </div>
                <p className="mt-1 font-mono text-[11px] text-space-text-secondary break-words">{item.actor} · {item.layer} · {item.status}</p>
                <p className="mt-1.5 text-sm text-space-text-secondary break-words">{item.summary}</p>
              </div>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Evidence({ item, onSelect }: { item: CanonRecord; onSelect: Dispatch<string> }) {
  const previousId = item.previous_record_id;
  const fields = [
    ['Repository', item.source.repository], ['Commit', item.source.commit],
    ['Source path', item.source.path], ['SHA-256', item.source.sha256], ['Receipt hash', item.receipt_sha256],
  ];
  return (
    <section id="canon-record" aria-labelledby="canon-evidence" tabIndex={-1} className="scroll-mt-3 outline-none">
      <h2 id="canon-evidence" className={HEADING}>Evidence and provenance</h2>
      <dl className="my-3 divide-y divide-space-border border-y border-space-border">
        {fields.map(([label, value]) => (
          <div className="grid grid-cols-[minmax(70px,30%)_minmax(0,1fr)] gap-2 py-2 text-xs" key={label}>
            <dt className="font-semibold text-space-text-secondary">{label}</dt>
            <dd className="font-mono break-all text-space-text">{value}</dd>
          </div>
        ))}
      </dl>
      {previousId && (
        <button type="button" className={cn(FOCUS, 'text-sm text-teal flex items-center gap-1')} onClick={() => { onSelect(previousId); }}>
          View superseded record <ArrowUpRight size={13} aria-hidden />
        </button>
      )}
      {([['Assumptions', item.assumptions], ['Unknowns', item.unknowns]] as const).map(([title, values]) => (
        values.length > 0 && <div key={title} className="mt-3">
          <h3 className="text-sm font-semibold text-space-text">{title}</h3>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-space-text-secondary">
            {values.map((value, index) => <li key={`${value}-${index}`}>{value}</li>)}
          </ul>
        </div>
      ))}
    </section>
  );
}

function ScenarioComparison({ branches }: { branches: CanonSnapshot['branches'] }) {
  return (
    <section aria-labelledby="canon-branches" className="mt-4 pt-4 border-t border-space-border-bright">
      <h2 id="canon-branches" className={HEADING}>Scenario comparison</h2>
      {branches.length ? (
        <div className="mt-2.5 overflow-x-auto rounded border border-space-border-bright">
          <table className="w-full text-left text-xs" aria-labelledby="canon-branches">
            <thead className="bg-space-surface-2 text-space-text"><tr>
              <th scope="col" className="px-3 py-2">Branch</th><th scope="col" className="px-3 py-2">Seed</th>
              <th scope="col" className="px-3 py-2">Turns</th><th scope="col" className="px-3 py-2">Replay</th>
            </tr></thead>
            <tbody>{branches.map((branch) => (
              <tr key={branch.receipt_sha256} className="border-t border-space-border">
                <th scope="row" className="px-3 py-2 font-medium text-space-text">{branch.name}</th>
                <td className="px-3 py-2 font-mono">{branch.seed}</td><td className="px-3 py-2 font-mono">{branch.turns}</td>
                <td className="px-3 py-2 font-mono" title={branch.receipt_sha256}>{branch.replay}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p className="mt-2 text-sm text-space-text-secondary">This snapshot has no run receipts.</p>}
    </section>
  );
}

function ReviewActions() {
  return (
    <section aria-labelledby="canon-actions" className="mt-4 pt-4 border-t border-space-border-bright">
      <h2 id="canon-actions" className={HEADING}>Review actions</h2>
      <p id="canon-read-only" className="flex items-start gap-2 mt-2 mb-3 rounded border border-teal/40 px-3 py-2 text-sm text-space-text-secondary">
        <Info size={16} className="shrink-0 mt-0.5 text-teal" aria-hidden /> Connect an authorized bridge to enable review actions.
      </p>
      <div className="flex flex-wrap gap-2" aria-describedby="canon-read-only">
        {['Approve', 'Partially approve', 'Reject', 'Submit staging request', 'Request simulation', 'Attach outcome', 'Request promotion review'].map((action) => (
          <button key={action} type="button" disabled className="rounded-md border border-space-border px-2.5 py-1.5 text-xs text-space-text-secondary opacity-65">
            {action}
          </button>
        ))}
      </div>
    </section>
  );
}

export function CanonOperationsView() {
  const [snapshot, setSnapshot] = useState<CanonSnapshot>(INITIAL_SNAPSHOT);
  const [selected, setSelected] = useState(INITIAL_SNAPSHOT.records[0].id);
  const [error, setError] = useState('');
  const latestFile = useRef<File | undefined>(undefined);

  function showRecord(id: string) {
    setSelected(id);
    if (matchMedia('(max-width: 1023px)').matches) {
      document.getElementById('canon-record')?.focus();
    }
  }

  async function loadSnapshot(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    latestFile.current = file;
    try {
      const parsed = canonSnapshot.parse(JSON.parse(await file.text()));
      if (file !== latestFile.current) return;
      const records = [...parsed.records].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp) || a.id.localeCompare(b.id));
      setSnapshot({ ...parsed, records });
      setSelected(records[0].id);
      setError('');
    } catch {
      if (file === latestFile.current) setError('The file does not match the Canon Operations snapshot format.');
    }
  }

  const item = snapshot.records.find((record) => record.id === selected) ?? snapshot.records[0];
  return (
    <div className="flex flex-col h-full text-space-text-secondary">
      <header className="h-14 shrink-0 flex items-center justify-between gap-2 border-b border-space-border-bright px-3 sm:px-6">
        <h1 className="flex items-center gap-2 text-base font-semibold text-space-text"><FileCheck2 size={17} aria-hidden /> Canon Operations</h1>
        <span className="flex items-center gap-1.5 rounded border border-space-border-bright bg-space-surface px-2 py-1 text-xs whitespace-nowrap">
          <Lock size={13} aria-hidden /> Read only
        </span>
      </header>
      <div className="overflow-y-auto flex-1 px-3 py-4 sm:px-6 sm:py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-3xl font-semibold tracking-tight text-space-text">{snapshot.title}</h2>
            {snapshot.synthetic && <p className="mt-1.5 text-sm">Synthetic fixture · pinned evidence</p>}
          </div>
          <label className="relative flex items-center gap-2 rounded border border-space-border-bright px-3 py-2 text-sm font-medium text-space-text cursor-pointer hover:bg-space-surface-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-teal">
            <Upload size={15} aria-hidden /> Open snapshot
            <input type="file" accept=".json,application/json" className="sr-only" onChange={(event) => { void loadSnapshot(event); }} />
          </label>
        </div>
        {error && <p role="alert" className="mb-4 text-sm text-red-300">{error}</p>}
        <div className="grid items-start gap-4 lg:grid-cols-[1.18fr_minmax(0,1fr)]">
          <Timeline records={snapshot.records} selected={selected} onSelect={showRecord} />
          <div className={cn(PANEL, 'min-w-0 px-4 py-3.5')}>
            <Evidence item={item} onSelect={setSelected} />
            <ScenarioComparison branches={snapshot.branches} />
            <ReviewActions />
          </div>
        </div>
      </div>
    </div>
  );
}
