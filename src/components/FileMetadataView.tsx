import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Brain, Tag, Users, Heart, Code, Image, Hash, Eye } from '@phosphor-icons/react'

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

interface FileMetadataViewProps {
  fileId: string
  fileName: string
  metadata?: ExtractedMetadata
  onAnalyze?: () => void
}

export function FileMetadataView({ fileId: _fileId, fileName: _fileName, metadata, onAnalyze }: FileMetadataViewProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500'
    if (confidence >= 0.6) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <Heart className="w-4 h-4 text-green-500" />
      case 'negative': return <Heart className="w-4 h-4 text-red-500" />
      default: return <Heart className="w-4 h-4 text-gray-500" />
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!metadata) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <h3 className="font-semibold mb-2">No AI Analysis</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This file hasn't been analyzed yet
          </p>
          {onAnalyze && (
            <Button onClick={onAnalyze} size="sm" className="w-full">
              <Brain className="w-4 h-4 mr-2" />
              Analyze with AI
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent" />
            AI Analysis Results
          </div>
          <Badge variant="outline" className={getConfidenceColor(metadata.confidence)}>
            {(metadata.confidence * 100).toFixed(0)}% confidence
          </Badge>
        </CardTitle>
        <CardDescription>
          Analyzed {new Date(metadata.analyzedAt).toLocaleString()} • 
          Processing time: {metadata.processingTime}ms
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Content Summary */}
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Content Summary
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {metadata.contentSummary}
          </p>
        </div>

        {/* Key Topics */}
        {metadata.keyTopics.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Key Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {metadata.keyTopics.map((topic, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Entities */}
        {metadata.entities.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              Extracted Entities
            </h4>
            <div className="space-y-2">
              {metadata.entities.slice(0, 5).map((entity, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {entity.type}
                    </Badge>
                    <span>{entity.value}</span>
                  </div>
                  <span className={`text-xs ${getConfidenceColor(entity.confidence)}`}>
                    {(entity.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
              {metadata.entities.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  +{metadata.entities.length - 5} more entities
                </p>
              )}
            </div>
          </div>
        )}

        {/* Sentiment */}
        {metadata.sentiment && (
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              {getSentimentIcon(metadata.sentiment.overall)}
              Sentiment Analysis
            </h4>
            <div className="flex items-center gap-4">
              <Badge 
                variant={metadata.sentiment.overall === 'positive' ? 'default' : 
                       metadata.sentiment.overall === 'negative' ? 'destructive' : 'secondary'}
              >
                {metadata.sentiment.overall}
              </Badge>
              <span className="text-sm">Score: {metadata.sentiment.score.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Code Analysis */}
        {metadata.codeAnalysis && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Code className="w-4 h-4" />
              Code Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Language: </span>
                  <Badge variant="outline">{metadata.codeAnalysis.language}</Badge>
                </div>
                <div>
                  <span className="font-medium">Complexity: </span>
                  <Badge className={getComplexityColor(metadata.codeAnalysis.complexity)}>
                    {metadata.codeAnalysis.complexity}
                  </Badge>
                </div>
              </div>
              
              {metadata.codeAnalysis.functions.length > 0 && (
                <div>
                  <p className="font-medium mb-1">Functions:</p>
                  <div className="flex flex-wrap gap-1">
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

            {metadata.codeAnalysis.issues.length > 0 && (
              <div>
                <p className="font-medium mb-2">Code Issues:</p>
                <div className="space-y-1">
                  {metadata.codeAnalysis.issues.slice(0, 3).map((issue, index) => (
                    <div key={index} className="text-xs p-2 rounded border-l-2 border-yellow-400 bg-yellow-50">
                      <span className="font-medium capitalize">{issue.type}: </span>
                      {issue.message}
                    </div>
                  ))}
                  {metadata.codeAnalysis.issues.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{metadata.codeAnalysis.issues.length - 3} more issues
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image Analysis */}
        {metadata.imageAnalysis && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Image className="w-4 h-4" />
              Image Analysis
            </h4>
            <div className="space-y-3">
              <p className="text-sm">{metadata.imageAnalysis.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {metadata.imageAnalysis.objects.length > 0 && (
                  <div>
                    <p className="font-medium text-xs mb-1">Objects:</p>
                    <div className="flex flex-wrap gap-1">
                      {metadata.imageAnalysis.objects.map((obj, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {obj}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {metadata.imageAnalysis.colors.length > 0 && (
                  <div>
                    <p className="font-medium text-xs mb-1">Colors:</p>
                    <div className="flex flex-wrap gap-1">
                      {metadata.imageAnalysis.colors.map((color, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  <div className="text-xs">
                    <span className="font-medium">Style: </span>
                    {metadata.imageAnalysis.style}
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">Quality: </span>
                    <Badge variant="outline" className="text-xs">
                      {metadata.imageAnalysis.quality}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Structured Data */}
        {metadata.structuredData && (
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Data Structure
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p><span className="font-medium">Format:</span> {metadata.structuredData.format}</p>
                {metadata.structuredData.recordCount && (
                  <p><span className="font-medium">Records:</span> {metadata.structuredData.recordCount}</p>
                )}
              </div>
              {metadata.structuredData.fields.length > 0 && (
                <div>
                  <p className="font-medium mb-1">Fields:</p>
                  <div className="flex flex-wrap gap-1">
                    {metadata.structuredData.fields.slice(0, 5).map((field, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                    {metadata.structuredData.fields.length > 5 && (
                      <span className="text-xs text-muted-foreground">
                        +{metadata.structuredData.fields.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}