export default function App() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#1e293b', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Cloudbank</h1>
      <p style={{ color: '#94a3b8' }}>Quantum File Repository</p>
      
      <div style={{ marginTop: '30px', backgroundColor: '#334155', padding: '20px', borderRadius: '8px' }}>
        <h2>System Status</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
          <div style={{ backgroundColor: '#475569', padding: '16px', borderRadius: '6px' }}>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>Status</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>Active</div>
          </div>
          <div style={{ backgroundColor: '#475569', padding: '16px', borderRadius: '6px' }}>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>Connections</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>72</div>
          </div>
          <div style={{ backgroundColor: '#475569', padding: '16px', borderRadius: '6px' }}>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>Vector Keys</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>12</div>
          </div>
        </div>
      </div>

      <button 
        style={{ 
          marginTop: '20px', 
          backgroundColor: '#3b82f6', 
          color: 'white', 
          padding: '12px 24px', 
          border: 'none', 
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Upload Files
      </button>
    </div>
  )
}