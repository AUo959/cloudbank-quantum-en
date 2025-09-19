import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'

type QuantumFile = {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: string
  quantumState: 'superposition' | 'collapsed' | 'entangled'
  vectorChain: string
  projectSpace: string
  parsedStructure?: { quantumSignature?: string }
  metadata?: { tags?: string[] } & Record<string, unknown>
}

type FileItem = {
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

export function KVDataBridge() {
  const [qFiles] = useKV<QuantumFile[]>('quantum-files', [])
  const [cloudFiles, setCloudFiles] = useKV<FileItem[]>('cloudbank-files', [])

  useEffect(() => {
    const src = qFiles || []
    setCloudFiles((cur = []) => {
      const qIds = new Set(src.map(f => f.id))
      const keep = cur.filter(f => !(f.metadata && f.metadata.source === 'quantum' && !qIds.has(f.id)))

      const byId = new Map(keep.map(f => [f.id, f]))
      let updated = keep.length !== cur.length

      const makePreview = (name: string) => {
        const text = (name || 'file').slice(0, 12)
        const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' width='320' height='200'><defs><linearGradient id='g' x1='0' x2='1'><stop stop-color='hsl(200,60%,90%)' offset='0'/><stop stop-color='hsl(260,60%,92%)' offset='1'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='20' fill='#334155'>${text}</text></svg>`
        return `data:image/svg+xml;base64,${btoa(svg)}`
      }

      for (const qf of src) {
        if (!byId.has(qf.id)) {
          const mapped: FileItem = {
            id: qf.id,
            name: qf.name,
            type: 'file',
            mimeType: qf.type,
            size: qf.size,
            dateModified: qf.uploadedAt || new Date().toISOString(),
            path: '/uploads',
            preview: (qf.metadata as any)?.preview || makePreview(qf.name),
            metadata: {
              ...(qf.metadata || {}),
              tags: qf.metadata?.tags || [],
              source: 'quantum',
            },
            quantumSignature: qf.parsedStructure?.quantumSignature,
          }
          byId.set(mapped.id, mapped)
          updated = true
        }
      }
      return updated ? Array.from(byId.values()) : cur
    })
  }, [qFiles, setCloudFiles])

  return null
}
