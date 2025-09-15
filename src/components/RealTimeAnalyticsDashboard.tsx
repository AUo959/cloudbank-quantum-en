import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Brain,
  Lightning,
  TrendUp,
  Activity,
  Database,
  Atom,
  Eye,
  Pause,
  Play
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface AnalysisMetric {
  id: string
  name: string
  value: number
  trend: 'up' | 'down' | 'stable'
  history: number[]
  timestamp: string
  color: string
}

interface AIProcessingTask {
  id: string
  name: string
  status: 'processing' | 'completed' | 'queued' | 'error'
  progress: number
  startTime: string
  estimatedCompletion?: string
  result?: any
}

export function RealTimeAnalyticsDashboard() {
  const [metrics, setMetrics] = useKV<AnalysisMetric[]>('analytics-metrics', [])
  const [tasks, setTasks] = useKV<AIProcessingTask[]>('processing-tasks', [])
  const [isRunning, setIsRunning] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const metricsCanvasRef = useRef<HTMLCanvasElement>(null)
  const systemCanvasRef = useRef<HTMLCanvasElement>(null)
  const isInitializing = (!metrics || metrics.length === 0) && (!tasks || tasks.length === 0)

  // Initialize sample metrics
  useEffect(() => {
    if (!metrics || metrics.length === 0) {
      const initialMetrics: AnalysisMetric[] = [
        {
          id: 'quantum-coherence',
          name: 'Quantum Coherence',
          value: 85,
          trend: 'up',
          history: Array.from({ length: 50 }, () => Math.random() * 100),
          timestamp: new Date().toISOString(),
          color: 'oklch(0.7 0.15 290)'
        },
        {
          id: 'processing-efficiency',
          name: 'Processing Efficiency',
          value: 92,
          trend: 'stable',
          history: Array.from({ length: 50 }, () => Math.random() * 100),
          timestamp: new Date().toISOString(),
          color: 'oklch(0.65 0.18 260)'
        },
        {
          id: 'vector-integrity',
          name: 'Vector Integrity',
          value: 78,
          trend: 'down',
          history: Array.from({ length: 50 }, () => Math.random() * 100),
          timestamp: new Date().toISOString(),
          color: 'oklch(0.75 0.12 260)'
        },
        {
          id: 'entanglement-strength',
          name: 'Entanglement Strength',
          value: 96,
          trend: 'up',
          history: Array.from({ length: 50 }, () => Math.random() * 100),
          timestamp: new Date().toISOString(),
          color: 'oklch(0.65 0.15 140)'
        }
      ]
      setMetrics(initialMetrics)
    }

    if (!tasks || tasks.length === 0) {
      const initialTasks: AIProcessingTask[] = [
        {
          id: 'file-analysis-1',
          name: 'Deep Content Analysis',
          status: 'processing',
          progress: 67,
          startTime: new Date().toISOString()
        },
        {
          id: 'vector-generation',
          name: 'Vector Key Generation',
          status: 'completed',
          progress: 100,
          startTime: new Date(Date.now() - 300000).toISOString(),
          result: 'Generated 15 vector keys'
        },
        {
          id: 'quantum-sync',
          name: 'Quantum State Synchronization',
          status: 'queued',
          progress: 0,
          startTime: new Date().toISOString()
        }
      ]
      setTasks(initialTasks)
    }
  }, [metrics, tasks, setMetrics, setTasks])

  // Update metrics in real-time
  useEffect(() => {
    if (!isRunning || !metrics) return

    const interval = setInterval(() => {
      setMetrics((prevMetrics) => {
        if (!prevMetrics) return []
        
        return prevMetrics.map(metric => {
          const newValue = Math.max(0, Math.min(100, 
            metric.value + (Math.random() - 0.5) * 5
          ))
          const newHistory = [...metric.history.slice(1), newValue]
          
          // Determine trend
          const recentValues = newHistory.slice(-5)
          const avgRecent = recentValues.reduce((a, b) => a + b, 0) / recentValues.length
          const avgPrevious = newHistory.slice(-10, -5).reduce((a, b) => a + b, 0) / 5
          
          let trend: 'up' | 'down' | 'stable' = 'stable'
          if (avgRecent > avgPrevious + 2) trend = 'up'
          else if (avgRecent < avgPrevious - 2) trend = 'down'

          return {
            ...metric,
            value: newValue,
            history: newHistory,
            trend,
            timestamp: new Date().toISOString()
          }
        })
      })

      // Update task progress
      setTasks((prevTasks) => {
        if (!prevTasks) return []
        
        return prevTasks.map(task => {
          if (task.status === 'processing') {
            const newProgress = Math.min(100, task.progress + Math.random() * 3)
            return {
              ...task,
              progress: newProgress,
              status: newProgress >= 100 ? 'completed' : 'processing'
            }
          }
          return task
        })
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, metrics, setMetrics, setTasks])

  // Draw metrics visualization (DPR-aware + resize)
  useEffect(() => {
    const canvas = metricsCanvasRef.current
    if (!canvas || !metrics) return

    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      const { width: cssW, height: cssH } = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(cssW * dpr))
      canvas.height = Math.max(1, Math.floor(cssH * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Redraw on resize
      draw(cssW, cssH)
    }

    const draw = (width: number, height: number) => {
      ctx.fillStyle = 'oklch(0.98 0.005 280)'
      ctx.fillRect(0, 0, width, height)

      ctx.strokeStyle = 'oklch(0.88 0.03 280 / 0.3)'
      ctx.lineWidth = 1
      for (let i = 0; i <= 10; i++) {
        const y = (height / 10) * i
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
      }
      for (let i = 0; i <= 20; i++) {
        const x = (width / 20) * i
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
      }

      metrics.forEach((metric, index) => {
        const yOffset = (height / metrics.length) * index
        const sectionHeight = height / metrics.length - 10

        ctx.strokeStyle = metric.color
        ctx.lineWidth = 2
        ctx.beginPath()
        metric.history.forEach((value, i) => {
          const x = (width / metric.history.length) * i
          const y = yOffset + sectionHeight - (value / 100) * sectionHeight
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
        })
        ctx.stroke()

        ctx.fillStyle = metric.color + '20'
        ctx.beginPath()
        metric.history.forEach((value, i) => {
          const x = (width / metric.history.length) * i
          const y = yOffset + sectionHeight - (value / 100) * sectionHeight
          if (i === 0) { ctx.moveTo(x, yOffset + sectionHeight); ctx.lineTo(x, y) } else { ctx.lineTo(x, y) }
        })
        ctx.lineTo(width, yOffset + sectionHeight)
        ctx.closePath(); ctx.fill()

        ctx.fillStyle = metric.color
        ctx.font = '14px Inter'
        ctx.textAlign = 'left'
        ctx.fillText(`${metric.name}: ${metric.value.toFixed(1)}%`, 10, yOffset + 20)
      })
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    // Redraw when metrics change
    const rect = canvas.getBoundingClientRect()
    draw(rect.width, rect.height)

    return () => { ro.disconnect() }
  }, [metrics])

  // Draw system overview (animated + DPR-aware)
  useEffect(() => {
    const canvas = systemCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    let rafId = 0

    const resize = () => {
      const { width: cssW, height: cssH } = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(cssW * dpr))
      canvas.height = Math.max(1, Math.floor(cssH * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (t: number) => {
      const { width: cssW, height: cssH } = canvas.getBoundingClientRect()
      const width = cssW
      const height = cssH
      const centerX = width / 2
      const centerY = height / 2

      ctx.fillStyle = 'oklch(0.98 0.005 280)'
      ctx.fillRect(0, 0, width, height)

      const time = t * 0.001
      const coreRadius = 30 + Math.sin(time) * 5
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius)
      gradient.addColorStop(0, 'oklch(0.7 0.15 290 / 0.8)')
      gradient.addColorStop(1, 'oklch(0.7 0.15 290 / 0.1)')
      ctx.fillStyle = gradient
      ctx.beginPath(); ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2); ctx.fill()

      const numOrbits = 3
      for (let orbit = 0; orbit < numOrbits; orbit++) {
        const orbitRadius = 80 + orbit * 40
        const numElements = 4 + orbit * 2
        for (let i = 0; i < numElements; i++) {
          const angle = (time * 0.5 + i * (Math.PI * 2 / numElements) + orbit * 0.3) % (Math.PI * 2)
          const x = centerX + Math.cos(angle) * orbitRadius
          const y = centerY + Math.sin(angle) * orbitRadius
          const elementGradient = ctx.createRadialGradient(x, y, 0, x, y, 8)
          elementGradient.addColorStop(0, 'oklch(0.65 0.18 260 / 0.9)')
          elementGradient.addColorStop(1, 'oklch(0.65 0.18 260 / 0.1)')
          ctx.fillStyle = elementGradient
          ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill()
          ctx.strokeStyle = 'oklch(0.7 0.15 290 / 0.3)'
          ctx.lineWidth = 1
          ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(x, y); ctx.stroke()
        }
      }

      for (let i = 0; i < 5; i++) {
        const pulseTime = ((time + i * 0.5) % 2)
        const pulseRadius = pulseTime * 100
        const pulseOpacity = 1 - pulseTime / 2
        ctx.strokeStyle = `oklch(0.7 0.15 290 / ${pulseOpacity * 0.3})`
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2); ctx.stroke()
      }

      if (isRunning) rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(() => { resize() })
    ro.observe(canvas)
    resize()
    rafId = requestAnimationFrame(draw)

    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [isRunning])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendUp className="w-4 h-4 text-green-500" />
      case 'down': return <TrendUp className="w-4 h-4 text-red-500 rotate-180" />
      default: return <Activity className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500'
      case 'processing': return 'text-blue-500'
      case 'error': return 'text-red-500'
      default: return 'text-yellow-500'
    }
  }

  return (
    <div className="space-y-6">
      {isInitializing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Loading Metrics</CardTitle>
              <CardDescription>Initializing realtime streams…</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Preparing Visualization</CardTitle>
              <CardDescription>Setting up canvas renderer…</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      )}
      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="quantum-field">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Real-Time Metrics
            </CardTitle>
            <CardDescription>
              Live system performance and quantum state monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <canvas
              ref={metricsCanvasRef}
              width={400}
              height={300}
              className="w-full h-auto border rounded-lg"
            />
          </CardContent>
        </Card>

        <Card className="quantum-field">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Atom className="w-5 h-5 text-primary" />
              Quantum Field Visualization
            </CardTitle>
            <CardDescription>
              Interactive quantum state and entanglement network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <canvas
              ref={systemCanvasRef}
              width={400}
              height={300}
              className="w-full h-auto border rounded-lg"
            />
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="quantum-field">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                variant={isRunning ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? "Pause" : "Resume"} Monitoring
              </Button>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Observer Active
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1 quantum-shimmer">
                  <Lightning className="w-3 h-3" />
                  Quantum Processing
                </Badge>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Last Update: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="quantum-field">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              System Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {(metrics || []).map(metric => (
                  <div 
                    key={metric.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-muted/20 ${
                      selectedMetric === metric.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{metric.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold" style={{ color: metric.color }}>
                            {metric.value.toFixed(1)}%
                          </span>
                          {getTrendIcon(metric.trend)}
                        </div>
                      </div>
                      
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{new Date(metric.timestamp).toLocaleTimeString()}</p>
                        <Badge variant="outline" className="mt-1">
                          {metric.trend}
                        </Badge>
                      </div>
                    </div>

                    {selectedMetric === metric.id && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Min:</span>
                            <span className="ml-2">{Math.min(...metric.history).toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Max:</span>
                            <span className="ml-2">{Math.max(...metric.history).toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg:</span>
                            <span className="ml-2">
                              {(metric.history.reduce((a, b) => a + b, 0) / metric.history.length).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Stability:</span>
                            <span className="ml-2">
                              {(100 - (Math.max(...metric.history) - Math.min(...metric.history))).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="quantum-field">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              AI Processing Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {(tasks || []).map(task => (
                  <div key={task.id} className="p-4 rounded-lg border">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{task.name}</h4>
                        <Badge variant="outline" className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{task.progress}%</span>
                        </div>
                        <div className="w-full bg-muted/20 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Started: {new Date(task.startTime).toLocaleTimeString()}
                        {task.result && (
                          <p className="mt-1 text-green-600">Result: {task.result}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}