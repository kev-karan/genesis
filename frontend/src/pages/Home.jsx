import { useState, useEffect } from 'react';
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import GenesisLogo from '../assets/GenesisLogo.png'
import GenesisLogoAlt from '../assets/GenesisLogoAlt.png'
import EmergenciaIcon from '../assets/Emergencia.png'
import CalculadoraIcon from '../assets/Calculadora.png'
import EstudoIcon from '../assets/Estudo.png'
import { listAcessosRecentes, registrarAcesso } from '../api/acessos';

function IcoHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}
function IcoHierarchy() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/>
      <line x1="12" y1="7" x2="12" y2="12"/><line x1="12" y1="12" x2="5.5" y2="17"/><line x1="12" y1="12" x2="18.5" y2="17"/>
    </svg>
  )
}
function IcoPill() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 20.5L3.5 13.5a5 5 0 0 1 7.07-7.07l7 7a5 5 0 0 1-7.07 7.07z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/>
    </svg>
  )
}
function IcoSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#959595" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}
function IcoUser() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
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

const PROTOCOLOS_SEARCH = [
  { id: 'emergencia', nome: 'Modo Emergência' },
  { id: 'dengue',     nome: 'Protocolo de Dengue' },
  { id: 'sedacao',    nome: 'Protocolo de Sedação' },
  { id: 'calculadora',nome: 'Calculadora de Doses' },
]

function DesktopHome({ navegar }) {
  const [busca, setBusca] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchRecentes, setSearchRecentes] = useState([])

  const protocolosFiltrados = PROTOCOLOS_SEARCH.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  )
  const showDropdown = searchFocused && (busca.length > 0 || searchRecentes.length > 0)

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
      {/* Topbar */}
      <div className="pd-topbar">
        <div className="pd-topbar-left">
          <img src={GenesisLogoAlt} className="pd-logo" alt="Genesis" />
          <div className="pd-nav-active">
            <IcoHome />
            <span>INÍCIO</span>
          </div>
          <button className="pd-nav-btn" onClick={() => navegar('emergencia')}><IcoHierarchy /></button>
          <button className="pd-nav-btn" style={{ opacity: 0.4, cursor: 'not-allowed' }} disabled><IcoPill /></button>
        </div>
        <div className="pd-topbar-center">
          <div style={{ position: 'relative' }}>
            <div className="pd-search" style={{ borderRadius: showDropdown ? '15px 15px 0 0' : '15px' }}>
              <IcoSearch />
              <input
                type="text"
                placeholder="O que deseja saber?"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                onFocus={() => {
                  setSearchFocused(true)
                  listAcessosRecentes().then(d => setSearchRecentes(d.slice(0, 3))).catch(() => {})
                }}
                onBlur={() => setSearchFocused(false)}
                className="pd-search-input"
              />
            </div>
            {showDropdown && (
              <div className="pd-search-dropdown">
                {busca.length > 0 ? (
                  protocolosFiltrados.length === 0 ? (
                    <div className="pd-search-empty">Nenhum protocolo encontrado.</div>
                  ) : protocolosFiltrados.map(p => (
                    <button
                      key={p.id}
                      className="pd-search-item"
                      onMouseDown={e => { e.preventDefault(); navegar(p.id) }}
                    >{p.nome}</button>
                  ))
                ) : searchRecentes.length > 0 ? (
                  <>
                    <div className="pd-search-label">Acessos Recentes</div>
                    {searchRecentes.map((acesso, i) => (
                      <button
                        key={i}
                        className="pd-search-item"
                        onMouseDown={e => { e.preventDefault(); navegar(acesso.destino) }}
                      >{acesso.titulo}</button>
                    ))}
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
        <div className="pd-topbar-right">
          <button className="pd-nav-btn pd-user-btn"><IcoUser /></button>
        </div>
      </div>

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