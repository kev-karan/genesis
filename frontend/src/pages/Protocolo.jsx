import { useState, useRef, useEffect } from 'react'
import TopBar from '../components/TopBar'
import { useFavorites } from '../hooks/useFavorites'
import { useFluxograma } from '../hooks/useFluxograma'

// ---- Mobile constants ----
const LINE_COLOR_TREE = '#8FA8C1'
const LINE_COLOR_GRUPOS = '#A8C4DF'
const PILL_H = 38
const GAP_FILHOS = 14
const DOT_R = 4
const H_LINE = 24
const H_LINE_FILHO = 20
const GAP_GRUPOS = 28

// ---- Mobile: tree protocol ----
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

// ---- Mobile: grupos protocol ----
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
          <button key={droga} style={{ background: color, color: 'white', border: 'none', borderRadius: 24, padding: '0 18px', height: PILL_H, fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.15s' }}
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
        <button onClick={() => setAberto(a => !a)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'white', border: `2px solid ${grupo.color}`, borderRadius: 24, padding: '8px 16px', height: PILL_H, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, color: grupo.color, cursor: 'pointer', alignSelf: 'flex-start', lineHeight: 1, transition: 'box-shadow 0.15s' }}
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

// ---- Main component (mobile only) ----
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
      <div className="content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Carregando...</div>
    </div>
  )

  if (error) return (
    <div className="screen proto-mobile">
      <TopBar />
      <div className="content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Erro ao carregar: {error}</div>
    </div>
  )

  const lineTop = PILL_H / 2

  return (
    <div className="screen proto-mobile" style={{ position: 'relative' }}>
      <TopBar />
      <div className="content">
        <button className="back-btn" onClick={() => navegar('emergencia')}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Modo Emergência
        </button>
        <div style={{ background: data.conteudo.rootColor || '#1B6FD8', color: 'white', borderRadius: 12, padding: '14px 18px', fontSize: 15, fontWeight: 700, marginBottom: 32, boxShadow: '0 4px 16px rgba(27,111,216,0.18)', lineHeight: 1.35, textAlign: 'center' }}>
          {data.titulo}
        </div>
        {isGruposType ? (
          <div ref={containerRef} style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 1, top: lineTop, height: lineHeight, width: 2, background: LINE_COLOR_GRUPOS, pointerEvents: 'none' }} />
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
    </div>
  )
}
