import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, Archive, Image, Code, Cube } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { QuantumField } from './QuantumField'

interface QuantumFile {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: string
  quantumState: 'superposition' | 'collapsed' | 'entangled'
  vectorChain: string
  projectSpace: string
  parsedStructure?: any
  metadata?: {
    checksum: string
    tags: string[]
    description: string
    accessedBy: string[]
    lastAccessed: string
    compressionRatio?: number
    extractedFiles?: string[]
    aiAnalyzed?: boolean
    relatedFiles?: string[]
  }
}

export function QuantumUploader() {
  const [files, setFiles] = useKV<QuantumFile[]>('quantum-files', [])
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const safeFiles = files || []

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />
    if (type.includes('zip') || type.includes('archive')) return <Archive className="w-5 h-5" />
    if (type.includes('javascript') || type.includes('typescript') || type.includes('json')) return <Code className="w-5 h-5" />
    return <FileText className="w-5 h-5" />
  }

  const getQuantumStateColor = (state: string) => {
    switch (state) {
      case 'superposition': return 'bg-secondary'
      case 'collapsed': return 'bg-primary'
      case 'entangled': return 'bg-accent'
      default: return 'bg-muted'
    }
  }

  const simulateQuantumParsing = async (file: File): Promise<QuantumFile> => {
    // Simulate quantum parsing process
    const steps = ['Initializing quantum state', 'Analyzing file structure', 'Creating vector chains', 'Collapsing into database']
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setUploadProgress((i + 1) * 25)
    }

    const quantumFile: QuantumFile = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      quantumState: Math.random() > 0.5 ? 'collapsed' : 'superposition',
      vectorChain: `vc_${Math.random().toString(36).substr(2, 8)}`,
      projectSpace: 'default',
      parsedStructure: {
        complexity: Math.floor(Math.random() * 100),
        quantumSignature: Math.random().toString(36).substr(2, 16),
        entanglements: Math.floor(Math.random() * 5)
      },
      metadata: {
        checksum: `sha256_${Math.random().toString(36).substr(2, 16)}`,
        tags: [file.type.split('/')[0]],
        description: `Quantum processed ${file.type} file`,
        accessedBy: [],
        lastAccessed: new Date().toISOString(),
        aiAnalyzed: Math.random() > 0.5,
        relatedFiles: []
      }
    }

    return quantumFile
  }

  const handleFiles = async (fileList: FileList) => {
    if (fileList.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const newFiles: QuantumFile[] = []
      
      for (const file of Array.from(fileList)) {
        const quantumFile = await simulateQuantumParsing(file)
        newFiles.push(quantumFile)
      }

      setFiles((current = []) => [...current, ...newFiles])
      toast.success(`${newFiles.length} file(s) quantum processed successfully`)
    } catch (error) {
      toast.error('Quantum processing failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const collapseState = (fileId: string) => {
    setFiles((current = []) => 
      current.map(file => 
        file.id === fileId 
          ? { ...file, quantumState: 'collapsed' as const }
          : file
      )
    )
    toast.success('Quantum state collapsed to stable configuration')
  }

  const deleteFile = (fileId: string) => {
    setFiles((current = []) => current.filter(file => file.id !== fileId))
    toast.success('File removed from quantum database')
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <QuantumField>
        <Card className={`border-2 border-dashed transition-all duration-300 ${
          dragActive ? 'border-accent bg-accent/5' : 'border-border'
        }`}>
          <CardContent className="p-8">
            <div
              className="text-center space-y-4"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex justify-center">
                <Upload className={`w-12 h-12 transition-colors ${
                  dragActive ? 'text-accent' : 'text-muted-foreground'
                } quantum-pulse`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Quantum File Upload</h3>
                <p className="text-muted-foreground mb-4">
                  Drop files here or click to browse. Files will be quantum processed and organized.
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                  accept="*/*"
                />
                <Button asChild className="quantum-shimmer">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Cube className="w-4 h-4 mr-2" />
                    Select Files
                  </label>
                </Button>
              </div>
            </div>

            {uploading && (
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Quantum Processing...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="quantum-pulse" />
              </div>
            )}
          </CardContent>
        </Card>
      </QuantumField>

      {/* File List */}
      {safeFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quantum Database</CardTitle>
            <CardDescription>
              Files processed and organized in quantum superposition states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {safeFiles.map((file) => (
                <Card key={file.id} className="state-collapse">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-muted-foreground mt-1">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{file.name}</h4>
                            <Badge className={getQuantumStateColor(file.quantumState)}>
                              {file.quantumState}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB • {file.type}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Vector: {file.vectorChain}</span>
                            <span>Complexity: {file.parsedStructure?.complexity || 0}</span>
                            <span>Entanglements: {file.parsedStructure?.entanglements || 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {file.quantumState !== 'collapsed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => collapseState(file.id)}
                          >
                            Collapse
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteFile(file.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {safeFiles.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Cube className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No files in quantum database yet</p>
            <p className="text-sm text-muted-foreground">Upload files to begin quantum processing</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}