import { useState, useEffect } from 'react';
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import GenesisLogo from '../assets/GenesisLogo.png'
import EmergenciaIcon from '../assets/Emergencia.png'
import CalculadoraIcon from '../assets/Calculadora.png'
import EstudoIcon from '../assets/Estudo.png'
import { listAcessosRecentes, registrarAcesso } from '../api/acessos'


function IcoBook() {
  return (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}
function IcoHierarchyLg() {
  return (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/>
      <line x1="12" y1="7" x2="12" y2="12"/><line x1="12" y1="12" x2="5.5" y2="17"/><line x1="12" y1="12" x2="18.5" y2="17"/>
    </svg>
  )
}
function IcoCalcLg() {
  return (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <line x1="8" y1="6" x2="16" y2="6"/>
      <line x1="8" y1="10" x2="8" y2="10" strokeWidth="3"/><line x1="12" y1="10" x2="12" y2="10" strokeWidth="3"/><line x1="16" y1="10" x2="16" y2="10" strokeWidth="3"/>
      <line x1="8" y1="14" x2="8" y2="14" strokeWidth="3"/><line x1="12" y1="14" x2="12" y2="14" strokeWidth="3"/><line x1="16" y1="14" x2="16" y2="14" strokeWidth="3"/>
      <line x1="8" y1="18" x2="13" y2="18"/>
    </svg>
  )
}

function DesktopHome({ navegar }) {
  const cards = [
    {
      label: 'Fluxogramas\nModo Emergência',
      color: '#1B5DCA',
      icon: <IcoHierarchyLg />,
      action: () => navegar('emergencia'),
      disabled: false,
    },
    {
      label: 'Calculadora\nde Doses',
      color: '#504FA8',
      icon: <IcoCalcLg />,
      action: null,
      disabled: true,
    },
    {
      label: 'Fluxogramas\nModo Estudo',
      color: '#5B91C0',
      icon: <IcoBook />,
      action: null,
      disabled: true,
    },
  ]

  return (
    <div className="proto-desktop">
      {/* Cards */}
      <div className="hd-body">
        <div className="hd-cards-row">
          {cards.map((card, i) => (
            <div key={i} className={`hd-card${card.disabled ? ' hd-card--disabled' : ''}`}>
              <div className="hd-card-icon" style={{ background: card.color }}>
                {card.icon}
              </div>
              <p className="hd-card-label">{card.label}</p>
              <button
                className="hd-card-btn"
                onClick={card.action ?? undefined}
                disabled={card.disabled}
              >
                Acesse &nbsp;→
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const FLUXOGRAMA_IDS = { dengue: 1, sedacao: 2 };
const ID_PARA_PROTOCOLO = {
  1: { nome: 'Protocolo de Dengue', navId: 'dengue' },
  2: { nome: 'Protocolo de Sedação', navId: 'sedacao' },
};

export default function Home({ navegar }) {
  const [busca, setBusca] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentAccesses, setRecentAccesses] = useState([]);

  const protocolos = [
    { id: 'emergencia', nome: 'Modo Emergência' },
    { id: 'dengue', nome: 'Protocolo de Dengue' },
    { id: 'sedacao', nome: 'Protocolo de Sedação' },
    { id: 'calculadora', nome: 'Calculadora de Doses' }
  ];


  const navegarComAcesso = (destino) => {
    const fluxogramaId = FLUXOGRAMA_IDS[destino];
    if (fluxogramaId) {
      registrarAcesso(fluxogramaId)
        .then(() => listAcessosRecentes())
        .then(data => setRecentAccesses(data.slice(0, 3)))
        .catch(() => {});
    }
    navegar(destino);
  };

  const protocolosFiltrados = protocolos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const showDropdown = isFocused && (busca.length > 0 || recentAccesses.length > 0);

  return (
    <>
    <DesktopHome navegar={navegarComAcesso} />
    <div className="screen proto-mobile">
      <TopBar showLogo={false} />
      
      <div className="content">
        {/* Hero */}
        <div className="home-hero">
          <div className="genesis-logo-wrap">
            <img src={GenesisLogo} alt="Logo Genesis" className="genesis-logo-wave"/>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 50 }}>
          
          {/* Search bar */}
          <div className="search-bar"
            style={{
              borderRadius: showDropdown ? '24px 24px 0 0' : '24px',
              transition: 'border-radius 0.2s ease',
              marginBottom: 0
            }}
          >
            <input
              type="text"
              placeholder="O que deseja saber?"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onFocus={() => {
                setIsFocused(true);
                listAcessosRecentes()
                  .then(data => setRecentAccesses(data.slice(0, 3)))
                  .catch(() => {});
              }}
              onBlur={() => setIsFocused(false)}
            />
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
          </div>

          {/* dropdown de pesquisa */}
          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderTop: 'none',
                borderRadius: '0 0 24px 24px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
              }}
            >
              {busca.length > 0 ? (
                <>
                  {protocolosFiltrados.map(p => (
                    <button
                      key={p.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        navegarComAcesso(p.id);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 20px',
                        border: 'none',
                        borderBottom: '1px solid #f5f5f5',
                        textAlign: 'left',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#333',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#f0f4f8'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                    >
                      {p.nome}
                    </button>
                  ))}

                  {protocolosFiltrados.length === 0 && (
                    <div style={{ padding: '15px 20px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
                      Nenhum protocolo encontrado.
                    </div>
                  )}
                </>
              ) : (
                <>
                  {recentAccesses.length > 0 && (
                    <>
                      <div style={{ padding: '12px 20px', fontSize: '12px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>
                        Acessos Recentes
                      </div>
                      {recentAccesses.map((acesso, idx) => {
                        const protocolo = ID_PARA_PROTOCOLO[acesso.fluxograma_id];
                        if (!protocolo) return null;
                        return (
                          <button
                            key={acesso.id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              navegar(protocolo.navId);
                            }}
                            style={{
                              display: 'block',
                              width: '100%',
                              padding: '12px 20px',
                              border: 'none',
                              borderBottom: idx < recentAccesses.length - 1 ? '1px solid #f5f5f5' : 'none',
                              textAlign: 'left',
                              backgroundColor: 'white',
                              cursor: 'pointer',
                              fontSize: '16px',
                              color: '#333',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#f0f4f8'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                          >
                            {protocolo.nome}
                          </button>
                        );
                      })}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="quick-grid" style={{ marginTop: '24px' }}>
          <button className="quick-btn" onClick={() => navegarComAcesso('emergencia')}>
            <div className="quick-icon">
              <img src={EmergenciaIcon} alt='Icon Modo Emergência'
              style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            </div>
            <span className="quick-label">Modo Emergência</span>
          </button>

          {/* <button className="quick-btn" onClick={() => navegar('calculadora')}>
            <div className="quick-icon">
              <img src={CalculadoraIcon} alt='Icon Calculadora de Doses'
              style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            </div>
            <span className="quick-label">Calculadora de Doses</span>
          </button> */}

          <button className="quick-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <div className="quick-icon">
              <img src={CalculadoraIcon} alt='Icon Calculadora de Doses'
              style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            </div>
            <span className="quick-label">Calculadora de Doses</span>
          </button>

          <button className="quick-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <div className="quick-icon">
              <img src={EstudoIcon} alt='Icon Modo Estudo'
              style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            </div>
            <span className="quick-label">Modo Estudo</span>
          </button>
        </div>

      </div>

      <BottomNav navegar={navegar} active="home" />
    </div>
    </>
  )
}