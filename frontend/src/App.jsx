import { useState } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { useAuth } from './hooks/useAuth'
import Home from './pages/Home'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import ModoEmergencia from './pages/ModoEmergencia'
import Protocolo from './pages/Protocolo'
import CalculadoraShell from './pages/CalculadoraDose/CalculadoraShell'
import MinhaConta from './pages/MinhaConta'
import MinhaContaMobile from './pages/MinhaContaMobile'
import CalculadoraDoseMobile from './pages/CalculadoraDose/CalculadoraDoseMobile'
import ModoEmergenciaShell from './pages/ModoEmergenciaShell'
import ModoEstudoShell from './pages/ModoEstudoShell'
import ModoEstudo from './pages/ModoEstudo'
import EstudoProtocolo from './pages/EstudoProtocolo'
import EstudoCaso from './pages/EstudoCaso'
import DesktopTopBar from './components/DesktopTopBar'
import BottomNav from './components/BottomNav'
import './App.css'

const PROTOCOLOS = {
  dengue: 1,
  sedacao: 2,
}

function ModalSairEmergencia({ onConfirmar, onCancelar }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} onClick={onCancelar} />
      <div style={{ position: 'relative', background: 'white', borderRadius: 16, padding: '32px 36px', maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(217,79,79,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D94F4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A2B3C', margin: '0 0 10px' }}>Sair do Modo Emergência?</h3>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: '0 0 28px' }}>
          Você está em atendimento de emergência. Tem certeza que deseja sair?
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancelar}
            style={{ flex: 1, background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '11px', fontSize: 14, fontWeight: 600, color: '#4A5568', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={onConfirmar}
            style={{ flex: 1, background: '#D94F4F', border: 'none', borderRadius: 10, padding: '11px', fontSize: 14, fontWeight: 600, color: 'white', cursor: 'pointer' }}>
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  const [tela, setTela] = useState('home')
  const [protocoloId, setProtocoloId] = useState(null)
  const [casoId, setCasoId] = useState(null)
  const [mostrarCadastro, setMostrarCadastro] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [pendingNav, setPendingNav] = useState(null)
  const { user, logout } = useAuth()

  const executarNavegacao = (destino, id = null) => {
    const emergenciaTelas = ['emergencia', 'dengue', 'sedacao']
    const entrandoEmergencia = !emergenciaTelas.includes(tela) && emergenciaTelas.includes(destino)
    if (emergenciaTelas.includes(tela) && !emergenciaTelas.includes(destino)) {
      localStorage.removeItem('genesis_emergency_start')
    }
    if (entrandoEmergencia) localStorage.setItem('genesis_emergency_start', Date.now().toString())
    if (PROTOCOLOS[destino] !== undefined) setProtocoloId(PROTOCOLOS[destino])
    if ((destino === 'estudo-caso' || destino === 'estudo-questoes') && id !== null) setCasoId(id)
    setTela(destino)
  }

  const navegar = (destino, id = null) => {
    const emergenciaTelas = ['emergencia', 'dengue', 'sedacao']
    const saindoEmergencia = emergenciaTelas.includes(tela) && !emergenciaTelas.includes(destino)
    if (saindoEmergencia) {
      setPendingNav({ destino, id })
      return
    }
    executarNavegacao(destino, id)
  }

  const handleLogout = () => {
    logout()
    setTela('home')
  }

  if (!user) {
    return mostrarCadastro ? (
      <Cadastro
        onCadastroSuccess={() => {
          setAuthMessage('Conta criada com sucesso. Agora faça login com seu email e senha.')
          setMostrarCadastro(false)
        }}
        onVoltarLogin={() => {
          setAuthMessage('')
          setMostrarCadastro(false)
        }}
      />
    ) : (
      <Login
        message={authMessage}
        onLoginSuccess={() => setTela('home')}
        onCriarConta={() => {
          setAuthMessage('')
          setMostrarCadastro(true)
        }}
      />
    )
  }

  const isFluxogramaView = tela === 'emergencia' || tela === 'dengue' || tela === 'sedacao'
  const isEstudoView = tela === 'estudo' || tela === 'estudo-caso' || tela === 'estudo-questoes'
  const isCalculadoraView = tela === 'calculadora'
  const isContaView = tela === 'conta'

  const activeNav = tela === 'home' ? 'home'
    : tela === 'conta' ? 'conta'
    : null

  return (
    <div className="app-wrapper">
      {pendingNav && (
        <ModalSairEmergencia
          onConfirmar={() => { executarNavegacao(pendingNav.destino, pendingNav.id); setPendingNav(null) }}
          onCancelar={() => setPendingNav(null)}
        />
      )}
      <DesktopTopBar tela={tela} navegar={navegar} />
      {isFluxogramaView && (
        <ModoEmergenciaShell tela={tela} protocoloId={protocoloId} navegar={navegar} />
      )}
      {isEstudoView && (
        <ModoEstudoShell tela={tela} casoId={casoId} navegar={navegar} />
      )}
      {isCalculadoraView && <CalculadoraShell navegar={navegar} />}
      {isContaView && <MinhaConta navegar={navegar} />}
      <div className="mobile-frame">
        {tela === 'home' && <Home navegar={navegar} />}
        {tela === 'emergencia' && <ModoEmergencia navegar={navegar} />}
        {(tela === 'dengue' || tela === 'sedacao') && protocoloId && (
          <Protocolo protocoloId={protocoloId} navegar={navegar} />
        )}
        {tela === 'calculadora' && <CalculadoraDoseMobile navegar={navegar} />}
        {tela === 'conta' && <MinhaContaMobile navegar={navegar} />}
        {tela === 'estudo' && <ModoEstudo navegar={navegar} />}
        {tela === 'estudo-caso' && casoId && <EstudoProtocolo casoId={casoId} navegar={navegar} />}
        {tela === 'estudo-questoes' && casoId && <EstudoCaso casoId={casoId} navegar={navegar} />}
        <BottomNav navegar={navegar} active={activeNav} />
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <AppContent />
      </FavoritesProvider>
    </AuthProvider>
  )
}

export default App