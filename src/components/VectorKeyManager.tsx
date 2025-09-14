import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Key, Eye, Lightning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface VectorKey {
  id: string
  name: string
  key: string
  permissions: 'read' | 'write' | 'admin'
  createdAt: string
  projectSpace: string
}

export function VectorKeyManager() {
  const [vectorKeys, setVectorKeys] = useKV<VectorKey[]>('vector-keys', [])
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [newKeyName, setNewKeyName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const keys = vectorKeys || []

  const generateVectorKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the vector key')
      return
    }

    setIsGenerating(true)
    
    // Simulate quantum key generation
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const newKey: VectorKey = {
      id: Date.now().toString(),
      name: newKeyName.trim(),
      key: `qvk_${Math.random().toString(36).substr(2, 9)}_${Math.random().toString(36).substr(2, 9)}`,
      permissions: 'read',
      createdAt: new Date().toISOString(),
      projectSpace: 'default'
    }

    setVectorKeys((current = []) => [...current, newKey])
    setNewKeyName('')
    setIsGenerating(false)
    
    toast.success('Quantum vector key generated successfully')
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

  return (
    <Card className="quantum-field">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5 text-accent" />
          Vector Key Management
        </CardTitle>
        <CardDescription>
          Generate and manage symbolic keys for cross-agent access and quantum interoperability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Generation */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key-name">Key Name</Label>
            <Input
              id="key-name"
              placeholder="Enter key name (e.g., 'Project Alpha Access')"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="font-mono"
            />
          </div>
          <Button 
            onClick={generateVectorKey}
            disabled={isGenerating}
            className="w-full quantum-pulse"
          >
            <Lightning className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating Quantum Key...' : 'Generate Vector Key'}
          </Button>
        </div>

        {/* Existing Keys */}
        {keys.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Active Vector Keys</h3>
            <div className="space-y-3">
              {keys.map((vectorKey) => (
                <Card key={vectorKey.id} className="state-collapse">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{vectorKey.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {vectorKey.permissions}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                            {showKeys[vectorKey.id] ? vectorKey.key : '••••••••••••••••••••'}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleKeyVisibility(vectorKey.id)}
                          >
                            {showKeys[vectorKey.id] ? 
                              <Eye className="w-4 h-4" /> : 
                              <Eye className="w-4 h-4" />
                            }
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(vectorKey.key)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(vectorKey.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteKey(vectorKey.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {keys.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No vector keys generated yet</p>
            <p className="text-sm">Create your first quantum access key above</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}