import { useRef, useLayoutEffect, useState } from 'react'
import GenesisLogoAlt from '../assets/GenesisLogoAlt.png'
import { listAcessosRecentes } from '../api/acessos'

const PROTOCOLO_MAP = {
  1: { destino: 'dengue' },
  2: { destino: 'sedacao' },
}

const PROTOCOLOS_SEARCH = [
  { id: 'emergencia',  nome: 'Modo Emergência' },
  { id: 'dengue',      nome: 'Protocolo de Dengue' },
  { id: 'sedacao',     nome: 'Protocolo de Sedação' },
  { id: 'calculadora', nome: 'Calculadora de Doses' },
]

function IcoSearch() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#959595" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function IcoUser() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function IcoHome() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
function IcoHierarchy() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/><line x1="12" y1="7" x2="12" y2="12"/><line x1="12" y1="12" x2="5.5" y2="17"/><line x1="12" y1="12" x2="18.5" y2="17"/></svg>
}
function IcoBook() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
}
function IcoPill() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 20.5L3.5 13.5a5 5 0 0 1 7.07-7.07l7 7a5 5 0 0 1-7.07 7.07z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>
}

function getActiveSection(tela) {
  if (['emergencia', 'dengue', 'sedacao'].includes(tela)) return 'emergencia'
  if (tela === 'calculadora') return 'calculadora'
  return 'home'
}

export default function DesktopTopBar({ tela, navegar }) {
  const activeSection = getActiveSection(tela)

  const [busca, setBusca] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchRecentes, setSearchRecentes] = useState([])

  const containerRef = useRef(null)
  const pillRef = useRef(null)
  const homeRef = useRef(null)
  const emergenciaRef = useRef(null)
  const estudoRef = useRef(null)
  const calculadoraRef = useRef(null)
  const isFirst = useRef(true)

  const refMap = { home: homeRef, emergencia: emergenciaRef, estudo: estudoRef, calculadora: calculadoraRef }

  useLayoutEffect(() => {
    const el = refMap[activeSection]?.current
    const container = containerRef.current
    const pill = pillRef.current
    if (!el || !container || !pill) return
    const cr = container.getBoundingClientRect()
    const er = el.getBoundingClientRect()
    if (isFirst.current) {
      pill.style.transition = 'none'
      isFirst.current = false
    } else {
      pill.style.transition = ''
    }
    pill.style.left = (er.left - cr.left) + 'px'
    pill.style.width = er.width + 'px'
    pill.style.opacity = '1'
    if (!isFirst.current) {
      requestAnimationFrame(() => { pill.style.transition = '' })
    }
  }, [activeSection])

  const protocolosFiltrados = PROTOCOLOS_SEARCH.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  )
  const showDropdown = searchFocused && (busca.length > 0 || searchRecentes.length > 0)

  const NAV = [
    { id: 'home',       label: 'INÍCIO',             icon: <IcoHome />,      onClick: () => navegar('home'),       disabled: false },
    { id: 'emergencia', label: 'MODO DE EMERGÊNCIA',  icon: <IcoHierarchy />, onClick: () => navegar('emergencia'), disabled: false },
    { id: 'estudo',     label: 'MODO DE ESTUDO',      icon: <IcoBook />,      onClick: () => {},                    disabled: true  },
    { id: 'calculadora',label: 'CALCULADORA',         icon: <IcoPill />,      onClick: () => {},                    disabled: true  },
  ]

  return (
    <div className="desktop-topbar">
      <div className="pd-topbar-left">
        <img src={GenesisLogoAlt} className="pd-logo" alt="Genesis" />
        <div ref={containerRef} className="dt-nav-container">
          <div ref={pillRef} className="dt-nav-pill" />
          {NAV.map(({ id, label, icon, onClick, disabled }) => (
            <button
              key={id}
              ref={refMap[id]}
              className={`dt-nav-item${activeSection === id ? ' dt-nav-item--active' : ''}`}
              onClick={disabled ? undefined : onClick}
              disabled={disabled}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
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
                protocolosFiltrados.length === 0
                  ? <div className="pd-search-empty">Nenhum protocolo encontrado.</div>
                  : protocolosFiltrados.map(p => (
                      <button key={p.id} className="pd-search-item"
                        onMouseDown={e => { e.preventDefault(); navegar(p.id) }}>{p.nome}</button>
                    ))
              ) : searchRecentes.length > 0 ? (
                <>
                  <div className="pd-search-label">Acessos Recentes</div>
                  {searchRecentes.map((a, i) => {
                    const meta = PROTOCOLO_MAP[a.fluxograma_id]
                    if (!meta) return null
                    return (
                      <button key={i} className="pd-search-item"
                        onMouseDown={e => { e.preventDefault(); navegar(meta.destino) }}>{a.titulo}</button>
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
  )
}
