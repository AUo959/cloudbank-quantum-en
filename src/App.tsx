import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, Key, Database, Cpu, Network, Atom, Lightning } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface SystemStats {
  quantumState: string
  connections: number
  vectorChains: number
  activeNodes: number
}

export default function App() {
  const [stats, setStats] = useKV<SystemStats>('cloudbank-stats', {
    quantumState: 'Active',
    connections: 72,
    vectorChains: 12,
    activeNodes: 5
  })

  const [isQuantumActive, setIsQuantumActive] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Simulate quantum field activity
    const statsInterval = setInterval(() => {
      setStats(prev => ({
        quantumState: prev?.quantumState || 'Active',
        connections: Math.floor(Math.random() * 20) + 60,
        vectorChains: Math.floor(Math.random() * 8) + 10,
        activeNodes: Math.floor(Math.random() * 3) + 4
      }))
    }, 3000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(statsInterval)
    }
  }, [setStats])

  const handleQuantumToggle = () => {
    setIsQuantumActive(!isQuantumActive)
    setStats(prev => ({
      ...prev!,
      quantumState: !isQuantumActive ? 'Active' : 'Standby'
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <Atom className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Cloudbank
                </h1>
                <p className="text-sm text-muted-foreground">Quantum File Repository</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium">{currentTime.toLocaleTimeString()}</div>
                <div className="text-xs text-muted-foreground">{currentTime.toLocaleDateString()}</div>
              </div>
              <Button
                variant={isQuantumActive ? "default" : "secondary"}
                size="sm"
                onClick={handleQuantumToggle}
                className="gap-2"
              >
                <div className={`w-2 h-2 rounded-full ${isQuantumActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                {isQuantumActive ? 'Active' : 'Standby'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Welcome to the Future of
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Cross-Agent File Management
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Leverage quantum computing principles and AI-powered organization to transform 
            how agents share and access information across multiple project spaces.
          </p>
        </div>

        {/* System Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <Lightning className="w-8 h-8 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{stats?.quantumState || 'Loading'}</div>
              <div className="text-sm text-muted-foreground">Quantum State</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-card/50 border-accent/20">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <Network className="w-8 h-8 text-accent" />
              </div>
              <div className="text-2xl font-bold text-accent mb-1">{stats?.connections || 0}</div>
              <div className="text-sm text-muted-foreground">Active Connections</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-card/50 border-secondary/20">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <Key className="w-8 h-8 text-secondary" />
              </div>
              <div className="text-2xl font-bold text-secondary mb-1">{stats?.vectorChains || 0}</div>
              <div className="text-sm text-muted-foreground">Vector Chains</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <Cpu className="w-8 h-8 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{stats?.activeNodes || 0}</div>
              <div className="text-sm text-muted-foreground">Quantum Nodes</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Quantum Operations
            </CardTitle>
            <CardDescription>
              Core functionality for file management and cross-agent communication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="h-auto p-6 flex-col gap-3 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                size="lg"
              >
                <Upload className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-semibold text-base">Upload Files</div>
                  <div className="text-xs opacity-80">Process & organize files</div>
                </div>
              </Button>
              
              <Button 
                className="h-auto p-6 flex-col gap-3 bg-gradient-to-br from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
                size="lg"
              >
                <Key className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-semibold text-base">Generate Vector Key</div>
                  <div className="text-xs opacity-80">Create access credentials</div>
                </div>
              </Button>
              
              <Button 
                className="h-auto p-6 flex-col gap-3 bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
                size="lg"
              >
                <Database className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-semibold text-base">Access Database</div>
                  <div className="text-xs opacity-80">Browse quantum storage</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  <div>
                    <span className="text-sm font-medium">Vector key VK-4A7B generated</span>
                    <div className="text-xs text-muted-foreground">Cross-agent access enabled</div>
                  </div>
                </div>
                <Badge variant="secondary">2 min ago</Badge>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-accent rounded-full" />
                  <div>
                    <span className="text-sm font-medium">Database sync completed</span>
                    <div className="text-xs text-muted-foreground">All nodes synchronized</div>
                  </div>
                </div>
                <Badge variant="secondary">5 min ago</Badge>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-secondary rounded-full" />
                  <div>
                    <span className="text-sm font-medium">3 files processed and indexed</span>
                    <div className="text-xs text-muted-foreground">AI metadata extraction complete</div>
                  </div>
                </div>
                <Badge variant="secondary">12 min ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}