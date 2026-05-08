import { useState } from 'react'
import Home from './pages/Home'
import ModoEmergencia from './pages/ModoEmergencia'
import ProtocoloDengue from './pages/ProtocoloDengue'
import ProtocoloSedacao from './pages/ProtocoloSedacao'
import './App.css'

function App() {
  const [tela, setTela] = useState('home')
  const navegar = (destino) => setTela(destino)

  return (
    <div className="app-wrapper">
      <div className="mobile-frame">
        {tela === 'home' && <Home navegar={navegar} />}
        {tela === 'emergencia' && <ModoEmergencia navegar={navegar} />}
        {tela === 'dengue' && <ProtocoloDengue navegar={navegar} />}
        {tela === 'sedacao' && <ProtocoloSedacao navegar={navegar} />}
      </div>
    </div>
  )
}

export default App
