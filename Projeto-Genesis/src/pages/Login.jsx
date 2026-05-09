import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { login as apiLogin } from '../api/auth';
import { setToken } from '../api/client';
import TopBar from '../components/TopBar';
import GenesisLogo from '../assets/GenesisLogo.png';

export default function Login({ onLoginSuccess }) {
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
    <div className="screen">
      <TopBar showLogo={false} />

      <div className="content login-content">
        <div className="login-card">
          <div className="login-logo">
            <img src={GenesisLogo} alt="Logo Genesis" />
          </div>

          <br></br>

          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Usuário"
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
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="test-user">Teste: medico / senha123</p>
        </div>
      </div>
    </div>
  );
}
