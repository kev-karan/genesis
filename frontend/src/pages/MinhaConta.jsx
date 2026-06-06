import { useAuth } from '../hooks/useAuth'

function IcoUser({ size = 22, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

export default function MinhaConta({ navegar }) {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navegar('home')
  }

  return (
    <div className="proto-desktop">
      <div className="pd-page-header">
        <div className="pd-page-icon"><IcoUser size={22} /></div>
        <div>
          <p className="pd-page-title">Minha Conta</p>
          <p className="pd-page-subtitle">{user?.email ?? ''}</p>
        </div>
      </div>
      <div className="pd-body">
        <div className="pd-main" style={{ alignItems: 'center' }}>
          <div className="pd-card" style={{ padding: '32px', flex: 'none', width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EEF4FB', border: '2px solid #c8d8ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IcoUser size={26} color="#2A569F" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#002646' }}>{user?.email ?? '—'}</p>
                <p style={{ margin: 0, fontSize: 13, color: '#6B7A8D' }}>Residente de Medicina Pediátrica</p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#6B7A8D' }}>Email</span>
                <span style={{ fontWeight: 600, color: '#002646' }}>{user?.email ?? '—'}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{ marginTop: 32, width: '100%', background: '#FEF2F2', color: '#DC2626', border: '1.5px solid #FECACA', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
