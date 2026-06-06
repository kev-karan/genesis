import React, { useState } from 'react';
import TopBar from '../../components/TopBar';
import './CalculadoraDoseMobile.css';

const CalculadoraDoseMobile = ({ navegar }) => {
    const [dosePrescrita, setDosePrescrita] = useState('');
    const [concentracao, setConcentracao] = useState('');
    const [volumeDesejado, setVolumeDesejado] = useState('');
    const [peso, setPeso] = useState('');
    const [resultado, setResultado] = useState(null);

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
