import React, { useState, useEffect } from 'react';
import TopBar from '../../components/TopBar';
import './CalculadoraDoseMobile.css';

const FAVS_KEY = 'calc_favs';

const MEDICAMENTOS = [
    { id: 'amoxicilina',  label: 'Amoxicilina',  color: '#1B5DCA' },
    { id: 'ibuprofeno',   label: 'Ibuprofeno',    color: '#504FA8' },
    { id: 'paracetamol',  label: 'Paracetamol',   color: '#2BA880' },
    { id: 'dipirona',     label: 'Dipirona',       color: '#D58B02' },
    { id: 'amicacina',    label: 'Amicacina',      color: '#D94F4F' },
    { id: 'gentamicina',  label: 'Gentamicina',    color: '#7C3AED' },
];

function IcoPill({ color = 'white' }) {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.5 20.5L3.5 13.5a5 5 0 0 1 7.07-7.07l7 7a5 5 0 0 1-7.07 7.07z"/>
            <line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/>
        </svg>
    );
}

const CalculadoraDoseMobile = ({ navegar }) => {
    const [selectedMed, setSelectedMed] = useState(null);
    const [favs, setFavs] = useState(() => JSON.parse(localStorage.getItem(FAVS_KEY) || '[]'));

    const toggleFav = (id) => {
        const updated = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
        setFavs(updated);
        localStorage.setItem(FAVS_KEY, JSON.stringify(updated));
    };
    const [dosePrescrita, setDosePrescrita] = useState('');
    const [concentracao, setConcentracao] = useState('');
    const [volumeDesejado, setVolumeDesejado] = useState('');
    const [peso, setPeso] = useState('');
    const [resultado, setResultado] = useState(null);

    const selectMed = (med) => {
        setSelectedMed(med);
        setDosePrescrita('');
        setConcentracao('');
        setVolumeDesejado('');
        setPeso('');
        setResultado(null);
    };

    const calcular = () => {
        const dose = parseFloat(dosePrescrita);
        const conc = parseFloat(concentracao);
        const vol = parseFloat(volumeDesejado);
        if (!dose || !conc || !vol || conc === 0) return;
        setResultado({
            volume: (dose * vol) / conc,
            dosePrescrita: dose,
            concentracao: conc,
            volumeDesejado: vol,
            peso: parseFloat(peso) || null,
        });
    };

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
                    <div className="section-header">
                        <h1 className="page-title">Calculadora</h1>
                        <p className="page-subtitle">Selecione o medicamento que deseja calcular</p>
                    </div>
                    <div className="protocol-list" style={{ paddingBottom: 32 }}>
                        {[...MEDICAMENTOS.filter(m => favs.includes(m.id)), ...MEDICAMENTOS.filter(m => !favs.includes(m.id))].map(med => (
                            <button
                                key={med.id}
                                className="protocol-card"
                                onClick={() => selectMed(med)}
                            >
                                <div className="protocol-icon" style={{ background: med.color }}>
                                    <IcoPill />
                                </div>
                                <span className="protocol-name" style={{ flex: 1 }}>{med.label}</span>
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
                    <h1 className="page-title">{selectedMed.label}</h1>
                    <p className="page-subtitle">Calcule volumes e doses para administração</p>
                </div>

                <div className="cm-form-card">
                    <div className="cm-field">
                        <label className="cm-label">Dose prescrita</label>
                        <div className="cm-input-row">
                            <input className="cm-input" type="number" placeholder="Ex: 500" value={dosePrescrita} onChange={e => setDosePrescrita(e.target.value)} min="0" />
                            <span className="cm-unit">mg</span>
                        </div>
                    </div>
                    <div className="cm-field">
                        <label className="cm-label">Concentração desejada</label>
                        <div className="cm-input-row">
                            <input className="cm-input" type="number" placeholder="Ex: 250" value={concentracao} onChange={e => setConcentracao(e.target.value)} min="0" />
                            <span className="cm-unit">mL</span>
                        </div>
                    </div>
                    <div className="cm-field">
                        <label className="cm-label">Volume desejado</label>
                        <div className="cm-input-row">
                            <input className="cm-input" type="number" placeholder="Ex: 10" value={volumeDesejado} onChange={e => setVolumeDesejado(e.target.value)} min="0" />
                            <span className="cm-unit">mL</span>
                        </div>
                    </div>
                    <div className="cm-field">
                        <label className="cm-label">Peso do paciente</label>
                        <div className="cm-input-row">
                            <input className="cm-input" type="number" placeholder="Ex: 70" value={peso} onChange={e => setPeso(e.target.value)} min="0" />
                            <span className="cm-unit">Kg</span>
                        </div>
                    </div>
                    <button className="cm-btn" onClick={calcular}>
                        Calcular dose
                    </button>
                </div>

                {resultado && (
                    <div className="cm-result-section">
                        <div className="cm-result-card">
                            <span className="cm-result-label">Volume a administrar</span>
                            <div className="cm-result-value">
                                <strong>{resultado.volume % 1 === 0 ? resultado.volume : resultado.volume.toFixed(2)}</strong>
                                <span className="cm-result-unit"> mL</span>
                            </div>
                        </div>
                        <div className="cm-summary-card">
                            <p className="cm-summary-title">Resumo do cálculo</p>
                            <div className="cm-summary-row"><span>Dose prescrita</span><span>{resultado.dosePrescrita}mg</span></div>
                            <div className="cm-summary-row"><span>Concentração desejada</span><span>{resultado.concentracao}mL</span></div>
                            <div className="cm-summary-row"><span>Volume desejado</span><span>{resultado.volumeDesejado}mL</span></div>
                            {resultado.peso && (
                                <div className="cm-summary-row"><span>Peso do paciente</span><span>{resultado.peso}Kg</span></div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalculadoraDoseMobile;
