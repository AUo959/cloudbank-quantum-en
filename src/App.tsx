import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Atom, Upload, Key, Network, Database, Brain } from '@phosphor-icons/react'
import { QuantumField } from '@/components/QuantumField'
import { QuantumUploader } from '@/components/QuantumUploader'
import { VectorKeyManager } from '@/components/VectorKeyManager'
import { ProjectSpaceManager } from '@/components/ProjectSpaceManager'
import { QuantumDatabase } from '@/components/QuantumDatabase'
import { MetadataAnalyzer } from '@/components/MetadataAnalyzer'
import { Toaster } from '@/components/ui/sonner'

function App() {
  const [activeTab, setActiveTab] = useState('analysis')

  return (
    <QuantumField className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Atom className="w-12 h-12 text-accent quantum-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">
              Cloudbank
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Quantum file repository system enabling seamless interoperability between AI agents 
            through symbolic vector chains and observer state protocols
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="quantum-shimmer">
              Quantum Computing Enabled
            </Badge>
            <Badge variant="outline" className="quantum-shimmer">
              Vector Chain Protocol
            </Badge>
            <Badge variant="outline" className="quantum-shimmer">
              Cross-Agent Compatible
            </Badge>
          </div>
        </div>

        {/* System Status */}
        <Card className="quantum-field">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Quantum System Status
            </CardTitle>
            <CardDescription>
              Real-time monitoring of quantum database and vector chain operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center space-y-1">
                <p className="text-2xl font-bold text-accent quantum-pulse">
                  {Math.floor(Math.random() * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Quantum Coherence</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-2xl font-bold text-primary quantum-pulse">
                  {Math.floor(Math.random() * 50) + 50}
                </p>
                <p className="text-xs text-muted-foreground">Active Entanglements</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-2xl font-bold text-secondary quantum-pulse">
                  {Math.floor(Math.random() * 10) + 5}
                </p>
                <p className="text-xs text-muted-foreground">Vector Chains</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-2xl font-bold text-ring quantum-pulse">
                  Online
                </p>
                <p className="text-xs text-muted-foreground">Observer State</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 quantum-field">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Analysis
            </TabsTrigger>
            <TabsTrigger value="vectors" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Vector Keys
            </TabsTrigger>
            <TabsTrigger value="spaces" className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              Project Spaces
            </TabsTrigger>
            <TabsTrigger value="browser" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Browser
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <QuantumUploader />
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <QuantumDatabase />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <MetadataAnalyzer />
          </TabsContent>

          <TabsContent value="vectors" className="space-y-6">
            <VectorKeyManager />
          </TabsContent>

          <TabsContent value="spaces" className="space-y-6">
            <ProjectSpaceManager />
          </TabsContent>

          <TabsContent value="browser" className="space-y-6">
            <QuantumDatabase />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>Powered by Quantum Computing • Vector Chain Protocol • Observer State Management</p>
          <div className="flex items-center justify-center gap-4">
            <span>Superposition Active</span>
            <span>•</span>
            <span>Entanglement Stable</span>
            <span>•</span>
            <span>Cross-Agent Ready</span>
          </div>
        </div>
      </div>

      <Toaster />
    </QuantumField>
  )
}

export default App