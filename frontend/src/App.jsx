import { useState } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { useAuth } from './hooks/useAuth'
import Home from './pages/Home'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import ModoEmergencia from './pages/ModoEmergencia'
import Protocolo from './pages/Protocolo'
import CalculadoraDose from './pages/CalculadoraDose/CalculadoraDose'
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

function AppContent() {
  const [tela, setTela] = useState('home')
  const [protocoloId, setProtocoloId] = useState(null)
  const [casoId, setCasoId] = useState(null)
  const [mostrarCadastro, setMostrarCadastro] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const { user, logout } = useAuth()

  const navegar = (destino, id = null) => {
    if (destino === 'home') {
      localStorage.removeItem('genesis_emergency_start')
    }
    if (PROTOCOLOS[destino] !== undefined) {
      setProtocoloId(PROTOCOLOS[destino])
    }
    if ((destino === 'estudo-caso' || destino === 'estudo-questoes') && id !== null) {
      setCasoId(id)
    }
    setTela(destino)
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

  const activeNav = tela === 'calculadora' ? 'calculadora'
    : (tela === 'estudo' || tela === 'estudo-caso' || tela === 'estudo-questoes') ? 'estudo'
    : tela === 'home' ? 'home'
    : null

  return (
    <div className="app-wrapper">
      <DesktopTopBar tela={tela} navegar={navegar} />
      {isFluxogramaView && (
        <ModoEmergenciaShell tela={tela} protocoloId={protocoloId} navegar={navegar} />
      )}
      {isEstudoView && (
        <ModoEstudoShell tela={tela} casoId={casoId} navegar={navegar} />
      )}
      <div className="mobile-frame">
        {tela === 'home' && <Home navegar={navegar} />}
        {tela === 'emergencia' && <ModoEmergencia navegar={navegar} />}
        {(tela === 'dengue' || tela === 'sedacao') && protocoloId && (
          <Protocolo protocoloId={protocoloId} navegar={navegar} />
        )}
        {tela === 'calculadora' && <CalculadoraDose navegar={navegar} />}
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