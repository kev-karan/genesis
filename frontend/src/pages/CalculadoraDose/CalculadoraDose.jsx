import React, { useState } from "react";
import "./CalculadoraDose.css";

const InputField = ({ label, value, onChange, placeholder, unit }) => (
    <div className="calc-field">
        <label className="calc-label">{label}</label>
        <div className="calc-input-row">
            <input
                type="number"
                className="calc-input"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                min="0"
            />
            <span className="unit-badge">{unit}</span>
        </div>
    </div>
);

const CalculadoraDose = ({ navegar }) => {
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
        <>
        <div className="pd-page-header">
            <div className="pd-page-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.5 20.5L3.5 13.5a5 5 0 0 1 7.07-7.07l7 7a5 5 0 0 1-7.07 7.07z"/>
                    <line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/>
                </svg>
            </div>
            <div>
                <p className="pd-page-title">Calculadora</p>
                <p className="pd-page-subtitle">Calcule volumes e doses para administração</p>
            </div>
        </div>
        <div className="calculadora-page">
            <div className="calculadora-grid">
                <div className="calc-card">
                    <h2 className="calc-section-title">Dados para o cálculo</h2>
                    <div className="calc-fields-grid">
                        <InputField
                            label="Dose prescrita"
                            value={dosePrescrita}
                            onChange={setDosePrescrita}
                            placeholder="Ex: 500"
                            unit="mg"
                        />
                        <InputField
                            label="Concentração desejada"
                            value={concentracao}
                            onChange={setConcentracao}
                            placeholder="Ex: 250"
                            unit="mL"
                        />
                        <InputField
                            label="Volume desejado"
                            value={volumeDesejado}
                            onChange={setVolumeDesejado}
                            placeholder="Ex: 10"
                            unit="mL"
                        />
                        <InputField
                            label="Peso do paciente"
                            value={peso}
                            onChange={setPeso}
                            placeholder="Ex: 70"
                            unit="Kg"
                        />
                    </div>
                    <button className="calc-btn" onClick={calcular}>
                        Calcular dose
                    </button>
                </div>

                <div className="calc-card">
                    <h2 className="calc-section-title">Resultado</h2>
                    {resultado ? (
                        <>
                            <div className="resultado-volume-card">
                                <span className="resultado-label">Volume a administrar</span>
                                <div className="resultado-valor">
                                    <strong>{resultado.volume % 1 === 0 ? resultado.volume : resultado.volume.toFixed(2)}</strong>
                                    <span className="resultado-unidade"> mL</span>
                                </div>
                            </div>
                            <div className="resumo-card">
                                <h3 className="resumo-titulo">Resumo do cálculo</h3>
                                <div className="resumo-linha">
                                    <span>Dose prescrita</span>
                                    <span>{resultado.dosePrescrita}mg</span>
                                </div>
                                <div className="resumo-linha">
                                    <span>Concentração desejada</span>
                                    <span>{resultado.concentracao}mL</span>
                                </div>
                                <div className="resumo-linha">
                                    <span>Volume desejado</span>
                                    <span>{resultado.volumeDesejado}mL</span>
                                </div>
                                {resultado.peso && (
                                    <div className="resumo-linha">
                                        <span>Peso do paciente</span>
                                        <span>{resultado.peso}Kg</span>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="resultado-placeholder">
                            Preencha os dados e clique em <strong>Calcular dose</strong>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
};

export default CalculadoraDose;
