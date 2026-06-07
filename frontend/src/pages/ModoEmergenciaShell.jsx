import { useState, useEffect } from 'react'
import DengueIcon from '../assets/DengueIcon.png'
import SedacaoIcon from '../assets/SedacaoIcon.png'
import { fetchFluxogramas } from '../api/fluxogramas'
import { listAcessosRecentes, registrarAcesso } from '../api/acessos'
import { useFavorites } from '../hooks/useFavorites'
import { useFluxograma } from '../hooks/useFluxograma'

const PROTOCOLO_MAP = {
  1: { label: 'Dengue',  image: DengueIcon,  destino: 'dengue',  color: '#1B5DCA' },
  2: { label: 'Sedação', image: SedacaoIcon, destino: 'sedacao', color: '#504FA8' },
}

// ---- Icons ----
function IcoHierarchy({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/><line x1="12" y1="7" x2="12" y2="12"/><line x1="12" y1="12" x2="5.5" y2="17"/><line x1="12" y1="12" x2="18.5" y2="17"/></svg>
}
function IcoClock({ size = 20, color = '#002646' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function IcoStar({ filled = false }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#F5A623' : 'none'} stroke={filled ? '#F5A623' : '#ccc'} strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
}
function IcoShield() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A569F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
}
function DrugIcon({ color }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/><line x1="12" y1="7" x2="12" y2="12"/><line x1="12" y1="12" x2="5.5" y2="17"/><line x1="12" y1="12" x2="18.5" y2="17"/></svg>
}
function IcoChevronRight() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#002646" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
}
function IcoChevronDown({ color = 'currentColor' }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
}
function IcoArrowLeft() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#002646" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
}

function formatAcesso(isoString) {
  const date = new Date(isoString)
  const ddmmaaaa = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const hhmm = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${ddmmaaaa}, ${hhmm}`
}

// ---- Flowchart tree node (for tree-type protocols on desktop) ----
function FluxoNo({ no, depth = 0, isLast = false, lineColor }) {
  const [aberto, setAberto] = useState(false)
  const temFilhos = no.filhos && no.filhos.length > 0
  return (
    <div style={{ position: 'relative', marginTop: depth === 0 ? 0 : 20 }}>
      {depth > 0 && (
        <>
          <div style={{ position: 'absolute', left: -24, top: -20, height: isLast ? 44 : 'calc(100% + 20px)', width: 2, backgroundColor: lineColor, zIndex: 0 }} />
          <div style={{ position: 'absolute', left: -24, top: 24, width: 18, height: 2, backgroundColor: lineColor, zIndex: 0 }} />
          <div style={{ position: 'absolute', left: -8, top: 21, width: 8, height: 8, borderRadius: '50%', border: `2px solid ${lineColor}`, backgroundColor: '#F0F7FF', zIndex: 1 }} />
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

// ---- Desktop flowchart renderer ----
function DesktopFluxogramaView({ grupos, conteudo, titulo, navegar }) {
  const [abertas, setAbertas] = useState({})
  const toggle = (id) => setAbertas(prev => ({ ...prev, [id]: !prev[id] }))
  const isGrupos = conteudo?.tipo === 'grupos'
  const n = grupos.length

  if (!isGrupos && conteudo) {
    return (
      <div className="pd-fluxo">
        <button className="pd-back-btn" onClick={() => navegar('emergencia')}><IcoArrowLeft /></button>
        <div style={{ padding: '0 24px 28px' }}>
          <FluxoNo no={conteudo} depth={0} lineColor={conteudo.cor || '#5B91C0'} />
        </div>
      </div>
    )
  }

  return (
    <div className="pd-fluxo">
      <button className="pd-back-btn" onClick={() => navegar('emergencia')}><IcoArrowLeft /></button>
      <div className="pd-fluxo-body">
        <div className="pd-algo-title" style={{ background: conteudo?.rootColor || '#2A569F' }}>
          {titulo}
        </div>
        <div className="pd-connector-v" />
        <div className="pd-groups-row" style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, '--n': n }}>
          {grupos.map((grupo) => (
            <div key={grupo.id} className="pd-grupo-col">
              <div className="pd-col-connector-v" />
              <div className="pd-dot" style={{ borderColor: grupo.color }} />
              <button className="pd-grupo-btn" style={{ background: grupo.color }} onClick={() => toggle(grupo.id)}>
                <span>{grupo.label}</span>
                <span style={{ display: 'flex', transform: abertas[grupo.id] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <IcoChevronDown color="white" />
                </span>
              </button>
              {abertas[grupo.id] && (
                <div className="pd-drogas">
                  {grupo.drogas.map(droga => (
                    <button key={droga} className="pd-droga-pill" style={{ background: grupo.color }}>{droga}</button>
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

// ---- Hub grid (emergencia) ----
function HubContent({ navegar, fluxogramas, loading, isFavorited, onToggleFavorite }) {
  if (loading) return <p style={{ fontSize: 14, color: '#999', textAlign: 'center', padding: '24px 0' }}>Carregando...</p>
  return (
    <div className="em-hub-grid">
      {fluxogramas.map(fluxo => {
        const meta = PROTOCOLO_MAP[fluxo.id]
        if (!meta) return null
        return (
          <button key={fluxo.id} className="protocol-card em-hub-card" onClick={() => navegar(meta.destino)}>
            <div className="protocol-icon" style={{ background: meta.color }}>
              <img src={meta.image} alt={meta.label} style={{ width: 28, height: 28, objectFit: 'contain' }} />
            </div>
            <span className="protocol-name" style={{ flex: 1, textAlign: 'left' }}>{meta.label}</span>
            <div onClick={e => { e.stopPropagation(); onToggleFavorite(fluxo.id) }}
              style={{ padding: '8px', display: 'flex', alignItems: 'center' }}>
              <IcoStar filled={isFavorited(fluxo.id)} />
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ---- Protocol content (dengue/sedacao) ----
function ProtocolContent({ protocoloId, navegar }) {
  const { fluxo: data, loading, error } = useFluxograma(protocoloId)

  useEffect(() => {
    if (protocoloId) registrarAcesso(protocoloId).catch(() => {})
  }, [protocoloId])

  if (loading) return <p style={{ fontSize: 14, color: '#999', textAlign: 'center', padding: '24px 0' }}>Carregando...</p>
  if (error)   return <p style={{ fontSize: 14, color: '#d32f2f', textAlign: 'center', padding: '24px 0' }}>Erro: {error}</p>
  if (!data)   return null

  const grupos = data?.conteudo?.grupos || []

  return (
    <>
      <div className="pd-card pd-status-bar">
        <div className="pd-status-left">
          <div className="pd-status-icon-wrap"><IcoShield /></div>
          <div>
            <p className="pd-status-title">{data.titulo}</p>
            <p className="pd-status-sub">Utilize os protocolos abaixo para conversão rápida e segura</p>
          </div>
        </div>
        <div className="pd-status-badge">
          <span className="pd-status-dot" />
          Ativo
        </div>
      </div>
      <div className="pd-card pd-fluxo-card">
        <DesktopFluxogramaView grupos={grupos} conteudo={data.conteudo} titulo={data.titulo} navegar={navegar} />
      </div>
      <style>{`
        .card-protocolo { color:white; border-radius:16px; padding:16px 44px 16px 20px; font-size:13px; line-height:1.5; box-shadow:0 4px 12px rgba(0,0,0,0.08); white-space:pre-line; cursor:pointer; position:relative; }
        .pill-btn { color:white; border:none; border-radius:24px; padding:8px 24px; font-size:13px; font-weight:600; box-shadow:0 4px 8px rgba(0,0,0,0.1); }
        .arrow { position:absolute; right:16px; top:50%; transform:translateY(-50%); transition:transform 0.3s ease; }
        .arrow.open { transform:translateY(-50%) rotate(180deg); }
        .nested-content { padding-left:24px; animation:slideIn 0.3s ease-out; }
        @keyframes slideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </>
  )
}

