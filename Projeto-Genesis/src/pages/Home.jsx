import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import GenesisLogo from '../assets/GenesisLogo.png'
import EmergenciaIcon from '../assets/Emergencia.png'
import CalculadoraIcon from '../assets/Calculadora.png'
import EstudoIcon from '../assets/Estudo.png'

export default function Home({ navegar }) {

  return (
    <div className="screen">
      <TopBar showLogo={false} />

      <div className="content">
        {/* Hero */}
        <div className="home-hero">
          <div className="genesis-logo-wrap">
            <img src={GenesisLogo} alt="Logo Genesis" className="genesis-logo-wave"/>
          </div>
        </div>

        {/* Search bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="O que deseja saber?"
          />
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
        </div>

        {/* Quick actions */}
        <div className="quick-grid">
          <button className="quick-btn" onClick={() => navegar('emergencia')}>
            <div className="quick-icon">
              <img src={EmergenciaIcon} alt='Icon Modo Emergência'
              style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            </div>
            <span className="quick-label">Modo Emergência</span>
          </button>

          <button className="quick-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <div className="quick-icon">
              <img src={CalculadoraIcon} alt='Icon Calculadora de Doses'
              style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            </div>
            <span className="quick-label">Calculadora de Doses</span>
          </button>

          <button className="quick-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <div className="quick-icon">
              <img src={EstudoIcon} alt='Icon Modo Estudo'
              style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            </div>
            <span className="quick-label">Modo Estudo</span>
          </button>
        </div>

      </div>

      <BottomNav navegar={navegar} active="home" />
    </div>
  )
}