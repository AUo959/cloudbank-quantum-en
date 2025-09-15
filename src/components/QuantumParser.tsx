import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileArchive, 
  FileText, 
  Atom, 
  Cube, 
  Lightning, 
  TreeStructure,
  FolderOpen,
  Code,
  Image,
  Archive,
  Database,
  CheckCircle,
  Warning,
  Info
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { QuantumField } from './QuantumField'

interface ParsedFile {
  id: string
  originalName: string
  parsedName: string
  path: string
  type: string
  size: number
  content?: string
  structure?: any
  metadata: {
    extractedFrom?: string
    parseMethod: 'quantum' | 'traditional' | 'ai-enhanced'
    complexity: number
    relationships: string[]
    tags: string[]
    checksum: string
  }
  quantumState: 'superposition' | 'collapsed' | 'entangled'
  vectorChain: string
}

interface ParsedArchive {
  id: string
  originalFile: string
  extractedFiles: ParsedFile[]
  archiveStructure: any
  totalSize: number
  compressionRatio: number
  parseStrategy: string
  quantumSignature: string
  createdAt: string
}

interface ParsingRule {
  id: string
  name: string
  pattern: string
  fileTypes: string[]
  action: 'extract' | 'analyze' | 'transform' | 'index'
  quantumEnhanced: boolean
  aiPowered: boolean
}

