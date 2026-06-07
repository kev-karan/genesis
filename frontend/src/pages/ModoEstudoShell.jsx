import { useState, useEffect, useRef } from 'react'
import { fetchCasos, fetchCaso, responderCaso } from '../api/casos'
import { listAcessosRecentes, registrarAcesso } from '../api/acessos'
import { useFavorites } from '../hooks/useFavorites'
import { useFluxograma } from '../hooks/useFluxograma'
import DengueIcon from '../assets/DengueIcon.png'
import SedacaoIcon from '../assets/SedacaoIcon.png'

function formatAcesso(isoString) {
  const date = new Date(isoString)
  const ddmmaaaa = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const hhmm = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${ddmmaaaa}, ${hhmm}`
}

// Toggle Responsividade (1500px)
function ToggleSidebarCard({ title, icon, children }) {
  const [expanded, setExpanded] = useState(() => window.innerWidth > 1500)

  return (
    <div className={`pd-card pd-sb-card pd-sb-toggle ${expanded ? 'is-expanded' : ''}`}>
      <button
        className="pd-sb-header"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
      >
        <div className="pd-sb-header-left">
          {icon}
          <span className="pd-sb-title">{title}</span>
        </div>
        <div className={`pd-sb-toggle-arrow ${expanded ? 'is-expanded' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#002646" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>
      <div className="pd-sb-toggle-content">
        {children}
      </div>
    </div>
  )
}

// ---- Constants ----
const NIVEL_BADGE = {
  facil:   { label: 'Básico',  color: '#2BA880', bg: '#DCFDDA' },
  medio:   { label: 'Médio',   color: '#D58B02', bg: 'rgba(213,139,2,0.14)' },
  dificil: { label: 'Difícil', color: '#D94F4F', bg: 'rgba(217,79,79,0.14)' },
}
const FLUXOGRAMA_ICON = {
  1: { image: DengueIcon,  color: '#1B5DCA' },
  2: { image: SedacaoIcon, color: '#504FA8' },
}
const LINE_COLOR_TREE   = '#8FA8C1'
const LINE_COLOR_GRUPOS = '#A8C4DF'
const PILL_H = 38, GAP_FILHOS = 14, DOT_R = 4, H_LINE = 24, H_LINE_FILHO = 20, GAP_GRUPOS = 28

// ---- Icons ----
function IcoBook({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}
function IcoStar({ filled = false }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#F5A623' : 'none'} stroke={filled ? '#F5A623' : '#ccc'} strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
}
function IcoArrowLeft() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#002646" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
}
function IcoChevronRight() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#002646" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
}
function IcoCheck({ size = 28, color = '#16A34A' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}

// ---- Fluxograma components (ported from EstudoProtocolo) ----
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
          <button key={droga}
            style={{ background: color, color: 'white', border: 'none', borderRadius: 24, padding: '0 18px', height: PILL_H, fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.15s' }}
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
        <button
          onClick={() => setAberto(a => !a)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'white', border: `2px solid ${grupo.color}`, borderRadius: 24, padding: '8px 16px', height: PILL_H, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, color: grupo.color, cursor: 'pointer', alignSelf: 'flex-start', lineHeight: 1, transition: 'box-shadow 0.15s' }}
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

function FluxoTreeNo({ no, depth = 0, isLast = false, lineColor }) {
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
            <FluxoTreeNo key={filho.id} no={filho} depth={depth + 1} isLast={idx === no.filhos.length - 1} lineColor={lineColor} />
          ))}
        </div>
      )}
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
      const firstTop = first.getBoundingClientRect().top
      const lastTop = last.getBoundingClientRect().top
      setLineHeight(lastTop - firstTop)
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
          <FluxoTreeNo no={data.conteudo} lineColor={LINE_COLOR_TREE} />
        </div>
      )}
    </>
  )
}

