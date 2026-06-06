import { useRef, useLayoutEffect } from 'react'

function IcoHome({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function IcoUser({ color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

const ACTIVE_COLOR   = '#2A569F'
const INACTIVE_COLOR = 'rgba(255,255,255,0.75)'

export default function BottomNav({ navegar, active }) {
  const containerRef = useRef(null)
  const pillRef      = useRef(null)
  const homeRef      = useRef(null)
  const contaRef     = useRef(null)
  const isFirst      = useRef(true)

  const refMap = { home: homeRef, conta: contaRef }

  useLayoutEffect(() => {
    const el        = refMap[active]?.current
    const container = containerRef.current
    const pill      = pillRef.current
    if (!pill) return
    if (!el || !container) { pill.style.opacity = '0'; return }

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
          ref={contaRef}
          className="nav-btn"
          onClick={() => navegar('conta')}
          aria-label="Minha Conta"
        >
          <IcoUser color={active === 'conta' ? ACTIVE_COLOR : INACTIVE_COLOR} />
        </button>
      </div>
    </nav>
  )
}
