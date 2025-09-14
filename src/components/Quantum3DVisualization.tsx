import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Atom, 
  Network, 
  Lightning, 
  Eye, 
  Cube, 
  ArrowsClockwise,
  Play,
  Pause,
  Plus,
  Trash,
  Gear
} from '@phosphor-icons/react'
import * as THREE from 'three'

interface QuantumNode3D {
  id: string
  mesh: THREE.Mesh
  position: THREE.Vector3
  velocity: THREE.Vector3
  type: 'quantum-core' | 'agent' | 'vector' | 'file' | 'observer'
  energy: number
  size: number
  quantumState: 'superposition' | 'entangled' | 'collapsed' | 'coherent'
}

interface QuantumConnection3D {
  id: string
  from: string
  to: string
  line: THREE.Line
  strength: number
}

export function Quantum3DVisualization() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const animationRef = useRef<number | null>(null)
  
  const [nodes, setNodes] = useState<QuantumNode3D[]>([])
  const [connections, setConnections] = useState<QuantumConnection3D[]>([])
  const [isPlaying, setIsPlaying] = useState(true)
  const [autoRotate, setAutoRotate] = useState(true)
  const [quantumEffects, setQuantumEffects] = useState(true)
  
  // Mouse controls
  const mouseRef = useRef({
    isDown: false,
    x: 0,
    y: 0,
    rotationX: 0,
    rotationY: 0
  })

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0f)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(15, 15, 15)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer

    mountRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x4a4a8a, 0.4)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0x7a7aff, 0.8)
    directionalLight.position.set(10, 10, 5)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    const pointLight1 = new THREE.PointLight(0xff4a9f, 0.6, 50)
    pointLight1.position.set(5, 5, 5)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x4a9fff, 0.6, 50)
    pointLight2.position.set(-5, -5, -5)
    scene.add(pointLight2)

    // Create particle field
    createParticleField(scene)

    // Mouse controls
    const onMouseDown = (event: MouseEvent) => {
      mouseRef.current.isDown = true
      mouseRef.current.x = event.clientX
      mouseRef.current.y = event.clientY
    }

    const onMouseMove = (event: MouseEvent) => {
      if (!mouseRef.current.isDown) return
      const deltaX = event.clientX - mouseRef.current.x
      const deltaY = event.clientY - mouseRef.current.y
      mouseRef.current.rotationY += deltaX * 0.01
      mouseRef.current.rotationX += deltaY * 0.01
      mouseRef.current.x = event.clientX
      mouseRef.current.y = event.clientY
    }

    const onMouseUp = () => {
      mouseRef.current.isDown = false
    }

    const onWheel = (event: WheelEvent) => {
      const distance = camera.position.length()
      const newDistance = Math.max(5, Math.min(50, distance + event.deltaY * 0.01))
      camera.position.normalize().multiplyScalar(newDistance)
    }

    renderer.domElement.addEventListener('mousedown', onMouseDown)
    renderer.domElement.addEventListener('mousemove', onMouseMove)
    renderer.domElement.addEventListener('mouseup', onMouseUp)
    renderer.domElement.addEventListener('wheel', onWheel)

    // Initialize quantum network
    initializeNetwork(scene)

    // Cleanup
    return () => {
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  const createParticleField = (scene: THREE.Scene) => {
    const particleCount = 500
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const radius = 25
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      const color = new THREE.Color()
      color.setHSL(0.6 + Math.random() * 0.4, 0.8, 0.5)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)
  }

  const initializeNetwork = (scene: THREE.Scene) => {
    const newNodes: QuantumNode3D[] = []
    const newConnections: QuantumConnection3D[] = []

    // Create quantum core
    const coreGeometry = new THREE.IcosahedronGeometry(1.5, 2)
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: 0x7a4fff,
      emissive: 0x2a1a4a,
      transparent: true,
      opacity: 0.9
    })
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial)
    coreMesh.castShadow = true
    scene.add(coreMesh)

    const coreNode: QuantumNode3D = {
      id: 'quantum-core',
      mesh: coreMesh,
      position: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      type: 'quantum-core',
      energy: 100,
      size: 1.5,
      quantumState: 'coherent'
    }
    newNodes.push(coreNode)

    // Create surrounding nodes
    const nodeTypes: Array<QuantumNode3D['type']> = ['agent', 'vector', 'file', 'observer']
    const colors = [0x4a9fff, 0xff9f4a, 0x4aff9f, 0x9fff4a]
    
    for (let i = 0; i < 8; i++) {
      const nodeType = nodeTypes[i % nodeTypes.length]
      const color = colors[i % colors.length]
      
      const geometry = new THREE.SphereGeometry(0.6, 16, 16)
      const material = new THREE.MeshPhongMaterial({
        color,
        emissive: new THREE.Color(color).multiplyScalar(0.1),
        transparent: true,
        opacity: 0.8
      })
      const mesh = new THREE.Mesh(geometry, material)
      
      // Position in sphere around core
      const radius = 6 + Math.random() * 3
      const theta = (i / 8) * Math.PI * 2 + Math.random() * 0.5
      const phi = Math.acos(2 * Math.random() - 1)
      
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)
      
      mesh.position.set(x, y, z)
      mesh.castShadow = true
      scene.add(mesh)

      const node: QuantumNode3D = {
        id: `node-${i}`,
        mesh,
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        type: nodeType,
        energy: 50 + Math.random() * 50,
        size: 0.6,
        quantumState: 'superposition'
      }
      newNodes.push(node)

      // Create connection to core
      const lineGeometry = new THREE.BufferGeometry()
      const positions = new Float32Array(6)
      positions[0] = 0; positions[1] = 0; positions[2] = 0
      positions[3] = x; positions[4] = y; positions[5] = z
      
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x7a4fff,
        transparent: true,
        opacity: 0.6
      })

      const line = new THREE.Line(lineGeometry, lineMaterial)
      scene.add(line)

      const connection: QuantumConnection3D = {
        id: `core-${node.id}`,
        from: 'quantum-core',
        to: node.id,
        line,
        strength: 0.7 + Math.random() * 0.3
      }
      newConnections.push(connection)
    }

    setNodes(newNodes)
    setConnections(newConnections)
  }

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !sceneRef.current || !rendererRef.current || !cameraRef.current) return

    const animate = () => {
      if (!isPlaying || !sceneRef.current || !rendererRef.current || !cameraRef.current) return

      const time = Date.now() * 0.001

      // Update camera
      const mouse = mouseRef.current
      if (autoRotate && !mouse.isDown) {
        mouse.rotationY += 0.005
      }
      
      const distance = cameraRef.current.position.length()
      cameraRef.current.position.set(
        Math.sin(mouse.rotationY) * Math.cos(mouse.rotationX) * distance,
        Math.sin(mouse.rotationX) * distance,
        Math.cos(mouse.rotationY) * Math.cos(mouse.rotationX) * distance
      )
      cameraRef.current.lookAt(0, 0, 0)

      // Update particles
      const particles = sceneRef.current.children.find(child => child.type === 'Points') as THREE.Points
      if (particles) {
        particles.rotation.y += 0.002
        particles.rotation.x += 0.001
      }

      // Update nodes
      nodes.forEach(node => {
        if (quantumEffects) {
          const fluctuation = Math.sin(time * 2 + node.position.length()) * 0.1
          node.mesh.scale.setScalar(1 + fluctuation * 0.1)
          
          const material = node.mesh.material as THREE.MeshPhongMaterial
          if (node.quantumState === 'superposition') {
            material.opacity = 0.5 + Math.sin(time * 4) * 0.3
          }
        }

        // Orbital motion for non-core nodes
        if (node.type !== 'quantum-core') {
          const coreNode = nodes.find(n => n.id === 'quantum-core')
          if (coreNode) {
            const direction = new THREE.Vector3()
              .subVectors(coreNode.position, node.position)
              .normalize()
            
            const distance = node.position.distanceTo(coreNode.position)
            const force = direction.multiplyScalar(0.0005 / (distance * distance))
            node.velocity.add(force)
            
            // Orbital motion
            const tangent = new THREE.Vector3()
              .crossVectors(node.position, new THREE.Vector3(0, 1, 0))
              .normalize()
              .multiplyScalar(0.008 / distance)
            node.velocity.add(tangent)
          }

          node.position.add(node.velocity)
          node.mesh.position.copy(node.position)
          node.velocity.multiplyScalar(0.99)
        }
      })

      // Update connections
      connections.forEach(connection => {
        const fromNode = nodes.find(n => n.id === connection.from)
        const toNode = nodes.find(n => n.id === connection.to)
        
        if (fromNode && toNode) {
          const positions = connection.line.geometry.getAttribute('position') as THREE.BufferAttribute
          positions.setXYZ(0, fromNode.position.x, fromNode.position.y, fromNode.position.z)
          positions.setXYZ(1, toNode.position.x, toNode.position.y, toNode.position.z)
          positions.needsUpdate = true
          
          const material = connection.line.material as THREE.LineBasicMaterial
          material.opacity = 0.3 + Math.sin(time * 3) * 0.3
        }
      })

      rendererRef.current.render(sceneRef.current, cameraRef.current)
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, autoRotate, quantumEffects, nodes, connections])

  const addNode = () => {
    if (!sceneRef.current) return

    const geometry = new THREE.SphereGeometry(0.5, 12, 8)
    const material = new THREE.MeshPhongMaterial({
      color: 0x4aff9f,
      transparent: true,
      opacity: 0.8
    })
    const mesh = new THREE.Mesh(geometry, material)
    
    const radius = 8 + Math.random() * 2
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    
    const x = radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.sin(phi) * Math.sin(theta)
    const z = radius * Math.cos(phi)
    
    mesh.position.set(x, y, z)
    mesh.castShadow = true
    sceneRef.current.add(mesh)

    const newNode: QuantumNode3D = {
      id: `node-${Date.now()}`,
      mesh,
      position: new THREE.Vector3(x, y, z),
      velocity: new THREE.Vector3(0, 0, 0),
      type: 'file',
      energy: 60,
      size: 0.5,
      quantumState: 'superposition'
    }

    setNodes(prev => [...prev, newNode])
  }

  const resetNetwork = () => {
    if (sceneRef.current) {
      nodes.forEach(node => sceneRef.current!.remove(node.mesh))
      connections.forEach(conn => sceneRef.current!.remove(conn.line))
      setNodes([])
      setConnections([])
      initializeNetwork(sceneRef.current)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="quantum-field">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cube className="w-5 h-5 text-primary quantum-pulse" />
            3D Quantum Network Visualization
          </CardTitle>
          <CardDescription>
            Interactive 3D visualization of quantum network topology with real-time physics simulation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              variant={isPlaying ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "Pause" : "Resume"}
            </Button>
            
            <Button
              onClick={addNode}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Node
            </Button>
            
            <Button
              onClick={resetNetwork}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowsClockwise className="w-4 h-4" />
              Reset
            </Button>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Atom className="w-3 h-3" />
                {nodes.length} Nodes
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Network className="w-3 h-3" />
                {connections.length} Links
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Lightning className="w-3 h-3" />
                {isPlaying ? "Active" : "Paused"}
              </Badge>
            </div>
          </div>

          {/* 3D Visualization */}
          <div className="relative">
            <div
              ref={mountRef}
              className="w-full h-[600px] border rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 to-purple-900"
            />
            
            <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                <strong>Controls:</strong> Drag to rotate • Scroll to zoom • Auto-rotation enabled
              </p>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-rotate">Auto Rotate</Label>
              <Switch
                id="auto-rotate"
                checked={autoRotate}
                onCheckedChange={setAutoRotate}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="quantum-effects">Quantum Effects</Label>
              <Switch
                id="quantum-effects"
                checked={quantumEffects}
                onCheckedChange={setQuantumEffects}
              />
            </div>

            <div className="flex items-center justify-center">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Gear className="w-3 h-3" />
                Physics Simulation Active
              </Badge>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm font-medium">Quantum Core</span>
              </div>
              <p className="text-xs text-muted-foreground">Central hub</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium">AI Agents</span>
              </div>
              <p className="text-xs text-muted-foreground">Processing nodes</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm font-medium">Vector Keys</span>
              </div>
              <p className="text-xs text-muted-foreground">Access control</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Data Files</span>
              </div>
              <p className="text-xs text-muted-foreground">Information</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full bg-lime-500"></div>
                <span className="text-sm font-medium">Observers</span>
              </div>
              <p className="text-xs text-muted-foreground">Quantum states</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}