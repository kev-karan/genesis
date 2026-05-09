import { useState } from 'react'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import DownloadBtn from '../assets/DownloadBtn.png'
import VisualizarBtn from '../assets/VisualizarBtn.png'
import { useFavorites } from '../hooks/useFavorites'

const LINE_COLOR = '#8FA8C1' 

const fluxo = {
  id: 'suspeita',
  texto: 'Febre por 2 a 7 dias acompanhada de pelo menos dois sintomas (como náusea, vômito, dores no corpo, dor de cabeça, manchas na pele ou outros).\nEm crianças, qualquer febre aguda sem causa aparente também pode ser considerada suspeita.',
  cor: '#5A8BBA',
  filhos: [
    {
      id: 'grupoC',
      texto: 'GRUPO C: Paciente com dengue com sinais de alarme, porém sem critérios de gravidade. Caracteriza-se por manifestações como dor abdominal intensa e contínua, vômitos persistentes, extravasamento de líquidos, hipotensão postural, sangramento de mucosas, letargia/irritabilidade e elevação progressiva do hematócrito.',
      cor: '#275CC5',
      filhos: [
        {
          id: 'acaoC',
          texto: 'Iniciar hidratação imediata independentemente de exames laboratoriais via intravenosa',
          cor: '#275CC5',
          filhos: [
            {
              id: 'acompC',
              texto: 'Acompanhamento',
              cor: '#1D4CA5',
              pill: true,
              filhos: [],
            },
          ],
        },
      ],
    },
    {
      id: 'grupoD',
      texto: 'GRUPO D: Extravasamento plasmático grave com evolução para choque (instabilidade hemodinâmica e hipoperfusão), podendo cursar com insuficiência respiratória, hemorragia grave e disfunção orgânica.',
      cor: '#3697A6',
      filhos: [
        {
          id: 'acaoD',
          texto: 'Iniciar hidratação imediata independentemente de exames laboratoriais via intravenosa',
          cor: '#3697A6',
          filhos: [
            {
              id: 'acompD',
              texto: 'Acompanhamento',
              cor: '#267A87',
              pill: true,
              filhos: [],
            },
          ],
        },
      ],
    },
  ],
}

function FluxoNo({ no, depth = 0, isLast = false }) {
  const [aberto, setAberto] = useState(false)
  const temFilhos = no.filhos && no.filhos.length > 0

  return (
    <div style={{ position: 'relative', marginTop: depth === 0 ? 0 : 20 }}>
      {depth > 0 && (
        <>
          <div style={{
            position: 'absolute', left: -24, top: -20,
            height: isLast ? 44 : 'calc(100% + 20px)',
            width: 2, backgroundColor: LINE_COLOR, zIndex: 0
          }} />
          <div style={{
            position: 'absolute', left: -24, top: 24,
            width: 18, height: 2, backgroundColor: LINE_COLOR, zIndex: 0
          }} />
          <div style={{
            position: 'absolute', left: -8, top: 21,
            width: 8, height: 8, borderRadius: '50%',
            border: `2px solid ${LINE_COLOR}`, backgroundColor: '#F0F7FF', zIndex: 1
          }} />
        </>
      )}

      <div style={{ position: 'relative', zIndex: 2 }}>
        {no.pill ? (
          <div style={{ display: 'flex' }}>
            <button className="pill-btn" style={{ background: no.cor }}>
              {no.texto}
            </button>
          </div>
        ) : (
          <div
            onClick={() => temFilhos && setAberto(!aberto)}
            className="card-protocolo"
            style={{ background: no.cor }}
          >
            {no.texto}
            {temFilhos && (
              <div className={`arrow ${aberto ? 'open' : ''}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>

      {aberto && temFilhos && (
        <div className="nested-content">
          {no.filhos.map((filho, idx) => (
            <FluxoNo 
              key={filho.id} 
              no={filho} 
              depth={depth + 1} 
              isLast={idx === no.filhos.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProtocoloDengue({ navegar }) {
  const FLUXO_ID = 1
  const { isFavorited, addToFavorites, removeFromFavorites } = useFavorites()
  const isFav = isFavorited(FLUXO_ID)

  const handleToggleFavorite = async () => {
    try {
      if (isFav) {
        await removeFromFavorites(FLUXO_ID)
      } else {
        await addToFavorites(FLUXO_ID)
      }
    } catch (err) {
      console.error('Erro ao atualizar favorito:', err)
    }
  }

  return (
    /* Container principal com position: relative para prender os FABs */
    <div className="screen" style={{ position: 'relative', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <TopBar />

      <div className="content" style={{ position: 'relative', zIndex: 1, flex: 1, overflowY: 'auto' }}>
        <button className="back-btn" onClick={() => navegar('emergencia')}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Modo Emergência
        </button>

        <div style={{ padding: '0 20px 120px 24px' }}>
          <FluxoNo no={fluxo} />
        </div>
      </div>

      {/* FABs: Agora dentro do fluxo do celular usando position: absolute */}
      <div className="fab-group" style={{
        position: 'absolute',
        right: '20px',
        bottom: '100px',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <button className="fab" title="Favoritar" onClick={handleToggleFavorite} style={{ fontSize: '20px', color: isFav ? '#fff' : '#999' }}>
          {isFav ? '★' : '☆'}
        </button>
        <button className="fab" title="Download">
          <img
           src={DownloadBtn}
           alt="Botão de Download"
           style={{ width: '20px', height: '20px', objectFit: 'contain' }}
          />
        </button>
        <button className="fab" title="Visualizar">
          <img
           src={VisualizarBtn}
           alt="Botão de Visualização"
           style={{ width: '20px', height: '20px', objectFit: 'contain' }}
          />
        </button>
      </div>

      <style>{`
        .card-protocolo {
          color: white;
          border-radius: 16px;
          padding: 16px 44px 16px 20px;
          font-size: 13px;
          line-height: 1.5;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          white-space: pre-line;
          cursor: pointer;
          position: relative;
        }
        .pill-btn {
          color: white;
          border: none;
          border-radius: 24px;
          padding: 8px 24px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .arrow {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          transition: transform 0.3s ease;
        }
        .arrow.open {
          transform: translateY(-50%) rotate(180deg);
        }
        .nested-content {
          padding-left: 24px;
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <BottomNav navegar={navegar} active="emergencia" />
    </div>
  )
}