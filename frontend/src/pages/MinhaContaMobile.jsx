import TopBar from '../components/TopBar'
import { useAuth } from '../hooks/useAuth'

function IcoUser({ size = 22, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

export default function MinhaContaMobile({ navegar }) {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navegar('home')
  }

  return (
    <div className="screen proto-mobile">
      <TopBar />
      <div className="content">
        <button className="back-btn" onClick={() => navegar('home')}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>

        <div className="section-header">
          <h1 className="page-title">Minha Conta</h1>
          <p className="page-subtitle">Gerencie suas informações</p>
        </div>

        <div className="protocol-card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#EEF4FB', border: '2px solid #c8d8ea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IcoUser size={22} color="#2A569F" />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#002646', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email ?? '—'}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#6B7A8D' }}>Residente de Medicina Pediátrica</p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16, fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ color: '#6B7A8D', flexShrink: 0 }}>Email</span>
              <span style={{ fontWeight: 600, color: '#002646', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email ?? '—'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{ width: '100%', background: '#FEF2F2', color: '#DC2626', border: '1.5px solid #FECACA', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
        >
          Sair
        </button>
      </div>
    </div>
  )
}
