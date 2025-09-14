export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Cloudbank</h1>
        <p className="text-slate-400 mb-8">Quantum File Repository</p>
        
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">System Status</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-700 rounded p-4">
              <div className="text-sm text-slate-400">Status</div>
              <div className="text-xl font-bold text-green-400">Online</div>
            </div>
            <div className="bg-slate-700 rounded p-4">
              <div className="text-sm text-slate-400">Connections</div>
              <div className="text-xl font-bold">72</div>
            </div>
            <div className="bg-slate-700 rounded p-4">
              <div className="text-sm text-slate-400">Vector Keys</div>
              <div className="text-xl font-bold">12</div>
            </div>
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded transition-colors">
            Upload Files
          </button>
        </div>
      </div>
    </div>
  )
}