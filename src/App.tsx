import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { AuroraChatView } from './views/AuroraChatView';
import { SimulationView } from './views/SimulationView';
import { ForecastView } from './views/ForecastView';
import { KnowledgeView } from './views/KnowledgeView';
import { NetworkView } from './views/NetworkView';
import type { ViewId } from './lib/types';

const VIEW_COMPONENTS: Record<ViewId, React.FC> = {
  chat: AuroraChatView,
  simulation: SimulationView,
  forecast: ForecastView,
  knowledge: KnowledgeView,
  network: NetworkView,
};

function App() {
  const [activeView, setActiveView] = useState<ViewId>('chat');
  const ViewComponent = VIEW_COMPONENTS[activeView];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-space-bg">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 min-w-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="h-full"
          >
            <ViewComponent />
          </motion.div>
        </AnimatePresence>
      </main>
      {/* Attribution */}
      <div className="fixed bottom-2 right-3 z-50">
        <a
          href="https://www.perplexity.ai/computer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] font-mono text-space-text-muted/40 hover:text-space-text-muted/70 transition-colors"
        >
          Created with Perplexity Computer
        </a>
      </div>
    </div>
  );
}

export default App;
