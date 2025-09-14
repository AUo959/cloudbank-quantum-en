import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Atom, Network, Lightning, Eye } from '@phosphor-icons/react'

interface Node {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  type: 'file' | 'agent' | 'vector' | 'quantum'
  connected: string[]
  data?: any
  size: number
  energy: number
}

interface Connection {
  from: string
  to: string
  strength: number
  type: 'entanglement' | 'vector' | 'data'
}

export function QuantumNetworkVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const [nodes, setNodes] = useState<Node[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [isRunning, setIsRunning] = useState(true)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  // Initialize quantum network
  useEffect(() => {
    const initialNodes: Node[] = [
      {
        id: 'quantum-core',
        x: 400,
        y: 300,
        vx: 0,
        vy: 0,
        type: 'quantum',
        connected: ['agent-1', 'agent-2', 'vector-1'],
        size: 25,
        energy: 100
      },
      {
        id: 'agent-1',
        x: 200,
        y: 200,
        vx: 0.5,
        vy: 0.3,
        type: 'agent',
        connected: ['quantum-core', 'file-1'],
        size: 15,
        energy: 80
      },
      {
        id: 'agent-2',
        x: 600,
        y: 400,
        vx: -0.3,
        vy: 0.5,
        type: 'agent',
        connected: ['quantum-core', 'file-2'],
        size: 15,
        energy: 75
      },
      {
        id: 'vector-1',
        x: 300,
        y: 500,
        vx: 0.4,
        vy: -0.2,
        type: 'vector',
        connected: ['quantum-core', 'file-1', 'file-2'],
        size: 12,
        energy: 90
      },
      {
        id: 'file-1',
        x: 150,
        y: 350,
        vx: 0.2,
        vy: 0.4,
        type: 'file',
        connected: ['agent-1', 'vector-1'],
        size: 8,
        energy: 60
      },
      {
        id: 'file-2',
        x: 650,
        y: 250,
        vx: -0.4,
        vy: 0.3,
        type: 'file',
        connected: ['agent-2', 'vector-1'],
        size: 8,
        energy: 65
      }
    ]

    const initialConnections: Connection[] = [
      { from: 'quantum-core', to: 'agent-1', strength: 0.9, type: 'entanglement' },
      { from: 'quantum-core', to: 'agent-2', strength: 0.85, type: 'entanglement' },
      { from: 'quantum-core', to: 'vector-1', strength: 0.95, type: 'vector' },
      { from: 'agent-1', to: 'file-1', strength: 0.7, type: 'data' },
      { from: 'agent-2', to: 'file-2', strength: 0.75, type: 'data' },
      { from: 'vector-1', to: 'file-1', strength: 0.6, type: 'vector' },
      { from: 'vector-1', to: 'file-2', strength: 0.65, type: 'vector' }
    ]

    setNodes(initialNodes)
    setConnections(initialConnections)
  }, [])

  // Animation loop
  useEffect(() => {
    if (!isRunning) return

    const animate = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')!
      if (!ctx) return

      // Clear canvas
      ctx.fillStyle = 'oklch(0.98 0.005 280)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw quantum field background
      drawQuantumField(ctx, canvas.width, canvas.height)

      // Update node positions
      setNodes(prevNodes => {
        const updatedNodes = prevNodes.map(node => {
          // Apply quantum forces
          let fx = 0, fy = 0

          // Repulsion from other nodes
          prevNodes.forEach(other => {
            if (other.id !== node.id) {
              const dx = node.x - other.x
              const dy = node.y - other.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              if (distance > 0 && distance < 200) {
                const force = 50 / (distance * distance)
                fx += (dx / distance) * force
                fy += (dy / distance) * force
              }
            }
          })

          // Attraction to connected nodes
          connections.forEach(conn => {
            if (conn.from === node.id || conn.to === node.id) {
              const otherId = conn.from === node.id ? conn.to : conn.from
              const other = prevNodes.find(n => n.id === otherId)
              if (other) {
                const dx = other.x - node.x
                const dy = other.y - node.y
                const distance = Math.sqrt(dx * dx + dy * dy)
                const idealDistance = 100 + node.size + other.size
                
                if (distance > 0) {
                  const force = (distance - idealDistance) * 0.01 * conn.strength
                  fx += (dx / distance) * force
                  fy += (dy / distance) * force
                }
              }
            }
          })

          // Center attraction for quantum core
          if (node.type === 'quantum') {
            const centerX = canvas.width / 2
            const centerY = canvas.height / 2
            const dx = centerX - node.x
            const dy = centerY - node.y
            fx += dx * 0.001
            fy += dy * 0.001
          }

          // Update velocity and position
          node.vx = (node.vx + fx) * 0.95
          node.vy = (node.vy + fy) * 0.95

          const newX = Math.max(node.size, Math.min(canvas.width - node.size, node.x + node.vx))
          const newY = Math.max(node.size, Math.min(canvas.height - node.size, node.y + node.vy))

          return {
            ...node,
            x: newX,
            y: newY,
            energy: Math.min(100, node.energy + Math.random() * 2 - 1)
          }
        })

        // Draw connections
        connections.forEach(conn => {
          const fromNode = updatedNodes.find(n => n.id === conn.from)
          const toNode = updatedNodes.find(n => n.id === conn.to)
          
          if (fromNode && toNode) {
            drawConnection(ctx, fromNode, toNode, conn)
          }
        })

        // Draw nodes
        updatedNodes.forEach(node => {
          drawNode(ctx, node, node.id === selectedNode?.id)
        })

        return updatedNodes
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning, connections, selectedNode])

  const drawQuantumField = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw quantum field particles
    for (let i = 0; i < 20; i++) {
      const x = (Date.now() * 0.001 + i * 50) % width
      const y = (Math.sin(Date.now() * 0.001 + i) * 50 + height / 2) % height
      
      ctx.fillStyle = `oklch(0.7 0.15 ${250 + i * 10} / 0.1)`
      ctx.beginPath()
      ctx.arc(x, y, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const drawConnection = (ctx: CanvasRenderingContext2D, from: Node, to: Node, connection: Connection) => {
    const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y)
    
    switch (connection.type) {
      case 'entanglement':
        gradient.addColorStop(0, 'oklch(0.7 0.15 290 / 0.8)')
        gradient.addColorStop(1, 'oklch(0.65 0.18 260 / 0.8)')
        break
      case 'vector':
        gradient.addColorStop(0, 'oklch(0.75 0.12 260 / 0.6)')
        gradient.addColorStop(1, 'oklch(0.7 0.15 290 / 0.6)')
        break
      case 'data':
        gradient.addColorStop(0, 'oklch(0.65 0.15 140 / 0.5)')
        gradient.addColorStop(1, 'oklch(0.7 0.12 120 / 0.5)')
        break
    }

    ctx.strokeStyle = gradient
    ctx.lineWidth = connection.strength * 3
    ctx.lineCap = 'round'

    // Draw flowing energy along connection
    const time = Date.now() * 0.005
    const segments = 20
    
    ctx.beginPath()
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const x = from.x + (to.x - from.x) * t
      const y = from.y + (to.y - from.y) * t
      
      // Add wave effect
      const wave = Math.sin(time + t * Math.PI * 4) * 5
      const perpX = -(to.y - from.y) / Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2)
      const perpY = (to.x - from.x) / Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2)
      
      if (i === 0) {
        ctx.moveTo(x + perpX * wave, y + perpY * wave)
      } else {
        ctx.lineTo(x + perpX * wave, y + perpY * wave)
      }
    }
    ctx.stroke()

    // Draw energy pulse
    const pulsePos = (time * 0.5) % 1
    const pulseX = from.x + (to.x - from.x) * pulsePos
    const pulseY = from.y + (to.y - from.y) * pulsePos
    
    ctx.fillStyle = 'oklch(0.9 0.2 280 / 0.8)'
    ctx.beginPath()
    ctx.arc(pulseX, pulseY, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  const drawNode = (ctx: CanvasRenderingContext2D, node: Node, isSelected: boolean) => {
    const time = Date.now() * 0.003
    const pulse = Math.sin(time + node.energy * 0.1) * 0.2 + 1

    // Draw energy field
    const fieldSize = node.size * 2 * pulse
    const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, fieldSize)
    
    switch (node.type) {
      case 'quantum':
        gradient.addColorStop(0, 'oklch(0.7 0.15 290 / 0.3)')
        gradient.addColorStop(1, 'oklch(0.7 0.15 290 / 0)')
        break
      case 'agent':
        gradient.addColorStop(0, 'oklch(0.65 0.18 260 / 0.25)')
        gradient.addColorStop(1, 'oklch(0.65 0.18 260 / 0)')
        break
      case 'vector':
        gradient.addColorStop(0, 'oklch(0.75 0.12 260 / 0.2)')
        gradient.addColorStop(1, 'oklch(0.75 0.12 260 / 0)')
        break
      case 'file':
        gradient.addColorStop(0, 'oklch(0.65 0.15 140 / 0.15)')
        gradient.addColorStop(1, 'oklch(0.65 0.15 140 / 0)')
        break
    }

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(node.x, node.y, fieldSize, 0, Math.PI * 2)
    ctx.fill()

    // Draw node core
    ctx.fillStyle = isSelected 
      ? 'oklch(0.9 0.2 280)' 
      : node.type === 'quantum' 
        ? 'oklch(0.7 0.15 290)'
        : node.type === 'agent'
          ? 'oklch(0.65 0.18 260)'
          : node.type === 'vector'
            ? 'oklch(0.75 0.12 260)'
            : 'oklch(0.65 0.15 140)'

    ctx.beginPath()
    ctx.arc(node.x, node.y, node.size * pulse, 0, Math.PI * 2)
    ctx.fill()

    // Draw node border
    ctx.strokeStyle = 'oklch(0.98 0.01 280)'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw type indicator
    ctx.fillStyle = 'oklch(0.98 0.01 280)'
    ctx.font = '12px Inter'
    ctx.textAlign = 'center'
    ctx.fillText(node.type.charAt(0).toUpperCase(), node.x, node.y + 4)
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
      return distance <= node.size
    })

    setSelectedNode(clickedNode || null)
  }

  const addQuantumNode = () => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      type: ['file', 'agent', 'vector'][Math.floor(Math.random() * 3)] as 'file' | 'agent' | 'vector',
      connected: [],
      size: Math.random() * 10 + 8,
      energy: Math.random() * 50 + 50
    }

    setNodes(prev => [...prev, newNode])
    
    // Add random connection to existing node
    if (nodes.length > 0) {
      const randomExistingNode = nodes[Math.floor(Math.random() * nodes.length)]
      const newConnection: Connection = {
        from: newNode.id,
        to: randomExistingNode.id,
        strength: Math.random() * 0.5 + 0.5,
        type: ['entanglement', 'vector', 'data'][Math.floor(Math.random() * 3)] as 'entanglement' | 'vector' | 'data'
      }
      setConnections(prev => [...prev, newConnection])
    }
  }

  return (
    <div className="space-y-6">
      <Card className="quantum-field">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" />
            Quantum Network Visualization
          </CardTitle>
          <CardDescription>
            Real-time visualization of quantum entanglements, vector chains, and agent interactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              variant={isRunning ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {isRunning ? "Pause" : "Resume"} Observer
            </Button>
            <Button
              onClick={addQuantumNode}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Atom className="w-4 h-4" />
              Add Quantum Node
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Lightning className="w-3 h-3" />
                {nodes.length} Active Nodes
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Network className="w-3 h-3" />
                {connections.length} Entanglements
              </Badge>
            </div>
          </div>

          <div className="relative border rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full h-auto cursor-pointer"
              onClick={handleCanvasClick}
              style={{ maxHeight: '600px' }}
            />
            
            {selectedNode && (
              <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">{selectedNode.id}</h4>
                <div className="space-y-1 text-sm">
                  <p>Type: <Badge variant="outline">{selectedNode.type}</Badge></p>
                  <p>Energy: {selectedNode.energy.toFixed(1)}%</p>
                  <p>Connections: {selectedNode.connected.length}</p>
                  <p>Position: ({selectedNode.x.toFixed(0)}, {selectedNode.y.toFixed(0)})</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-sm font-medium">Quantum Core</span>
              </div>
              <p className="text-xs text-muted-foreground">Central processing hub</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                <span className="text-sm font-medium">AI Agents</span>
              </div>
              <p className="text-xs text-muted-foreground">Active processing units</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span className="text-sm font-medium">Vector Keys</span>
              </div>
              <p className="text-xs text-muted-foreground">Access control nodes</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: 'oklch(0.65 0.15 140)' }}></div>
                <span className="text-sm font-medium">Data Files</span>
              </div>
              <p className="text-xs text-muted-foreground">Stored information</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}