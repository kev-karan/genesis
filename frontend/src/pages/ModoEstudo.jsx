import { useState, useEffect } from 'react'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import { fetchCasos } from '../api/casos'

const NIVEL_LABEL = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' }
const NIVEL_COLOR = { facil: '#2BA880', medio: '#D58B02', dificil: '#D94F4F' }
const NIVEL_BG    = { facil: 'rgba(43,168,128,0.12)', medio: 'rgba(213,139,2,0.12)', dificil: 'rgba(217,79,79,0.12)' }

function BookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}

export default function ModoEstudo({ navegar }) {
  const [casos, setCasos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCasos()
      .then(data => setCasos(Array.isArray(data) ? data : (data.resultados || [])))
      .catch(err => console.error('Erro ao carregar casos:', err))
      .finally(() => setLoading(false))
  }, [])

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
          <h1 className="page-title">Modo de Estudo</h1>
          <p className="page-subtitle">Selecione o caso clínico que deseja estudar</p>
        </div>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#999' }}>Carregando...</p>
        ) : (
          <div className="protocol-list">
            {casos.map((caso) => (
              <button
                key={caso.id}
                className="protocol-card"
                onClick={() => navegar('estudo-caso', caso.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', width: '100%' }}
              >
                <div className="protocol-icon">
                  <BookIcon />
                </div>
                <div style={{ flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="protocol-name">{caso.titulo}</span>
                  {caso.nivel && (
                    <span style={{
                      flexShrink: 0,
                      fontSize: '11px',
                      fontWeight: '600',
                      color: NIVEL_COLOR[caso.nivel] ?? '#666',
                      background: NIVEL_BG[caso.nivel] ?? 'rgba(0,0,0,0.06)',
                      borderRadius: '10px',
                      padding: '2px 8px',
                    }}>
                      {NIVEL_LABEL[caso.nivel] ?? caso.nivel}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNav navegar={navegar} active="estudo" />
    </div>
  )
}
