import { useState, useRef, useEffect } from 'react'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import DownloadBtn from '../assets/DownloadBtn.png'
import VisualizarBtn from '../assets/VisualizarBtn.png'
import { useFavorites } from '../hooks/useFavorites'

const LINE_COLOR = '#A8C4DF'
const PILL_H = 38
const GAP_FILHOS = 14
const DOT_R = 4
const H_LINE = 24        // horizontal até bolinha do grupo
const H_LINE_FILHO = 20  // horizontal até bolinha do filho
const GAP_GRUPOS = 28

const grupos = [
  {
    id: 'sedativos',
    label: 'Sedativos',
    color: '#1B6FD8',
    drogas: ['Midazolan Contínua', 'Lorazepam'],
  },
  {
    id: 'analgésicos',
    label: 'Analgésicos',
    color: '#3D3190',
    drogas: ['Morfina Contínua', 'Fentanil Contínuo'],
  },
  {
    id: 'alfa2',
    label: 'Alfa-2',
    color: '#1A8C8C',
    drogas: ['Clonidina Contínua', 'Dexamedetomidina'],
  },
]

// Conectores dos filhos via SVG — não muda com expansão de outros grupos
function FilhosConectores({ drogas, color }) {
  const n = drogas.length
  const svgW = H_LINE_FILHO + DOT_R * 2 + 2
  const filhoY = (i) => i * (PILL_H + GAP_FILHOS) + PILL_H / 2
  const totalH = n * PILL_H + (n - 1) * GAP_FILHOS

  return (
    <div style={{ display: 'flex', marginTop: 10, marginLeft: 16, animation: 'fadeDown 0.2s ease' }}>
      {/* SVG com linha vertical + horizontais + bolinhas */}
      <svg width={svgW} height={totalH} style={{ flexShrink: 0, overflow: 'visible' }}>
        {/* Linha vertical: centro do 1º até centro do último */}
        <line
          x1={1} y1={filhoY(0)}
          x2={1} y2={filhoY(n - 1)}
          stroke={LINE_COLOR} strokeWidth={2}
        />
        {drogas.map((_, i) => {
          const cy = filhoY(i)
          return (
            <g key={i}>
              <line x1={1} y1={cy} x2={H_LINE_FILHO} y2={cy} stroke={LINE_COLOR} strokeWidth={2} />
              <circle cx={H_LINE_FILHO + DOT_R} cy={cy} r={DOT_R} fill="white" stroke={color} strokeWidth={2} />
            </g>
          )
        })}
      </svg>

      {/* Pills */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: GAP_FILHOS, marginLeft: 6 }}>
        {drogas.map((droga) => (
          <button key={droga} style={{
            background: color,
            color: 'white',
            border: 'none',
            borderRadius: 24,
            padding: '0 18px',
            height: PILL_H,
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {droga}
          </button>
        ))}
      </div>
    </div>
  )
}

function GrupoNode({ grupo, nodeRef }) {
  const [aberto, setAberto] = useState(false)

  return (
    <div ref={nodeRef} style={{ display: 'flex', alignItems: 'flex-start' }}>
      {/* Linha horizontal + bolinha antes do botão do grupo */}
      <svg
        width={H_LINE + DOT_R * 2 + 2}
        height={PILL_H}
        style={{ flexShrink: 0, overflow: 'visible' }}
      >
        <line x1={0} y1={PILL_H / 2} x2={H_LINE} y2={PILL_H / 2} stroke={LINE_COLOR} strokeWidth={2} />
        <circle cx={H_LINE + DOT_R} cy={PILL_H / 2} r={DOT_R} fill="white" stroke={grupo.color} strokeWidth={2} />
      </svg>

      {/* Botão + filhos */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button
          onClick={() => setAberto(a => !a)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'white',
            border: `2px solid ${grupo.color}`,
            borderRadius: 24,
            padding: '8px 16px',
            height: PILL_H,
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 14,
            fontWeight: 600,
            color: grupo.color,
            cursor: 'pointer',
            alignSelf: 'flex-start',
            lineHeight: 1,
            transition: 'box-shadow 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 0 3px ${grupo.color}22`}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
          {grupo.label}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke={grupo.color} strokeWidth={2.8}
            style={{ transition: 'transform 0.2s', transform: aberto ? 'rotate(180deg)' : 'rotate(0)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {aberto && <FilhosConectores drogas={grupo.drogas} color={grupo.color} />}
      </div>
    </div>
  )
}

export default function ProtocoloSedacao({ navegar }) {
  const FLUXO_ID = 2
  const { isFavorited, addToFavorites, removeFromFavorites } = useFavorites()
  const isFav = isFavorited(FLUXO_ID)

  const handleToggleFavorite = async () => {
    try {
      if (isFav) {
        await removeFromFavorites(FLUXO_ID)
      } else {
        await addToFavorites(FLUXO_ID)
      }
    } catch (err) {
      console.error('Erro ao atualizar favorito:', err)
    }
  }

  // refs para cada nó de grupo — para medir a posição real do último
  const nodeRefs = useRef(grupos.map(() => ({ current: null })))
  const containerRef = useRef(null)
  const [lineHeight, setLineHeight] = useState(0)

  // Recalcula a linha vertical sempre que o DOM mudar
  useEffect(() => {
    const recalc = () => {
      const container = containerRef.current
      if (!container) return
      const first = nodeRefs.current[0]?.current
      const last = nodeRefs.current[grupos.length - 1]?.current
      if (!first || !last) return

      const containerTop = container.getBoundingClientRect().top
      const firstTop = first.getBoundingClientRect().top
      const lastTop = last.getBoundingClientRect().top

      // linha vai do centro do 1º ao centro do último botão
      const start = firstTop - containerTop + PILL_H / 2
      const end = lastTop - containerTop + PILL_H / 2

      setLineHeight(end - start)
    }

    recalc()

    // Observa mudanças de tamanho no container (quando expande/colapsa)
    const obs = new ResizeObserver(recalc)
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  })

  // Calcula o top da linha (posição do centro do 1º grupo dentro do container)
  const lineTop = PILL_H / 2

  return (
    <div className="screen" style={{ position: 'relative' }}>
      <TopBar />

      <div className="content">
        <button className="back-btn" onClick={() => navegar('emergencia')}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Modo Emergência
        </button>

        {/* Nó raiz */}
        <div style={{
          background: '#1B6FD8',
          color: 'white',
          borderRadius: 12,
          padding: '14px 18px',
          fontSize: 15,
          fontWeight: 700,
          marginBottom: 32,
          boxShadow: '0 4px 16px rgba(27,111,216,0.18)',
          lineHeight: 1.35,
          textAlign: 'center',
        }}>
          Algoritmo de Conversão de Sedativos Analgésicos
        </div>

        {/* Árvore */}
        <div ref={containerRef} style={{ position: 'relative' }}>
          {/* Linha vertical principal — altura calculada dinamicamente */}
          <div style={{
            position: 'absolute',
            left: 1,
            top: lineTop,
            height: lineHeight,
            width: 2,
            background: LINE_COLOR,
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: GAP_GRUPOS }}>
            {grupos.map((grupo, i) => (
              <GrupoNode
                key={grupo.id}
                grupo={grupo}
                nodeRef={nodeRefs.current[i]}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* FABs */}
      <div className="fab-group">
        <button className="fab" title="Favoritar" onClick={handleToggleFavorite} style={{ fontSize: '20px', color: isFav ? '#1B6FD8' : '#999' }}>
          {isFav ? '★' : '☆'}
        </button>
        <button className="fab" title="Download">
          <img
           src={DownloadBtn}
           alt="Botão de Download"
           style={{ width: '20px', height: '20px', objectFit: 'contain' }}
          />
        </button>
        <button className="fab" title="Visualizar">
          <img
           src={VisualizarBtn}
           alt="Botão de Visualização"
           style={{ width: '20px', height: '20px', objectFit: 'contain' }}
          />
        </button>
      </div>

      <BottomNav navegar={navegar} active="emergencia" />
    </div>
  )
}