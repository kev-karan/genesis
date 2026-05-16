import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import GenesisLogo from '../assets/GenesisLogoAlt.png';

export default function Cadastro({ onCadastroSuccess }){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleCadastro = async (e) =>{
        e.preventDefault();
        setError('');

        if(password !== confirmPassword){
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);

        try{
            navigate('/login');
        } catch(err){
            setError(err.message || 'Erro ao criar conta');
        } finally{
            setLoading(false);
        }
    };

    return(
        <div className="screen">
            <TopBar showLogo={false}></TopBar>

            <div className="content login-content">
                <div className="login-card">
                    <div className="login-logo">
                        <img src={GenesisLogo} alt="Logo Genesis" />
                    </div>

                    <br />

                    <form onSubmit={handleCadastro}>
                        <input 
                            type="email"
                            placeholder="Digite seu Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading} 
                        />

                        <input 
                            type="password"
                            placeholder="Digite sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />

                        <input 
                            type="password"
                            placeholder="Confirme Sua Senha"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                        />

                        {error && <p className="error">{error}</p>}
                        <button type="submit" disabled={loading}>
                            {loading ? 'Cadastrando...' : 'Cadastrar'}
                        </button>
                    </form>

                    <div style={{textAlign: 'center', marginTop:'16px'}}>
                        <span style={{fontSize:'14px', color:'#888'}}>Já tem uma conta?</span>
                        <a href="/login" style={{fontSize:'14px', color:'#1a6faf'}}>Entrar</a>
                    </div>
                </div>
            </div>
        </div>
    )
};