import { useState, useRef, useEffect } from 'react'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import { useFluxograma } from '../hooks/useFluxograma'
import { useFavorites } from '../hooks/useFavorites'
import { fetchCaso } from '../api/casos'

// Constantes
const LINE_COLOR_TREE   = '#8FA8C1'
const LINE_COLOR_GRUPOS = '#A8C4DF'
const PILL_H     = 38
const GAP_FILHOS = 14
const DOT_R      = 4
const H_LINE     = 24
const H_LINE_FILHO = 20
const GAP_GRUPOS = 28

const NIVEL_LABEL = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' }
const NIVEL_COLOR = { facil: '#2BA880', medio: '#D58B02', dificil: '#D94F4F' }
const NIVEL_BG    = { facil: 'rgba(43,168,128,0.14)', medio: 'rgba(213,139,2,0.14)', dificil: 'rgba(217,79,79,0.14)' }

// Renderiza fluxograma igual a Modo de Emergência
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

function FluxogramaView({ data }) {
  const nodeRefs = useRef([])
  const containerRef = useRef(null)
  const [lineHeight, setLineHeight] = useState(0)
  const grupos = data?.conteudo?.grupos || []
  const isGruposType = data?.conteudo?.tipo === 'grupos'

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

  return (
    <>
      <div style={{ background: data.conteudo.rootColor || '#1B6FD8', color: 'white', borderRadius: 12, padding: '14px 18px', fontSize: 15, fontWeight: 700, marginBottom: 32, boxShadow: '0 4px 16px rgba(27,111,216,0.18)', lineHeight: 1.35, textAlign: 'center' }}>
        {data.titulo}
      </div>
      {isGruposType ? (
        <div ref={containerRef} style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 1, top: PILL_H / 2, height: lineHeight, width: 2, background: LINE_COLOR_GRUPOS, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: GAP_GRUPOS }}>
            {grupos.map((grupo, i) => (
              <GrupoNode key={grupo.id} grupo={grupo} nodeRef={(ref) => { nodeRefs.current[i] = { current: ref } }} />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: '0 20px 0 24px' }}>
          <FluxoNo no={data.conteudo} lineColor={LINE_COLOR_TREE} />
        </div>
      )}
    </>
  )
}

