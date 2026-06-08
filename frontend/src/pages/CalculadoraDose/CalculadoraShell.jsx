import { useState, useEffect } from 'react'
import { fetchMedicamentos, fetchMedicamento, calcularDose, fetchConversoes, calcularConversao } from '../../api/calculadora'

const RECENTS_KEY = 'calc_recents'
const FAVS_KEY    = 'calc_favs'

const PALETTE = ['#1B5DCA', '#504FA8', '#2BA880', '#D58B02', '#D94F4F', '#7C3AED']
const medColor = (id) => PALETTE[id % PALETTE.length]

const fmt = (n) => Number(n) % 1 === 0 ? Number(n) : Number(n).toFixed(2)
const UNIDADE = { ml: 'mL', gotas: 'gotas' }

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

// Toggle Responsividade (1500px)
function ToggleSidebarCard({ title, icon, children }) {
  const [expanded, setExpanded] = useState(() => window.innerWidth > 1500)

  useEffect(() => {
    const handleResize = () => setExpanded(window.innerWidth > 1500)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

function SelectCard({ selected, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        background: selected ? '#eff6ff' : 'white',
        border: `2px solid ${selected ? '#2a569f' : '#e5e7eb'}`,
        borderRadius: 10,
        padding: '12px 16px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      {children}
    </button>
  )
}

function MedicamentosHub({ medicamentos, loading, error, onSelect, favs, onToggleFav }) {
  if (loading) {
    return (
      <div className="pd-card" style={{ padding: 24 }}>
        <p style={{ color: '#6B7A8D', fontSize: 14, margin: 0 }}>Carregando medicamentos...</p>
      </div>
    )
  }
  if (error) {
    return (
      <div className="pd-card" style={{ padding: 24 }}>
        <p style={{ color: '#D94F4F', fontSize: 14, margin: 0 }}>{error}</p>
      </div>
    )
  }

  const favList = medicamentos.filter(m => favs.includes(m.id))
  const outros  = medicamentos.filter(m => !favs.includes(m.id))
  const ordered = [...favList, ...outros]

  return (
    <div className="pd-card" style={{ padding: 24, flex: 'none' }}>
      {ordered.length === 0 && (
        <p style={{ color: '#6B7A8D', fontSize: 14, margin: 0 }}>Nenhum medicamento cadastrado.</p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {ordered.map(med => (
          <button
            key={med.id}
            className="protocol-card em-hub-card"
            onClick={() => onSelect(med)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}
          >
            <div className="protocol-icon" style={{ background: medColor(med.id) }}>
              <IcoPill size={22} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="protocol-name">{med.nome}</span>
              {med.principio_ativo && (
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6B7A8D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {med.principio_ativo}
                </p>
              )}
            </div>
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

function CalculadoraForm({ med, onBack, onResult }) {
  const [detalhe, setDetalhe]                       = useState(null)
  const [loadingDetalhe, setLoadingDetalhe]         = useState(true)
  const [errorDetalhe, setErrorDetalhe]             = useState(null)
  const [selectedDoseRef, setSelectedDoseRef]       = useState(null)
  const [selectedApresentacao, setSelectedApresentacao] = useState(null)
  const [peso, setPeso]                             = useState('')
  const [resultado, setResultado]                   = useState(null)
  const [loadingCalculo, setLoadingCalculo]         = useState(false)
  const [errorCalculo, setErrorCalculo]             = useState(null)

  useEffect(() => {
    setLoadingDetalhe(true)
    setErrorDetalhe(null)
    setDetalhe(null)
    setSelectedDoseRef(null)
    setSelectedApresentacao(null)
    setResultado(null)
    fetchMedicamento(med.id)
      .then(data => {
        setDetalhe(data)
        if (data.doses_referencia.length === 1) setSelectedDoseRef(data.doses_referencia[0])
        if (data.apresentacoes.length === 1)    setSelectedApresentacao(data.apresentacoes[0])
      })
      .catch(e => setErrorDetalhe(e.message))
      .finally(() => setLoadingDetalhe(false))
  }, [med.id])

  const pesoNum     = parseFloat(peso.replace(',', '.'))
  const podeCalcular = selectedDoseRef && selectedApresentacao && pesoNum > 0

  const calcular = async () => {
    setLoadingCalculo(true)
    setErrorCalculo(null)
    try {
      const r = await calcularDose({
        peso_kg: pesoNum,
        dose_referencia_id: selectedDoseRef.id,
        apresentacao_id: selectedApresentacao.id,
      })
      setResultado(r)
      onResult({
        medicamento_id: med.id,
        medicamento_nome: med.nome,
        peso_kg: pesoNum,
        dose_final_mg: r.dose_final_mg,
        volume: r.volume,
        unidade_volume: r.unidade_volume,
        timestamp: new Date().toISOString(),
      })
    } catch (e) {
      setErrorCalculo(e.message)
    } finally {
      setLoadingCalculo(false)
    }
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
        <div style={{ width: 42, height: 42, borderRadius: 10, background: medColor(med.id), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IcoPill size={20} color="white" />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#002646' }}>{med.nome}</p>
          {med.principio_ativo && (
            <p style={{ margin: 0, fontSize: 13, color: '#6B7A8D' }}>{med.principio_ativo}</p>
          )}
        </div>
      </div>

      {loadingDetalhe && <p style={{ color: '#6B7A8D', fontSize: 14 }}>Carregando dados do medicamento...</p>}
      {errorDetalhe  && <p style={{ color: '#D94F4F', fontSize: 14 }}>{errorDetalhe}</p>}

      {detalhe && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {detalhe.doses_referencia.length > 0 && (
            <div>
              <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#374151' }}>Dose de referência</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {detalhe.doses_referencia.map(d => (
                  <SelectCard key={d.id} selected={selectedDoseRef?.id === d.id} onClick={() => { setSelectedDoseRef(d); setResultado(null) }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#002646' }}>
                      {d.dose_mg_por_kg} mg/kg
                    </p>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                      {d.dose_maxima_mg  && <span style={{ fontSize: 12, color: '#6B7A8D' }}>máx {d.dose_maxima_mg} mg</span>}
                      {d.intervalo_horas && <span style={{ fontSize: 12, color: '#6B7A8D' }}>de {d.intervalo_horas}h em {d.intervalo_horas}h</span>}
                      {d.fonte           && <span style={{ fontSize: 12, color: '#6B7A8D' }}>{d.fonte}</span>}
                    </div>
                  </SelectCard>
                ))}
              </div>
            </div>
          )}

          {detalhe.apresentacoes.length > 0 && (
            <div>
              <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#374151' }}>Apresentação</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {detalhe.apresentacoes.map(a => (
                  <SelectCard key={a.id} selected={selectedApresentacao?.id === a.id} onClick={() => { setSelectedApresentacao(a); setResultado(null) }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#002646' }}>
                      {a.nome || (a.apresentacao === 'gotas' ? 'Gotas' : 'Solução oral')}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7A8D' }}>
                      {a.concentracao_mg_por_ml} mg/mL
                      {a.via_administracao && ` · ${a.via_administracao}`}
                    </p>
                  </SelectCard>
                ))}
              </div>
            </div>
          )}

          <div>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#374151' }}>Peso do paciente</p>
            <div style={{ display: 'flex', alignItems: 'stretch', border: '1.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', background: 'white', maxWidth: 200 }}>
              <input
                type="text"
                inputMode="decimal"
                value={peso}
                onChange={e => { setPeso(e.target.value.replace(/[^0-9.,]/g, '')); setResultado(null) }}
                placeholder="Ex: 70"
                style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 14px', fontSize: 15, color: '#111827', background: 'transparent', fontFamily: 'DM Sans, sans-serif' }}
              />
              <span style={{ background: '#2a569f', color: 'white', fontSize: 13, fontWeight: 600, padding: '0 16px', display: 'flex', alignItems: 'center', borderRadius: '0 8px 8px 0' }}>kg</span>
            </div>
          </div>

          {errorCalculo && (
            <p style={{ color: '#D94F4F', fontSize: 14, margin: 0 }}>{errorCalculo}</p>
          )}

          <button
            onClick={calcular}
            disabled={!podeCalcular || loadingCalculo}
            style={{
              width: '100%',
              background: podeCalcular && !loadingCalculo ? '#2a569f' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '14px 24px',
              fontSize: 16,
              fontWeight: 600,
              cursor: podeCalcular && !loadingCalculo ? 'pointer' : 'default',
              transition: 'background 0.15s',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {loadingCalculo ? 'Calculando...' : 'Calcular dose'}
          </button>

          {resultado && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {resultado.dose_limitada && (
                <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                  <p style={{ margin: 0, fontSize: 13, color: '#92400e', fontWeight: 500 }}>
                    Dose calculada ({fmt(resultado.dose_calculada_mg)} mg) excede a dose máxima. Administrar {fmt(resultado.dose_final_mg)} mg.
                  </p>
                </div>
              )}
              <div style={{ background: '#d1fae5', borderRadius: 16, padding: '20px 24px' }}>
                <p style={{ margin: '0 0 6px', fontSize: 14, color: '#065f46', fontWeight: 500 }}>Volume a administrar</p>
                <p style={{ margin: 0, fontSize: 36, fontWeight: 900, color: '#047857', lineHeight: 1 }}>
                  {fmt(resultado.volume)}
                  <span style={{ fontSize: 24, fontWeight: 700 }}> {UNIDADE[resultado.unidade_volume] ?? resultado.unidade_volume}</span>
                </p>
              </div>
              <div style={{ background: '#f9fafb', borderRadius: 16, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#374151' }}>Resumo do cálculo</p>
                {[
                  ['Peso',                `${pesoNum} kg`],
                  ['Dose calculada',      `${fmt(resultado.dose_calculada_mg)} mg`],
                  ['Dose administrada',   `${fmt(resultado.dose_final_mg)} mg`],
                  ['Concentração usada',  `${resultado.concentracao_usada_mg_por_ml} mg/mL`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#374151' }}>
                    <span>{k}</span><span style={{ fontWeight: 600, color: '#111827' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function IcoConversao({ size = 22, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16V4m0 0L3 8m4-4l4 4"/>
      <path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
    </svg>
  )
}

function TabPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 22px',
        borderRadius: 20,
        border: `2px solid ${active ? '#2a569f' : '#e5e7eb'}`,
        background: active ? '#2a569f' : 'white',
        color: active ? 'white' : '#6B7A8D',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'DM Sans, sans-serif',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}

function ConversaoHub({ conversoes, loading, error, onSelect }) {
  if (loading) return <div className="pd-card" style={{ padding: 24 }}><p style={{ color: '#6B7A8D', fontSize: 14, margin: 0 }}>Carregando conversões...</p></div>
  if (error)   return <div className="pd-card" style={{ padding: 24 }}><p style={{ color: '#D94F4F', fontSize: 14, margin: 0 }}>{error}</p></div>

  const origens = []
  const seen = new Set()
  for (const c of conversoes) {
    if (!seen.has(c.medicamento_origem)) {
      seen.add(c.medicamento_origem)
      origens.push({ id: c.medicamento_origem, nome: c.medicamento_origem_nome })
    }
  }

  return (
    <div className="pd-card" style={{ padding: 24, flex: 'none' }}>
      {origens.length === 0 && <p style={{ color: '#6B7A8D', fontSize: 14, margin: 0 }}>Nenhuma conversão cadastrada.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {origens.map(med => (
          <button
            key={med.id}
            className="protocol-card em-hub-card"
            onClick={() => onSelect(med)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}
          >
            <div className="protocol-icon" style={{ background: medColor(med.id) }}>
              <IcoConversao size={20} color="white" />
            </div>
            <span className="protocol-name">{med.nome}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ConversaoForm({ medOrigem, conversoes, onBack }) {
  const pares = conversoes.filter(c => c.medicamento_origem === medOrigem.id)
  const [selectedPar, setSelectedPar]     = useState(pares.length === 1 ? pares[0] : null)
  const [dose, setDose]                   = useState('')
  const [peso, setPeso]                   = useState('')
  const [resultado, setResultado]         = useState(null)
  const [loading, setLoading]             = useState(false)
  const [erro, setErro]                   = useState(null)

  const precisaPeso = selectedPar?.tipo === 'peso'
  const doseNum = parseFloat(dose.replace(',', '.'))
  const pesoNum = parseFloat(peso.replace(',', '.'))
  const podeConverter = selectedPar && doseNum > 0 && (!precisaPeso || pesoNum > 0)

  const converter = async () => {
    setLoading(true)
    setErro(null)
    try {
      const r = await calcularConversao({
        conversao_id: selectedPar.id,
        dose: doseNum,
        peso: precisaPeso ? pesoNum : undefined,
      })
      setResultado(r)
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pd-card" style={{ padding: '28px 32px', flex: 'none' }}>
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#1B6FD8', fontSize: 14, fontWeight: 500, padding: '0 0 20px', fontFamily: 'DM Sans, sans-serif' }}
      >
        <IcoArrowLeft /> Todas as conversões
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: medColor(medOrigem.id), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IcoConversao size={20} color="white" />
        </div>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#002646' }}>{medOrigem.nome}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#374151' }}>Converter para</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pares.map(par => (
              <SelectCard key={par.id} selected={selectedPar?.id === par.id} onClick={() => { setSelectedPar(par); setResultado(null) }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#002646' }}>{par.medicamento_destino_nome}</p>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#6B7A8D' }}>{par.descricao}</span>
                  <span style={{ fontSize: 12, color: '#6B7A8D' }}>{par.unidade_origem} → {par.unidade_destino}</span>
                </div>
                {par.observacoes ? <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9CA3AF' }}>{par.observacoes}</p> : null}
              </SelectCard>
            ))}
          </div>
        </div>

        <div>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#374151' }}>
            Dose atual ({selectedPar?.unidade_origem || '—'})
          </p>
          <div style={{ display: 'flex', alignItems: 'stretch', border: '1.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', background: 'white', maxWidth: 220 }}>
            <input
              type="text" inputMode="decimal" value={dose} placeholder="Ex: 2.5"
              onChange={e => { setDose(e.target.value.replace(/[^0-9.,]/g, '')); setResultado(null) }}
              style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 14px', fontSize: 15, color: '#111827', background: 'transparent', fontFamily: 'DM Sans, sans-serif' }}
            />
            <span style={{ background: '#2a569f', color: 'white', fontSize: 12, fontWeight: 600, padding: '0 12px', display: 'flex', alignItems: 'center', borderRadius: '0 8px 8px 0', whiteSpace: 'nowrap' }}>
              {selectedPar?.unidade_origem || '—'}
            </span>
          </div>
        </div>

        {precisaPeso && (
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#374151' }}>Peso do paciente</p>
            <div style={{ display: 'flex', alignItems: 'stretch', border: '1.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', background: 'white', maxWidth: 200 }}>
              <input
                type="text" inputMode="decimal" value={peso} placeholder="Ex: 10"
                onChange={e => { setPeso(e.target.value.replace(/[^0-9.,]/g, '')); setResultado(null) }}
                style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 14px', fontSize: 15, color: '#111827', background: 'transparent', fontFamily: 'DM Sans, sans-serif' }}
              />
              <span style={{ background: '#2a569f', color: 'white', fontSize: 13, fontWeight: 600, padding: '0 16px', display: 'flex', alignItems: 'center', borderRadius: '0 8px 8px 0' }}>kg</span>
            </div>
          </div>
        )}

        {erro && <p style={{ color: '#D94F4F', fontSize: 14, margin: 0 }}>{erro}</p>}

        <button
          onClick={converter}
          disabled={!podeConverter || loading}
          style={{
            width: '100%', background: podeConverter && !loading ? '#2a569f' : '#d1d5db',
            color: 'white', border: 'none', borderRadius: 12, padding: '14px 24px',
            fontSize: 16, fontWeight: 600, cursor: podeConverter && !loading ? 'pointer' : 'default',
            transition: 'background 0.15s', fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {loading ? 'Calculando...' : 'Converter'}
        </button>

        {resultado && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#d1fae5', borderRadius: 16, padding: '20px 24px' }}>
              <p style={{ margin: '0 0 6px', fontSize: 14, color: '#065f46', fontWeight: 500 }}>Dose convertida</p>
              <p style={{ margin: 0, fontSize: 36, fontWeight: 900, color: '#047857', lineHeight: 1 }}>
                {fmt(resultado.resultado)}
                <span style={{ fontSize: 20, fontWeight: 700 }}> {resultado.unidade_destino}</span>
              </p>
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 16, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#374151' }}>Resumo</p>
              {[
                [resultado.medicamento_origem, `${fmt(doseNum)} ${resultado.unidade_origem}`],
                ...(precisaPeso ? [['Peso', `${fmt(pesoNum)} kg`]] : []),
                [resultado.medicamento_destino, `${fmt(resultado.resultado)} ${resultado.unidade_destino}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#374151' }}>
                  <span>{k}</span><span style={{ fontWeight: 600, color: '#111827' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CalculadoraShell({ navegar }) {
  const [tab, setTab]                   = useState('dose')
  const [medicamentos, setMedicamentos] = useState([])
  const [loadingMeds, setLoadingMeds]   = useState(true)
  const [errorMeds, setErrorMeds]       = useState(null)
  const [selectedMed, setSelectedMed]   = useState(null)
  const [conversoes, setConversoes]     = useState([])
  const [loadingConv, setLoadingConv]   = useState(true)
  const [errorConv, setErrorConv]       = useState(null)
  const [medOrigem, setMedOrigem]       = useState(null)
  const [recents, setRecents]           = useState([])
  const [favs, setFavs]                 = useState([])

  useEffect(() => {
    setRecents(JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]'))
    setFavs(JSON.parse(localStorage.getItem(FAVS_KEY) || '[]'))
  }, [])

  useEffect(() => {
    fetchMedicamentos()
      .then(setMedicamentos)
      .catch(e => setErrorMeds(e.message))
      .finally(() => setLoadingMeds(false))
    fetchConversoes()
      .then(setConversoes)
      .catch(e => setErrorConv(e.message))
      .finally(() => setLoadingConv(false))
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

  const subtitle = tab === 'conversao'
    ? (medOrigem ? medOrigem.nome : 'Selecione o medicamento para converter')
    : (selectedMed ? selectedMed.nome : 'Selecione o medicamento que deseja calcular')

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
        <div className="pd-main">
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <TabPill label="Dose" active={tab === 'dose'} onClick={() => { setTab('dose'); setMedOrigem(null) }} />
            <TabPill label="Conversão" active={tab === 'conversao'} onClick={() => { setTab('conversao'); setSelectedMed(null) }} />
          </div>

          {tab === 'dose' ? (
            !selectedMed ? (
              <MedicamentosHub
                medicamentos={medicamentos}
                loading={loadingMeds}
                error={errorMeds}
                onSelect={setSelectedMed}
                favs={favs}
                onToggleFav={toggleFav}
              />
            ) : (
              <CalculadoraForm
                med={selectedMed}
                onBack={() => setSelectedMed(null)}
                onResult={handleResult}
              />
            )
          ) : (
            !medOrigem ? (
              <ConversaoHub
                conversoes={conversoes}
                loading={loadingConv}
                error={errorConv}
                onSelect={setMedOrigem}
              />
            ) : (
              <ConversaoForm
                medOrigem={medOrigem}
                conversoes={conversoes}
                onBack={() => setMedOrigem(null)}
              />
            )
          )}
        </div>

        <div className="pd-sidebar">
          <ToggleSidebarCard title="Últimos Cálculos" icon={<IcoClock size={17} />}>
            <div className="pd-sb-list">
              {recents.length === 0
                ? <p style={{ fontSize: 12, color: '#999', padding: '10px 14px' }}>Nenhum cálculo ainda</p>
                : recents.map((r, i) => (
                    <button key={i} className="pd-sb-item pd-sb-item-btn"
                      onClick={() => setSelectedMed({ id: r.medicamento_id, nome: r.medicamento_nome })}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: medColor(r.medicamento_id), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IcoPill size={16} color="white" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="pd-sb-item-label">{r.medicamento_nome}</p>
                        <p className="pd-sb-item-time">{formatTime(r.timestamp)}</p>
                      </div>
                    </button>
                  ))
              }
            </div>
          </ToggleSidebarCard>

          <ToggleSidebarCard title="Favoritos" icon={<IcoStar filled />}>
            <div className="pd-sb-list">
              {favs.length === 0
                ? <p style={{ fontSize: 12, color: '#999', padding: '10px 14px' }}>Nenhum favorito ainda</p>
                : medicamentos.filter(m => favs.includes(m.id)).map((med, i) => (
                    <button key={i} className="pd-sb-item pd-sb-item-btn"
                      onClick={() => setSelectedMed(med)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: medColor(med.id), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IcoPill size={16} color="white" />
                      </div>
                      <p className="pd-sb-item-label" style={{ flex: 1 }}>{med.nome}</p>
                      <IcoStar filled />
                    </button>
                  ))
              }
            </div>
          </ToggleSidebarCard>

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
