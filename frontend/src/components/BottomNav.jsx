import { useRef, useLayoutEffect } from 'react'

function IcoHome({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function IcoCalc({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 20.5L3.5 13.5a5 5 0 0 1 7.07-7.07l7 7a5 5 0 0 1-7.07 7.07z"/>
      <line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/>
    </svg>
  )
}

function IcoEstudo({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}

const ACTIVE_COLOR   = '#2A569F'
const INACTIVE_COLOR = 'rgba(255,255,255,0.75)'

export default function BottomNav({ navegar, active }) {
  const containerRef = useRef(null)
  const pillRef      = useRef(null)
  const homeRef      = useRef(null)
  const estudoRef    = useRef(null)
  const isFirst      = useRef(true)

  const calcRef = useRef(null)
  const refMap = { home: homeRef, estudo: estudoRef, calculadora: calcRef }

  useLayoutEffect(() => {
    const el        = refMap[active]?.current
    const container = containerRef.current
    const pill      = pillRef.current
    if (!el || !container || !pill) return

    const cr = container.getBoundingClientRect()
    const er = el.getBoundingClientRect()

    if (isFirst.current) {
      pill.style.transition = 'none'
      isFirst.current = false
    }

    pill.style.left    = (er.left - cr.left) + 'px'
    pill.style.width   = er.width + 'px'
    pill.style.opacity = '1'

    requestAnimationFrame(() => { pill.style.transition = '' })
  }, [active])

  return (
    <nav className="bottom-nav">
      <div ref={containerRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%', position: 'relative' }}>
        <div ref={pillRef} className="bn-pill" />

        <button
          ref={homeRef}
          className="nav-btn"
          onClick={() => navegar('home')}
          aria-label="Home"
        >
          <IcoHome color={active === 'home' ? ACTIVE_COLOR : INACTIVE_COLOR} />
        </button>

        <button
          ref={calcRef}
          className="nav-btn"
          aria-label="Calculadora"
          disabled
          style={{ opacity: 0.4, cursor: 'not-allowed' }}
        >
          <IcoCalc color={INACTIVE_COLOR} />
        </button>

        <button
          ref={estudoRef}
          className="nav-btn"
          onClick={() => navegar('estudo')}
          aria-label="Modo Estudo"
        >
          <IcoEstudo color={active === 'estudo' ? ACTIVE_COLOR : INACTIVE_COLOR} />
        </button>
      </div>
    </nav>
  )
}
