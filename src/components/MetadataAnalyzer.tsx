import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, FileText, Image, Code, Archive, Activity, Tag, Clock, Hash, Lightbulb, CheckCircle, XCircle, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface ExtractedMetadata {
  id: string
  fileId: string
  fileName: string
  contentSummary: string
  extractedText?: string
  keyTopics: string[]
  entities: Array<{
    type: 'person' | 'organization' | 'location' | 'technology' | 'concept'
    value: string
    confidence: number
  }>
  sentiment?: {
    overall: 'positive' | 'negative' | 'neutral'
    score: number
  }
  codeAnalysis?: {
    language: string
    functions: string[]
    dependencies: string[]
    complexity: 'low' | 'medium' | 'high'
    issues: Array<{
      type: 'warning' | 'error' | 'suggestion'
      message: string
      line?: number
    }>
  }
  imageAnalysis?: {
    description: string
    objects: string[]
    colors: string[]
    style: string
    quality: 'low' | 'medium' | 'high'
  }
  structuredData?: {
    format: string
    schema: any
    recordCount?: number
    fields: string[]
  }
  confidence: number
  processingTime: number
  analyzedAt: string
}

interface AnalysisJob {
  id: string
  fileId: string
  fileName: string
  fileType: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  startedAt: string
  completedAt?: string
  error?: string
}