export function QuantumParser() {
  const [files] = useKV<any[]>('quantum-files', [])
  const [parsedArchives, setParsedArchives] = useKV<ParsedArchive[]>('parsed-archives', [])
  const [parsingRules, setParsingRules] = useKV<ParsingRule[]>('parsing-rules', [])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStage, setProcessingStage] = useState('')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [parsingStrategy, setParsingStrategy] = useState<'automatic' | 'intelligent' | 'quantum'>('intelligent')

  const safeFiles = files || []
  const safeArchives = parsedArchives || []
  const safeRules = parsingRules || []

  // Default parsing rules
  const defaultRules: ParsingRule[] = [
    {
      id: 'zip-extract',
      name: 'ZIP Archive Extraction',
      pattern: '*.zip',
      fileTypes: ['application/zip'],
      action: 'extract',
      quantumEnhanced: true,
      aiPowered: false
    },
    {
      id: 'code-analysis',
      name: 'Code Structure Analysis',
      pattern: '*.{js,ts,py,java,cpp}',
      fileTypes: ['text/javascript', 'text/typescript', 'text/x-python'],
      action: 'analyze',
      quantumEnhanced: true,
      aiPowered: true
    },
    {
      id: 'document-index',
      name: 'Document Indexing',
      pattern: '*.{txt,md,pdf,doc}',
      fileTypes: ['text/plain', 'text/markdown', 'application/pdf'],
      action: 'index',
      quantumEnhanced: false,
      aiPowered: true
    },
    {
      id: 'image-metadata',
      name: 'Image Metadata Extraction',
      pattern: '*.{jpg,png,gif,svg}',
      fileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
      action: 'analyze',
      quantumEnhanced: false,
      aiPowered: false
    }
  ]

  // Initialize default rules if none exist
  React.useEffect(() => {
    if (safeRules.length === 0) {
      setParsingRules(defaultRules)
    }
  }, [])

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />
    if (type.includes('zip') || type.includes('archive')) return <Archive className="w-4 h-4" />
    if (type.includes('javascript') || type.includes('typescript') || type.includes('json')) return <Code className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'extract': return 'bg-primary text-primary-foreground'
      case 'analyze': return 'bg-accent text-accent-foreground'
      case 'transform': return 'bg-secondary text-secondary-foreground'
      case 'index': return 'bg-muted text-muted-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  // Enhanced file parsing with AI assistance
  const parseFileWithAI = async (file: any, strategy: string): Promise<ParsedFile[]> => {
    const spark = (window as any).spark
    if (!spark || typeof spark.llm !== 'function' || typeof spark.llmPrompt !== 'function') {
      return parseFileTraditionally(file)
    }
    const prompt = spark.llmPrompt`
    You are a quantum file parser. Analyze this file and provide parsing instructions:
    
    File: ${file.name}
    Type: ${file.type}
    Size: ${file.size} bytes
    Strategy: ${strategy}
    
    Based on the file type and contents, determine:
    1. How to optimally parse this file
    2. What structure and metadata to extract
    3. Appropriate quantum state assignment
    4. Vector chain relationships
    5. Tags and categorization
    
    Return a JSON object with:
    {
      "parseMethod": "quantum|traditional|ai-enhanced",
      "expectedStructure": "description of file structure",
      "extractionSteps": ["step1", "step2", "step3"],
      "quantumState": "superposition|collapsed|entangled",
      "tags": ["tag1", "tag2"],
      "complexity": 1-100,
      "relationships": ["file1", "file2"]
    }
    
    Consider quantum superposition for files with multiple possible interpretations,
    collapsed state for clearly defined structures, and entangled state for files
    with strong relationships to other files.`

    try {
      const response = await spark.llm(prompt, 'gpt-4o', true)
      const parseInstructions = JSON.parse(response)
      
      // Simulate parsing based on AI instructions
      const parsedFile: ParsedFile = {
        id: `parsed_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        originalName: file.name,
        parsedName: file.name,
        path: `/${file.name}`,
        type: file.type,
        size: file.size,
        structure: parseInstructions.expectedStructure,
        metadata: {
          parseMethod: parseInstructions.parseMethod || 'ai-enhanced',
          complexity: parseInstructions.complexity || Math.floor(Math.random() * 100),
          relationships: parseInstructions.relationships || [],
          tags: parseInstructions.tags || [],
          checksum: `sha256_${Math.random().toString(36).substr(2, 16)}`
        },
        quantumState: parseInstructions.quantumState || 'superposition',
        vectorChain: `vc_${Math.random().toString(36).substr(2, 8)}`
      }

      return [parsedFile]
    } catch (error) {
      // Fallback to traditional parsing
      return parseFileTraditionally(file)
    }
  }

  const parseFileTraditionally = (file: any): ParsedFile[] => {
    const parsedFile: ParsedFile = {
      id: `parsed_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      originalName: file.name,
      parsedName: file.name,
      path: `/${file.name}`,
      type: file.type,
      size: file.size,
      structure: { type: 'single-file', analyzed: false },
      metadata: {
        parseMethod: 'traditional',
        complexity: Math.floor(Math.random() * 50),
        relationships: [],
        tags: [file.type.split('/')[0]],
        checksum: `sha256_${Math.random().toString(36).substr(2, 16)}`
      },
      quantumState: 'collapsed',
      vectorChain: `vc_${Math.random().toString(36).substr(2, 8)}`
    }

    return [parsedFile]
  }

  // Quantum-enhanced archive extraction
  const extractArchive = async (file: any): Promise<ParsedFile[]> => {
    if (!file.type.includes('zip') && !file.type.includes('archive')) {
      return []
    }

    // Simulate archive analysis and extraction
    const fileCount = Math.floor(Math.random() * 20) + 5
    const extractedFiles: ParsedFile[] = []

    for (let i = 0; i < fileCount; i++) {
      const fileName = `extracted_file_${i + 1}.${['txt', 'js', 'json', 'md', 'py'][Math.floor(Math.random() * 5)]}`
      const fileSize = Math.floor(Math.random() * 10000) + 1000
      
      const extractedFile: ParsedFile = {
        id: `extracted_${Date.now()}_${i}`,
        originalName: fileName,
        parsedName: fileName,
        path: `/extracted/${file.name}/${fileName}`,
        type: `text/plain`,
        size: fileSize,
        structure: { type: 'extracted', parentArchive: file.name },
        metadata: {
          extractedFrom: file.name,
          parseMethod: 'quantum',
          complexity: Math.floor(Math.random() * 80),
          relationships: [`parent:${file.name}`],
          tags: ['extracted', 'archive-content'],
          checksum: `sha256_${Math.random().toString(36).substr(2, 16)}`
        },
        quantumState: Math.random() > 0.5 ? 'entangled' : 'superposition',
        vectorChain: `vc_${Math.random().toString(36).substr(2, 8)}`
      }

      extractedFiles.push(extractedFile)
    }

    // Create archive record
    const archive: ParsedArchive = {
      id: `archive_${Date.now()}`,
      originalFile: file.name,
      extractedFiles,
      archiveStructure: {
        type: 'zip',
        fileCount,
        totalUncompressedSize: extractedFiles.reduce((sum, f) => sum + f.size, 0)
      },
      totalSize: file.size,
      compressionRatio: file.size / extractedFiles.reduce((sum, f) => sum + f.size, 0),
      parseStrategy: parsingStrategy,
      quantumSignature: `qs_${Math.random().toString(36).substr(2, 12)}`,
      createdAt: new Date().toISOString()
    }

    setParsedArchives((current = []) => [...current, archive])
    
    return extractedFiles
  }

  const processFile = async (file: any) => {
    setIsProcessing(true)
    setProcessingProgress(0)
    setProcessingStage('Initializing quantum parser...')

    const stages = [
      'Analyzing file structure...',
      'Applying parsing rules...',
      'Extracting metadata...',
      'Generating quantum signatures...',
      'Creating vector chains...',
      'Finalizing database entries...'
    ]

    try {
  const allParsedFiles: ParsedFile[] = []

      for (let i = 0; i < stages.length; i++) {
        setProcessingStage(stages[i])
        await new Promise(resolve => setTimeout(resolve, 800))
        setProcessingProgress(((i + 1) / stages.length) * 100)

        if (i === 1) { // Apply parsing rules
          if (file.type.includes('zip') || file.type.includes('archive')) {
            const extractedFiles = await extractArchive(file)
            allParsedFiles.push(...extractedFiles)
          }
        }

        if (i === 2) { // Extract metadata
          if (parsingStrategy === 'intelligent' || parsingStrategy === 'quantum') {
            const aiParsedFiles = await parseFileWithAI(file, parsingStrategy)
            allParsedFiles.push(...aiParsedFiles)
          } else {
            const traditionalFiles = parseFileTraditionally(file)
            allParsedFiles.push(...traditionalFiles)
          }
        }
      }

      toast.success(`Successfully parsed ${allParsedFiles.length} file(s) with ${parsingStrategy} strategy`)
      
    } catch (error) {
      toast.error('Quantum parsing failed')
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
      setProcessingStage('')
    }
  }

  const getFilesByType = () => {
    const archiveFiles = safeFiles.filter(f => f.type && (f.type.includes('zip') || f.type.includes('archive')))
    const codeFiles = safeFiles.filter(f => f.type && (f.type.includes('javascript') || f.type.includes('typescript') || f.type.includes('json')))
    const documentFiles = safeFiles.filter(f => f.type && (f.type.includes('text') || f.type.includes('document')))
    const imageFiles = safeFiles.filter(f => f.type && f.type.includes('image'))
    
    return { archiveFiles, codeFiles, documentFiles, imageFiles }
  }

  const { archiveFiles, codeFiles, documentFiles, imageFiles } = getFilesByType()

  return (
    <div className="space-y-6">
      <Tabs defaultValue="parser" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 quantum-field">
          <TabsTrigger value="parser" className="flex items-center gap-2">
            <Atom className="w-4 h-4" />
            Quantum Parser
          </TabsTrigger>
          <TabsTrigger value="archives" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Archive Browser
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <TreeStructure className="w-4 h-4" />
            Parsing Rules
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Parsed Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="parser" className="space-y-6">
          {/* Parsing Strategy Selection */}
          <QuantumField>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightning className="w-5 h-5 text-accent" />
                  Quantum File Parser
                </CardTitle>
                <CardDescription>
                  Advanced file parsing with AI-enhanced structure analysis and quantum organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant={parsingStrategy === 'automatic' ? 'default' : 'outline'}
                    onClick={() => setParsingStrategy('automatic')}
                    className="h-auto p-4 flex-col gap-2"
                  >
                    <Cube className="w-6 h-6" />
                    <div className="text-center">
                      <p className="font-medium">Automatic</p>
                      <p className="text-xs opacity-75">Rule-based parsing</p>
                    </div>
                  </Button>
                  
                  <Button
                    variant={parsingStrategy === 'intelligent' ? 'default' : 'outline'}
                    onClick={() => setParsingStrategy('intelligent')}
                    className="h-auto p-4 flex-col gap-2"
                  >
                    <Atom className="w-6 h-6" />
                    <div className="text-center">
                      <p className="font-medium">Intelligent</p>
                      <p className="text-xs opacity-75">AI-enhanced analysis</p>
                    </div>
                  </Button>
                  
                  <Button
                    variant={parsingStrategy === 'quantum' ? 'default' : 'outline'}
                    onClick={() => setParsingStrategy('quantum')}
                    className="h-auto p-4 flex-col gap-2"
                  >
                    <Lightning className="w-6 h-6" />
                    <div className="text-center">
                      <p className="font-medium">Quantum</p>
                      <p className="text-xs opacity-75">Full quantum processing</p>
                    </div>
                  </Button>
                </div>

                {isProcessing && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>{processingStage}</span>
                      <span>{Math.round(processingProgress)}%</span>
                    </div>
                    <Progress value={processingProgress} className="quantum-pulse" />
                  </div>
                )}
              </CardContent>
            </Card>
          </QuantumField>

          {/* File Processing Queue */}
          <Card className="quantum-field">
            <CardHeader>
              <CardTitle>File Processing Queue</CardTitle>
              <CardDescription>
                Select files for quantum parsing and structure analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {safeFiles.length > 0 ? (
                <div className="space-y-3">
                  {safeFiles.map((file) => (
                    <Card key={file.id} className="state-collapse">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-muted-foreground">
                              {getFileIcon(file.type)}
                            </div>
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {file.type} • {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">
                              {file.quantumState}
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => processFile(file)}
                              disabled={isProcessing}
                              className="quantum-shimmer"
                            >
                              <Atom className="w-4 h-4 mr-2" />
                              Parse
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileArchive className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <h3 className="font-semibold mb-2">No Files Available</h3>
                  <p className="text-sm">Upload files to begin quantum parsing</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archives" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Archive Statistics */}
            <Card className="quantum-field">
              <CardHeader>
                <CardTitle>Archive Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{archiveFiles.length}</p>
                    <p className="text-sm text-muted-foreground">Archive Files</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">{safeArchives.length}</p>
                    <p className="text-sm text-muted-foreground">Extracted</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Code Files:</span>
                    <span>{codeFiles.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Documents:</span>
                    <span>{documentFiles.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Images:</span>
                    <span>{imageFiles.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Extractions */}
            <Card className="quantum-field">
              <CardHeader>
                <CardTitle>Recent Extractions</CardTitle>
              </CardHeader>
              <CardContent>
                {safeArchives.length > 0 ? (
                  <div className="space-y-3">
                    {safeArchives.slice(0, 3).map((archive) => (
                      <div key={archive.id} className="border-b pb-2 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{archive.originalFile}</p>
                            <p className="text-xs text-muted-foreground">
                              {archive.extractedFiles.length} files extracted
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {(archive.compressionRatio * 100).toFixed(1)}% ratio
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No archives extracted yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Extracted Archives List */}
          {safeArchives.length > 0 && (
            <Card className="quantum-field">
              <CardHeader>
                <CardTitle>Extracted Archives</CardTitle>
                <CardDescription>
                  Browse files extracted from quantum-processed archives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safeArchives.map((archive) => (
                    <Card key={archive.id} className="state-collapse">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Archive className="w-4 h-4 text-accent" />
                              <h4 className="font-medium">{archive.originalFile}</h4>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline">
                                {archive.extractedFiles.length} files
                              </Badge>
                              <Badge variant="secondary">
                                {archive.parseStrategy}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            <p>Quantum Signature: {archive.quantumSignature}</p>
                            <p>Compression Ratio: {(archive.compressionRatio * 100).toFixed(1)}%</p>
                            <p>Extracted: {new Date(archive.createdAt).toLocaleString()}</p>
                          </div>

                          <div className="pt-2 border-t">
                            <p className="text-sm font-medium mb-2">Extracted Files:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {archive.extractedFiles.slice(0, 6).map((file) => (
                                <div key={file.id} className="flex items-center gap-2 text-xs">
                                  {getFileIcon(file.type)}
                                  <span className="truncate">{file.originalName}</span>
                                </div>
                              ))}
                              {archive.extractedFiles.length > 6 && (
                                <div className="text-xs text-muted-foreground">
                                  +{archive.extractedFiles.length - 6} more...
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <Card className="quantum-field">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreeStructure className="w-5 h-5 text-accent" />
                Parsing Rules Configuration
              </CardTitle>
              <CardDescription>
                Configure automated parsing rules for different file types and patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safeRules.map((rule) => (
                  <Card key={rule.id} className="state-collapse">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{rule.name}</h4>
                            <Badge className={getActionColor(rule.action)}>
                              {rule.action}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Pattern: <code className="bg-muted px-1 rounded">{rule.pattern}</code>
                          </p>
                          <div className="flex gap-2">
                            {rule.quantumEnhanced && (
                              <Badge variant="outline" className="text-xs">
                                <Atom className="w-3 h-3 mr-1" />
                                Quantum
                              </Badge>
                            )}
                            {rule.aiPowered && (
                              <Badge variant="outline" className="text-xs">
                                <Lightning className="w-3 h-3 mr-1" />
                                AI-Powered
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Edit Rule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card className="quantum-field">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-accent" />
                Parsing Results Database
              </CardTitle>
              <CardDescription>
                View and manage all parsed file structures and metadata
              </CardDescription>
            </CardHeader>
            <CardContent>
              {safeArchives.length > 0 ? (
                <div className="space-y-4">
                  {safeArchives.flatMap(archive => archive.extractedFiles).map((file) => (
                    <Card key={file.id} className="state-collapse">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="text-muted-foreground mt-1">
                              {getFileIcon(file.type)}
                            </div>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{file.originalName}</h4>
                                <Badge className={getActionColor(file.metadata.parseMethod)}>
                                  {file.metadata.parseMethod}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {file.path} • {(file.size / 1024).toFixed(1)} KB
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Vector: {file.vectorChain}</span>
                                <span>Complexity: {file.metadata.complexity}</span>
                                <span>State: {file.quantumState}</span>
                              </div>
                              {file.metadata.tags.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                  {file.metadata.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <FolderOpen className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Parsed Results</h3>
                  <p className="text-sm">Process files through the quantum parser to see results here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}