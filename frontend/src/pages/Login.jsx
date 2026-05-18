import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { login as apiLogin } from '../api/auth';
import GenesisLogo from '../assets/GenesisLogoAlt.png';
import loginBg from '../assets/FotoFundo.png';
import arcaLogo from '../assets/arca-logo.svg';

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#959595" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#959595" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

export default function Login({ onLoginSuccess, onCriarConta, message }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiLogin(username, password);
      login(data, data.token);
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Desktop: Figma design */}
      <div className="login-desktop">
        <div className="login-bg-gradient" />
        <img className="login-bg-photo" src={loginBg} alt="" aria-hidden="true" />

        <div className="login-corner-logo">
          <img src={GenesisLogo} alt="Genesis" />
        </div>

        <div className="login-form-area">
          <h1 className="login-title">Genesis</h1>

          <form onSubmit={handleLogin} className="login-form">
            <div className="login-field">
              <input
                type="text"
                placeholder="Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
              <span className="login-field-icon"><UserIcon /></span>
            </div>

            <div className="login-field">
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <span className="login-field-icon"><LockIcon /></span>
            </div>

            {message && <p className="login-success">{message}</p>}
            {error && <p className="login-error">{error}</p>}

            <div className="login-actions">
              <button
                type="button"
                className="login-criar-conta login-link-button"
                onClick={onCriarConta}
                disabled={loading}
              >
                Criar Conta
              </button>

              <button type="submit" className="login-btn-entrar" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
        </div>

        <div className="login-bottom-bar">
          <img src={arcaLogo} alt="ARCA" />
        </div>
      </div>

      {/* Mobile: card layout */}
      <div className="login-mobile">
        <div className="login-card">
          <div className="login-logo">
            <img src={GenesisLogo} alt="Logo Genesis" />
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            {message && <p className="login-success">{message}</p>}
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <button
            type="button"
            className="login-link-button"
            onClick={onCriarConta}
            disabled={loading}
          >
            Criar Conta
          </button>
        </div>
      </div>
    </>
  );
}