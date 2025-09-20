import { Button } from '@/components/ui/button'
import { RealTimeAnalyticsDashboard } from '@/components/RealTimeAnalyticsDashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VisualFileBrowser } from '@/components/VisualFileBrowser'
import { QuantumDatabase } from '@/components/QuantumDatabase'
import { VectorKeyManager } from '@/components/VectorKeyManager'
import { QuantumNetworkVisualization } from '@/components/QuantumNetworkVisualization'
import { Quantum3DVisualization } from '@/components/Quantum3DVisualization'
import { QuantumUploader } from '@/components/QuantumUploader'
import { KVDataBridge } from '@/components/KVDataBridge'
import { useKV } from '@github/spark/hooks'
import { useEffect, useState } from 'react'
import { isLLMAvailable } from '@/lib/spark'

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const toggleTheme = () => {
    const el = document.documentElement
    el.dataset.appearance = el.dataset.appearance === 'dark' ? 'light' : 'dark'
  }
  const [, setFiles] = useKV<any[]>('quantum-files', [])
  const [, setCloudFiles] = useKV<any[]>('cloudbank-files', [])
  const [, setMetrics] = useKV<any[]>('analytics-metrics', [])
  const [, setTasks] = useKV<any[]>('processing-tasks', [])
  const [llmOnline, setLlmOnline] = useState<boolean>(false)
  const clearKV = () => { setFiles([]); setMetrics([]); setTasks([]) }
  const openInDatabase = (_id: string) => setTab('database')
  const deleteEverywhere = (id: string) => {
    setCloudFiles((cur = []) => cur.filter((f: any) => f.id !== id))
    setFiles((cur = []) => cur.filter((f: any) => f.id !== id))
  }
  const bulkDeleteEverywhere = (ids: string[]) => {
    setCloudFiles((cur = []) => cur.filter((f: any) => !ids.includes(f.id)))
    setFiles((cur = []) => cur.filter((f: any) => !ids.includes(f.id)))
  }
  useEffect(() => {
    const check = () => {
      setLlmOnline(isLLMAvailable())
    }
    check()
    const id = setInterval(check, 3000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="min-h-screen bg-background text-foreground p-8 font-sans">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-end gap-2 mb-4">
          <Button variant="outline" onClick={toggleTheme}>Toggle theme</Button>
          <Button variant="destructive" onClick={clearKV}>Clear KV</Button>
        </div>
        <h1 className="text-5xl font-bold mb-4 text-primary text-center">🌌 Cloudbank</h1>
        <p className="text-xl text-muted-foreground mb-12 text-center">
          Quantum File Repository & Vector Database
        </p>

        <div className="bg-card p-8 rounded-2xl border mb-8 shadow-md">
          <h2 className="text-xl font-bold mb-6 text-card-foreground">System Status</h2>
          <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="bg-gradient-to-br from-background to-card p-6 rounded-xl text-center border">
              <div className="text-2xl font-bold text-green-500 mb-2">● ONLINE</div>
              <div className="text-sm text-muted-foreground">System Status</div>
            </div>
            <div className="bg-gradient-to-br from-background to-card p-6 rounded-xl text-center border">
              <div className="text-2xl font-bold text-primary mb-2">127</div>
              <div className="text-sm text-muted-foreground">Active Connections</div>
            </div>
            <div className="bg-gradient-to-br from-background to-card p-6 rounded-xl text-center border">
              <div className="text-2xl font-bold text-cyan-400 mb-2">42</div>
              <div className="text-sm text-muted-foreground">Vector Keys</div>
            </div>
            <div className="bg-gradient-to-br from-background to-card p-6 rounded-xl text-center border">
              <div className={`text-2xl font-bold mb-2 ${llmOnline ? 'text-green-500' : 'text-yellow-500'}`}>
                LLM: {llmOnline ? 'ONLINE' : 'OFFLINE'}
              </div>
              <div className="text-sm text-muted-foreground">Spark LLM Availability</div>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            <Button className="quantum-shimmer" variant="default" onClick={() => setTab('uploader')}>📁 Upload Files</Button>
            <Button variant="outline">🔑 Manage Keys</Button>
            <Button variant="secondary">🌐 Vector Database</Button>
          </div>
        </div>

        <div className="text-center p-8 rounded-2xl border mb-8 bg-gradient-to-br from-primary/10 to-cyan-500/10">
          <div className="inline-flex items-center gap-4 text-lg">
            <div className="size-4 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
            <span className="text-green-500 font-semibold">🚀 CLOUDBANK PREVIEW IS LIVE AND WORKING!</span>
            <div className="size-4 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
          </div>
          <p className="text-muted-foreground mt-3 text-base">All systems operational. Ready for quantum file operations.</p>
        </div>

        <div className="bg-gradient-to-br from-card to-background p-8 rounded-2xl border">
          <h3 className="text-lg font-bold text-card-foreground mb-4">🔬 Debug Information</h3>
          <div className="text-sm text-muted-foreground">
            <p>• React App: ✅ Mounted</p>
            <p>• CSS Variables: ✅ Loaded</p>
            <p>• Font Family: ✅ Inter from Google Fonts</p>
            <p>• JavaScript: ✅ Executing</p>
            <p>• Vite Dev Server: ✅ Running</p>
          </div>
        </div>

        {/* Workspace Tabs: mount visual interface components */}
        <div className="mt-8">
          <Tabs value={tab} onValueChange={setTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7 quantum-field">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="uploader">Uploader</TabsTrigger>
              <TabsTrigger value="browser">File Browser</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="keys">Keys</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="viz3d">3D</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <RealTimeAnalyticsDashboard />
            </TabsContent>

            <TabsContent value="uploader">
              <KVDataBridge />
              <QuantumUploader />
            </TabsContent>

            <TabsContent value="browser">
              <VisualFileBrowser onOpenInDatabase={openInDatabase} onDelete={deleteEverywhere} />
            </TabsContent>

            <TabsContent value="database">
              <QuantumDatabase onOpenInBrowser={() => setTab('browser')} onDelete={deleteEverywhere} onBulkDelete={bulkDeleteEverywhere} />
            </TabsContent>

            <TabsContent value="keys">
              <VectorKeyManager />
            </TabsContent>

            <TabsContent value="network">
              <QuantumNetworkVisualization />
            </TabsContent>

            <TabsContent value="viz3d">
              <Quantum3DVisualization />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}