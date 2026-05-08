import React, { useState, useEffect } from "react";
import { ChevronLeft, Star, User, Droplet, ChevronDown, Home, ClipboardList, Pill } from 'lucide-react';
import './App.css';

const App = () => {
    const [peso, setPeso] = useState(0);
    const [dose, setDose] = useState(0);
    const [resultadoTotal, setResultadoTotal] = useState(0);

    const handlePesoChange = (valor) => {
        if (valor === "") { setPeso(""); return; }
        const num = parseFloat(valor);
        if (!isNaN(num) && num <= 700) {
            setPeso(num);
        }
    };

    const ajustarDose = (delta) => {
        setDose(prev => {
            const nova = Math.max(0.1, prev + delta);
            return parseFloat(nova.toFixed(1));
        });
    };

    useEffect(() => {
        setResultadoTotal((parseFloat(peso) || 0) * dose);
    }, [peso, dose]);

    const isDoseAlta = resultadoTotal > 100;

    return (
        <div className="body-container">
            <div className="telefone-tela">
                <header className="app-header">
                    <ChevronLeft color="white" size={24} /> 
                    <h2 className="header-titulo">Cálculo de Dose</h2>
                    <Star color="white" size={20} />
                </header>

                <div className="app-container">
                    <div className="instrucao">Digite os valores para ver o cálculo</div>

                    {/* Linha Peso */}
                    <div className="input-linha">
                        <div className="label-grupo">
                            <div className="icones"><User size={18} color="#3467B0" /></div>
                            <span className="label-texto">Peso (Kg)</span>
                        </div>
                        <div className="container-input">
                            <button onClick={() => handlePesoChange(peso - 1)} className="step-btn">-</button>
                            <input
                                type="number"
                                value={peso}
                                onChange={(e) => handlePesoChange(e.target.value)}
                                className="input-peso"
                            />
                            <button onClick={() => handlePesoChange(peso + 1)} className="step-btn">+</button>
                        </div>
                    </div>

                    {/* Linha Dose */}
                    <div className="input-linha">
                        <div className="label-grupo">
                            <div className="icon-circle"><Droplet size={18} color="#3467B0" /></div>
                            <span className="label-texto">Dose (mg/kg)</span>
                        </div>
                        <div className="container-input">
                            <button onClick={() => ajustarDose(-0.1)} className="step-btn">-</button>
                            <div className="input-field" style={{ lineHeight: '40px' }}>
                                {dose.toLocaleString('pt-BR')}
                            </div>
                            <button onClick={() => ajustarDose(0.1)} className="step-btn">+</button>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', margin: '15px 0' }}>
                        <ChevronDown color="#3467B0" />
                    </div>

                    {/* Card Resultado 1 */}
                    <div className="resultado-card" style={{ backgroundColor: isDoseAlta ? 'var(--vermelho-alerta)' : 'var(--verde-sucesso)' }}>
                        <h3 className="card-titulo" style={{ color: isDoseAlta ? 'var(--vermelho-texto)' : 'var(--verde-texto)' }}>
                            DOSE TOTAL 24h
                        </h3>
                        <div className="result-value" style={{ color: isDoseAlta ? 'var(--vermelho-texto)' : 'var(--verde-texto)' }}>
                            {resultadoTotal.toLocaleString('pt-BR')} mg
                        </div>
                        <span style={{ fontSize: '12px', opacity: 0.7 }}>Por dia</span>
                    </div>

                    {/* Card Resultado 2 */}
                    <div className="resultado-card" style={{ backgroundColor: isDoseAlta ? 'var(--vermelho-alerta)' : 'var(--verde-sucesso)' }}>
                        <h3 className="card-titulo" style={{ color: isDoseAlta ? 'var(--vermelho-texto)' : 'var(--verde-texto)' }}>
                            POR ADMINISTRAÇÃO (6/6h)
                        </h3>
                        <div className="result-value" style={{ color: isDoseAlta ? 'var(--vermelho-texto)' : 'var(--verde-texto)' }}>
                            {(resultadoTotal / 4).toLocaleString('pt-BR')} mg
                        </div>
                        <span style={{ fontSize: '12px', opacity: 0.7 }}>A cada 6 horas</span>
                    </div>
                </div>

                <footer className="app-footrt">
                    <Home color="white" size={24} />
                    <Pill color="white" size={24} />
                    <ClipboardList color="white" size={24} />
                </footer>
            </div>
        </div>
    );
};

export default App;