import GenesisLogoAlt from '../assets/GenesisLogoAlt.png'

export default function TopBar({ showLogo = true }) {
  return (
    <header className="topbar">
      
      {showLogo ? (
        <img 
          src={GenesisLogoAlt} 
          alt="Logo Genesis" 
          className="topbar-logo" 
          style={{ objectFit: 'contain' }}
        />
      ) : (
        <div style={{ width: '36px', height: '36px' }}></div>
      )}

      {}
      <button className="topbar-menu">
        <span></span>
        <span></span>
        <span></span>
      </button>

    </header>
  );
}