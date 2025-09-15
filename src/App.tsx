export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Cloudbank</h1>
        <p className="text-muted-foreground mb-8">Quantum File Repository</p>
        
        <div className="bg-card text-card-foreground rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">System Status</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-muted rounded p-4">
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="text-xl font-bold text-accent">Online</div>
            </div>
            <div className="bg-muted rounded p-4">
              <div className="text-sm text-muted-foreground">Connections</div>
              <div className="text-xl font-bold text-card-foreground">72</div>
            </div>
            <div className="bg-muted rounded p-4">
              <div className="text-sm text-muted-foreground">Vector Keys</div>
              <div className="text-xl font-bold text-card-foreground">12</div>
            </div>
          </div>
          
          <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded transition-colors">
            Upload Files
          </button>
        </div>
      </div>
    </div>
  )
}