import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Plus, Cube, Network, Users } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface ProjectSpace {
  id: string
  name: string
  description: string
  quantumField: string
  createdAt: string
  fileCount: number
  vectorKeyCount: number
  agentAccess: string[]
  status: 'active' | 'suspended' | 'archived'
}

export function ProjectSpaceManager() {
  const [projectSpaces, setProjectSpaces] = useKV<ProjectSpace[]>('project-spaces', [])
  const [activeSpace, setActiveSpace] = useKV<string>('active-space', 'default')
  const [newSpaceName, setNewSpaceName] = useState('')
  const [newSpaceDescription, setNewSpaceDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const spaces = projectSpaces || []

  const createProjectSpace = async () => {
    if (!newSpaceName.trim()) {
      toast.error('Please enter a project space name')
      return
    }

    setIsCreating(true)
    
    // Simulate quantum space creation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newSpace: ProjectSpace = {
      id: Date.now().toString(),
      name: newSpaceName.trim(),
      description: newSpaceDescription.trim() || 'Quantum project space',
      quantumField: `qf_${Math.random().toString(36).substr(2, 8)}`,
      createdAt: new Date().toISOString(),
      fileCount: 0,
      vectorKeyCount: 0,
      agentAccess: [],
      status: 'active'
    }

    setProjectSpaces((current = []) => [...current, newSpace])
    setNewSpaceName('')
    setNewSpaceDescription('')
    setIsCreating(false)
    
    toast.success('Quantum project space created successfully')
  }

  const switchToSpace = (spaceId: string) => {
    setActiveSpace(spaceId)
    const space = spaces.find(s => s.id === spaceId)
    toast.success(`Switched to ${space?.name || 'project space'}`)
  }

  const archiveSpace = (spaceId: string) => {
    setProjectSpaces((current = []) =>
      current.map(space =>
        space.id === spaceId
          ? { ...space, status: 'archived' as const }
          : space
      )
    )
    toast.success('Project space archived')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400'
      case 'suspended': return 'bg-yellow-500/20 text-yellow-400'
      case 'archived': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-muted'
    }
  }

  const activeSpaceData = spaces.find(s => s.id === activeSpace)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5 text-accent" />
            Current Quantum Space
          </CardTitle>
          <CardDescription>
            Active environment: {activeSpaceData?.name || 'Default Space'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeSpaceData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{activeSpaceData.name}</h3>
                  <p className="text-sm text-muted-foreground">{activeSpaceData.description}</p>
                </div>
                <Badge className={getStatusColor(activeSpaceData.status)}>
                  {activeSpaceData.status}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-accent">{activeSpaceData.fileCount}</p>
                  <p className="text-xs text-muted-foreground">Files</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-secondary">{activeSpaceData.vectorKeyCount}</p>
                  <p className="text-xs text-muted-foreground">Vector Keys</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-primary">{activeSpaceData.agentAccess.length}</p>
                  <p className="text-xs text-muted-foreground">Agent Access</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Quantum Field: <code className="bg-muted px-1 py-0.5 rounded">{activeSpaceData.quantumField}</code>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No active quantum space</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="spaces" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="spaces">Project Spaces</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="spaces" className="space-y-4">
          {spaces.length > 0 ? (
            <div className="grid gap-4">
              {spaces.map((space) => (
                <Card key={space.id} className="state-collapse">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{space.name}</h4>
                          <Badge className={getStatusColor(space.status)}>
                            {space.status}
                          </Badge>
                          {space.id === activeSpace && (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{space.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Cube className="w-3 h-3" />
                            {space.fileCount} files
                          </span>
                          <span className="flex items-center gap-1">
                            <Network className="w-3 h-3" />
                            {space.vectorKeyCount} keys
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {space.agentAccess.length} agents
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(space.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {space.id !== activeSpace && space.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => switchToSpace(space.id)}
                          >
                            Activate
                          </Button>
                        )}
                        {space.status === 'active' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => archiveSpace(space.id)}
                          >
                            Archive
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Network className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No project spaces created yet</p>
                <p className="text-sm text-muted-foreground">Create your first quantum environment</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Quantum Project Space</CardTitle>
              <CardDescription>
                Establish a new isolated quantum environment for organizing files and managing agent access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="space-name">Space Name</Label>
                <Input
                  id="space-name"
                  placeholder="Enter project space name"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="space-description">Description (Optional)</Label>
                <Input
                  id="space-description"
                  placeholder="Describe the purpose of this quantum space"
                  value={newSpaceDescription}
                  onChange={(e) => setNewSpaceDescription(e.target.value)}
                />
              </div>
              <Separator />
              <Button 
                onClick={createProjectSpace}
                disabled={isCreating}
                className="w-full quantum-pulse"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isCreating ? 'Creating Quantum Space...' : 'Create Project Space'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}