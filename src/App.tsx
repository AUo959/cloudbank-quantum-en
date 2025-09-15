export default function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--background)', 
      color: 'var(--foreground)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: 'var(--primary)'
        }}>
          Cloudbank
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: 'var(--muted-foreground)',
          marginBottom: '2rem'
        }}>
          Quantum File Repository - Live Preview Test
        </p>
        
        <div style={{
          backgroundColor: 'var(--card)',
          color: 'var(--card-foreground)',
          padding: '2rem',
          borderRadius: '0.75rem',
          border: '1px solid var(--border)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            System Status
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              backgroundColor: 'var(--muted)',
              padding: '1rem',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                Online
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                System Status
              </div>
            </div>
            <div style={{
              backgroundColor: 'var(--muted)',
              padding: '1rem',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                72
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                Connections
              </div>
            </div>
            <div style={{
              backgroundColor: 'var(--muted)',
              padding: '1rem',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--card-foreground)' }}>
                12
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                Vector Keys
              </div>
            </div>
          </div>
          
          <button style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            fontWeight: '500',
            cursor: 'pointer',
            marginRight: '1rem'
          }}>
            Upload Files
          </button>
          
          <button style={{
            backgroundColor: 'var(--secondary)',
            color: 'var(--secondary-foreground)',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            Manage Keys
          </button>
        </div>

        <div style={{ 
          textAlign: 'center',
          padding: '1rem',
          backgroundColor: 'var(--accent)/10',
          borderRadius: '0.5rem',
          border: '1px solid var(--accent)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--accent)',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
            <span style={{ color: 'var(--accent)', fontWeight: '500' }}>
              Preview Working Successfully! 🎉
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}