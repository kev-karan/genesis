import { useState, useRef, useEffect } from 'react'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import DownloadBtn from '../assets/DownloadBtn.png'
import GenesisLogo from '../assets/GenesisLogoAlt.png'
import { useFavorites } from '../hooks/useFavorites'
import { useFluxograma } from '../hooks/useFluxograma'
import { registrarAcesso, listAcessosRecentes } from '../api/acessos'

// ---- Mobile constants ----
const LINE_COLOR_TREE = '#8FA8C1'
const LINE_COLOR_GRUPOS = '#A8C4DF'
const PILL_H = 38
const GAP_FILHOS = 14
const DOT_R = 4
const H_LINE = 24
const H_LINE_FILHO = 20
const GAP_GRUPOS = 28

// ---- Mobile: tree protocol (Dengue) ----
function FluxoNo({ no, depth = 0, isLast = false, lineColor }) {
  const [aberto, setAberto] = useState(false)
  const temFilhos = no.filhos && no.filhos.length > 0

  return (
    <div style={{ position: 'relative', marginTop: depth === 0 ? 0 : 20 }}>
      {depth > 0 && (
        <>
          <div style={{
            position: 'absolute', left: -24, top: -20,
            height: isLast ? 44 : 'calc(100% + 20px)',
            width: 2, backgroundColor: lineColor, zIndex: 0
          }} />
          <div style={{
            position: 'absolute', left: -24, top: 24,
            width: 18, height: 2, backgroundColor: lineColor, zIndex: 0
          }} />
          <div style={{
            position: 'absolute', left: -8, top: 21,
            width: 8, height: 8, borderRadius: '50%',
            border: `2px solid ${lineColor}`, backgroundColor: '#F0F7FF', zIndex: 1
          }} />
        </>
      )}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {no.pill ? (
          <div style={{ display: 'flex' }}>
            <button className="pill-btn" style={{ background: no.cor }}>{no.texto}</button>
          </div>
        ) : (
          <div onClick={() => temFilhos && setAberto(!aberto)} className="card-protocolo" style={{ background: no.cor }}>
            {no.texto}
            {temFilhos && (
              <div className={`arrow ${aberto ? 'open' : ''}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
      {aberto && temFilhos && (
        <div className="nested-content">
          {no.filhos.map((filho, idx) => (
            <FluxoNo key={filho.id} no={filho} depth={depth + 1} isLast={idx === no.filhos.length - 1} lineColor={lineColor} />
          ))}
        </div>
      )}
    </div>
  )
}

// ---- Mobile: grupos protocol (Sedação) ----
function FilhosConectores({ drogas, color }) {
  const n = drogas.length
  const svgW = H_LINE_FILHO + DOT_R * 2 + 2
  const filhoY = (i) => i * (PILL_H + GAP_FILHOS) + PILL_H / 2
  const totalH = n * PILL_H + (n - 1) * GAP_FILHOS

  return (
    <div style={{ display: 'flex', marginTop: 10, marginLeft: 16, animation: 'fadeDown 0.2s ease' }}>
      <svg width={svgW} height={totalH} style={{ flexShrink: 0, overflow: 'visible' }}>
        <line x1={1} y1={filhoY(0)} x2={1} y2={filhoY(n - 1)} stroke={LINE_COLOR_GRUPOS} strokeWidth={2} />
        {drogas.map((_, i) => {
          const cy = filhoY(i)
          return (
            <g key={i}>
              <line x1={1} y1={cy} x2={H_LINE_FILHO} y2={cy} stroke={LINE_COLOR_GRUPOS} strokeWidth={2} />
              <circle cx={H_LINE_FILHO + DOT_R} cy={cy} r={DOT_R} fill="white" stroke={color} strokeWidth={2} />
            </g>
          )
        })}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: GAP_FILHOS, marginLeft: 6 }}>
        {drogas.map((droga) => (
          <button key={droga} style={{
            background: color, color: 'white', border: 'none', borderRadius: 24,
            padding: '0 18px', height: PILL_H, fontFamily: 'DM Sans, sans-serif',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >{droga}</button>
        ))}
      </div>
    </div>
  )
}

function GrupoNode({ grupo, nodeRef }) {
  const [aberto, setAberto] = useState(false)

  return (
    <div ref={nodeRef} style={{ display: 'flex', alignItems: 'flex-start' }}>
      <svg width={H_LINE + DOT_R * 2 + 2} height={PILL_H} style={{ flexShrink: 0, overflow: 'visible' }}>
        <line x1={0} y1={PILL_H / 2} x2={H_LINE} y2={PILL_H / 2} stroke={LINE_COLOR_GRUPOS} strokeWidth={2} />
        <circle cx={H_LINE + DOT_R} cy={PILL_H / 2} r={DOT_R} fill="white" stroke={grupo.color} strokeWidth={2} />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button onClick={() => setAberto(a => !a)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, background: 'white',
          border: `2px solid ${grupo.color}`, borderRadius: 24, padding: '8px 16px', height: PILL_H,
          fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, color: grupo.color,
          cursor: 'pointer', alignSelf: 'flex-start', lineHeight: 1, transition: 'box-shadow 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 0 3px ${grupo.color}22`}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
          {grupo.label}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={grupo.color} strokeWidth={2.8}
            style={{ transition: 'transform 0.2s', transform: aberto ? 'rotate(180deg)' : 'rotate(0)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {aberto && <FilhosConectores drogas={grupo.drogas} color={grupo.color} />}
      </div>
    </div>
  )
}


const PROTOCOLO_META = {
  1: { label: 'Protocolo Dengue',  color: '#1B5DCA', destino: 'dengue' },
  2: { label: 'Protocolo Sedação', color: '#504FA8', destino: 'sedacao' },
}

// ---- Desktop: inline SVG icons ----
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
function IcoGear() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}
function IcoHeart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
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
function IcoShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A569F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
    </svg>
  )
}
function IcoChevronDown({ color = 'currentColor' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
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
function IcoArrowLeft() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#002646" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
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
function IcoInfo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1B5DCA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
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

// ---- Desktop: flowchart ----
function DesktopFluxograma({ grupos, titulo, rootColor, conteudo, navegar }) {
  const [abertas, setAbertas] = useState({})
  const toggle = (id) => setAbertas(prev => ({ ...prev, [id]: !prev[id] }))
  const isGrupos = conteudo?.tipo === 'grupos'
  const n = grupos.length

  if (!isGrupos && conteudo) {
    return (
      <div className="pd-fluxo">
        <button className="pd-back-btn" onClick={() => navegar('emergencia')}>
          <IcoArrowLeft />
        </button>
        <div style={{ padding: '0 24px 28px' }}>
          <FluxoNo no={conteudo} depth={0} lineColor={conteudo.cor || '#5B91C0'} />
        </div>
      </div>
    )
  }

  return (
    <div className="pd-fluxo">
      <button className="pd-back-btn" onClick={() => navegar('emergencia')}>
        <IcoArrowLeft />
      </button>

      <div className="pd-fluxo-body">
        <div className="pd-algo-title" style={{ background: rootColor || '#2A569F' }}>
          {titulo}
        </div>
        <div className="pd-connector-v" />
        <div className="pd-groups-row" style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, '--n': n }}>
          {grupos.map((grupo) => (
            <div key={grupo.id} className="pd-grupo-col">
              <div className="pd-col-connector-v" />
              <div className="pd-dot" style={{ borderColor: grupo.color }} />
              <button
                className="pd-grupo-btn"
                style={{ background: grupo.color }}
                onClick={() => toggle(grupo.id)}
              >
                <span>{grupo.label}</span>
                <span style={{ display: 'flex', transform: abertas[grupo.id] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <IcoChevronDown color="white" />
                </span>
              </button>
              {abertas[grupo.id] && (
                <div className="pd-drogas">
                  {grupo.drogas.map(droga => (
                    <button key={droga} className="pd-droga-pill" style={{ background: grupo.color }}>
                      {droga}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---- Desktop: full layout ----
function formatAcesso(isoString) {
  const date = new Date(isoString)
  const now = new Date()
  const hhmm = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const diffDays = Math.floor((now - date) / 86400000)
  if (diffDays === 0) return `Hoje, ${hhmm}`
  if (diffDays === 1) return `Ontem, ${hhmm}`
  return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}, ${hhmm}`
}

const PROTOCOLOS_SEARCH = [
  { id: 'emergencia', nome: 'Modo Emergência' },
  { id: 'dengue',     nome: 'Protocolo de Dengue' },
  { id: 'sedacao',    nome: 'Protocolo de Sedação' },
  { id: 'calculadora',nome: 'Calculadora de Doses' },
]

function DesktopProtocolo({ grupos, titulo, rootColor, conteudo, navegar, protocoloId }) {
  const { favorites } = useFavorites()
  const [recentes, setRecentes] = useState([])
  const [busca, setBusca] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchRecentes, setSearchRecentes] = useState([])
  const [elapsed, setElapsed] = useState('00:00:00')

  useEffect(() => {
    registrarAcesso(protocoloId).catch(() => {})
    listAcessosRecentes().then(setRecentes).catch(() => {})
  }, [protocoloId])

  useEffect(() => {
    const KEY = 'genesis_emergency_start'
    const tick = () => {
      const start = parseInt(localStorage.getItem(KEY), 10)
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

  const protocolosFiltrados = PROTOCOLOS_SEARCH.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  )
  const showDropdown = searchFocused && (busca.length > 0 || searchRecentes.length > 0)

  return (
    <div className="proto-desktop">
      {/* Top bar */}
      <div className="pd-topbar">
        <div className="pd-topbar-left">
          <img src={GenesisLogo} className="pd-logo" alt="Genesis" />
          <button className="pd-nav-btn" onClick={() => navegar('home')}><IcoHome /></button>
          <div className="pd-nav-active">
            <IcoHierarchy />
            <span>FLUXOGRAMAS</span>
          </div>
          <button className="pd-nav-btn" onClick={() => navegar('calculadora')}><IcoPill /></button>
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
                  <button
                    key={p.id}
                    className="pd-search-item"
                    onMouseDown={e => { e.preventDefault(); navegar(p.id) }}
                  >{p.nome}</button>
                ))
              ) : searchRecentes.length > 0 ? (<>
                  <div className="pd-search-label">Acessos Recentes</div>
                  {searchRecentes.map((acesso, i) => {
                    const meta = PROTOCOLO_META[acesso.fluxograma_id]
                    if (!meta) return null
                    return (
                      <button
                        key={i}
                        className="pd-search-item"
                        onMouseDown={e => { e.preventDefault(); navegar(meta.destino) }}
                      >{acesso.titulo}</button>
                    )
                  })}
                </>) : null}
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
          <p className="pd-page-subtitle">{titulo}</p>
        </div>
      </div>

      {/* Two-column body */}
      <div className="pd-body">
        {/* Left main */}
        <div className="pd-main">
          {/* Status bar card */}
          <div className="pd-card pd-status-bar">
            <div className="pd-status-left">
              <div className="pd-status-icon-wrap">
                <IcoShield />
              </div>
              <div>
                <p className="pd-status-title">{titulo}</p>
                <p className="pd-status-sub">Utilize os protocolos abaixo para conversão rápida e segura</p>
              </div>
            </div>
            <div className="pd-status-badge">
              <span className="pd-status-dot" />
              Ativo
            </div>
          </div>

          {/* Flowchart card */}
          <div className="pd-card pd-fluxo-card">
            <DesktopFluxograma grupos={grupos} titulo={titulo} rootColor={rootColor} conteudo={conteudo} navegar={navegar} />
          </div>

        </div>

        {/* Right sidebar */}
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
                const meta = PROTOCOLO_META[item.fluxograma_id]
                return (
                  <button key={i} className="pd-sb-item pd-sb-item-btn" onClick={() => meta && navegar(meta.destino)}>
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
              {favorites.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#999', padding: '10px 14px' }}>Nenhum favorito ainda</p>
              ) : favorites.map((fav, i) => {
                const meta = PROTOCOLO_META[fav.fluxograma_id]
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

          {/* Modo Emergência timer */}
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

          {/* Quick actions card */}
          <div className="pd-card pd-acoes-card">
            <p className="pd-card-title">Ações Rápidas</p>
            <div className="pd-acoes-grid">
              {[
                { label: 'Calculadora',    sub: 'Cálculos rápidos de doses',         color: '#1B5DCA', bg: 'rgba(27,93,202,0.1)',   border: 'rgba(27,93,202,0.4)',   action: () => navegar('calculadora'),  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B5DCA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10" strokeWidth="3"/><line x1="12" y1="10" x2="12" y2="10" strokeWidth="3"/><line x1="16" y1="10" x2="16" y2="10" strokeWidth="3"/><line x1="8" y1="14" x2="8" y2="14" strokeWidth="3"/><line x1="12" y1="14" x2="12" y2="14" strokeWidth="3"/><line x1="16" y1="14" x2="16" y2="14" strokeWidth="3"/><line x1="8" y1="18" x2="13" y2="18"/></svg> },
                { label: 'Nova Conversão', sub: 'Iniciar uma nova conversão',         color: '#2BA880', bg: 'rgba(43,168,128,0.1)',  border: 'rgba(43,168,128,0.4)',  action: () => {},                      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2BA880" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
                { label: 'Alertas',        sub: 'Ver alertas e contraindicações',     color: '#D58B02', bg: 'rgba(250,173,31,0.1)',  border: 'rgba(250,173,31,0.4)',  action: () => {},                      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D58B02" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
                { label: 'Protocolos',     sub: 'Ver todos os protocolos',            color: '#9317FF', bg: 'rgba(147,23,255,0.1)',  border: 'rgba(147,23,255,0.4)',  action: () => navegar('emergencia'),   icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9317FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/><line x1="12" y1="7" x2="12" y2="12"/><line x1="12" y1="12" x2="5.5" y2="17"/><line x1="12" y1="12" x2="18.5" y2="17"/></svg> },
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
export default function Protocolo({ protocoloId, navegar }) {
  const { fluxo: data, loading, error } = useFluxograma(protocoloId)
  const { isFavorited, addToFavorites, removeFromFavorites } = useFavorites()
  const isFav = isFavorited(protocoloId)

  const nodeRefs = useRef([])
  const containerRef = useRef(null)
  const [lineHeight, setLineHeight] = useState(0)

  const grupos = data?.conteudo?.grupos || []
  const isGruposType = data?.conteudo?.tipo === 'grupos'

  const handleToggleFavorite = async () => {
    try {
      if (isFav) await removeFromFavorites(protocoloId)
      else await addToFavorites(protocoloId)
    } catch (err) {
      console.error('Erro ao atualizar favorito:', err)
    }
  }

  useEffect(() => {
    if (!isGruposType) return
    const recalc = () => {
      const container = containerRef.current
      if (!container) return
      const first = nodeRefs.current[0]?.current
      const last = nodeRefs.current[grupos.length - 1]?.current
      if (!first || !last) return
      const containerTop = container.getBoundingClientRect().top
      const firstTop = first.getBoundingClientRect().top
      const lastTop = last.getBoundingClientRect().top
      setLineHeight(lastTop - containerTop + PILL_H / 2 - (firstTop - containerTop + PILL_H / 2) + PILL_H / 2 - PILL_H / 2)
    }
    recalc()
    const obs = new ResizeObserver(recalc)
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [isGruposType, grupos.length])

  if (loading) return (
    <div className="screen proto-mobile">
      <TopBar />
      <div className="content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        Carregando...
      </div>
      <BottomNav navegar={navegar} active="emergencia" />
    </div>
  )

  if (error) return (
    <div className="screen proto-mobile">
      <TopBar />
      <div className="content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        Erro ao carregar: {error}
      </div>
      <BottomNav navegar={navegar} active="emergencia" />
    </div>
  )

  const lineTop = PILL_H / 2

  return (
    <>
      {data && (
        <DesktopProtocolo
          grupos={grupos}
          titulo={data.titulo}
          rootColor={data.conteudo?.rootColor}
          conteudo={data.conteudo}
          navegar={navegar}
          protocoloId={protocoloId}
        />
      )}

      <div className={`screen${data ? ' proto-mobile' : ''}`} style={{ position: 'relative' }}>
        <TopBar />

        <div className="content" style={data ? {} : { position: 'relative', zIndex: 1, flex: 1, overflowY: 'auto' }}>
          <button className="back-btn" onClick={() => navegar('emergencia')}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Modo Emergência
          </button>

          <div style={{
            background: data.conteudo.rootColor || '#1B6FD8', color: 'white', borderRadius: 12,
            padding: '14px 18px', fontSize: 15, fontWeight: 700, marginBottom: 32,
            boxShadow: '0 4px 16px rgba(27,111,216,0.18)', lineHeight: 1.35, textAlign: 'center',
          }}>
            {data.titulo}
          </div>

          {isGruposType ? (
            <div ref={containerRef} style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: 1, top: lineTop,
                height: lineHeight, width: 2, background: LINE_COLOR_GRUPOS, pointerEvents: 'none',
              }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: GAP_GRUPOS }}>
                {grupos.map((grupo, i) => (
                  <GrupoNode key={grupo.id} grupo={grupo} nodeRef={(ref) => { nodeRefs.current[i] = { current: ref } }} />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '0 20px 120px 24px' }}>
              <FluxoNo no={data.conteudo} lineColor={LINE_COLOR_TREE} />
            </div>
          )}
        </div>

        <div className="fab-group" style={{ position: 'absolute', right: '20px', bottom: '100px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="fab" title="Favoritar" onClick={handleToggleFavorite} style={{ fontSize: '20px', color: isFav ? '#1B6FD8' : '#999' }}>
            {isFav ? '★' : '☆'}
          </button>
        </div>

        <style>{`
          .card-protocolo { color:white; border-radius:16px; padding:16px 44px 16px 20px; font-size:13px; line-height:1.5; box-shadow:0 4px 12px rgba(0,0,0,0.08); white-space:pre-line; cursor:pointer; position:relative; }
          .pill-btn { color:white; border:none; border-radius:24px; padding:8px 24px; font-size:13px; font-weight:600; box-shadow:0 4px 8px rgba(0,0,0,0.1); }
          .arrow { position:absolute; right:16px; top:50%; transform:translateY(-50%); transition:transform 0.3s ease; }
          .arrow.open { transform:translateY(-50%) rotate(180deg); }
          .nested-content { padding-left:24px; animation:slideIn 0.3s ease-out; }
          @keyframes slideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
          @keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        `}</style>

        <BottomNav navegar={navegar} active="emergencia" />
      </div>
    </>
  )
}