// Card de caso
function CaseIcon() {
  return (
    <svg width="47" height="46" viewBox="0 0 47 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32.6138 3.83118C32.6138 4.80786 32.6138 5.2962 32.7437 5.75127C32.815 6.00126 32.915 6.24221 33.0416 6.46936C33.272 6.88287 33.6178 7.22818 34.3095 7.9188L38.1123 11.7159C38.804 12.4065 39.1498 12.7518 39.5639 12.9819C39.7914 13.1083 40.0327 13.2081 40.2831 13.2794C40.7389 13.4091 41.2279 13.4091 42.2061 13.4091" stroke="#1B5DCA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22.4327 13.4091L12.9789 22.8487C10.9361 24.8884 9.91478 25.9082 9.67133 27.1303C9.56594 27.6593 9.56594 28.2039 9.67133 28.733C9.91478 29.9551 10.9361 30.9749 12.9789 33.0145C15.0216 35.0542 16.0429 36.074 17.2668 36.3171C17.7967 36.4223 18.3421 36.4223 18.872 36.3171C20.0959 36.074 21.1172 35.0542 23.16 33.0145L32.6138 23.5749" stroke="#1B5DCA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21.103 11.4935L34.5323 24.9026" stroke="#1B5DCA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15.3477 35.701L13.1041 37.3012C12.2012 37.9452 11.7497 38.2672 11.2546 38.3061C11.0625 38.3212 10.8694 38.3052 10.6824 38.2588C10.2005 38.1391 9.80815 37.7474 9.02351 36.9639C8.23888 36.1805 7.84656 35.7888 7.7267 35.3075C7.68022 35.1209 7.66423 34.928 7.67935 34.7363C7.71834 34.2419 8.04082 33.7911 8.68579 32.8895L10.2883 30.6493" stroke="#1B5DCA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M25.8992 15.3247L35.4915 7.66235M30.6953 20.1136L38.3692 10.5357" stroke="#1B5DCA" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M8.63307 37.3539L3.83691 42.1428" stroke="#1B5DCA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const NIVEL_BADGE = {
  facil:   { label: 'Básico',  color: '#2BA880', bg: '#DCFDDA' },
  medio:   { label: 'Médio',   color: '#D58B02', bg: 'rgba(213,139,2,0.14)' },
  dificil: { label: 'Difícil', color: '#D94F4F', bg: 'rgba(217,79,79,0.14)' },
}

function CaseCard({ caso, onIniciar }) {
  const badge = NIVEL_BADGE[caso.nivel]
  return (
    <div style={{ background: 'white', border: '1px solid rgba(27,93,202,0.6)', borderRadius: 10, padding: '24px 23px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <CaseIcon />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#2A569F', lineHeight: 1.4 }}>Caso Clínico</p>
        {badge && (
          <span style={{ display: 'inline-flex', alignItems: 'center', background: badge.bg, color: badge.color, borderRadius: 5, padding: '3px 8px', fontSize: 10, fontWeight: 500, height: 20, flexShrink: 0, marginLeft: 8 }}>
            {badge.label}
          </span>
        )}
      </div>

      <p style={{ margin: '0 0 16px', fontSize: 10, fontWeight: 500, color: 'rgba(0,38,70,0.55)', fontFamily: 'Montserrat, sans-serif', textAlign: 'left', lineHeight: 1.5 }}>
        {caso.descricao}
      </p>

      <button
        onClick={onIniciar}
        style={{ background: '#408BD1', color: 'white', border: 'none', borderRadius: 5, height: 28, fontSize: 10, fontWeight: 500, cursor: 'pointer', width: '100%', transition: 'opacity 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        Iniciar Caso
      </button>
    </div>
  )
}

// Componente
export default function EstudoProtocolo({ casoId, navegar }) {
  const [caso, setCaso] = useState(null)
  const [casoLoading, setCasoLoading] = useState(true)
  const [casoError, setCasoError] = useState(null)

  useEffect(() => {
    if (!casoId) return
    fetchCaso(casoId)
      .then(setCaso)
      .catch(err => setCasoError(err.message))
      .finally(() => setCasoLoading(false))
  }, [casoId])

  const { fluxo, loading: fluxoLoading } = useFluxograma(caso?.fluxograma ?? null)
  const { isFavorited, addToFavorites, removeFromFavorites } = useFavorites()

  const loading = casoLoading || (caso?.fluxograma && fluxoLoading)

  const handleToggleFavorite = async () => {
    if (!caso?.fluxograma) return
    try {
      if (isFavorited(caso.fluxograma)) await removeFromFavorites(caso.fluxograma)
      else await addToFavorites(caso.fluxograma)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return (
    <div className="screen proto-mobile">
      <TopBar />
      <div className="content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Carregando...</div>
      <BottomNav navegar={navegar} active="estudo" />
    </div>
  )

  if (casoError) return (
    <div className="screen proto-mobile">
      <TopBar />
      <div className="content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#d32f2f' }}>Erro: {casoError}</div>
      <BottomNav navegar={navegar} active="estudo" />
    </div>
  )

  return (
    <div className="screen proto-mobile">
      <TopBar />
      <div className="content">
        <button className="back-btn" onClick={() => navegar('estudo')}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Modo de Estudo
        </button>

        {fluxo && <FluxogramaView data={fluxo} />}

        {caso && (
          <div style={{ marginTop: fluxo ? 32 : 0, marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 200 }}>
              <CaseCard caso={caso} onIniciar={() => navegar('estudo-questoes', casoId)} />
            </div>
          </div>
        )}
      </div>
      {fluxo && caso?.fluxograma && (
        <div className="fab-group" style={{ position: 'absolute', right: '20px', bottom: '100px', zIndex: 999 }}>
          <button className="fab" title="Favoritar" onClick={handleToggleFavorite}
            style={{ fontSize: '20px', color: isFavorited(caso.fluxograma) ? '#1B6FD8' : '#999' }}>
            {isFavorited(caso.fluxograma) ? '★' : '☆'}
          </button>
        </div>
      )}
      <style>{`
        .card-protocolo { color:white; border-radius:16px; padding:16px 44px 16px 20px; font-size:13px; line-height:1.5; box-shadow:0 4px 12px rgba(0,0,0,0.08); white-space:pre-line; cursor:pointer; position:relative; }
        .pill-btn { color:white; border:none; border-radius:24px; padding:8px 24px; font-size:13px; font-weight:600; box-shadow:0 4px 8px rgba(0,0,0,0.1); }
        .arrow { position:absolute; right:16px; top:50%; transform:translateY(-50%); transition:transform 0.3s ease; }
        .arrow.open { transform:translateY(-50%) rotate(180deg); }
        .nested-content { padding-left:24px; animation:slideIn 0.3s ease-out; }
        @keyframes slideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <BottomNav navegar={navegar} active="estudo" />
    </div>
  )
}
