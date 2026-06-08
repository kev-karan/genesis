import React, { useState, useEffect } from 'react';
import TopBar from '../../components/TopBar';
import { fetchMedicamentos, fetchMedicamento, calcularDose, fetchConversoes, calcularConversao } from '../../api/calculadora';
import './CalculadoraDoseMobile.css';

const FAVS_KEY = 'calc_favs';

const PALETTE = ['#1B5DCA', '#504FA8', '#2BA880', '#D58B02', '#D94F4F', '#7C3AED'];
const medColor = (id) => PALETTE[id % PALETTE.length];

const fmt = (n) => Number(n) % 1 === 0 ? Number(n) : Number(n).toFixed(2);
const UNIDADE = { ml: 'mL', gotas: 'gotas' };

function IcoPill({ color = 'white' }) {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.5 20.5L3.5 13.5a5 5 0 0 1 7.07-7.07l7 7a5 5 0 0 1-7.07 7.07z"/>
            <line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/>
        </svg>
    );
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
                padding: '12px 14px',
                cursor: 'pointer',
                fontFamily: 'inherit',
            }}
        >
            {children}
        </button>
    );
}

const CalculadoraDoseMobile = ({ navegar }) => {
    const [tab, setTab]                   = useState('dose');
    const [medicamentos, setMedicamentos] = useState([]);
    const [loadingMeds, setLoadingMeds]   = useState(true);
    const [errorMeds, setErrorMeds]       = useState(null);
    const [favs, setFavs]                 = useState(() => JSON.parse(localStorage.getItem(FAVS_KEY) || '[]'));
    const [selectedMed, setSelectedMed]   = useState(null);
    const [conversoes, setConversoes]     = useState([]);
    const [loadingConv, setLoadingConv]   = useState(true);
    const [medOrigem, setMedOrigem]       = useState(null);
    const [selectedConversao, setSelectedConversao] = useState(null);
    const [doseConv, setDoseConv]         = useState('');
    const [pesoConv, setPesoConv]         = useState('');
    const [resultadoConv, setResultadoConv] = useState(null);
    const [loadingConvCalc, setLoadingConvCalc] = useState(false);
    const [erroConv, setErroConv]         = useState(null);

    const [detalhe, setDetalhe]                           = useState(null);
    const [loadingDetalhe, setLoadingDetalhe]             = useState(false);
    const [errorDetalhe, setErrorDetalhe]                 = useState(null);
    const [selectedDoseRef, setSelectedDoseRef]           = useState(null);
    const [selectedApresentacao, setSelectedApresentacao] = useState(null);
    const [peso, setPeso]                                 = useState('');
    const [resultado, setResultado]                       = useState(null);
    const [loadingCalculo, setLoadingCalculo]             = useState(false);
    const [errorCalculo, setErrorCalculo]                 = useState(null);

    useEffect(() => {
        fetchMedicamentos()
            .then(setMedicamentos)
            .catch(e => setErrorMeds(e.message))
            .finally(() => setLoadingMeds(false));
        fetchConversoes()
            .then(setConversoes)
            .catch(() => {})
            .finally(() => setLoadingConv(false));
    }, []);

    const toggleFav = (id) => {
        const updated = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
        setFavs(updated);
        localStorage.setItem(FAVS_KEY, JSON.stringify(updated));
    };

    const selectMed = (med) => {
        setSelectedMed(med);
        setDetalhe(null);
        setSelectedDoseRef(null);
        setSelectedApresentacao(null);
        setPeso('');
        setResultado(null);
        setErrorDetalhe(null);
        setErrorCalculo(null);
        setLoadingDetalhe(true);
        fetchMedicamento(med.id)
            .then(data => {
                setDetalhe(data);
                if (data.doses_referencia.length === 1) setSelectedDoseRef(data.doses_referencia[0]);
                if (data.apresentacoes.length === 1)    setSelectedApresentacao(data.apresentacoes[0]);
            })
            .catch(e => setErrorDetalhe(e.message))
            .finally(() => setLoadingDetalhe(false));
    };

    const selectOrigem = (med) => {
        setMedOrigem(med);
        setSelectedConversao(null);
        setDoseConv('');
        setPesoConv('');
        setResultadoConv(null);
        setErroConv(null);
    };

    const converterMed = async () => {
        setLoadingConvCalc(true);
        setErroConv(null);
        try {
            const doseNum = parseFloat(doseConv.replace(',', '.'));
            const pesoNum = parseFloat(pesoConv.replace(',', '.'));
            const r = await calcularConversao({
                conversao_id: selectedConversao.id,
                dose: doseNum,
                peso: selectedConversao.tipo === 'peso' ? pesoNum : undefined,
            });
            setResultadoConv(r);
        } catch (e) {
            setErroConv(e.message);
        } finally {
            setLoadingConvCalc(false);
        }
    };

    const pesoNum      = parseFloat(peso.replace(',', '.'));
    const podeCalcular = selectedDoseRef && selectedApresentacao && pesoNum > 0;

    const calcular = async () => {
        setLoadingCalculo(true);
        setErrorCalculo(null);
        try {
            const r = await calcularDose({
                peso_kg: pesoNum,
                dose_referencia_id: selectedDoseRef.id,
                apresentacao_id: selectedApresentacao.id,
            });
            setResultado(r);
        } catch (e) {
            setErrorCalculo(e.message);
        } finally {
            setLoadingCalculo(false);
        }
    };

    const favList = medicamentos.filter(m => favs.includes(m.id));
    const outros  = medicamentos.filter(m => !favs.includes(m.id));
    const ordered = [...favList, ...outros];

    const tabStyle = (active) => ({
        flex: 1, padding: '8px 0', borderRadius: 20, border: `2px solid ${active ? '#2a569f' : '#e5e7eb'}`,
        background: active ? '#2a569f' : 'white', color: active ? 'white' : '#6B7A8D',
        fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
    });

    const paresConv = medOrigem ? conversoes.filter(c => c.medicamento_origem === medOrigem.id) : [];
    const doseConvNum = parseFloat(doseConv.replace(',', '.'));
    const pesoConvNum = parseFloat(pesoConv.replace(',', '.'));
    const precisaPeso = selectedConversao?.tipo === 'peso';
    const podeConverter = selectedConversao && doseConvNum > 0 && (!precisaPeso || pesoConvNum > 0);

    const origens = [];
    const seen = new Set();
    for (const c of conversoes) {
        if (!seen.has(c.medicamento_origem)) {
            seen.add(c.medicamento_origem);
            origens.push({ id: c.medicamento_origem, nome: c.medicamento_origem_nome });
        }
    }

    if (tab === 'conversao') {
        if (!medOrigem) {
            return (
                <div className="screen proto-mobile">
                    <TopBar />
                    <div className="content">
                        <button className="back-btn" onClick={() => navegar('home')}>
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            Voltar
                        </button>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                            <button style={tabStyle(false)} onClick={() => setTab('dose')}>Dose</button>
                            <button style={tabStyle(true)}>Conversão</button>
                        </div>
                        <div className="section-header">
                            <h1 className="page-title">Conversão</h1>
                            <p className="page-subtitle">Selecione o medicamento para converter</p>
                        </div>
                        {loadingConv && <p style={{ color: '#6B7A8D', fontSize: 14, padding: '8px 0' }}>Carregando...</p>}
                        <div className="protocol-list" style={{ paddingBottom: 32 }}>
                            {origens.map(med => (
                                <button key={med.id} className="protocol-card" onClick={() => selectOrigem(med)}>
                                    <div className="protocol-icon" style={{ background: medColor(med.id) }}>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
                                        </svg>
                                    </div>
                                    <span className="protocol-name" style={{ textAlign: 'left' }}>{med.nome}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="screen proto-mobile">
                <TopBar />
                <div className="content">
                    <button className="back-btn" onClick={() => setMedOrigem(null)}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Todas as conversões
                    </button>
                    <div className="section-header">
                        <h1 className="page-title">{medOrigem.nome}</h1>
                    </div>

                    <div className="cm-form-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#374151' }}>Converter para</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {paresConv.map(par => (
                                    <SelectCard key={par.id} selected={selectedConversao?.id === par.id}
                                        onClick={() => { setSelectedConversao(par); setResultadoConv(null); }}>
                                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#002646' }}>{par.medicamento_destino_nome}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7A8D' }}>{par.descricao}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9CA3AF' }}>{par.unidade_origem} → {par.unidade_destino}</p>
                                        {par.observacoes ? <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9CA3AF' }}>{par.observacoes}</p> : null}
                                    </SelectCard>
                                ))}
                            </div>
                        </div>

                        <div className="cm-field">
                            <label className="cm-label">Dose atual ({selectedConversao?.unidade_origem || '—'})</label>
                            <div className="cm-input-row">
                                <input className="cm-input" type="text" inputMode="decimal" placeholder="Ex: 2.5"
                                    value={doseConv}
                                    onChange={e => { setDoseConv(e.target.value.replace(/[^0-9.,]/g, '')); setResultadoConv(null); }} />
                                <span className="cm-unit" style={{ fontSize: 11, padding: '0 10px', whiteSpace: 'nowrap' }}>
                                    {selectedConversao?.unidade_origem || '—'}
                                </span>
                            </div>
                        </div>

                        {precisaPeso && (
                            <div className="cm-field">
                                <label className="cm-label">Peso do paciente</label>
                                <div className="cm-input-row">
                                    <input className="cm-input" type="text" inputMode="decimal" placeholder="Ex: 10"
                                        value={pesoConv}
                                        onChange={e => { setPesoConv(e.target.value.replace(/[^0-9.,]/g, '')); setResultadoConv(null); }} />
                                    <span className="cm-unit">kg</span>
                                </div>
                            </div>
                        )}

                        {erroConv && <p style={{ color: '#D94F4F', fontSize: 13, margin: 0 }}>{erroConv}</p>}

                        <button className="cm-btn" onClick={converterMed}
                            disabled={!podeConverter || loadingConvCalc}
                            style={{ opacity: podeConverter && !loadingConvCalc ? 1 : 0.5 }}>
                            {loadingConvCalc ? 'Calculando...' : 'Converter'}
                        </button>
                    </div>

                    {resultadoConv && (
                        <div className="cm-result-section">
                            <div className="cm-result-card">
                                <span className="cm-result-label">Dose convertida</span>
                                <div className="cm-result-value">
                                    <strong>{fmt(resultadoConv.resultado)}</strong>
                                    <span className="cm-result-unit"> {resultadoConv.unidade_destino}</span>
                                </div>
                            </div>
                            <div className="cm-summary-card">
                                <p className="cm-summary-title">Resumo</p>
                                <div className="cm-summary-row"><span>{resultadoConv.medicamento_origem}</span><span>{fmt(doseConvNum)} {resultadoConv.unidade_origem}</span></div>
                                {precisaPeso && <div className="cm-summary-row"><span>Peso</span><span>{fmt(pesoConvNum)} kg</span></div>}
                                <div className="cm-summary-row"><span>{resultadoConv.medicamento_destino}</span><span>{fmt(resultadoConv.resultado)} {resultadoConv.unidade_destino}</span></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!selectedMed) {
        return (
            <div className="screen proto-mobile">
                <TopBar />
                <div className="content">
                    <button className="back-btn" onClick={() => navegar('home')}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Voltar
                    </button>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                        <button style={tabStyle(true)}>Dose</button>
                        <button style={tabStyle(false)} onClick={() => setTab('conversao')}>Conversão</button>
                    </div>
                    <div className="section-header">
                        <h1 className="page-title">Calculadora</h1>
                        <p className="page-subtitle">Selecione o medicamento que deseja calcular</p>
                    </div>

                    {loadingMeds && <p style={{ color: '#6B7A8D', fontSize: 14, padding: '8px 0' }}>Carregando medicamentos...</p>}
                    {errorMeds   && <p style={{ color: '#D94F4F', fontSize: 14, padding: '8px 0' }}>{errorMeds}</p>}

                    <div className="protocol-list" style={{ paddingBottom: 32 }}>
                        {ordered.map(med => (
                            <button
                                key={med.id}
                                className="protocol-card"
                                onClick={() => selectMed(med)}
                            >
                                <div className="protocol-icon" style={{ background: medColor(med.id) }}>
                                    <IcoPill />
                                </div>
                                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                    <span className="protocol-name">{med.nome}</span>
                                    {med.principio_ativo && (
                                        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6B7A8D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {med.principio_ativo}
                                        </p>
                                    )}
                                </div>
                                <div
                                    onClick={e => { e.stopPropagation(); toggleFav(med.id); }}
                                    style={{ padding: '8px', display: 'flex', alignItems: 'center', fontSize: '20px', color: favs.includes(med.id) ? '#F5A623' : '#ccc', transition: 'color 0.2s' }}
                                >
                                    {favs.includes(med.id) ? '★' : '☆'}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="screen proto-mobile">
            <TopBar />
            <div className="content">
                <button className="back-btn" onClick={() => setSelectedMed(null)}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Todos os medicamentos
                </button>
                <div className="section-header">
                    <h1 className="page-title">{selectedMed.nome}</h1>
                    {selectedMed.principio_ativo && (
                        <p className="page-subtitle">{selectedMed.principio_ativo}</p>
                    )}
                </div>

                {loadingDetalhe && <p style={{ color: '#6B7A8D', fontSize: 14, padding: '8px 0' }}>Carregando dados do medicamento...</p>}
                {errorDetalhe   && <p style={{ color: '#D94F4F', fontSize: 14, padding: '8px 0' }}>{errorDetalhe}</p>}

                {detalhe && (
                    <div className="cm-form-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {detalhe.doses_referencia.length > 0 && (
                            <div>
                                <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#374151' }}>Dose de referência</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {detalhe.doses_referencia.map(d => (
                                        <SelectCard
                                            key={d.id}
                                            selected={selectedDoseRef?.id === d.id}
                                            onClick={() => { setSelectedDoseRef(d); setResultado(null); }}
                                        >
                                            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#002646' }}>
                                                {d.dose_mg_por_kg} mg/kg
                                            </p>
                                            <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
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
                                        <SelectCard
                                            key={a.id}
                                            selected={selectedApresentacao?.id === a.id}
                                            onClick={() => { setSelectedApresentacao(a); setResultado(null); }}
                                        >
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

                        <div className="cm-field">
                            <label className="cm-label">Peso do paciente</label>
                            <div className="cm-input-row">
                                <input
                                    className="cm-input"
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="Ex: 70"
                                    value={peso}
                                    onChange={e => { setPeso(e.target.value.replace(/[^0-9.,]/g, '')); setResultado(null); }}
                                />
                                <span className="cm-unit">kg</span>
                            </div>
                        </div>

                        {errorCalculo && (
                            <p style={{ color: '#D94F4F', fontSize: 13, margin: 0 }}>{errorCalculo}</p>
                        )}

                        <button
                            className="cm-btn"
                            onClick={calcular}
                            disabled={!podeCalcular || loadingCalculo}
                            style={{ opacity: podeCalcular && !loadingCalculo ? 1 : 0.5 }}
                        >
                            {loadingCalculo ? 'Calculando...' : 'Calcular dose'}
                        </button>
                    </div>
                )}

                {resultado && (
                    <div className="cm-result-section">
                        {resultado.dose_limitada && (
                            <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 12 }}>
                                <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
                                <p style={{ margin: 0, fontSize: 13, color: '#92400e', fontWeight: 500 }}>
                                    Dose calculada ({fmt(resultado.dose_calculada_mg)} mg) excede a máxima. Administrar {fmt(resultado.dose_final_mg)} mg.
                                </p>
                            </div>
                        )}
                        <div className="cm-result-card">
                            <span className="cm-result-label">Volume a administrar</span>
                            <div className="cm-result-value">
                                <strong>{fmt(resultado.volume)}</strong>
                                <span className="cm-result-unit"> {UNIDADE[resultado.unidade_volume] ?? resultado.unidade_volume}</span>
                            </div>
                        </div>
                        <div className="cm-summary-card">
                            <p className="cm-summary-title">Resumo do cálculo</p>
                            <div className="cm-summary-row"><span>Peso</span><span>{pesoNum} kg</span></div>
                            <div className="cm-summary-row"><span>Dose calculada</span><span>{fmt(resultado.dose_calculada_mg)} mg</span></div>
                            <div className="cm-summary-row"><span>Dose administrada</span><span>{fmt(resultado.dose_final_mg)} mg</span></div>
                            <div className="cm-summary-row"><span>Concentração</span><span>{resultado.concentracao_usada_mg_por_ml} mg/mL</span></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalculadoraDoseMobile;
