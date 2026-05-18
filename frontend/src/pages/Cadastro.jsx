import { useState } from "react";
import { cadastro as apiCadastro } from '../api/auth';
import TopBar from '../components/TopBar';
import GenesisLogo from '../assets/GenesisLogo.png';

export default function Cadastro({ onCadastroSuccess, onVoltarLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCadastro = async (e) => {
        e.preventDefault();
        setError('');

        const normalizedEmail = email.trim().toLowerCase();

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);

        try {
            await apiCadastro({
                email: normalizedEmail,
                password,
                confirmPassword,
            });

            onCadastroSuccess();
        } catch (err) {
            setError(err.message || 'Erro ao criar conta');
        } finally {
            setLoading(false);
        }
    };

    return (
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

                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <span style={{ fontSize: '14px', color: '#888', marginRight: '6px' }}>
                            Já tem uma conta?
                        </span>

                        <button
                            type="button"
                            className="login-link-button"
                            onClick={onVoltarLogin}
                            disabled={loading}
                        >
                            Entrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
};