export function MetadataAnalyzer() {
  const [extractedMetadata, setExtractedMetadata] = useKV<ExtractedMetadata[]>('extracted-metadata', [])
  const [analysisJobs, setAnalysisJobs] = useKV<AnalysisJob[]>('analysis-jobs', [])
  const [files] = useKV<any[]>('quantum-files', [])
  const [selectedFileId, setSelectedFileId] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState('analyzer')

  const safeMetadata = extractedMetadata || []
  const safeJobs = analysisJobs || []
  const safeFiles = files || []

  const analyzeFile = async (fileId: string) => {
    const file = safeFiles.find(f => f.id === fileId)
    if (!file) {
      toast.error('File not found')
      return
    }

    setIsAnalyzing(true)
    const jobId = Date.now().toString()
    const startTime = Date.now()

    // Create analysis job
    const job: AnalysisJob = {
      id: jobId,
      fileId,
      fileName: file.name,
      fileType: file.type,
      status: 'processing',
      progress: 0,
      startedAt: new Date().toISOString()
    }

    setAnalysisJobs((current = []) => [job, ...current])
    toast.info(`Starting AI analysis of ${file.name}`)

    try {
      // Simulate progress updates
      for (let progress = 10; progress <= 90; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setAnalysisJobs((current = []) => 
          current.map(j => j.id === jobId ? { ...j, progress } : j)
        )
      }

      // Perform AI-powered content analysis
      const spark = (window as any).spark
      if (!spark || typeof spark.llm !== 'function' || typeof spark.llmPrompt !== 'function') {
        throw new Error('Spark LLM unavailable')
      }
      const prompt = spark.llmPrompt`
      You are an advanced AI file metadata analyzer. Analyze the following file information and extract comprehensive metadata:

      File Name: ${file.name}
      File Type: ${file.type}
      File Size: ${file.size} bytes
      Upload Date: ${file.uploadedAt}
      
      Based on the file extension and type, provide a detailed analysis. Return a JSON object with the following structure:
      
      {
        "contentSummary": "Brief summary of what this file likely contains",
        "keyTopics": ["topic1", "topic2", "topic3"],
        "entities": [
          {
            "type": "person|organization|location|technology|concept",
            "value": "entity name",
            "confidence": 0.85
          }
        ],
        "sentiment": {
          "overall": "positive|negative|neutral",
          "score": 0.7
        },
        "codeAnalysis": {
          "language": "detected language if code file",
          "functions": ["function names if code"],
          "dependencies": ["libraries/frameworks detected"],
          "complexity": "low|medium|high",
          "issues": [
            {
              "type": "warning|error|suggestion", 
              "message": "issue description"
            }
          ]
        },
        "imageAnalysis": {
          "description": "what the image likely shows",
          "objects": ["object1", "object2"],
          "colors": ["color1", "color2"],
          "style": "photography|illustration|diagram|etc",
          "quality": "low|medium|high"
        },
        "structuredData": {
          "format": "JSON|CSV|XML|etc if structured",
          "schema": "inferred structure",
          "recordCount": 100,
          "fields": ["field1", "field2"]
        },
        "confidence": 0.8
      }
      
      Only include sections relevant to the file type. Be realistic about what can be inferred from just the file metadata.`

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const analysisResult = JSON.parse(response)

      // Create metadata record
      const metadata: ExtractedMetadata = {
        id: Date.now().toString(),
        fileId,
        fileName: file.name,
        contentSummary: analysisResult.contentSummary || 'No summary available',
        keyTopics: analysisResult.keyTopics || [],
        entities: analysisResult.entities || [],
        sentiment: analysisResult.sentiment,
        codeAnalysis: analysisResult.codeAnalysis,
        imageAnalysis: analysisResult.imageAnalysis,
        structuredData: analysisResult.structuredData,
        confidence: analysisResult.confidence || 0.5,
        processingTime: Date.now() - startTime,
        analyzedAt: new Date().toISOString()
      }

      // Update metadata storage
      setExtractedMetadata((current = []) => {
        const filtered = current.filter(m => m.fileId !== fileId)
        return [metadata, ...filtered]
      })

      // Complete the job
      setAnalysisJobs((current = []) => 
        current.map(j => j.id === jobId ? { 
          ...j, 
          status: 'completed', 
          progress: 100,
          completedAt: new Date().toISOString()
        } : j)
      )

      toast.success(`Analysis completed for ${file.name}`)
      
    } catch (error) {
      console.error('Analysis failed:', error)
      
      setAnalysisJobs((current = []) => 
        current.map(j => j.id === jobId ? { 
          ...j, 
          status: 'failed', 
          error: 'Analysis failed due to processing error'
        } : j)
      )
      
      toast.error('Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeAllFiles = async () => {
    if (safeFiles.length === 0) {
      toast.error('No files to analyze')
      return
    }

    setIsAnalyzing(true)
    toast.info(`Starting batch analysis of ${safeFiles.length} files`)

    for (const file of safeFiles) {
      // Skip if already analyzed
      if (safeMetadata.some(m => m.fileId === file.id)) continue
      
      await analyzeFile(file.id)
      // Small delay between analyses
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    setIsAnalyzing(false)
    toast.success('Batch analysis completed')
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />
    if (type.includes('zip') || type.includes('archive')) return <Archive className="w-4 h-4" />
    if (type.includes('javascript') || type.includes('typescript') || type.includes('json')) return <Code className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />
      case 'processing': return <Activity className="w-4 h-4 text-blue-500 animate-spin" />
      default: return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500'
    if (confidence >= 0.6) return 'text-yellow-500'
    return 'text-red-500'
  }

  const unanalyzedFiles = safeFiles.filter(file => 
    !safeMetadata.some(m => m.fileId === file.id)
  )

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 quantum-field">
          <TabsTrigger value="analyzer" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Analyzer
          </TabsTrigger>
          <TabsTrigger value="metadata" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Metadata
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Analysis Jobs
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer" className="space-y-6">
          <Card className="quantum-field">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-accent" />
                AI-Powered File Analysis
              </CardTitle>
              <CardDescription>
                Extract comprehensive metadata and insights from your files using advanced AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Analysis Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Single File Analysis</h3>
                  <div className="space-y-3">
                    <select 
                      value={selectedFileId}
                      onChange={(e) => setSelectedFileId(e.target.value)}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="">Select a file to analyze...</option>
                      {unanalyzedFiles.map(file => (
                        <option key={file.id} value={file.id}>
                          {file.name} ({file.type})
                        </option>
                      ))}
                    </select>
                    <Button 
                      onClick={() => selectedFileId && analyzeFile(selectedFileId)}
                      disabled={!selectedFileId || isAnalyzing}
                      className="w-full"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      {isAnalyzing ? 'Analyzing...' : 'Analyze File'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Batch Analysis</h3>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <p>Total files: {safeFiles.length}</p>
                      <p>Analyzed: {safeMetadata.length}</p>
                      <p>Remaining: {unanalyzedFiles.length}</p>
                    </div>
                    <Button 
                      onClick={analyzeAllFiles}
                      disabled={unanalyzedFiles.length === 0 || isAnalyzing}
                      className="w-full"
                      variant="outline"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      {isAnalyzing ? 'Processing Batch...' : 'Analyze All Files'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Analysis Capabilities */}
              <div className="space-y-4">
                <h3 className="font-semibold">Analysis Capabilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <h4 className="font-medium">Content Analysis</h4>
                      <p className="text-xs text-muted-foreground">Extract topics, entities, sentiment</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Code className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <h4 className="font-medium">Code Analysis</h4>
                      <p className="text-xs text-muted-foreground">Functions, dependencies, complexity</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Image className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                      <h4 className="font-medium">Image Analysis</h4>
                      <p className="text-xs text-muted-foreground">Objects, colors, style detection</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Hash className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                      <h4 className="font-medium">Data Analysis</h4>
                      <p className="text-xs text-muted-foreground">Schema, structure, records</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-6">
          {safeMetadata.length > 0 ? (
            <div className="space-y-4">
              {safeMetadata.map((metadata) => (
                <Card key={metadata.id} className="quantum-field state-collapse">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getFileIcon(safeFiles.find(f => f.id === metadata.fileId)?.type || '')}
                        <div>
                          <CardTitle className="text-lg">{metadata.fileName}</CardTitle>
                          <CardDescription>
                            Analyzed {new Date(metadata.analyzedAt).toLocaleString()} • 
                            Confidence: <span className={getConfidenceColor(metadata.confidence)}>
                              {(metadata.confidence * 100).toFixed(0)}%
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {metadata.processingTime}ms
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Content Summary */}
                    <div>
                      <h4 className="font-medium mb-2">Content Summary</h4>
                      <p className="text-sm text-muted-foreground">{metadata.contentSummary}</p>
                    </div>

                    {/* Key Topics */}
                    {metadata.keyTopics.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Key Topics</h4>
                        <div className="flex flex-wrap gap-1">
                          {metadata.keyTopics.map((topic, index) => (
                            <Badge key={index} variant="secondary">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Entities */}
                    {metadata.entities.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Extracted Entities</h4>
                        <div className="space-y-1">
                          {metadata.entities.map((entity, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {entity.type}
                                </Badge>
                                <span>{entity.value}</span>
                              </div>
                              <span className={`text-xs ${getConfidenceColor(entity.confidence)}`}>
                                {(entity.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Code Analysis */}
                    {metadata.codeAnalysis && (
                      <div>
                        <h4 className="font-medium mb-2">Code Analysis</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p><strong>Language:</strong> {metadata.codeAnalysis.language}</p>
                            <p><strong>Complexity:</strong> {metadata.codeAnalysis.complexity}</p>
                          </div>
                          {metadata.codeAnalysis.functions.length > 0 && (
                            <div>
                              <p className="font-medium">Functions:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {metadata.codeAnalysis.functions.slice(0, 3).map((func, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {func}
                                  </Badge>
                                ))}
                                {metadata.codeAnalysis.functions.length > 3 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{metadata.codeAnalysis.functions.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Image Analysis */}
                    {metadata.imageAnalysis && (
                      <div>
                        <h4 className="font-medium mb-2">Image Analysis</h4>
                        <div className="text-sm space-y-2">
                          <p><strong>Description:</strong> {metadata.imageAnalysis.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div>
                              <p className="font-medium">Objects:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {metadata.imageAnalysis.objects.map((obj, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {obj}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="font-medium">Colors:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {metadata.imageAnalysis.colors.map((color, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {color}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p><strong>Style:</strong> {metadata.imageAnalysis.style}</p>
                              <p><strong>Quality:</strong> {metadata.imageAnalysis.quality}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sentiment */}
                    {metadata.sentiment && (
                      <div>
                        <h4 className="font-medium mb-2">Sentiment Analysis</h4>
                        <div className="flex items-center gap-4 text-sm">
                          <Badge 
                            variant={metadata.sentiment.overall === 'positive' ? 'default' : 
                                   metadata.sentiment.overall === 'negative' ? 'destructive' : 'secondary'}
                          >
                            {metadata.sentiment.overall}
                          </Badge>
                          <span>Score: {metadata.sentiment.score.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="quantum-field">
              <CardContent className="py-16 text-center">
                <Tag className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Metadata Extracted</h3>
                <p className="text-muted-foreground">Start analyzing files to see extracted metadata here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card className="quantum-field">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent" />
                Analysis Jobs
              </CardTitle>
              <CardDescription>
                Monitor the progress of file analysis operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {safeJobs.length > 0 ? (
                <div className="space-y-4">
                  {safeJobs.map((job) => (
                    <Card key={job.id} className="state-collapse">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getFileIcon(job.fileType)}
                            <div>
                              <p className="font-medium">{job.fileName}</p>
                              <p className="text-sm text-muted-foreground">
                                Started {new Date(job.startedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(job.status)}
                            <Badge variant={
                              job.status === 'completed' ? 'default' :
                              job.status === 'failed' ? 'destructive' :
                              job.status === 'processing' ? 'secondary' : 'outline'
                            }>
                              {job.status}
                            </Badge>
                          </div>
                        </div>

                        {job.status === 'processing' && (
                          <div className="space-y-2">
                            <Progress value={job.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              {job.progress}% complete
                            </p>
                          </div>
                        )}

                        {job.status === 'completed' && job.completedAt && (
                          <p className="text-sm text-green-600">
                            Completed {new Date(job.completedAt).toLocaleString()}
                          </p>
                        )}

                        {job.status === 'failed' && job.error && (
                          <div className="flex items-start gap-2 mt-2">
                            <Warning className="w-4 h-4 text-red-500 mt-0.5" />
                            <p className="text-sm text-red-600">{job.error}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Analysis Jobs</h3>
                  <p className="text-sm">Analysis jobs will appear here when you start processing files</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card className="quantum-field">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-accent" />
                AI Insights & Recommendations
              </CardTitle>
              <CardDescription>
                Intelligent insights derived from your file metadata analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {safeMetadata.length > 0 ? (
                <div className="space-y-6">
                  {/* Overview Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center space-y-1">
                      <p className="text-2xl font-bold text-accent">{safeMetadata.length}</p>
                      <p className="text-xs text-muted-foreground">Files Analyzed</p>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-2xl font-bold text-primary">
                        {safeMetadata.reduce((sum, m) => sum + m.keyTopics.length, 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Topics Extracted</p>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-2xl font-bold text-secondary">
                        {safeMetadata.reduce((sum, m) => sum + m.entities.length, 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Entities Found</p>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-2xl font-bold text-ring">
                        {(safeMetadata.reduce((sum, m) => sum + m.confidence, 0) / safeMetadata.length * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Avg Confidence</p>
                    </div>
                  </div>

                  {/* Top Topics */}
                  <div>
                    <h3 className="font-semibold mb-3">Most Common Topics</h3>
                    <div className="space-y-2">
                      {Object.entries(
                        safeMetadata.reduce((acc, m) => {
                          m.keyTopics.forEach(topic => {
                            acc[topic] = (acc[topic] || 0) + 1
                          })
                          return acc
                        }, {} as Record<string, number>)
                      )
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 10)
                        .map(([topic, count]) => (
                          <div key={topic} className="flex items-center justify-between">
                            <span className="text-sm">{topic}</span>
                            <Badge variant="outline">{count} files</Badge>
                          </div>
                        ))
                      }
                    </div>
                  </div>

                  {/* Analysis Quality */}
                  <div>
                    <h3 className="font-semibold mb-3">Analysis Quality Distribution</h3>
                    <div className="space-y-2">
                      {['high', 'medium', 'low'].map(quality => {
                        const count = safeMetadata.filter(m => {
                          if (quality === 'high') return m.confidence >= 0.8
                          if (quality === 'medium') return m.confidence >= 0.6 && m.confidence < 0.8
                          return m.confidence < 0.6
                        }).length
                        const percentage = safeMetadata.length > 0 ? (count / safeMetadata.length * 100).toFixed(1) : '0'
                        
                        return (
                          <div key={quality} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                quality === 'high' ? 'bg-green-500' :
                                quality === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                              <span className="text-sm capitalize">{quality} Confidence</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{count} files</span>
                              <Badge variant="outline">{percentage}%</Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Lightbulb className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Insights Available</h3>
                  <p className="text-sm">Analyze some files to generate intelligent insights</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}