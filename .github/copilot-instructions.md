## Cloudbank Quantum — Copilot Instructions

Concise project essentials to move fast and stay consistent.

### Architecture
- Stack: Vite + React 19 (SWC), Tailwind v4, Radix UI, CVA, GitHub Spark.
- Client-only app: persistence via `useKV` from `@github/spark/hooks` (browser storage).
- Path alias: `@` → `src` (see `vite.config.ts`, `tsconfig.json`). Example: `@/components/ui/card`.
- Theming: CSS variables in `src/main.css` power Tailwind tokens; `theme.json` can override via `tailwind.config.js`.

### Build & Dev
- Dev: `npm run dev`
- Build: `npm run build` then `npm run preview`
- Lint: `npm run lint` — use to maintain patterns and imports.

### State & Data
- Use `useKV` with defaults; prefer functional updates.
  ```tsx
  const [items, setItems] = useKV<{id:string}[]>('items', [])
  setItems((cur = []) => [...cur, { id: crypto.randomUUID() }])
  ```
- Known keys: `quantum-files`, `cloudbank-files`, `analytics-metrics`, `processing-tasks`, `database-queries`, `vector-keys`, `parsed-archives`, `parsing-rules`, `extracted-metadata`, `analysis-jobs`.

### UI Patterns
- Primitives in `src/components/ui/*` use CVA (`variant`, `size`) and `cn` from `src/lib/utils.ts`.
- Compose primitives; favor Tailwind tokens (`bg-card`, `text-muted-foreground`) over literals.
- Icons via `@phosphor-icons/react` (plugin configured). Example: `import { Cube } from '@phosphor-icons/react'`.
- Effects: `QuantumField`/`QuantumParticle` use DOM APIs in `useEffect`; clean up listeners/intervals.

### Styling
- `src/main.css` imports Tailwind and maps tokens with `@theme`.
- Dark mode selector: `data-appearance="dark"` (config in `tailwind.config.js`). Toggle by setting `document.documentElement.dataset.appearance`.

### Key Files
- `src/main.tsx`: Bootstraps app, imports Spark and `main.css`.
- `src/App.tsx`: Landing surface (rest of components follow Tailwind patterns).
- `src/components/QuantumUploader.tsx`: Drag/drop, simulated parsing, KV, `sonner` toasts.
- `src/components/RealTimeAnalyticsDashboard.tsx`: Canvas metrics + realtime simulation.
- `src/components/QuantumField.tsx`: Ambient particle/energy wave wrapper.

### Conventions
- Use alias imports (`@/...`).
- Always provide `useKV` defaults and guard reads (`const safe = x || []`).
- Use functional setters for arrays/objects.
- Keep UI under `src/**` so Tailwind content paths pick it up.
 - Guard Spark LLM access: some components use `window.spark.llm` and ``spark.llmPrompt``. Always check availability and provide fallbacks.
   ```tsx
   const spark = (window as any).spark
   if (!spark || typeof spark.llm !== 'function' || typeof spark.llmPrompt !== 'function') {
     // Fallback behavior (basic search / traditional parsing / enhanced random key)
   } else {
     const prompt = spark.llmPrompt`...`
     const result = await spark.llm(prompt, 'gpt-4o', true)
   }
   ```

### Add a Feature (recipe)
- Create under `src/components/`, compose UI primitives, use tokens.
- Persist with `useKV` if needed; avoid global singletons.
- Wire into `App.tsx` or a parent, manage effects with cleanup.

### Component Template
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useKV } from '@github/spark/hooks'

export function MyWidget() {
  const [items, setItems] = useKV<{ id: string; label: string }[]>('items', [])
  const safe = items || []
  const add = () => setItems((cur = []) => [...cur, { id: crypto.randomUUID(), label: 'New' }])

  return (
    <Card>
      <CardHeader><CardTitle className="text-xl">My Widget</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" onClick={add}>Add Item</Button>
        <ul className="text-muted-foreground space-y-1">
          {safe.map((i) => (<li key={i.id}>{i.label}</li>))}
        </ul>
      </CardContent>
    </Card>
  )
}
```

### Runtime Dark Mode
```tsx
function ToggleThemeButton() {
  const toggle = () => {
    const el = document.documentElement
    el.dataset.appearance = el.dataset.appearance === 'dark' ? 'light' : 'dark'
  }
  return <Button onClick={toggle}>Toggle theme</Button>
}
```

### Additional Components
- Present but not yet documented in UI flow: `QuantumDatabase.tsx`, `VectorKeyManager.tsx`, `FileMetadataView.tsx`, `ProjectSpaceManager.tsx`, `QuantumNetworkVisualization.tsx`, `Quantum3DVisualization.tsx`, `QuantumParser.tsx`, `QuantumQRScanner.tsx`, `QuantumQRShare.tsx`, `QuantumSync.tsx`, `VisualFileBrowser.tsx`, `MetadataAnalyzer.tsx`.
- When integrating any of these, add a short usage note here (where mounted, key props/state, and any side effects).

### Wire Into `App.tsx`
```tsx
// src/App.tsx
import { MyWidget } from '@/components/MyWidget'

export default function App() {
  return (
    <div>{/* ...existing layout... */}
      {/* Feature slot: widgets & panels */}
      <div style={{ marginTop: '2rem' }}>
        <MyWidget />
      </div>
    </div>
  )
}
```

### CVA Primitive Example
```tsx
// src/components/ui/tag.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
const tag = cva('inline-flex items-center rounded-md px-2 py-0.5 text-xs', {
  variants: {
    tone: {
      info: 'bg-accent text-accent-foreground',
      success: 'bg-green-600 text-white',
      danger: 'bg-destructive text-destructive-foreground',
    },
    size: { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' },
  },
  defaultVariants: { tone: 'info', size: 'md' },
})
export function Tag(
  { className, tone, size, ...props }:
  React.ComponentProps<'span'> & VariantProps<typeof tag>
) {
  return <span className={cn(tag({ tone, size }), className)} {...props} />
}
// usage: <Tag tone="success">Ready</Tag>
```

### Canvas Visuals Pattern
```tsx
import { useEffect, useRef } from 'react'

export function MiniCanvasViz() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    let id = 0
    const draw = (t: number) => {
      const w = canvas.width / dpr, h = canvas.height / dpr
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = 'oklch(0.98 0.005 280)'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = 'oklch(0.65 0.18 260)'
      const x = (t / 10) % w
      ctx.beginPath(); ctx.moveTo(0, h/2); ctx.lineTo(x, h/2); ctx.stroke()
      id = requestAnimationFrame(draw)
    }
    id = requestAnimationFrame(draw)
    const ro = new ResizeObserver(resize); ro.observe(canvas)
    return () => { cancelAnimationFrame(id); ro.disconnect() }
  }, [])
  return <canvas ref={ref} className="w-full h-48 rounded-lg border" />
}
```
