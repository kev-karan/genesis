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
  
  const [showTooltip, setShowTooltip] = useState(false); 
  
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
            <p className="test-user" style={{ margin: 0 }}>Teste: medico / senha123</p>
            
            <div 
              style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >

              {/* Daqui pra baixo é tudo pro ícone de tooltip de login */}
              <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '18px', 
                  height: '18px', 
                  borderRadius: '50%', 
                  backgroundColor: '#dbdbdb', 
                  color: 'white', 
                  fontSize: '12px', 
                  fontWeight: 'bold', 
                  cursor: 'help' 
              }}>?</span>
              
              {showTooltip && (
                <div style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '260px',
                  padding: '12px',
                  backgroundColor: '#333',
                  color: 'white',
                  fontSize: '12px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  textAlign: 'center',
                  lineHeight: '1.5'
                }}>
                  Rode <strong>python manage.py createsuperuser</strong> na pasta <strong>projeto_genesis</strong> (cd projeto_genesis) pra criar o usuário. Quando pedir email deixa em branco e aperta enter
                  
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderWidth: '6px',
                    borderStyle: 'solid',
                    borderColor: '#333 transparent transparent transparent'
                  }} />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}