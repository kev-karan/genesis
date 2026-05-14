import { useState } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { useAuth } from './hooks/useAuth'
import Home from './pages/Home'
import Login from './pages/Login'
import ModoEmergencia from './pages/ModoEmergencia'
import Protocolo from './pages/Protocolo'
import CalculadoraDose from './pages/CalculadoraDose/CalculadoraDose'
import './App.css'

const PROTOCOLOS = {
  dengue: 1,
  sedacao: 2,
}

function AppContent() {
  const [tela, setTela] = useState('home')
  const [protocoloId, setProtocoloId] = useState(null)
  const { user, logout } = useAuth()

  const navegar = (destino) => {
    if (PROTOCOLOS[destino] !== undefined) {
      setProtocoloId(PROTOCOLOS[destino])
    }
    setTela(destino)
  }

  const handleLogout = () => {
    logout()
    setTela('home')
  }

  if (!user) {
    return <Login onLoginSuccess={() => setTela('home')} />
  }

  return (
    <div className="app-wrapper">
      <div className="mobile-frame">
        <>
          <div className="header">
            <span className="user-info">{user.username}</span>
            <button onClick={handleLogout} className="logout-btn">Sair</button>
          </div>
          {tela === 'home' && <Home navegar={navegar} />}
          {tela === 'emergencia' && <ModoEmergencia navegar={navegar} />}
          {(tela === 'dengue' || tela === 'sedacao') && protocoloId && <Protocolo protocoloId={protocoloId} navegar={navegar} />}
          {tela === 'calculadora' && <CalculadoraDose navegar={navegar} />}
        </>
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