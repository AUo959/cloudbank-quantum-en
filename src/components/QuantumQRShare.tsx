import React, { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { QrCode, Download, Copy, Share, Atom, Network, Key } from '@phosphor-icons/react'
import { toast } from 'sonner'

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

interface QuantumQRShareProps {
  vectorKey: VectorKey
  children: React.ReactNode
}

export function QuantumQRShare({ vectorKey, children }: QuantumQRShareProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [qrSize, setQrSize] = useState(256)
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [customEndpoint, setCustomEndpoint] = useState('https://cloudbank.quantum/api/connect')
  const [shareableLink, setShareableLink] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Generate QR code when dialog opens
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      generateQRCode()
    }
  }, [isOpen, qrSize, includeMetadata, customEndpoint])

  const generateQRCode = async () => {
    if (!canvasRef.current) return
    
    setIsGenerating(true)
    
    try {
      // Create quantum key sharing payload
      const qrPayload = {
        type: 'cloudbank-quantum-key',
        version: '1.0',
        key: vectorKey.key,
        permissions: vectorKey.permissions,
        metadata: includeMetadata ? {
          name: vectorKey.name,
          quantumStrength: vectorKey.quantumStrength,
          entanglementChain: vectorKey.entanglementChain,
          observerState: vectorKey.observerState,
          allowedAgents: vectorKey.allowedAgents,
          projectSpace: vectorKey.projectSpace,
          expiresAt: vectorKey.expiresAt
        } : undefined,
        endpoint: customEndpoint,
        timestamp: new Date().toISOString(),
        quantumSignature: await generateQuantumSignature(vectorKey.key)
      }

      const qrData = JSON.stringify(qrPayload)
      const shareableUrl = `${customEndpoint}?key=${encodeURIComponent(vectorKey.key)}&name=${encodeURIComponent(vectorKey.name)}`
      setShareableLink(shareableUrl)

      await QRCode.toCanvas(canvasRef.current, qrData, {
        width: qrSize,
        margin: 2,
        color: {
          dark: '#0a0b1e',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      })
    } catch (error) {
      toast.error('Failed to generate QR code')
      console.error('QR generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateQuantumSignature = async (key: string): Promise<string> => {
    // Simple quantum-inspired signature using key entropy
    const encoder = new TextEncoder()
    const data = encoder.encode(key + vectorKey.entanglementChain + new Date().toISOString())
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
  }

  const downloadQRCode = () => {
    if (!canvasRef.current) return

    const link = document.createElement('a')
    link.download = `quantum-key-${vectorKey.name.replace(/\s+/g, '-').toLowerCase()}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
    
    toast.success('QR code downloaded')
  }

  const copyShareableLink = () => {
    navigator.clipboard.writeText(shareableLink)
    toast.success('Shareable link copied to clipboard')
  }

  const copyQRData = async () => {
    if (!canvasRef.current) return
    
    try {
      // Convert canvas to blob and copy to clipboard
      canvasRef.current.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
          toast.success('QR code copied to clipboard')
        }
      })
    } catch (error) {
      toast.error('Failed to copy QR code to clipboard')
    }
  }

  const getQuantumStrengthIcon = (strength: string) => {
    switch (strength) {
      case 'quantum-secured':
        return <Atom className="w-4 h-4 text-accent quantum-pulse" />
      case 'enhanced':
        return <Network className="w-4 h-4 text-primary" />
      default:
        return <Key className="w-4 h-4 text-secondary" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl quantum-field">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-accent" />
            Quantum Key QR Sharing
          </DialogTitle>
          <DialogDescription>
            Generate a quantum-secured QR code for seamless agent integration and cross-platform key sharing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {getQuantumStrengthIcon(vectorKey.quantumStrength)}
                {vectorKey.name}
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">{vectorKey.permissions}</Badge>
                <Badge variant="secondary">{vectorKey.quantumStrength}</Badge>
                <Badge variant="outline">{vectorKey.observerState}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Entanglement:</span> <code className="text-xs">{vectorKey.entanglementChain}</code></p>
                <p><span className="text-muted-foreground">Agents:</span> {vectorKey.allowedAgents.includes('*') ? 'All Agents' : vectorKey.allowedAgents.join(', ')}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR Code Display */}
            <div className="space-y-4">
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <canvas
                    ref={canvasRef}
                    className="border border-border rounded-lg quantum-field"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                  {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                      <Atom className="w-8 h-8 text-accent quantum-pulse" />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 justify-center">
                  <Button size="sm" variant="outline" onClick={downloadQRCode} disabled={isGenerating}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" onClick={copyQRData} disabled={isGenerating}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>

            {/* Configuration Options */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-size">QR Code Size</Label>
                <Input
                  id="qr-size"
                  type="number"
                  value={qrSize}
                  onChange={(e) => setQrSize(parseInt(e.target.value) || 256)}
                  min="128"
                  max="512"
                  step="32"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endpoint">Integration Endpoint</Label>
                <Input
                  id="endpoint"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  placeholder="https://your-agent.com/api/quantum-connect"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include-metadata"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="include-metadata" className="text-sm">
                  Include quantum metadata in QR code
                </Label>
              </div>

              {/* Shareable Link */}
              <div className="space-y-2">
                <Label>Shareable Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareableLink}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button size="sm" variant="outline" onClick={copyShareableLink}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Usage Instructions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Integration Instructions</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <p><strong>For AI Agents:</strong> Scan the QR code to automatically import the quantum vector key with all metadata and permissions.</p>
                  <p><strong>For Developers:</strong> Use the shareable link or parse the QR JSON payload to integrate with your application.</p>
                  <p><strong>Security:</strong> QR codes include quantum signatures for verification and tamper detection.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}