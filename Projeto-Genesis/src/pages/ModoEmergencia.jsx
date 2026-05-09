import { useState, useEffect } from 'react'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import DengueIcon from '../assets/DengueIcon.png'
import SedacaoIcon from '../assets/SedacaoIcon.png'
import { fetchFluxogramas } from '../api/fluxogramas'
import { useFavorites } from '../hooks/useFavorites'

const protocoloMap = {
  1: { nome: 'Protocolo Dengue', image: DengueIcon, destino: 'dengue' },
  2: { nome: 'Protocolo Sedação', image: SedacaoIcon, destino: 'sedacao' },
}

export default function ModoEmergencia({ navegar }) {
  const [fluxogramas, setFluxogramas] = useState([])
  const [loading, setLoading] = useState(true)
  const { favorites, isFavorited, addToFavorites, removeFromFavorites } = useFavorites()

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchFluxogramas()
        setFluxogramas(data.resultados || data)
      } catch (err) {
        console.error('Erro ao carregar:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleToggleFavorite = async (id) => {
    try {
      if (isFavorited(id)) {
        await removeFromFavorites(id)
      } else {
        await addToFavorites(id)
      }
    } catch (err) {
      console.error('Erro:', err)
    }
  }

  const favoritos = fluxogramas.filter(f => isFavorited(f.id))
  const outros = fluxogramas.filter(f => !isFavorited(f.id))
  const todos = [...favoritos, ...outros]

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

        {loading ? (
          <p style={{ textAlign: 'center', color: '#999' }}>Carregando...</p>
        ) : (
          <div className="protocol-list">
            {todos.map((fluxo) => {
              const meta = protocoloMap[fluxo.id]
              if (!meta) return null

              return (
                <button
                  key={fluxo.id}
                  className="protocol-card"
                  onClick={() => navegar(meta.destino)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', width: '100%', position: 'relative' }}
                >
                  <div className="protocol-icon">
                    <img src={meta.image}
                      alt={meta.nome}
                      style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                    />
                  </div>
                  <span className="protocol-name">{meta.nome}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleFavorite(fluxo.id)
                    }}
                    style={{
                      marginLeft: 'auto',
                      background: 'none',
                      border: 'none',
                      fontSize: '20px',
                      cursor: 'pointer',
                      padding: '8px',
                      color: isFavorited(fluxo.id) ? '#1B6FD8' : '#999',
                      transition: 'color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {isFavorited(fluxo.id) ? '★' : '☆'}
                  </button>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav navegar={navegar} active="emergencia" />
    </div>
  )
}