// ---- Main shell ----
export default function DesktopFluxogramasShell({ tela, protocoloId, navegar }) {
  const [recentes, setRecentes] = useState([])
  const [elapsed, setElapsed] = useState('00:00:00')
  const [hubFluxogramas, setHubFluxogramas] = useState([])
  const [hubLoading, setHubLoading] = useState(true)
  const { isFavorited, addToFavorites, removeFromFavorites } = useFavorites()

  useEffect(() => {
    fetchFluxogramas()
      .then(data => setHubFluxogramas(data.resultados || data))
      .catch(() => {})
      .finally(() => setHubLoading(false))
  }, [])

  useEffect(() => {
    listAcessosRecentes().then(setRecentes).catch(() => {})
  }, [tela])

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

  const favoritos = hubFluxogramas.filter(f => isFavorited(f.id))
  const outros   = hubFluxogramas.filter(f => !isFavorited(f.id))
  const todos    = [...favoritos, ...outros]

  const isHub = tela === 'emergencia'
  const subtitle = isHub
    ? 'Selecione o Protocolo que deseja visualizar'
    : (PROTOCOLO_MAP[protocoloId]?.label ?? '')

  return (
    <div className="proto-desktop">
      {/* Page header */}
      <div className="pd-page-header">
        <div className="pd-page-icon"><IcoHierarchy size={22} /></div>
        <div>
          <p className="pd-page-title">Modo Emergência</p>
          <p className="pd-page-subtitle">{subtitle}</p>
        </div>
      </div>

      {/* Body */}
      <div className="pd-body">
        {/* Main — swaps, sidebar never unmounts */}
        <div className="pd-main">
          {isHub ? (
            <div className="pd-card" style={{ padding: '24px', flex: 'none' }}>
              <HubContent
                navegar={navegar}
                fluxogramas={todos}
                loading={hubLoading}
                isFavorited={isFavorited}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          ) : (
            <ProtocolContent protocoloId={protocoloId} navegar={navegar} />
          )}
        </div>

        {/* Sidebar — always mounted */}
        <div className="pd-sidebar">
          <div className="pd-card pd-sb-card">
            <div className="pd-sb-header">
              <div className="pd-sb-header-left">
                <IcoClock size={18} />
                <span className="pd-sb-title">Últimos Acessados</span>
              </div>
            </div>
            <div className="pd-sb-list">
              {recentes.length === 0
                ? <p style={{ fontSize: 12, color: '#999', padding: '10px 14px' }}>Nenhum acesso ainda</p>
                : recentes.map((item, i) => {
                    const meta = PROTOCOLO_MAP[item.fluxograma_id]
                    return (
                      <button key={i} className="pd-sb-item pd-sb-item-btn"
                        onClick={() => meta && navegar(meta.destino)}>
                        <div style={{ width: 32, height: 32, borderRadius: 6, background: meta?.color ?? '#2A569F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {meta?.image
                            ? <img src={meta.image} alt={item.titulo} style={{ width: 20, height: 20, objectFit: 'contain' }} />
                            : <DrugIcon color="white" />
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className="pd-sb-item-label">{item.titulo}</p>
                          <p className="pd-sb-item-time">{formatAcesso(item.ultimo_acesso)}</p>
                        </div>
                      </button>
                    )
                  })}
            </div>
          </div>

          <div className="pd-card pd-sb-card">
            <div className="pd-sb-header">
              <div className="pd-sb-header-left">
                <IcoStar filled />
                <span className="pd-sb-title">Favoritos</span>
              </div>
            </div>
            <div className="pd-sb-list">
              {favoritos.length === 0
                ? <p style={{ fontSize: 12, color: '#999', padding: '10px 14px' }}>Nenhum favorito ainda</p>
                : favoritos.map((f, i) => {
                    const meta = PROTOCOLO_MAP[f.id]
                    if (!meta) return null
                    return (
                      <button key={i} className="pd-sb-item pd-sb-item-btn" onClick={() => navegar(meta.destino)}>
                        <div style={{ width: 32, height: 32, borderRadius: 6, background: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <img src={meta.image} alt={meta.label} style={{ width: 20, height: 20, objectFit: 'contain' }} />
                        </div>
                        <p className="pd-sb-item-label" style={{ flex: 1 }}>{meta.label}</p>
                        <IcoStar filled />
                      </button>
                    )
                  })}
            </div>
          </div>

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
              <div style={{ width: 120 }}>
                <p className="pd-emergencia-label">Tempo ativo</p>
                <p className="pd-emergencia-timer">{elapsed}</p>
              </div>
              <IcoClock size={56} color="#2BA880" />
            </div>
          </div>

          <div className="pd-card pd-acoes-card">
            <p className="pd-card-title">Ações Rápidas</p>
            <div className="pd-acoes-grid">
              {[
                { label: 'Calculadora',        sub: 'Cálculos rápidos de doses',     color: '#1B5DCA', bg: 'rgba(27,93,202,0.1)',  border: 'rgba(27,93,202,0.4)',  action: () => navegar('calculadora'), hidden: true,  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B5DCA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10" strokeWidth="3"/><line x1="12" y1="10" x2="12" y2="10" strokeWidth="3"/><line x1="16" y1="10" x2="16" y2="10" strokeWidth="3"/><line x1="8" y1="14" x2="8" y2="14" strokeWidth="3"/><line x1="12" y1="14" x2="12" y2="14" strokeWidth="3"/><line x1="16" y1="14" x2="16" y2="14" strokeWidth="3"/><line x1="8" y1="18" x2="13" y2="18"/></svg> },
                { label: 'Nova Conversão',      sub: 'Iniciar uma nova conversão',     color: '#2BA880', bg: 'rgba(43,168,128,0.1)', border: 'rgba(43,168,128,0.4)', action: () => {},                     hidden: true,  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2BA880" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
                { label: 'Alertas',             sub: 'Ver alertas e contraindicações', color: '#D58B02', bg: 'rgba(250,173,31,0.1)', border: 'rgba(250,173,31,0.4)', action: () => {},                     hidden: true,  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D58B02" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
                { label: 'Todos os Protocolos', sub: 'Ver todos os protocolos',        color: '#9317FF', bg: 'rgba(147,23,255,0.1)', border: 'rgba(147,23,255,0.4)', action: () => navegar('emergencia'), hidden: false, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9317FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/><line x1="12" y1="7" x2="12" y2="12"/><line x1="12" y1="12" x2="5.5" y2="17"/><line x1="12" y1="12" x2="18.5" y2="17"/></svg> },
              ].filter(a => !a.hidden).map(({ label, sub, color, bg, border, action, icon }) => (
                <button key={label} className="pd-acao" onClick={action}>
                  <div className="pd-acao-icon" style={{ background: bg, border: `1px solid ${border}` }}>{icon}</div>
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
