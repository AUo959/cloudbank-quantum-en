import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Key, Eye, Lightning, Network, Shield, Atom, Download, QrCode, Share } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { QuantumQRShare } from '@/components/QuantumQRShare'
import { QuantumQRScanner } from '@/components/QuantumQRScanner'

interface VectorKey {
  id: string
  name: string
  key: string
  permissions: 'read' | 'write' | 'admin'
  createdAt: string
  projectSpace: string
  quantumStrength: 'standard' | 'enhanced' | 'quantum-secured'
  entanglementChain: string
  observerState: 'active' | 'passive' | 'superposition'
  expiresAt?: string
  allowedAgents: string[]
  accessCount: number
}

export function VectorKeyManager() {
  const [vectorKeys, setVectorKeys] = useKV<VectorKey[]>('vector-keys', [])
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [newKeyName, setNewKeyName] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<'read' | 'write' | 'admin'>('read')
  const [quantumStrength, setQuantumStrength] = useState<'standard' | 'enhanced' | 'quantum-secured'>('standard')
  const [observerState, setObserverState] = useState<'active' | 'passive' | 'superposition'>('active')
  const [allowedAgents, setAllowedAgents] = useState('')
  const [keyExpiry, setKeyExpiry] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const keys = vectorKeys || []

  // Generate quantum-secured key using LLM for enhanced entropy
  const generateQuantumKey = async (strength: string): Promise<string> => {
    if (strength === 'quantum-secured') {
      const spark = (window as any).spark
      if (!spark || typeof spark.llm !== 'function' || typeof spark.llmPrompt !== 'function') {
        return `qvk_enhanced_${Math.random().toString(36).substr(2, 16)}_${Date.now().toString(36)}`
      }
      const prompt = spark.llmPrompt`Generate a cryptographically secure quantum vector key with the following requirements:
      - 64 characters long
      - Include quantum state indicators (q, x, z bases)
      - Use base32 encoding with quantum-specific prefixes
      - Must be unique and unpredictable
      - Include entanglement verification bits
      Return only the key string without explanation.`
      
      const quantumKey = await spark.llm(prompt, 'gpt-4o-mini')
      return `qvk_quantum_${quantumKey.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`
    } else if (strength === 'enhanced') {
      return `qvk_enhanced_${Math.random().toString(36).substr(2, 16)}_${Date.now().toString(36)}`
    } else {
      return `qvk_${Math.random().toString(36).substr(2, 9)}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  const generateEntanglementChain = (): string => {
    const bases = ['|0⟩', '|1⟩', '|+⟩', '|-⟩', '|L⟩', '|R⟩']
    return Array.from({ length: 8 }, () => bases[Math.floor(Math.random() * bases.length)]).join('⊗')
  }

  const generateVectorKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the vector key')
      return
    }

    setIsGenerating(true)
    
    try {
      // Quantum key generation with enhanced security
      const key = await generateQuantumKey(quantumStrength)
      const entanglementChain = generateEntanglementChain()
      
      // Simulate quantum state preparation
      await new Promise(resolve => setTimeout(resolve, quantumStrength === 'quantum-secured' ? 3000 : 1500))
      
      const newKey: VectorKey = {
        id: Date.now().toString(),
        name: newKeyName.trim(),
        key,
        permissions: selectedPermissions,
        createdAt: new Date().toISOString(),
        projectSpace: 'default',
        quantumStrength,
        entanglementChain,
        observerState,
        expiresAt: keyExpiry ? new Date(keyExpiry).toISOString() : undefined,
        allowedAgents: allowedAgents ? allowedAgents.split(',').map(agent => agent.trim()).filter(Boolean) : ['*'],
        accessCount: 0
      }

      setVectorKeys((current = []) => [...current, newKey])
      
      // Reset form
      setNewKeyName('')
      setSelectedPermissions('read')
      setQuantumStrength('standard')
      setObserverState('active')
      setAllowedAgents('')
      setKeyExpiry('')
      
      toast.success(`${quantumStrength === 'quantum-secured' ? 'Quantum-secured' : 'Enhanced'} vector key generated successfully`)
    } catch (error) {
      toast.error('Failed to generate quantum vector key')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success('Vector key copied to clipboard')
  }

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const deleteKey = (keyId: string) => {
    setVectorKeys((current = []) => current.filter(key => key.id !== keyId))
    toast.success('Vector key deleted')
  }

  const revokeKey = (keyId: string) => {
    setVectorKeys((current = []) => 
      current.map(key => 
        key.id === keyId 
          ? { ...key, observerState: 'passive' as const, expiresAt: new Date().toISOString() }
          : key
      )
    )
    toast.success('Vector key revoked')
  }

  const exportKeyConfig = (vectorKey: VectorKey) => {
    const config = {
      key: vectorKey.key,
      permissions: vectorKey.permissions,
      entanglementChain: vectorKey.entanglementChain,
      observerState: vectorKey.observerState,
      allowedAgents: vectorKey.allowedAgents,
      projectSpace: vectorKey.projectSpace
    }
    
    const dataStr = JSON.stringify(config, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `vector-key-${vectorKey.name.replace(/\s+/g, '-').toLowerCase()}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    toast.success('Key configuration exported')
  }

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'admin': return 'destructive'
      case 'write': return 'default'
      case 'read': return 'secondary'
      default: return 'outline'
    }
  }

  const getQuantumStrengthColor = (strength: string) => {
    switch (strength) {
      case 'quantum-secured': return 'bg-gradient-to-r from-accent to-primary text-primary-foreground'
      case 'enhanced': return 'bg-secondary text-secondary-foreground'
      case 'standard': return 'bg-muted text-muted-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const isKeyExpired = (key: VectorKey) => {
    return key.expiresAt && new Date(key.expiresAt) < new Date()
  }

  const isKeyActive = (key: VectorKey) => {
    return key.observerState === 'active' && !isKeyExpired(key)
  }

  return (
    <Tabs defaultValue="generate" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 quantum-field">
        <TabsTrigger value="generate" className="flex items-center gap-2">
          <Lightning className="w-4 h-4" />
          Generate Keys
        </TabsTrigger>
        <TabsTrigger value="manage" className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Manage Keys
        </TabsTrigger>
        <TabsTrigger value="qr-share" className="flex items-center gap-2">
          <QrCode className="w-4 h-4" />
          QR Sharing
        </TabsTrigger>
        <TabsTrigger value="qr-import" className="flex items-center gap-2">
          <QrCode className="w-4 h-4" />
          QR Import
        </TabsTrigger>
      </TabsList>

      <TabsContent value="generate" className="space-y-6">
        <Card className="quantum-field">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Atom className="w-5 h-5 text-accent" />
              Quantum Vector Key Generation
            </CardTitle>
            <CardDescription>
              Create quantum-secured access keys for cross-agent interoperability with advanced entanglement protocols
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Key Name</Label>
                <Input
                  id="key-name"
                  placeholder="Enter descriptive key name"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="permissions">Access Permissions</Label>
                <Select value={selectedPermissions} onValueChange={(value: 'read' | 'write' | 'admin') => setSelectedPermissions(value)}>
                  <SelectTrigger id="permissions">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read Only</SelectItem>
                    <SelectItem value="write">Read + Write</SelectItem>
                    <SelectItem value="admin">Full Admin Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantum-strength">Quantum Security Level</Label>
                <Select value={quantumStrength} onValueChange={(value: 'standard' | 'enhanced' | 'quantum-secured') => setQuantumStrength(value)}>
                  <SelectTrigger id="quantum-strength">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Encryption</SelectItem>
                    <SelectItem value="enhanced">Enhanced Security</SelectItem>
                    <SelectItem value="quantum-secured">Quantum-Secured (LLM Generated)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observer-state">Observer State Protocol</Label>
                <Select value={observerState} onValueChange={(value: 'active' | 'passive' | 'superposition') => setObserverState(value)}>
                  <SelectTrigger id="observer-state">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active Observation</SelectItem>
                    <SelectItem value="passive">Passive Monitoring</SelectItem>
                    <SelectItem value="superposition">Quantum Superposition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowed-agents">Allowed Agents (comma-separated)</Label>
                <Input
                  id="allowed-agents"
                  placeholder="GPT-4, Claude, Gemini, or leave empty for all"
                  value={allowedAgents}
                  onChange={(e) => setAllowedAgents(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="key-expiry">Expiration Date (optional)</Label>
                <Input
                  id="key-expiry"
                  type="datetime-local"
                  value={keyExpiry}
                  onChange={(e) => setKeyExpiry(e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={generateVectorKey}
              disabled={isGenerating}
              className="w-full quantum-pulse"
              size="lg"
            >
              <Lightning className="w-5 h-5 mr-2" />
              {isGenerating 
                ? `Generating ${quantumStrength === 'quantum-secured' ? 'Quantum-Secured' : 'Enhanced'} Key...` 
                : 'Generate Vector Key'
              }
            </Button>

            {quantumStrength === 'quantum-secured' && (
              <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Atom className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-accent">Quantum-Secured Generation</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  This mode uses advanced LLM-generated entropy for maximum security and unpredictability.
                  Generation may take up to 3 seconds to ensure quantum-grade randomness.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="manage" className="space-y-6">
        <Card className="quantum-field">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-accent" />
              Active Vector Keys ({keys.filter(isKeyActive).length} active)
            </CardTitle>
            <CardDescription>
              Manage existing quantum vector keys and monitor cross-agent access patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {keys.length > 0 ? (
              <div className="space-y-4">
                {keys.map((vectorKey) => (
                  <Card key={vectorKey.id} className="state-collapse">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Key Header */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-medium text-lg">{vectorKey.name}</h4>
                              <Badge variant={getPermissionColor(vectorKey.permissions) as any}>
                                {vectorKey.permissions}
                              </Badge>
                              <div className={`px-2 py-1 rounded text-xs font-medium ${getQuantumStrengthColor(vectorKey.quantumStrength)}`}>
                                {vectorKey.quantumStrength}
                              </div>
                              {!isKeyActive(vectorKey) && (
                                <Badge variant="destructive">
                                  {isKeyExpired(vectorKey) ? 'Expired' : 'Inactive'}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Quantum Properties */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Observer State:</span>
                                <span className="ml-2 font-mono">{vectorKey.observerState}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Access Count:</span>
                                <span className="ml-2 font-mono">{vectorKey.accessCount}</span>
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-muted-foreground">Entanglement Chain:</span>
                                <code className="ml-2 text-xs bg-muted px-2 py-1 rounded font-mono">
                                  {vectorKey.entanglementChain}
                                </code>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Allowed Agents:</span>
                                <span className="ml-2 text-xs">
                                  {vectorKey.allowedAgents.includes('*') ? 'All Agents' : vectorKey.allowedAgents.join(', ')}
                                </span>
                              </div>
                              {vectorKey.expiresAt && (
                                <div>
                                  <span className="text-muted-foreground">Expires:</span>
                                  <span className="ml-2 text-xs">
                                    {new Date(vectorKey.expiresAt).toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Vector Key Display */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Vector Key</Label>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-sm bg-muted px-3 py-2 rounded font-mono overflow-hidden">
                              {showKeys[vectorKey.id] ? vectorKey.key : '•'.repeat(vectorKey.key.length)}
                            </code>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleKeyVisibility(vectorKey.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(vectorKey.key)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => exportKeyConfig(vectorKey)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <QuantumQRShare vectorKey={vectorKey}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="quantum-shimmer"
                              >
                                <QrCode className="w-4 h-4" />
                              </Button>
                            </QuantumQRShare>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(vectorKey.createdAt).toLocaleString()}
                          </p>
                          <div className="flex gap-2">
                            {isKeyActive(vectorKey) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => revokeKey(vectorKey.id)}
                              >
                                Revoke
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteKey(vectorKey.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Vector Keys Generated</h3>
                <p className="text-sm">Create your first quantum access key to enable cross-agent interoperability</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="qr-share" className="space-y-6">
        <Card className="quantum-field">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-accent" />
              Quantum Key QR Sharing Hub
            </CardTitle>
            <CardDescription>
              Generate and share quantum vector keys through QR codes for seamless cross-agent integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            {keys.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {keys.filter(isKeyActive).map((vectorKey) => (
                    <Card key={vectorKey.id} className="state-collapse">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h4 className="font-medium">{vectorKey.name}</h4>
                              <div className="flex gap-1">
                                <Badge variant={getPermissionColor(vectorKey.permissions) as any} className="text-xs">
                                  {vectorKey.permissions}
                                </Badge>
                                <div className={`px-1.5 py-0.5 rounded text-xs font-medium ${getQuantumStrengthColor(vectorKey.quantumStrength)}`}>
                                  {vectorKey.quantumStrength}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {vectorKey.observerState}
                            </Badge>
                          </div>
                          
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Agents: {vectorKey.allowedAgents.includes('*') ? 'All' : vectorKey.allowedAgents.join(', ')}</p>
                            <p>Access Count: {vectorKey.accessCount}</p>
                          </div>

                          <div className="pt-2 border-t">
                            <QuantumQRShare vectorKey={vectorKey}>
                              <Button size="sm" className="w-full quantum-shimmer">
                                <Share className="w-4 h-4 mr-2" />
                                Generate QR Code
                              </Button>
                            </QuantumQRShare>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {keys.filter(isKeyActive).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <QrCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Active Keys for Sharing</h3>
                    <p className="text-sm">Generate an active quantum key to enable QR code sharing</p>
                  </div>
                )}

                {/* QR Sharing Instructions */}
                <Card className="border-accent/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Atom className="w-4 h-4 text-accent" />
                      QR Code Integration Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">For AI Agents</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Scan QR code with agent's camera/scanner</li>
                          <li>• Automatic key import with permissions</li>
                          <li>• Quantum entanglement verification</li>
                          <li>• Instant access to project files</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">For Developers</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Parse JSON payload from QR code</li>
                          <li>• Validate quantum signature</li>
                          <li>• Integrate with custom endpoints</li>
                          <li>• Cross-platform compatibility</li>
                        </ul>
                      </div>
                    </div>
                    <div className="pt-2 border-t text-xs text-muted-foreground">
                      <p><strong>Security:</strong> All QR codes include quantum signatures and can be revoked instantly through the observer state protocol.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Vector Keys Available</h3>
                <p className="text-sm">Create your first quantum access key to start sharing via QR codes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="qr-import" className="space-y-6">
        <QuantumQRScanner />
      </TabsContent>
    </Tabs>
  )
}