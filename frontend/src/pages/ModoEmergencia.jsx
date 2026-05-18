import { useState, useEffect } from 'react'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import GenesisLogoAlt from '../assets/GenesisLogoAlt.png'
import DengueIcon from '../assets/DengueIcon.png'
import SedacaoIcon from '../assets/SedacaoIcon.png'
import { fetchFluxogramas } from '../api/fluxogramas'
import { listAcessosRecentes } from '../api/acessos'
import { useFavorites } from '../hooks/useFavorites'

const protocoloMap = {
  1: { label: 'Protocolo Dengue',  image: DengueIcon,  destino: 'dengue',  color: '#1B5DCA' },
  2: { label: 'Protocolo Sedação', image: SedacaoIcon, destino: 'sedacao', color: '#504FA8' },
}

const PROTOCOLOS_SEARCH = [
  { id: 'emergencia', nome: 'Modo Emergência' },
  { id: 'dengue',     nome: 'Protocolo de Dengue' },
  { id: 'sedacao',    nome: 'Protocolo de Sedação' },
  { id: 'calculadora',nome: 'Calculadora de Doses' },
]

// ---- Icons ----
function IcoHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}
function IcoHierarchy() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/>
      <line x1="12" y1="7" x2="12" y2="12"/><line x1="12" y1="12" x2="5.5" y2="17"/><line x1="12" y1="12" x2="18.5" y2="17"/>
    </svg>
  )
}
function IcoPill() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 20.5L3.5 13.5a5 5 0 0 1 7.07-7.07l7 7a5 5 0 0 1-7.07 7.07z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/>
    </svg>
  )
}
function IcoSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#959595" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}
function IcoUser() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
function IcoClock({ size = 20, color = '#002646' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}
function IcoStar({ filled = false }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#F5A623' : 'none'} stroke={filled ? '#F5A623' : '#ccc'} strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}
function IcoShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A569F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
    </svg>
  )
}
function DrugIcon({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/>
      <line x1="12" y1="7" x2="12" y2="12"/><line x1="12" y1="12" x2="5.5" y2="17"/><line x1="12" y1="12" x2="18.5" y2="17"/>
    </svg>
  )
}
function IcoChevronRight() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#002646" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}