// ---- Case list hub ----
function CasosHub({ casos, loading, isFavorited, onToggleFavorite, navegar }) {
  if (loading) return <p style={{ textAlign: 'center', color: '#999', fontSize: 14, padding: '24px 0' }}>Carregando...</p>
  if (!casos.length) return <p style={{ textAlign: 'center', color: '#999', fontSize: 14, padding: '24px 0' }}>Nenhum caso disponível</p>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
      {casos.map(caso => {
        const iconMeta = FLUXOGRAMA_ICON[caso.fluxograma]
        const badge = NIVEL_BADGE[caso.nivel]
        return (
          <button key={caso.id} className="protocol-card em-hub-card"
            onClick={() => navegar('estudo-caso', caso.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}
          >
            <div className="protocol-icon" style={{ background: iconMeta?.color || '#2A569F' }}>
              {iconMeta
                ? <img src={iconMeta.image} alt={caso.titulo} style={{ width: 28, height: 28, objectFit: 'contain' }} />
                : <IcoBook size={22} />
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="protocol-name">{caso.titulo}</span>
              {badge && (
                <span style={{ display: 'inline-flex', alignItems: 'center', background: badge.bg, color: badge.color, borderRadius: 10, padding: '2px 8px', fontSize: 11, fontWeight: 600, marginLeft: 8, flexShrink: 0 }}>
                  {badge.label}
                </span>
              )}
            </div>
            {caso.fluxograma && (
              <div onClick={e => { e.stopPropagation(); onToggleFavorite(caso.fluxograma) }}
                style={{ padding: 8, display: 'flex', alignItems: 'center' }}>
                <IcoStar filled={isFavorited(caso.fluxograma)} />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ---- Sidebar: case card (shown when viewing protocol) ----
function SbCaseCard({ caso, onIniciar }) {
  const badge = NIVEL_BADGE[caso.nivel]
  return (
    <div className="pd-card pd-sb-card" style={{ flex: 'none' }}>
      <div className="pd-sb-header">
        <div className="pd-sb-header-left">
          <IcoBook size={17} />
          <span className="pd-sb-title">Caso Clínico</span>
        </div>
        {badge && (
          <span style={{ background: badge.bg, color: badge.color, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
            {badge.label}
          </span>
        )}
      </div>
      <div style={{ padding: '12px 14px' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#1A2B3C', margin: '0 0 8px' }}>{caso.titulo}</p>
        {caso.descricao && (
          <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5, margin: '0 0 14px' }}>{caso.descricao}</p>
        )}
        <button
          onClick={onIniciar}
          style={{ width: '100%', background: '#1B6FD8', color: 'white', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Iniciar Caso
        </button>
      </div>
    </div>
  )
}

// ---- Sidebar: progress card (shown during questions) ----
function SbProgressCard({ questionIndex, total, acertos, erros }) {
  const progress = total > 0 ? Math.round((questionIndex / total) * 100) : 0
  return (
    <div className="pd-card pd-sb-card" style={{ flex: 'none' }}>
      <div className="pd-sb-header">
        <div className="pd-sb-header-left">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1B6FD8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span className="pd-sb-title">Progresso</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1B6FD8' }}>{questionIndex}/{total}</span>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ height: 6, background: '#E2E8F0', borderRadius: 3, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#1B6FD8', borderRadius: 3, transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: '#DCFCE7', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#16A34A' }}>{acertos}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#16A34A' }}>Corretas</p>
          </div>
          <div style={{ flex: 1, background: '#FEE2E2', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#DC2626' }}>{erros}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#DC2626' }}>Incorretas</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Sidebar: context card (shown during questions) ----
function SbContextCard({ caso }) {
  if (!caso.contexto) return null
  return (
    <div className="pd-card pd-sb-card" style={{ flex: 'none' }}>
      <div className="pd-sb-header">
        <div className="pd-sb-header-left">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#002646" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span className="pd-sb-title">Contexto</span>
        </div>
      </div>
      <div style={{ padding: '10px 14px' }}>
        <p style={{ fontSize: 12, color: '#4A5568', lineHeight: 1.6, margin: 0 }}>{caso.contexto}</p>
      </div>
    </div>
  )
}

// ---- Main: questions view ----
function QuestoesMain({ caso, questoes, questionIndex, selecionado, resultado, submetendo,
                        introVista, concluido, onSetIntroVista, onSelect, onBinaria,
                        onNumerica, onConfirmar, onAvancar, navegar }) {
  if (!introVista) {
    return (
      <div className="pd-card" style={{ padding: '36px 40px', flex: 'none' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A2B3C', margin: '0 0 20px' }}>{caso.titulo}</h3>
        {caso.contexto && (
          <div style={{ background: '#EEF4FB', border: '1px solid rgba(27,111,216,0.15)', borderRadius: 10, padding: '14px 18px', marginBottom: 14, fontSize: 14, color: '#2A569F', lineHeight: 1.6 }}>
            {caso.contexto}
          </div>
        )}
        {caso.descricao && (
          <div style={{ background: '#FFFBEB', border: '1px solid rgba(213,139,2,0.2)', borderRadius: 10, padding: '14px 18px', marginBottom: 24, fontSize: 14, color: '#92400E', lineHeight: 1.6 }}>
            {caso.descricao}
          </div>
        )}
        <button
          onClick={() => onSetIntroVista(true)}
          style={{ background: '#1B6FD8', color: 'white', border: 'none', borderRadius: 8, padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Iniciar questões →
        </button>
      </div>
    )
  }

  if (concluido) {
    return (
      <div className="pd-card" style={{ padding: '48px 40px', flex: 'none', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <IcoCheck size={32} color="#16A34A" />
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1A2B3C', margin: '0 0 8px' }}>Caso concluído!</h3>
        <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 32px' }}>{caso.titulo}</p>
        <button
          onClick={() => navegar('estudo')}
          style={{ background: '#1B6FD8', color: 'white', border: 'none', borderRadius: 8, padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Voltar ao Modo Estudo
        </button>
      </div>
    )
  }

  const questao = questoes[questionIndex]
  const isLast = questionIndex === questoes.length - 1

  return (
    <div className="pd-card" style={{ padding: '32px 40px', flex: 'none' }}>
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {questoes.map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: i < questionIndex ? '#2BA880' : i === questionIndex ? '#1B6FD8' : '#E2E8F0',
            transition: 'background 0.2s'
          }} />
        ))}
      </div>

      <p style={{ fontSize: 16, fontWeight: 600, color: '#1A2B3C', lineHeight: 1.6, marginBottom: 20 }}>
        {questao.enunciado}
      </p>

      {/* Multiple choice */}
      {questao.tipo === 'multipla_escolha' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {questao.opcoes.map((op) => {
            let bg = 'white', border = '1.5px solid #c8d8ea', color = '#1A2B3C'
            if (resultado) {
              if (selecionado === op.id) {
                bg    = resultado.correto ? '#DCFCE7' : '#FEF2F2'
                border = `1.5px solid ${resultado.correto ? '#86EFAC' : '#FECACA'}`
                color = resultado.correto ? '#166534' : '#991B1B'
              }
            } else if (selecionado === op.id) {
              bg = '#EEF4FB'; border = '1.5px solid #1B6FD8'; color = '#1B6FD8'
            }
            return (
              <button key={op.id}
                onClick={() => !resultado && onSelect(op.id)}
                disabled={!!resultado}
                style={{ background: bg, border, borderRadius: 10, padding: '12px 16px', fontSize: 14, fontWeight: 500, color, cursor: resultado ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
              >
                {op.texto}
              </button>
            )
          })}
        </div>
      )}

      {/* Binary */}
      {questao.tipo === 'binaria' && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          {['sim', 'nao'].map((val) => {
            let bg = 'white', border = '1.5px solid #c8d8ea', color = '#1A2B3C'
            if (resultado && selecionado === val) {
              bg    = resultado.correto ? '#DCFCE7' : '#FEF2F2'
              border = `1.5px solid ${resultado.correto ? '#86EFAC' : '#FECACA'}`
              color = resultado.correto ? '#166534' : '#991B1B'
            }
            return (
              <button key={val}
                onClick={() => !resultado && onBinaria(val)}
                disabled={!!resultado}
                style={{ flex: 1, background: bg, border, borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, color, cursor: resultado ? 'default' : 'pointer', transition: 'all 0.15s' }}
              >
                {val === 'sim' ? 'Sim' : 'Não'}
              </button>
            )
          })}
        </div>
      )}

      {/* Numeric */}
      {questao.tipo === 'numerica' && (
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            inputMode="decimal"
            value={selecionado ?? ''}
            onChange={e => !resultado && onNumerica(e.target.value)}
            disabled={!!resultado}
            placeholder="Digite o valor numérico"
            style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px solid #c8d8ea', fontSize: 14, boxSizing: 'border-box', marginBottom: 10, background: '#ffffff', color: '#1a2b4a' }}
          />
          {!resultado && (
            <button
              onClick={onConfirmar}
              disabled={!selecionado || submetendo}
              style={{ background: '#1B6FD8', color: 'white', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: (!selecionado || submetendo) ? 'not-allowed' : 'pointer', opacity: (!selecionado || submetendo) ? 0.6 : 1 }}
            >
              Confirmar
            </button>
          )}
        </div>
      )}

      {/* Feedback */}
      {resultado && (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            padding: '10px 14px', borderRadius: 8, fontSize: 13,
            background: resultado.correto ? '#DCFCE7' : '#FEF2F2',
            color: resultado.correto ? '#166534' : '#991B1B',
            borderLeft: `3px solid ${resultado.correto ? '#22C55E' : '#EF4444'}`,
            marginBottom: resultado.mensagem ? 8 : 0
          }}>
            {resultado.correto ? '✓ Correto!' : `✗ Incorreto. Resposta correta: ${resultado.resposta_correta}`}
          </div>
          {resultado.mensagem && (
            <div style={{ background: '#EEF4FB', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#2A569F', lineHeight: 1.5 }}>
              {resultado.mensagem}
            </div>
          )}
        </div>
      )}

      {/* Confirm button for multiple choice */}
      {questao.tipo === 'multipla_escolha' && !resultado && (
        <button
          onClick={onConfirmar}
          disabled={selecionado == null || submetendo}
          style={{ background: '#1B6FD8', color: 'white', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: (selecionado == null || submetendo) ? 'not-allowed' : 'pointer', opacity: (selecionado == null || submetendo) ? 0.6 : 1, marginRight: 12 }}
        >
          Confirmar
        </button>
      )}

      {/* Advance button */}
      {resultado && (
        <button
          onClick={onAvancar}
          style={{ background: '#1B6FD8', color: 'white', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          {isLast ? 'Concluir ✓' : 'Próxima →'}
        </button>
      )}
    </div>
  )
}

// ---- Main shell ----
export default function ModoEstudoShell({ tela, casoId, navegar }) {
  const [casos, setCasos] = useState([])
  const [casosLoading, setCasosLoading] = useState(true)
  const [casoAtivo, setCasoAtivo] = useState(null)
  const [casoLoading, setCasoLoading] = useState(false)
  const [recentes, setRecentes] = useState([])

  const [questionIndex, setQuestionIndex] = useState(0)
  const [selecionado, setSelecionado] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [submetendo, setSubmetendo] = useState(false)
  const [concluido, setConcluido] = useState(false)
  const [introVista, setIntroVista] = useState(false)
  const [acertos, setAcertos] = useState(0)
  const [erros, setErros] = useState(0)

  const { isFavorited, addToFavorites, removeFromFavorites } = useFavorites()
  const { fluxo, loading: fluxoLoading, error: fluxoError } = useFluxograma(casoAtivo?.fluxograma ?? null)

  useEffect(() => {
    fetchCasos()
      .then(data => setCasos(Array.isArray(data) ? data : (data.resultados || [])))
      .catch(() => {})
      .finally(() => setCasosLoading(false))
  }, [])

  useEffect(() => {
    listAcessosRecentes().then(setRecentes).catch(() => {})
  }, [tela])

  useEffect(() => {
    if (!casoId) return
    setCasoLoading(true)
    setCasoAtivo(null)
    setQuestionIndex(0)
    setSelecionado(null)
    setResultado(null)
    setConcluido(false)
    setIntroVista(false)
    setAcertos(0)
    setErros(0)
    fetchCaso(casoId)
      .then(data => {
        const sorted = { ...data, questoes: [...data.questoes].sort((a, b) => a.ordem - b.ordem) }
        setCasoAtivo(sorted)
        if (data.fluxograma) registrarAcesso(data.fluxograma).catch(() => {})
      })
      .catch(() => {})
      .finally(() => setCasoLoading(false))
  }, [casoId])

  const handleToggleFavorite = async (fluxogramaId) => {
    try {
      if (isFavorited(fluxogramaId)) await removeFromFavorites(fluxogramaId)
      else await addToFavorites(fluxogramaId)
    } catch {}
  }

  const submitResposta = async (payload) => {
    if (submetendo || !casoAtivo) return
    setSubmetendo(true)
    const questao = casoAtivo.questoes[questionIndex]
    try {
      const res = await responderCaso(casoId, questao.id, payload)
      setResultado(res)
      if (res.correto) setAcertos(a => a + 1)
      else setErros(e => e + 1)
    } catch (e) {
      setResultado({ correto: false, mensagem: e.message, resposta_correta: '' })
      setErros(e => e + 1)
    } finally {
      setSubmetendo(false)
    }
  }

  const handleAvancar = () => {
    const isLast = questionIndex === casoAtivo.questoes.length - 1
    if (isLast) {
      setConcluido(true)
    } else {
      setQuestionIndex(i => i + 1)
      setSelecionado(null)
      setResultado(null)
    }
  }

  const favoritos = casos.filter(c => isFavorited(c.fluxograma))
  const casosOrdenados = [...favoritos, ...casos.filter(c => !isFavorited(c.fluxograma))]

  const isHub       = tela === 'estudo'
  const isProtocolo = tela === 'estudo-caso'
  const isQuestoes  = tela === 'estudo-questoes'

  const subtitle = isHub
    ? 'Selecione o caso clínico que deseja estudar'
    : (casoAtivo?.titulo ?? (casoLoading ? 'Carregando...' : ''))

  return (
    <div className="proto-desktop">
      <div className="pd-page-header">
        <div className="pd-page-icon"><IcoBook size={22} /></div>
        <div>
          <p className="pd-page-title">Modo de Estudo</p>
          <p className="pd-page-subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="pd-body">
        {/* Main content */}
        <div className="pd-main">
          {isHub && (
            <div className="pd-card" style={{ padding: '24px', flex: 'none' }}>
              <CasosHub
                casos={casosOrdenados}
                loading={casosLoading}
                isFavorited={isFavorited}
                onToggleFavorite={handleToggleFavorite}
                navegar={navegar}
              />
            </div>
          )}

          {isProtocolo && (
            <>
              <div className="pd-card pd-fluxo-card">
                <div className="pd-fluxo">
                  <button className="pd-back-btn" onClick={() => navegar('estudo')}><IcoArrowLeft /></button>
                  {(casoLoading || fluxoLoading) && (
                    <p style={{ fontSize: 14, color: '#999', textAlign: 'center', padding: '24px 0' }}>Carregando protocolo...</p>
                  )}
                  {fluxoError && (
                    <p style={{ fontSize: 14, color: '#d32f2f', textAlign: 'center', padding: '24px 0' }}>Erro: {fluxoError}</p>
                  )}
                  {fluxo && <FluxogramaView data={fluxo} />}
                </div>
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
            </>
          )}

          {isQuestoes && casoAtivo && (
            <QuestoesMain
              caso={casoAtivo}
              questoes={casoAtivo.questoes}
              questionIndex={questionIndex}
              selecionado={selecionado}
              resultado={resultado}
              submetendo={submetendo}
              introVista={introVista}
              concluido={concluido}
              onSetIntroVista={setIntroVista}
              onSelect={setSelecionado}
              onBinaria={(val) => { setSelecionado(val); submitResposta({ resposta: val }) }}
              onNumerica={setSelecionado}
              onConfirmar={() => {
                const tipo = casoAtivo.questoes[questionIndex].tipo
                submitResposta(tipo === 'numerica' ? { resposta: selecionado } : { opcaoId: selecionado })
              }}
              onAvancar={handleAvancar}
              navegar={navegar}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="pd-sidebar">
          {/* Case card — visible when viewing protocol */}
          {isProtocolo && casoAtivo && (
            <SbCaseCard caso={casoAtivo} onIniciar={() => navegar('estudo-questoes', casoId)} />
          )}

          {/* Progress + context — visible during questions */}
          {isQuestoes && casoAtivo && introVista && !concluido && (
            <SbProgressCard
              questionIndex={questionIndex}
              total={casoAtivo.questoes.length}
              acertos={acertos}
              erros={erros}
            />
          )}
          {isQuestoes && casoAtivo && <SbContextCard caso={casoAtivo} />}

          {/* Recentes e Favoritos — visíveis apenas no hub */}
          {isHub && (
            <>
              <ToggleSidebarCard title="Últimos Acessados" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#002646" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}>
                <div className="pd-sb-list">
                  {recentes.length === 0
                    ? <p style={{ fontSize: 12, color: '#999', padding: '10px 14px' }}>Nenhum acesso ainda</p>
                    : recentes.map((item, i) => {
                        const iconMeta = FLUXOGRAMA_ICON[item.fluxograma_id]
                        const caso = casos.find(c => c.fluxograma === item.fluxograma_id)
                        return (
                          <button key={i} className="pd-sb-item pd-sb-item-btn"
                            onClick={() => caso && navegar('estudo-caso', caso.id)}>
                            <div style={{ width: 32, height: 32, borderRadius: 6, background: iconMeta?.color || '#2A569F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {iconMeta
                                ? <img src={iconMeta.image} alt={item.titulo} style={{ width: 20, height: 20, objectFit: 'contain' }} />
                                : <IcoBook size={16} />
                              }
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p className="pd-sb-item-label">{caso?.titulo ?? item.titulo}</p>
                              <p className="pd-sb-item-time">{formatAcesso(item.ultimo_acesso)}</p>
                            </div>
                          </button>
                        )
                      })
                  }
                </div>
              </ToggleSidebarCard>

              <ToggleSidebarCard title="Favoritos" icon={<IcoStar filled />}>
                <div className="pd-sb-list">
                  {favoritos.length === 0
                    ? <p style={{ fontSize: 12, color: '#999', padding: '10px 14px' }}>Nenhum favorito ainda</p>
                    : favoritos.map((caso, i) => {
                        const iconMeta = FLUXOGRAMA_ICON[caso.fluxograma]
                        return (
                          <button key={i} className="pd-sb-item pd-sb-item-btn"
                            onClick={() => navegar('estudo-caso', caso.id)}>
                            <div style={{ width: 32, height: 32, borderRadius: 6, background: iconMeta?.color || '#2A569F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {iconMeta
                                ? <img src={iconMeta.image} alt={caso.titulo} style={{ width: 20, height: 20, objectFit: 'contain' }} />
                                : <IcoBook size={16} />
                              }
                            </div>
                            <p className="pd-sb-item-label" style={{ flex: 1 }}>{caso.titulo}</p>
                            <IcoStar filled />
                          </button>
                        )
                      })
                  }
                </div>
              </ToggleSidebarCard>
            </>
          )}

          {/* Quick actions */}
          <div className="pd-card pd-acoes-card">
            <p className="pd-card-title">Ações Rápidas</p>
            <div className="pd-acoes-grid">
              <button className="pd-acao" onClick={() => navegar('estudo')}>
                <div className="pd-acao-icon" style={{ background: 'rgba(42,86,159,0.1)', border: '1px solid rgba(42,86,159,0.4)' }}>
                  <IcoBook size={22} />
                </div>
                <div className="pd-acao-text">
                  <p className="pd-acao-label" style={{ color: '#2A569F' }}>Todos os Casos</p>
                  <p className="pd-acao-sub">Ver todos os casos clínicos</p>
                </div>
                <IcoChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
