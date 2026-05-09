import { useState } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { useAuth } from './hooks/useAuth'
import Home from './pages/Home'
import Login from './pages/Login'
import ModoEmergencia from './pages/ModoEmergencia'
import ProtocoloDengue from './pages/ProtocoloDengue'
import ProtocoloSedacao from './pages/ProtocoloSedacao'
import CalculadoraDose from './pages/CalculadoraDose/CalculadoraDose'
import './App.css'

function AppContent() {
  const [tela, setTela] = useState('home')
  const { user, logout } = useAuth()

  const navegar = (destino) => setTela(destino)

  const handleLogout = () => {
    logout()
    setTela('home')
  }

  return (
    <div className="app-wrapper">
      <div className="mobile-frame">
        {!user ? (
          <Login onLoginSuccess={() => setTela('home')} />
        ) : (
          <>
            <div className="header">
              <span className="user-info">{user.username}</span>
              <button onClick={handleLogout} className="logout-btn">Sair</button>
            </div>
            {tela === 'home' && <Home navegar={navegar} />}
            {tela === 'emergencia' && <ModoEmergencia navegar={navegar} />}
            {tela === 'dengue' && <ProtocoloDengue navegar={navegar} />}
            {tela === 'sedacao' && <ProtocoloSedacao navegar={navegar} />}
            {tela === 'calculadora' && <CalculadoraDose />}
          </>
        )}
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