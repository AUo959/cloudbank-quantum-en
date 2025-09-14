import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  File, 
  Folder, 
  Image, 
  FileText, 
  FileCode, 
  FileVideo, 
  FileAudio,
  Archive,
  MagnifyingGlass,
  GridFour,
  List,
  Eye,
  Download,
  Share
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  mimeType?: string
  size: number
  dateModified: string
  path: string
  content?: string
  preview?: string
  metadata?: any
  quantumSignature?: string
  vectorKey?: string
}

export function VisualFileBrowser() {
  const [files, setFiles] = useKV<FileItem[]>('cloudbank-files', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [currentPath, setCurrentPath] = useState('/')

  // Sample data for demonstration
  useEffect(() => {
    if (!files || files.length === 0) {
      const sampleFiles: FileItem[] = [
        {
          id: '1',
          name: 'Research Documents',
          type: 'folder',
          size: 0,
          dateModified: '2024-01-15',
          path: '/research',
          quantumSignature: 'QS-R001'
        },
        {
          id: '2',
          name: 'quantum-analysis.pdf',
          type: 'file',
          mimeType: 'application/pdf',
          size: 2048576,
          dateModified: '2024-01-14',
          path: '/research/quantum-analysis.pdf',
          preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRPQ1VNRU5UPC90ZXh0Pjwvc3ZnPg==',
          metadata: { pages: 25, author: 'Dr. Quantum' },
          quantumSignature: 'QS-D001',
          vectorKey: 'VK-QA-789'
        },
        {
          id: '3',
          name: 'entanglement-data.json',
          type: 'file',
          mimeType: 'application/json',
          size: 524288,
          dateModified: '2024-01-13',
          path: '/research/entanglement-data.json',
          content: '{"quantum_states": [{"id": 1, "entangled": true}]}',
          metadata: { records: 150, format: 'JSON' },
          quantumSignature: 'QS-E001',
          vectorKey: 'VK-ED-456'
        },
        {
          id: '4',
          name: 'visualization.mp4',
          type: 'file',
          mimeType: 'video/mp4',
          size: 10485760,
          dateModified: '2024-01-12',
          path: '/media/visualization.mp4',
          preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwMDAwIi8+PHBvbHlnb24gcG9pbnRzPSI3NSw3NSAxMjUsNTAgMTI1LDEwMCIgZmlsbD0iI2ZmZmZmZiIvPjwvc3ZnPg==',
          metadata: { duration: '2:34', resolution: '1920x1080' },
          quantumSignature: 'QS-V001'
        },
        {
          id: '5',
          name: 'agent-config.yaml',
          type: 'file',
          mimeType: 'text/yaml',
          size: 4096,
          dateModified: '2024-01-11',
          path: '/config/agent-config.yaml',
          content: 'agents:\n  - name: quantum-processor\n    type: analysis',
          metadata: { syntax: 'YAML', lines: 23 },
          quantumSignature: 'QS-C001',
          vectorKey: 'VK-AC-123'
        }
      ]
      setFiles(sampleFiles)
    }
  }, [files, setFiles])

  const filteredFiles = (files || []).filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.metadata?.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.vectorKey?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') return <Folder className="w-8 h-8 text-primary" />
    
    if (file.mimeType?.startsWith('image/')) return <Image className="w-8 h-8 text-green-500" />
    if (file.mimeType?.startsWith('video/')) return <FileVideo className="w-8 h-8 text-blue-500" />
    if (file.mimeType?.startsWith('audio/')) return <FileAudio className="w-8 h-8 text-purple-500" />
    if (file.mimeType?.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />
    if (file.mimeType?.includes('json') || file.mimeType?.includes('yaml')) return <FileCode className="w-8 h-8 text-yellow-500" />
    if (file.mimeType?.includes('zip') || file.mimeType?.includes('archive')) return <Archive className="w-8 h-8 text-gray-500" />
    
    return <File className="w-8 h-8 text-muted-foreground" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const FilePreview = ({ file }: { file: FileItem }) => {
    if (file.preview) {
      return (
        <div className="w-full h-32 rounded-lg overflow-hidden bg-muted/20 border">
          <img 
            src={file.preview} 
            alt={file.name}
            className="w-full h-full object-cover"
          />
        </div>
      )
    }

    if (file.content) {
      return (
        <div className="w-full h-32 rounded-lg overflow-hidden bg-muted/20 border p-3">
          <pre className="text-xs text-muted-foreground overflow-hidden">
            {file.content.substring(0, 200)}...
          </pre>
        </div>
      )
    }

    return (
      <div className="w-full h-32 rounded-lg bg-muted/20 border flex items-center justify-center">
        {getFileIcon(file)}
      </div>
    )
  }

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredFiles.map(file => (
        <Card 
          key={file.id} 
          className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 quantum-field ${
            selectedFile?.id === file.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedFile(file)}
        >
          <CardContent className="p-4 space-y-3">
            <FilePreview file={file} />
            
            <div className="space-y-2">
              <h4 className="font-medium truncate" title={file.name}>
                {file.name}
              </h4>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatFileSize(file.size)}</span>
                <span>{file.dateModified}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {file.quantumSignature && (
                  <Badge variant="outline" className="text-xs">
                    {file.quantumSignature}
                  </Badge>
                )}
                {file.vectorKey && (
                  <Badge variant="secondary" className="text-xs">
                    {file.vectorKey}
                  </Badge>
                )}
              </div>

              {file.metadata && (
                <div className="text-xs text-muted-foreground space-y-1">
                  {Object.entries(file.metadata).slice(0, 2).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const ListView = () => (
    <div className="space-y-2">
      {filteredFiles.map(file => (
        <Card 
          key={file.id}
          className={`cursor-pointer transition-all hover:bg-muted/10 ${
            selectedFile?.id === file.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedFile(file)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {getFileIcon(file)}
              </div>
              
              <div className="flex-grow min-w-0">
                <h4 className="font-medium truncate">{file.name}</h4>
                <p className="text-sm text-muted-foreground truncate">{file.path}</p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{formatFileSize(file.size)}</span>
                <span>{file.dateModified}</span>
                
                <div className="flex gap-1">
                  {file.quantumSignature && (
                    <Badge variant="outline" className="text-xs">
                      {file.quantumSignature}
                    </Badge>
                  )}
                  {file.vectorKey && (
                    <Badge variant="secondary" className="text-xs">
                      VK
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <Card className="quantum-field">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            Visual File Browser
          </CardTitle>
          <CardDescription>
            Advanced file visualization with quantum signatures and vector key integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Controls */}
          <div className="flex items-center gap-4">
            <div className="relative flex-grow">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search files, metadata, vector keys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <GridFour className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* File Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-primary">
                {filteredFiles.length}
              </p>
              <p className="text-xs text-muted-foreground">Total Files</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-accent">
                {filteredFiles.filter(f => f.vectorKey).length}
              </p>
              <p className="text-xs text-muted-foreground">Vector Keys</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-secondary">
                {filteredFiles.filter(f => f.quantumSignature).length}
              </p>
              <p className="text-xs text-muted-foreground">Quantum Signatures</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-ring">
                {formatFileSize(filteredFiles.reduce((acc, f) => acc + f.size, 0))}
              </p>
              <p className="text-xs text-muted-foreground">Total Size</p>
            </div>
          </div>

          {/* File Grid/List */}
          <ScrollArea className="h-96">
            {viewMode === 'grid' ? <GridView /> : <ListView />}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* File Details Panel */}
      {selectedFile && (
        <Card className="quantum-field">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getFileIcon(selectedFile)}
              {selectedFile.name}
            </CardTitle>
            <CardDescription>File details and quantum metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File Preview */}
              <div className="space-y-4">
                <h4 className="font-semibold">Preview</h4>
                <FilePreview file={selectedFile} />
                
                <div className="flex gap-2">
                  <Button size="sm" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Share className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </div>

              {/* File Metadata */}
              <div className="space-y-4">
                <h4 className="font-semibold">Properties</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{selectedFile.name}</span>
                    
                    <span className="text-muted-foreground">Type:</span>
                    <span>{selectedFile.mimeType || selectedFile.type}</span>
                    
                    <span className="text-muted-foreground">Size:</span>
                    <span>{formatFileSize(selectedFile.size)}</span>
                    
                    <span className="text-muted-foreground">Modified:</span>
                    <span>{selectedFile.dateModified}</span>
                    
                    <span className="text-muted-foreground">Path:</span>
                    <span className="truncate">{selectedFile.path}</span>
                  </div>

                  {selectedFile.quantumSignature && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Quantum Properties</h5>
                      <Badge variant="outline" className="quantum-shimmer">
                        {selectedFile.quantumSignature}
                      </Badge>
                    </div>
                  )}

                  {selectedFile.vectorKey && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Vector Key</h5>
                      <Badge variant="secondary">
                        {selectedFile.vectorKey}
                      </Badge>
                    </div>
                  )}

                  {selectedFile.metadata && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Metadata</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(selectedFile.metadata).map(([key, value]) => (
                          <React.Fragment key={key}>
                            <span className="text-muted-foreground capitalize">{key}:</span>
                            <span>{String(value)}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}