import React from 'react'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Cloudbank - Quantum Repository
        </h1>
        
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700 p-4 rounded">
              <div className="text-2xl font-bold text-blue-400">Active</div>
              <div className="text-sm text-slate-300">Quantum State</div>
            </div>
            <div className="bg-slate-700 p-4 rounded">
              <div className="text-2xl font-bold text-green-400">72</div>
              <div className="text-sm text-slate-300">Connections</div>
            </div>
            <div className="bg-slate-700 p-4 rounded">
              <div className="text-2xl font-bold text-purple-400">12</div>
              <div className="text-sm text-slate-300">Vector Chains</div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium transition-colors">
              Upload Files
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-medium transition-colors">
              Generate Vector Key
            </button>
            <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium transition-colors">
              View Database
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}