import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { Database, MagnifyingGlass, Eye, Download, Trash, FileText, Archive, Image, Code, Activity, ChartBar, CloudArrowUp, Network, Key, Lock, Atom, ArrowClockwise } from '@phosphor-icons/react'
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
  }
}

interface DatabaseQuery {
  id: string
  query: string
  filters: {
    fileType?: string
    quantumState?: string
    projectSpace?: string
    dateRange?: { start: string; end: string }
    sizeRange?: { min: number; max: number }
    tags?: string[]
  }
  results: QuantumFile[]
  executedAt: string
  executionTime: number
}

interface DatabaseAnalytics {
  totalFiles: number
  totalSize: number
  quantumStateDistribution: Record<string, number>
  fileTypeDistribution: Record<string, number>
  projectSpaceDistribution: Record<string, number>
  recentActivity: Array<{
    action: string
    fileName: string
    timestamp: string
    vectorChain: string
  }>
}

export function QuantumDatabase(
  { onOpenInBrowser, onDelete, onBulkDelete }: { onOpenInBrowser?: (id: string) => void; onDelete?: (id: string) => void; onBulkDelete?: (ids: string[]) => void } = {}
) {
  const [files] = useKV<QuantumFile[]>('quantum-files', [])
  const [queries, setQueries] = useKV<DatabaseQuery[]>('database-queries', [])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedState, setSelectedState] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedSpace, setSelectedSpace] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('uploadedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [analytics, setAnalytics] = useState<DatabaseAnalytics | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [advancedQuery, setAdvancedQuery] = useState('')
  const [activeTab, setActiveTab] = useState('browser')

  const safeFiles = files || []
  const safeQueries = queries || []
  const handleBulkDelete = () => {
    if (selectedFiles.length === 0) return
    if (onBulkDelete) onBulkDelete(selectedFiles)
    else if (onDelete) selectedFiles.forEach(id => onDelete(id))
    setSelectedFiles([])
  }


  // Generate real-time analytics
  useEffect(() => {
    const generateAnalytics = () => {
      if (safeFiles.length === 0) {
        setAnalytics(null)
        return
      }

      const totalSize = safeFiles.reduce((sum, file) => sum + file.size, 0)
      
      const quantumStateDistribution = safeFiles.reduce((acc, file) => {
        acc[file.quantumState] = (acc[file.quantumState] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const fileTypeDistribution = safeFiles.reduce((acc, file) => {
        const category = getFileCategory(file.type)
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const projectSpaceDistribution = safeFiles.reduce((acc, file) => {
        acc[file.projectSpace] = (acc[file.projectSpace] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const recentActivity = safeFiles
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
        .slice(0, 10)
        .map(file => ({
          action: 'uploaded',
          fileName: file.name,
          timestamp: file.uploadedAt,
          vectorChain: file.vectorChain
        }))

      setAnalytics({
        totalFiles: safeFiles.length,
        totalSize,
        quantumStateDistribution,
        fileTypeDistribution,
        projectSpaceDistribution,
        recentActivity
      })
    }

    generateAnalytics()
  }, [safeFiles])

  const getFileCategory = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'Images'
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'Archives'
    if (mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('json')) return 'Code'
    if (mimeType.includes('text') || mimeType.includes('document')) return 'Documents'
    return 'Other'
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />
    if (type.includes('zip') || type.includes('archive')) return <Archive className="w-4 h-4" />
    if (type.includes('javascript') || type.includes('typescript') || type.includes('json')) return <Code className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const getQuantumStateColor = (state: string) => {
    switch (state) {
      case 'superposition': return 'bg-secondary text-secondary-foreground'
      case 'collapsed': return 'bg-primary text-primary-foreground'
      case 'entangled': return 'bg-accent text-accent-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  // Advanced filtering and search
  const filteredFiles = safeFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.vectorChain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ?? false)
    
    const matchesState = selectedState === 'all' || file.quantumState === selectedState
    const matchesType = selectedType === 'all' || getFileCategory(file.type) === selectedType
    const matchesSpace = selectedSpace === 'all' || file.projectSpace === selectedSpace

    return matchesSearch && matchesState && matchesType && matchesSpace
  })

  // Sort files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let aValue: any = a[sortBy as keyof QuantumFile]
    let bValue: any = b[sortBy as keyof QuantumFile]

    if (sortBy === 'uploadedAt') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }

    if (typeof aValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
  })

  // Pagination
  const totalPages = Math.ceil(sortedFiles.length / pageSize)
  const paginatedFiles = sortedFiles.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const executeAdvancedQuery = async () => {
    if (!advancedQuery.trim()) {
      toast.error('Please enter a query')
      return
    }

    setIsAnalyzing(true)
    const startTime = Date.now()

    try {
      const spark = (window as any).spark
      if (!spark || typeof spark.llm !== 'function' || typeof spark.llmPrompt !== 'function') {
        const matchingFiles = safeFiles.filter(file => 
          file.name.toLowerCase().includes(advancedQuery.toLowerCase()) ||
          file.vectorChain.toLowerCase().includes(advancedQuery.toLowerCase()) ||
          (file.metadata?.tags || []).some(t => t.toLowerCase().includes(advancedQuery.toLowerCase()))
        )

        const newQuery: DatabaseQuery = {
          id: Date.now().toString(),
          query: advancedQuery,
          filters: {},
          results: matchingFiles,
          executedAt: new Date().toISOString(),
          executionTime: Date.now() - startTime
        }

        setQueries((current = []) => [newQuery, ...current].slice(0, 20))
        toast.info('LLM unavailable; executed basic search instead')
        return
      }

      // Use LLM to process natural language query
      const prompt = spark.llmPrompt`
      You are a quantum database query processor. Analyze this natural language query and return a JSON response with matching criteria:
      
      Query: "${advancedQuery}"
      
      Available files data for context:
      ${JSON.stringify(safeFiles.slice(0, 10), null, 2)}
      
      Return a JSON object with these fields:
      {
        "matchingFileIds": ["file_id1", "file_id2"],
        "explanation": "Clear explanation of what was found",
        "filters": {
          "fileType": "optional_file_type",
          "quantumState": "optional_state",
          "tags": ["optional", "tags"]
        }
      }
      
      Base your response on the actual file data provided.`

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const queryResult = JSON.parse(response)

      const matchingFiles = safeFiles.filter(file => 
        queryResult.matchingFileIds?.includes(file.id) ||
        file.name.toLowerCase().includes(advancedQuery.toLowerCase()) ||
        file.vectorChain.toLowerCase().includes(advancedQuery.toLowerCase())
      )

      const newQuery: DatabaseQuery = {
        id: Date.now().toString(),
        query: advancedQuery,
        filters: queryResult.filters || {},
        results: matchingFiles,
        executedAt: new Date().toISOString(),
        executionTime: Date.now() - startTime
      }

      setQueries((current = []) => [newQuery, ...current].slice(0, 20))
      
      toast.success(`Query executed: ${matchingFiles.length} files found`)
      if (queryResult.explanation) {
        toast.info(queryResult.explanation)
      }

    } catch (error) {
      toast.error('Failed to execute quantum query')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const exportSelectedFiles = () => {
    if (selectedFiles.length === 0) {
      toast.error('No files selected')
      return
    }

    const selectedFileData = safeFiles.filter(file => selectedFiles.includes(file.id))
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalFiles: selectedFileData.length,
      files: selectedFileData.map(file => ({
        ...file,
        exportConfig: {
          quantumState: file.quantumState,
          vectorChain: file.vectorChain,
          entanglementChain: `|ψ⟩=${Math.random().toFixed(3)}|0⟩+${Math.random().toFixed(3)}|1⟩`
        }
      }))
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `quantum-database-export-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast.success(`Exported ${selectedFiles.length} files`)
    setSelectedFiles([])
  }

  const deleteSelectedFiles = () => {
    if (selectedFiles.length === 0) {
      toast.error('No files selected')
      return
    }

    // This would integrate with the main file management system
    toast.success(`${selectedFiles.length} files marked for deletion`)
    setSelectedFiles([])
  }

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(current => 
      current.includes(fileId) 
        ? current.filter(id => id !== fileId)
        : [...current, fileId]
    )
  }

  const toggleSelectAll = () => {
    setSelectedFiles(current => 
      current.length === paginatedFiles.length 
        ? []
        : paginatedFiles.map(file => file.id)
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 quantum-field">
          <TabsTrigger value="browser" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Database Browser
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <ChartBar className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="query" className="flex items-center gap-2">
            <MagnifyingGlass className="w-4 h-4" />
            Advanced Query
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <CloudArrowUp className="w-4 h-4" />
            Export & Sync
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browser" className="space-y-6">
          {/* Search and Filters */}
          <QuantumField>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MagnifyingGlass className="w-5 h-5 text-accent" />
                  Quantum Database Search
                </CardTitle>
                <CardDescription>
                  Search and filter files across quantum states and project spaces
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="lg:col-span-2">
                    <Label htmlFor="search">Search Files</Label>
                    <Input
                      id="search"
                      placeholder="Search by name, vector chain, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="quantum-state">Quantum State</Label>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger id="quantum-state">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        <SelectItem value="superposition">Superposition</SelectItem>
                        <SelectItem value="collapsed">Collapsed</SelectItem>
                        <SelectItem value="entangled">Entangled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="file-type">File Type</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger id="file-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Images">Images</SelectItem>
                        <SelectItem value="Archives">Archives</SelectItem>
                        <SelectItem value="Code">Code</SelectItem>
                        <SelectItem value="Documents">Documents</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="sort-by">Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger id="sort-by">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uploadedAt">Upload Date</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="size">File Size</SelectItem>
                        <SelectItem value="quantumState">Quantum State</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="sort-order">Order</Label>
                    <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                      <SelectTrigger id="sort-order">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Descending</SelectItem>
                        <SelectItem value="asc">Ascending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      {filteredFiles.length} of {safeFiles.length} files
                    </p>
                    {selectedFiles.length > 0 && (
                      <Badge variant="secondary">
                        {selectedFiles.length} selected
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {selectedFiles.length > 0 && (
                      <>
                        <Button size="sm" variant="outline" onClick={exportSelectedFiles}>
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                        <Button size="sm" variant="destructive" onClick={deleteSelectedFiles}>
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    )}
                    <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </QuantumField>

          {/* File Table */}
          <Card className="quantum-field">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-3 border-b">
                <div className="text-sm text-muted-foreground">
                  {selectedFiles.length > 0 ? `${selectedFiles.length} selected` : `${paginatedFiles.length} shown`}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="destructive" disabled={selectedFiles.length === 0} onClick={handleBulkDelete}>
                    <Trash className="w-4 h-4 mr-1" /> Delete Selected
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={paginatedFiles.length > 0 && selectedFiles.length === paginatedFiles.length}
                        onChange={toggleSelectAll}
                        className="rounded border-border"
                      />
                    </TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Quantum State</TableHead>
                    <TableHead>Vector Chain</TableHead>
                    <TableHead>Project Space</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFiles.map((file) => (
                    <ContextMenu key={file.id}>
                      <ContextMenuTrigger asChild>
                        <TableRow className="state-collapse">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => toggleFileSelection(file.id)}
                          className="rounded border-border"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="text-muted-foreground">
                            {getFileIcon(file.type)}
                          </div>
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.type}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatFileSize(file.size)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getQuantumStateColor(file.quantumState)}>
                          {file.quantumState}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {file.vectorChain}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {file.projectSpace}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => onOpenInBrowser?.(file.id)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete?.(file.id)}>
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                        </TableRow>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onClick={() => onOpenInBrowser?.(file.id)}>Open in Browser</ContextMenuItem>
                        <ContextMenuItem className="text-destructive" onClick={() => onDelete?.(file.id)}>Delete</ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                </TableBody>
              </Table>

              {paginatedFiles.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Files Found</h3>
                  <p className="text-sm">
                    {filteredFiles.length === 0 ? 'No files match your search criteria' : 'No files to display'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(current => current - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(current => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics ? (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="quantum-field">
                  <CardContent className="p-6 text-center">
                    <Database className="w-8 h-8 mx-auto mb-2 text-primary quantum-pulse" />
                    <p className="text-2xl font-bold">{analytics.totalFiles}</p>
                    <p className="text-sm text-muted-foreground">Total Files</p>
                  </CardContent>
                </Card>
                <Card className="quantum-field">
                  <CardContent className="p-6 text-center">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-accent quantum-pulse" />
                    <p className="text-2xl font-bold">{formatFileSize(analytics.totalSize)}</p>
                    <p className="text-sm text-muted-foreground">Total Size</p>
                    {onOpenInBrowser && (
                      <div className="pt-3">
                        <Button size="sm" variant="outline" onClick={() => onOpenInBrowser(safeFiles[0]?.id || '')}>
                          Open in Browser
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="quantum-field">
                  <CardContent className="p-6 text-center">
                    <Atom className="w-8 h-8 mx-auto mb-2 text-secondary quantum-pulse" />
                    <p className="text-2xl font-bold">
                      {Object.keys(analytics.quantumStateDistribution).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Quantum States</p>
                  </CardContent>
                </Card>
                <Card className="quantum-field">
                  <CardContent className="p-6 text-center">
                    <Network className="w-8 h-8 mx-auto mb-2 text-ring quantum-pulse" />
                    <p className="text-2xl font-bold">
                      {Object.keys(analytics.projectSpaceDistribution).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Project Spaces</p>
                  </CardContent>
                </Card>
              </div>

              {/* Distribution Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="quantum-field">
                  <CardHeader>
                    <CardTitle>Quantum State Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.quantumStateDistribution).map(([state, count]) => (
                        <div key={state} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getQuantumStateColor(state).split(' ')[0]}`} />
                            <span className="capitalize">{state}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono">{count}</span>
                            <span className="text-xs text-muted-foreground">
                              ({((count / analytics.totalFiles) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="quantum-field">
                  <CardHeader>
                    <CardTitle>File Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.fileTypeDistribution).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getFileIcon(`${type.toLowerCase()}/`)}
                            <span>{type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono">{count}</span>
                            <span className="text-xs text-muted-foreground">
                              ({((count / analytics.totalFiles) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="quantum-field">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-accent" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <div className="text-muted-foreground">
                            {getFileIcon('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{activity.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              Vector: {activity.vectorChain}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm capitalize">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="quantum-field">
              <CardContent className="py-16 text-center">
                <ChartBar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
                <p className="text-muted-foreground">Upload files to generate analytics insights</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="query" className="space-y-6">
          <Card className="quantum-field">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MagnifyingGlass className="w-5 h-5 text-accent" />
                Advanced Quantum Query Interface
              </CardTitle>
              <CardDescription>
                Use natural language to search and analyze your quantum database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="advanced-query">Natural Language Query</Label>
                <Textarea
                  id="advanced-query"
                  placeholder="e.g., 'Find all image files uploaded last week in superposition state' or 'Show me code files larger than 1MB'"
                  value={advancedQuery}
                  onChange={(e) => setAdvancedQuery(e.target.value)}
                  rows={3}
                />
              </div>
              
              <Button 
                onClick={executeAdvancedQuery}
                disabled={isAnalyzing}
                className="w-full quantum-pulse"
              >
                <MagnifyingGlass className="w-4 h-4 mr-2" />
                {isAnalyzing ? 'Processing Quantum Query...' : 'Execute Query'}
              </Button>
            </CardContent>
          </Card>

          {/* Query History */}
          {safeQueries.length > 0 && (
            <Card className="quantum-field">
              <CardHeader>
                <CardTitle>Query History</CardTitle>
                <CardDescription>
                  Recent quantum database queries and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safeQueries.map((query) => (
                    <Card key={query.id} className="state-collapse">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{query.query}</p>
                              <p className="text-sm text-muted-foreground">
                                {query.results.length} results • {query.executionTime}ms • {new Date(query.executedAt).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {query.results.length} files
                            </Badge>
                          </div>
                          
                          {query.results.length > 0 && (
                            <div className="pt-2 border-t">
                              <div className="space-y-1">
                                {query.results.slice(0, 3).map((file) => (
                                  <div key={file.id} className="flex items-center gap-2 text-sm">
                                    {getFileIcon(file.type)}
                                    <span>{file.name}</span>
                                    <Badge className={`text-xs ${getQuantumStateColor(file.quantumState)}`}>
                                      {file.quantumState}
                                    </Badge>
                                  </div>
                                ))}
                                {query.results.length > 3 && (
                                  <p className="text-xs text-muted-foreground">
                                    +{query.results.length - 3} more files
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card className="quantum-field">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudArrowUp className="w-5 h-5 text-accent" />
                Export & Synchronization
              </CardTitle>
              <CardDescription>
                Export database configurations and sync with external quantum repositories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Database Export Options</h3>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Complete Database
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Archive className="w-4 h-4 mr-2" />
                      Export Quantum States Only
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Key className="w-4 h-4 mr-2" />
                      Export Vector Chains
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Sync Options</h3>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <ArrowClockwise className="w-4 h-4 mr-2" />
                      Sync with Remote Repository
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Lock className="w-4 h-4 mr-2" />
                      Create Encrypted Backup
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Network className="w-4 h-4 mr-2" />
                      Generate Migration Package
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Database Schema Information</h4>
                <div className="text-sm text-muted-foreground space-y-1 font-mono">
                  <p>• Quantum Files: {safeFiles.length} entries</p>
                  <p>• Query History: {safeQueries.length} entries</p>
                  <p>• Schema Version: 1.0.0-quantum</p>
                  <p>• Last Updated: {safeFiles.length > 0 ? new Date(Math.max(...safeFiles.map(f => new Date(f.uploadedAt).getTime()))).toLocaleString() : 'Never'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}