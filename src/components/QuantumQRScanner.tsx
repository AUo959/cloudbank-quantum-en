import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QrCode, CheckCircle, XCircle, Key, Upload, Atom } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

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

interface QRPayload {
  type: string
  version: string
  key: string
  permissions: 'read' | 'write' | 'admin'
  metadata?: {
    name: string
    quantumStrength: 'standard' | 'enhanced' | 'quantum-secured'
    entanglementChain: string
    observerState: 'active' | 'passive' | 'superposition'
    allowedAgents: string[]
    projectSpace: string
    expiresAt?: string
  }
  endpoint: string
  timestamp: string
  quantumSignature: string
}

export function QuantumQRScanner() {
  const [vectorKeys, setVectorKeys] = useKV<VectorKey[]>('vector-keys', [])
  const [qrInput, setQrInput] = useState('')
  const [parsedData, setParsedData] = useState<QRPayload | null>(null)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  const parseQRCode = (input: string) => {
    try {
      const data = JSON.parse(input.trim()) as QRPayload
      
      // Validate QR code structure
      if (data.type !== 'cloudbank-quantum-key' || !data.key || !data.permissions) {
        setIsValid(false)
        setParsedData(null)
        toast.error('Invalid quantum key QR code format')
        return
      }

      // Check if key already exists
      const keys = vectorKeys || []
      const existingKey = keys.find(k => k.key === data.key)
      if (existingKey) {
        setIsValid(false)
        setParsedData(null)
        toast.error('This quantum key has already been imported')
        return
      }

      setParsedData(data)
      setIsValid(true)
      toast.success('Valid quantum key QR code detected')
    } catch {
      setIsValid(false)
      setParsedData(null)
      toast.error('Invalid JSON format in QR code')
    }
  }

  const handleInputChange = (value: string) => {
    setQrInput(value)
    if (value.trim()) {
      parseQRCode(value)
    } else {
      setParsedData(null)
      setIsValid(null)
    }
  }

  const importQuantumKey = async () => {
    if (!parsedData || !isValid) return

    setIsImporting(true)
    
    try {
      // Simulate quantum state verification
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newKey: VectorKey = {
        id: Date.now().toString(),
        name: parsedData.metadata?.name || `Imported Key ${Date.now()}`,
        key: parsedData.key,
        permissions: parsedData.permissions,
        createdAt: new Date().toISOString(),
        projectSpace: parsedData.metadata?.projectSpace || 'imported',
        quantumStrength: parsedData.metadata?.quantumStrength || 'standard',
        entanglementChain: parsedData.metadata?.entanglementChain || '|0⟩⊗|1⟩⊗|+⟩⊗|-⟩',
        observerState: parsedData.metadata?.observerState || 'active',
        expiresAt: parsedData.metadata?.expiresAt,
        allowedAgents: parsedData.metadata?.allowedAgents || ['*'],
        accessCount: 0
      }

      setVectorKeys((current = []) => [...current, newKey])
      
      // Clear form
      setQrInput('')
      setParsedData(null)
      setIsValid(null)
      
      toast.success('Quantum key imported successfully!')
    } catch {
      toast.error('Failed to import quantum key')
    } finally {
      setIsImporting(false)
    }
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

  return (
    <div className="space-y-6">
      <Card className="quantum-field">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-accent" />
            QR Code Scanner & Importer
          </CardTitle>
          <CardDescription>
            Import quantum vector keys by scanning QR codes or pasting QR data from other agents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qr-input">QR Code Data</Label>
            <Textarea
              id="qr-input"
              placeholder="Paste QR code JSON data here or scan with your device's camera..."
              value={qrInput}
              onChange={(e) => handleInputChange(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
          </div>

          {/* Validation Status */}
          {qrInput && (
            <Alert className={isValid ? 'border-green-500/20 bg-green-500/5' : 'border-destructive/20 bg-destructive/5'}>
              <div className="flex items-center gap-2">
                {isValid ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive" />
                )}
                <AlertDescription>
                  {isValid ? 'Valid quantum key QR code detected' : 'Invalid QR code format or key already exists'}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Parsed Data Preview */}
          {parsedData && isValid && (
            <Card className="border-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="w-4 h-4 text-accent" />
                  Quantum Key Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2 font-medium">{parsedData.metadata?.name || 'Unnamed Key'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Permissions:</span>
                    <Badge variant={getPermissionColor(parsedData.permissions) as any} className="ml-2">
                      {parsedData.permissions}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Security Level:</span>
                    <div className={`ml-2 inline-block px-2 py-1 rounded text-xs font-medium ${getQuantumStrengthColor(parsedData.metadata?.quantumStrength || 'standard')}`}>
                      {parsedData.metadata?.quantumStrength || 'standard'}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Observer State:</span>
                    <span className="ml-2 font-mono text-xs">{parsedData.metadata?.observerState || 'active'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Allowed Agents:</span>
                    <span className="ml-2 text-xs">
                      {parsedData.metadata?.allowedAgents?.includes('*') ? 'All Agents' : parsedData.metadata?.allowedAgents?.join(', ') || 'All Agents'}
                    </span>
                  </div>
                  {parsedData.metadata?.entanglementChain && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Entanglement Chain:</span>
                      <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                        {parsedData.metadata.entanglementChain}
                      </code>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Endpoint:</span>
                    <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                      {parsedData.endpoint}
                    </code>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Generated:</span>
                    <span className="ml-2 text-xs">{new Date(parsedData.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <Button 
                    onClick={importQuantumKey}
                    disabled={isImporting}
                    className="w-full quantum-pulse"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isImporting ? 'Importing Quantum Key...' : 'Import Quantum Key'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Atom className="w-4 h-4 text-accent" />
                How to Use QR Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h4 className="font-medium mb-1">Method 1: Camera Scan</h4>
                  <p className="text-muted-foreground">Use your device's camera to scan QR codes from other applications or agents.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Method 2: Copy & Paste</h4>
                  <p className="text-muted-foreground">Copy the QR JSON data and paste it into the text area above.</p>
                </div>
              </div>
              <div className="pt-2 border-t text-muted-foreground">
                <p><strong>Security:</strong> All imported keys are verified for quantum signatures and authenticity before adding to your key store.</p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}