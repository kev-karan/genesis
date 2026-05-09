import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import DengueIcon from '../assets/DengueIcon.png'
import SedacaoIcon from '../assets/SedacaoIcon.png'

const protocolos = [
  {
    id: 'dengue',
    nome: 'Protocolo Dengue',
    image: DengueIcon,
    destino: 'dengue',
  },
  {
    id: 'sedacao',
    nome: 'Protocolo Sedação',
    image: SedacaoIcon,
    destino: 'sedacao',
  },
]

export default function ModoEmergencia({ navegar }) {
  return (
    <div className="screen">
      <TopBar />

      <div className="content">
        <button className="back-btn" onClick={() => navegar('home')}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>

        <div className="section-header">
          <h1 className="page-title">Modo Emergência</h1>
          <p className="page-subtitle">Selecione o Protocolo que deseja visualizar</p>
        </div>

        <div className="protocol-list">
          {protocolos.map((p) => (
            <button
              key={p.id}
              className="protocol-card"
              onClick={() => navegar(p.destino)}
            >
              <div className="protocol-icon">
                <img src={p.image} 
                  alt={`Icon ${p.nome}`} 
                  style={{ width: '28px', height: '28px', objectFit: 'contain' }} 
                />
              </div>
              <span className="protocol-name">{p.nome}</span>
              <svg
                style={{ marginLeft: 'auto', color: 'var(--gray-400)' }}
                width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <BottomNav navegar={navegar} active="emergencia" />
    </div>
  )
}