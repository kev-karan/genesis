import { useState, useEffect } from 'react'

const RECENTS_KEY = 'calc_recents'
const FAVS_KEY    = 'calc_favs'

const MEDICAMENTOS = [
  { id: 'amoxicilina',  label: 'Amoxicilina',  color: '#1B5DCA' },
  { id: 'ibuprofeno',   label: 'Ibuprofeno',    color: '#504FA8' },
  { id: 'paracetamol',  label: 'Paracetamol',   color: '#2BA880' },
  { id: 'dipirona',     label: 'Dipirona',       color: '#D58B02' },
  { id: 'amicacina',    label: 'Amicacina',      color: '#D94F4F' },
  { id: 'gentamicina',  label: 'Gentamicina',    color: '#7C3AED' },
]

// ---- Icons ----
function IcoPill({ size = 22, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 20.5L3.5 13.5a5 5 0 0 1 7.07-7.07l7 7a5 5 0 0 1-7.07 7.07z"/>
      <line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/>
    </svg>
  )
}
function IcoStar({ filled = false }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#F5A623' : 'none'} stroke={filled ? '#F5A623' : '#ccc'} strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
}
function IcoChevronRight() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#002646" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
}
function IcoClock({ size = 18, color = '#002646' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function IcoArrowLeft() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#002646" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
}

function formatTime(isoString) {
  const date = new Date(isoString)
  const dd = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const hh = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${dd}, ${hh}`
}

const InputField = ({ label, value, onChange, placeholder, unit }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</label>
    <div style={{ display: 'flex', alignItems: 'stretch', border: '1.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', background: 'white', transition: 'border-color 0.15s' }}
      onFocus={e => e.currentTarget.style.borderColor = '#3467B0'}
      onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
    >
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={e => onChange(e.target.value.replace(/[^0-9.,]/g, ''))}
        placeholder={placeholder}
        style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 14px', fontSize: 15, color: '#111827', background: 'transparent', minWidth: 0, fontFamily: 'DM Sans, sans-serif' }}
      />
      <span style={{ background: '#2a569f', color: 'white', fontSize: 13, fontWeight: 600, padding: '0 16px', display: 'flex', alignItems: 'center', borderRadius: '0 8px 8px 0', whiteSpace: 'nowrap' }}>{unit}</span>
    </div>
  </div>
)

// ---- Hub: medication picker ----
function MedicamentosHub({ onSelect, favs, onToggleFav }) {
  const favList = MEDICAMENTOS.filter(m => favs.includes(m.id))
  const outros  = MEDICAMENTOS.filter(m => !favs.includes(m.id))
  const ordered = [...favList, ...outros]

  return (
    <div className="pd-card" style={{ padding: 24, flex: 'none' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {ordered.map(med => (
          <button
            key={med.id}
            className="protocol-card em-hub-card"
            onClick={() => onSelect(med)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}
          >
            <div className="protocol-icon" style={{ background: med.color }}>
              <IcoPill size={22} color="white" />
            </div>
            <span className="protocol-name" style={{ flex: 1 }}>{med.label}</span>
            <div
              onClick={e => { e.stopPropagation(); onToggleFav(med.id) }}
              style={{ padding: 8, display: 'flex', alignItems: 'center' }}
            >
              <IcoStar filled={favs.includes(med.id)} />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ---- Calculator form + result ----
function CalculadoraForm({ med, onBack, onResult }) {
  const [dose,   setDose]   = useState('')
  const [conc,   setConc]   = useState('')
  const [vol,    setVol]    = useState('')
  const [peso,   setPeso]   = useState('')
  const [result, setResult] = useState(null)

  const norm = (s) => parseFloat(s.replace(',', '.'))
  const calcular = () => {
    const d = norm(dose), c = norm(conc), v = norm(vol)
    if (!d || !c || !v || c === 0) return
    const volume = (d * v) / c
    const r = { medicamento: med.label, dosePrescrita: d, concentracao: c, volumeDesejado: v, peso: norm(peso) || null, volume, timestamp: new Date().toISOString() }
    setResult(r)
    onResult(r)
  }

  return (
    <div className="pd-card" style={{ padding: '28px 32px', flex: 'none' }}>
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#1B6FD8', fontSize: 14, fontWeight: 500, padding: '0 0 20px', fontFamily: 'DM Sans, sans-serif' }}
      >
        <IcoArrowLeft /> Todos os medicamentos
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: med.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IcoPill size={20} color="white" />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#002646' }}>{med.label}</p>
          <p style={{ margin: 0, fontSize: 13, color: '#6B7A8D' }}>Dados para o cálculo</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px', marginBottom: 24 }}>
        <InputField label="Dose prescrita"       value={dose} onChange={setDose} placeholder="Ex: 500" unit="mg" />
        <InputField label="Concentração desejada" value={conc} onChange={setConc} placeholder="Ex: 250" unit="mL" />
        <InputField label="Volume desejado"       value={vol}  onChange={setVol}  placeholder="Ex: 10"  unit="mL" />
        <InputField label="Peso do paciente"      value={peso} onChange={setPeso} placeholder="Ex: 70"  unit="Kg" />
      </div>

      <button
        onClick={calcular}
        style={{ width: '100%', background: '#2a569f', color: 'white', border: 'none', borderRadius: 12, padding: '14px 24px', fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s', fontFamily: 'DM Sans, sans-serif' }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        Calcular dose
      </button>

      {result && (
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#d1fae5', borderRadius: 16, padding: '20px 24px' }}>
            <p style={{ margin: '0 0 6px', fontSize: 14, color: '#065f46', fontWeight: 500 }}>Volume a administrar</p>
            <p style={{ margin: 0, fontSize: 36, fontWeight: 900, color: '#047857', lineHeight: 1 }}>
              {result.volume % 1 === 0 ? result.volume : result.volume.toFixed(2)}
              <span style={{ fontSize: 24, fontWeight: 700 }}> mL</span>
            </p>
          </div>
          <div style={{ background: '#f9fafb', borderRadius: 16, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#374151' }}>Resumo do cálculo</p>
            {[
              ['Dose prescrita',       `${result.dosePrescrita}mg`],
              ['Concentração desejada',`${result.concentracao}mL`],
              ['Volume desejado',      `${result.volumeDesejado}mL`],
              ...(result.peso ? [['Peso do paciente', `${result.peso}Kg`]] : []),
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#374151' }}>
                <span>{k}</span><span style={{ fontWeight: 600, color: '#111827' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Main shell ----
export default function CalculadoraShell({ navegar }) {
  const [selectedMed, setSelectedMed] = useState(null)
  const [recents, setRecents]         = useState([])
  const [favs, setFavs]               = useState([])

  useEffect(() => {
    setRecents(JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]'))
    setFavs(JSON.parse(localStorage.getItem(FAVS_KEY) || '[]'))
  }, [])

  const handleResult = (r) => {
    const updated = [r, ...recents].slice(0, 10)
    setRecents(updated)
    localStorage.setItem(RECENTS_KEY, JSON.stringify(updated))
  }

  const toggleFav = (id) => {
    const updated = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id]
    setFavs(updated)
    localStorage.setItem(FAVS_KEY, JSON.stringify(updated))
  }

  const subtitle = selectedMed ? selectedMed.label : 'Selecione o medicamento que deseja calcular'

  return (
    <div className="proto-desktop">
      <div className="pd-page-header">
        <div className="pd-page-icon"><IcoPill size={22} /></div>
        <div>
          <p className="pd-page-title">Calculadora</p>
          <p className="pd-page-subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="pd-body">
        {/* Main */}
        <div className="pd-main">
          {!selectedMed ? (
            <MedicamentosHub onSelect={setSelectedMed} favs={favs} onToggleFav={toggleFav} />
          ) : (
            <CalculadoraForm med={selectedMed} onBack={() => setSelectedMed(null)} onResult={handleResult} />
          )}
        </div>

        {/* Sidebar */}
        <div className="pd-sidebar">
          {/* Recents */}
          <div className="pd-card pd-sb-card">
            <div className="pd-sb-header">
              <div className="pd-sb-header-left">
                <IcoClock size={17} />
                <span className="pd-sb-title">Últimos Cálculos</span>
              </div>
            </div>
            <div className="pd-sb-list">
              {recents.length === 0
                ? <p style={{ fontSize: 12, color: '#999', padding: '10px 14px' }}>Nenhum cálculo ainda</p>
                : recents.map((r, i) => {
                    const med = MEDICAMENTOS.find(m => m.label === r.medicamento)
                    return (
                      <button key={i} className="pd-sb-item pd-sb-item-btn"
                        onClick={() => med && setSelectedMed(med)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 6, background: med?.color ?? '#2A569F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <IcoPill size={16} color="white" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className="pd-sb-item-label">{r.medicamento}</p>
                          <p className="pd-sb-item-time">{formatTime(r.timestamp)}</p>
                        </div>
                      </button>
                    )
                  })
              }
            </div>
          </div>

          {/* Favorites */}
          <div className="pd-card pd-sb-card">
            <div className="pd-sb-header">
              <div className="pd-sb-header-left">
                <IcoStar filled />
                <span className="pd-sb-title">Favoritos</span>
              </div>
            </div>
            <div className="pd-sb-list">
              {favs.length === 0
                ? <p style={{ fontSize: 12, color: '#999', padding: '10px 14px' }}>Nenhum favorito ainda</p>
                : MEDICAMENTOS.filter(m => favs.includes(m.id)).map((med, i) => (
                    <button key={i} className="pd-sb-item pd-sb-item-btn"
                      onClick={() => setSelectedMed(med)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: med.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IcoPill size={16} color="white" />
                      </div>
                      <p className="pd-sb-item-label" style={{ flex: 1 }}>{med.label}</p>
                      <IcoStar filled />
                    </button>
                  ))
              }
            </div>
          </div>

          {/* Quick actions */}
          <div className="pd-card pd-acoes-card">
            <p className="pd-card-title">Ações Rápidas</p>
            <div className="pd-acoes-grid">
              {[
                { label: 'Modo Emergência', sub: 'Acessar protocolos de emergência', color: '#1B5DCA', bg: 'rgba(27,93,202,0.1)', border: 'rgba(27,93,202,0.4)', action: () => navegar('emergencia'),
                  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B5DCA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/><line x1="12" y1="7" x2="12" y2="12"/><line x1="12" y1="12" x2="5.5" y2="17"/><line x1="12" y1="12" x2="18.5" y2="17"/></svg> },
                { label: 'Modo de Estudo', sub: 'Acessar casos clínicos', color: '#2BA880', bg: 'rgba(43,168,128,0.1)', border: 'rgba(43,168,128,0.4)', action: () => navegar('estudo'),
                  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2BA880" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
              ].map(({ label, sub, color, bg, border, action, icon }) => (
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