function formatAcesso(isoString) {
  const date = new Date(isoString)
  const now = new Date()
  const hhmm = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const diffDays = Math.floor((now - date) / 86400000)
  if (diffDays === 0) return `Hoje, ${hhmm}`
  if (diffDays === 1) return `Ontem, ${hhmm}`
  return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}, ${hhmm}`
}

// ---- Desktop hub ----
function DesktopModoEmergencia({ navegar, fluxogramas, loading, isFavorited, addToFavorites, removeFromFavorites }) {
  const [busca, setBusca] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchRecentes, setSearchRecentes] = useState([])
  const [recentes, setRecentes] = useState([])
  const [elapsed, setElapsed] = useState('00:00:00')

  useEffect(() => {
    listAcessosRecentes().then(setRecentes).catch(() => {})
  }, [])

  useEffect(() => {
    const KEY = 'genesis_emergency_start'
    const tick = () => {
      const start = parseInt(localStorage.getItem(KEY), 10)
      if (!start) return
      const secs = Math.floor((Date.now() - start) / 1000)
      const h = String(Math.floor(secs / 3600)).padStart(2, '0')
      const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
      const s = String(secs % 60).padStart(2, '0')
      setElapsed(`${h}:${m}:${s}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const handleToggleFavorite = async (id) => {
    try {
      if (isFavorited(id)) await removeFromFavorites(id)
      else await addToFavorites(id)
    } catch {}
  }

  const protocolosFiltrados = PROTOCOLOS_SEARCH.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  )
  const showDropdown = searchFocused && (busca.length > 0 || searchRecentes.length > 0)

  return (
    <div className="proto-desktop">
      {/* Topbar */}
      <div className="pd-topbar">
        <div className="pd-topbar-left">
          <img src={GenesisLogoAlt} className="pd-logo" alt="Genesis" />
          <button className="pd-nav-btn" onClick={() => navegar('home')}><IcoHome /></button>
          <div className="pd-nav-active">
            <IcoHierarchy />
            <span>FLUXOGRAMAS</span>
          </div>
          <button className="pd-nav-btn" disabled style={{ opacity: 0.4, cursor: 'not-allowed' }}><IcoPill /></button>
        </div>
        <div className="pd-topbar-center">
          <div style={{ position: 'relative' }}>
            <div className="pd-search" style={{ borderRadius: showDropdown ? '15px 15px 0 0' : '15px' }}>
              <IcoSearch />
              <input
                type="text"
                placeholder="O que deseja saber?"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                onFocus={() => {
                  setSearchFocused(true)
                  listAcessosRecentes().then(d => setSearchRecentes(d.slice(0, 3))).catch(() => {})
                }}
                onBlur={() => setSearchFocused(false)}
                className="pd-search-input"
              />
            </div>
            {showDropdown && (
              <div className="pd-search-dropdown">
                {busca.length > 0 ? (
                  protocolosFiltrados.length === 0 ? (
                    <div className="pd-search-empty">Nenhum protocolo encontrado.</div>
                  ) : protocolosFiltrados.map(p => (
                    <button key={p.id} className="pd-search-item"
                      onMouseDown={e => { e.preventDefault(); navegar(p.id) }}
                    >{p.nome}</button>
                  ))
                ) : searchRecentes.length > 0 ? (
                  <>
                    <div className="pd-search-label">Acessos Recentes</div>
                    {searchRecentes.map((acesso, i) => {
                      const meta = protocoloMap[acesso.fluxograma_id]
                      if (!meta) return null
                      return (
                        <button key={i} className="pd-search-item"
                          onMouseDown={e => { e.preventDefault(); navegar(meta.destino) }}
                        >{acesso.titulo}</button>
                      )
                    })}
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
        <div className="pd-topbar-right">
          <button className="pd-nav-btn pd-user-btn"><IcoUser /></button>
        </div>
      </div>

      {/* Page header */}
      <div className="pd-page-header">
        <div className="pd-page-icon">
          <IcoHierarchy />
        </div>
        <div>
          <p className="pd-page-title">Modo Emergência</p>
          <p className="pd-page-subtitle">Selecione o Protocolo que deseja visualizar</p>
        </div>
      </div>

      {/* Body */}
      <div className="pd-body">
        {/* Main */}
        <div className="pd-main">
          <div className="pd-card" style={{ padding: '24px', flex: 'none' }}>
            {loading ? (
              <p style={{ fontSize: '14px', color: '#999', textAlign: 'center', padding: '24px 0' }}>Carregando...</p>
            ) : <div className="em-hub-grid">
              {fluxogramas.map(fluxo => {
                const meta = protocoloMap[fluxo.id]
                if (!meta) return null
                return (
                  <button
                    key={fluxo.id}
                    className="protocol-card em-hub-card"
                    onClick={() => navegar(meta.destino)}
                  >
                    <div className="protocol-icon" style={{ background: meta.color }}>
                      <img src={meta.image} alt={meta.label}
                        style={{ width: 28, height: 28, objectFit: 'contain' }} />
                    </div>
                    <span className="protocol-name" style={{ flex: 1, textAlign: 'left' }}>{meta.label}</span>
                    <div
                      onClick={e => { e.stopPropagation(); handleToggleFavorite(fluxo.id) }}
                      style={{ padding: '8px', display: 'flex', alignItems: 'center' }}
                    >
                      <IcoStar filled={isFavorited(fluxo.id)} />
                    </div>
                  </button>
                )
              })}
            </div>}
          </div>
        </div>

        {/* Sidebar */}
        <div className="pd-sidebar">
          {/* Últimos Acessados */}
          <div className="pd-card pd-sb-card">
            <div className="pd-sb-header">
              <div className="pd-sb-header-left">
                <IcoClock size={18} />
                <span className="pd-sb-title">Últimos Acessados</span>
              </div>
              <button className="pd-sb-link">Ver Todos</button>
            </div>
            <div className="pd-sb-list">
              {recentes.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#999', padding: '10px 14px' }}>Nenhum acesso ainda</p>
              ) : recentes.map((item, i) => {
                const meta = protocoloMap[item.fluxograma_id]
                return (
                  <button key={i} className="pd-sb-item pd-sb-item-btn"
                    onClick={() => meta && navegar(meta.destino)}>
                    <DrugIcon color={meta?.color ?? '#5B91C0'} />
                    <p className="pd-sb-item-label">{item.titulo}</p>
                    <p className="pd-sb-item-time">{formatAcesso(item.ultimo_acesso)}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Favoritos */}
          <div className="pd-card pd-sb-card">
            <div className="pd-sb-header">
              <div className="pd-sb-header-left">
                <IcoStar filled />
                <span className="pd-sb-title">Favoritos</span>
              </div>
              <button className="pd-sb-link">Editar</button>
            </div>
            <div className="pd-sb-list">
              {fluxogramas.filter(f => isFavorited(f.id)).length === 0 ? (
                <p style={{ fontSize: '12px', color: '#999', padding: '10px 14px' }}>Nenhum favorito ainda</p>
              ) : fluxogramas.filter(f => isFavorited(f.id)).map((f, i) => {
                const meta = protocoloMap[f.id]
                if (!meta) return null
                return (
                  <button key={i} className="pd-sb-item pd-sb-item-btn" onClick={() => navegar(meta.destino)}>
                    <DrugIcon color={meta.color} />
                    <p className="pd-sb-item-label" style={{ flex: 1 }}>{meta.label}</p>
                    <IcoStar filled />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Timer */}
          <div className="pd-card pd-sb-card pd-emergencia-card">
            <div className="pd-sb-header">
              <div className="pd-sb-header-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2BA880" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
                </svg>
                <span className="pd-sb-title">Modo Emergência</span>
              </div>
            </div>
            <div className="pd-emergencia-body">
              <div>
                <p className="pd-emergencia-label">Tempo ativo</p>
                <p className="pd-emergencia-timer">{elapsed}</p>
              </div>
              <IcoClock size={56} color="#2BA880" />
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="pd-card pd-acoes-card">
            <p className="pd-card-title">Ações Rápidas</p>
            <div className="pd-acoes-grid">
              {[
                { label: 'Calculadora',    sub: 'Cálculos rápidos de doses',     color: '#1B5DCA', bg: 'rgba(27,93,202,0.1)',  border: 'rgba(27,93,202,0.4)',  action: () => navegar('calculadora'), icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B5DCA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10" strokeWidth="3"/><line x1="12" y1="10" x2="12" y2="10" strokeWidth="3"/><line x1="16" y1="10" x2="16" y2="10" strokeWidth="3"/><line x1="8" y1="14" x2="8" y2="14" strokeWidth="3"/><line x1="12" y1="14" x2="12" y2="14" strokeWidth="3"/><line x1="16" y1="14" x2="16" y2="14" strokeWidth="3"/><line x1="8" y1="18" x2="13" y2="18"/></svg> },
                { label: 'Nova Conversão', sub: 'Iniciar uma nova conversão',     color: '#2BA880', bg: 'rgba(43,168,128,0.1)', border: 'rgba(43,168,128,0.4)', action: () => {},                     icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2BA880" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
                { label: 'Alertas',        sub: 'Ver alertas e contraindicações', color: '#D58B02', bg: 'rgba(250,173,31,0.1)', border: 'rgba(250,173,31,0.4)', action: () => {},                     icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D58B02" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
                { label: 'Protocolos',     sub: 'Ver todos os protocolos',        color: '#9317FF', bg: 'rgba(147,23,255,0.1)', border: 'rgba(147,23,255,0.4)', action: () => navegar('emergencia'), icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9317FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/><line x1="12" y1="7" x2="12" y2="12"/><line x1="12" y1="12" x2="5.5" y2="17"/><line x1="12" y1="12" x2="18.5" y2="17"/></svg> },
              ].map(({ label, sub, color, bg, border, action, icon }) => (
                <button key={label} className="pd-acao" onClick={action}>
                  <div className="pd-acao-icon" style={{ background: bg, border: `1px solid ${border}` }}>
                    {icon}
                  </div>
                  <div className="pd-acao-text">
                    <p className="pd-acao-label" style={{ color }}>{label}</p>
                    <p className="pd-acao-sub">{sub}</p>
                  </div>
                  <IcoChevronRight />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Main component ----
export default function ModoEmergencia({ navegar }) {
  const [fluxogramas, setFluxogramas] = useState([])
  const [loading, setLoading] = useState(true)
  const { favorites, isFavorited, addToFavorites, removeFromFavorites } = useFavorites()

  useEffect(() => {
    localStorage.setItem('genesis_emergency_start', Date.now().toString())
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
      if (isFavorited(id)) await removeFromFavorites(id)
      else await addToFavorites(id)
    } catch (err) {
      console.error('Erro:', err)
    }
  }

  const favoritos = fluxogramas.filter(f => isFavorited(f.id))
  const outros = fluxogramas.filter(f => !isFavorited(f.id))
  const todos = [...favoritos, ...outros]

  return (
    <>
      <DesktopModoEmergencia
        navegar={navegar}
        fluxogramas={todos}
        loading={loading}
        isFavorited={isFavorited}
        addToFavorites={addToFavorites}
        removeFromFavorites={removeFromFavorites}
      />

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
                      <img src={meta.image} alt={meta.label}
                        style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                    </div>
                    <span className="protocol-name">{meta.label}</span>
                    <div
                      onClick={(e) => { e.stopPropagation(); handleToggleFavorite(fluxo.id) }}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '8px', color: isFavorited(fluxo.id) ? '#1B6FD8' : '#999', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                    >
                      {isFavorited(fluxo.id) ? '★' : '☆'}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <BottomNav navegar={navegar} active="emergencia" />
      </div>
    </>
  )
}
