import { useState, useEffect } from 'react'
import { fetchCaso, responderCaso } from '../api/casos'
import './ModoEstudo/ModoEstudo.css'

const TopBar = ({ index, total, onBack }) => (
  <div className="med-topbar">
    <button className="med-back-btn" onClick={onBack} aria-label="Voltar">
      ← Voltar
    </button>
    <span className="med-step-badge">{index + 1}/{total}</span>
  </div>
)

const Feedback = ({ resultado }) => {
  if (!resultado) return null
  return (
    <div className="med-step" style={{ gap: 8 }}>
      {resultado.correto ? (
        <p className="med-acerto">✓ Correto!</p>
      ) : (
        <div className="med-feedback med-feedback--error">
          ✗ Incorreto. Resposta correta: <strong>{resultado.resposta_correta}</strong>
        </div>
      )}
      {resultado.mensagem && (
        <div className="med-card med-card--blue">
          <p className="med-small">{resultado.mensagem}</p>
        </div>
      )}
    </div>
  )
}

const QuestaoMultipla = ({ questao, selecionado, resultado, onSelect }) => (
  <div className="med-options">
    {questao.opcoes.map((op) => {
      let variant = 'med-btn--outline'
      if (resultado) {
        if (selecionado === op.id) variant = resultado.correto ? 'med-btn--success' : 'med-btn--error'
      } else if (selecionado === op.id) {
        variant = 'med-btn--primary'
      }
      return (
        <button
          key={op.id}
          className={`med-btn ${variant}`}
          onClick={() => onSelect(op.id)}
          disabled={!!resultado}
        >
          {op.texto}
        </button>
      )
    })}
  </div>
)

const QuestaoBinaria = ({ selecionado, resultado, onSubmit }) => (
  <div className="med-options">
    {['sim', 'nao'].map((val) => {
      let variant = 'med-btn--outline'
      if (resultado && selecionado === val) {
        variant = resultado.correto ? 'med-btn--success' : 'med-btn--error'
      }
      return (
        <button
          key={val}
          className={`med-btn ${variant}`}
          onClick={() => onSubmit(val)}
          disabled={!!resultado}
        >
          {val === 'sim' ? 'Sim' : 'Não'}
        </button>
      )
    })}
  </div>
)

const QuestaoNumerica = ({ selecionado, resultado, onChange, onSubmit }) => (
  <div className="med-step" style={{ gap: 8 }}>
    <input
      type="text"
      inputMode="decimal"
      value={selecionado ?? ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={!!resultado}
      placeholder="Digite o valor numérico"
      style={{
        width: '100%',
        padding: '12px 16px',
        borderRadius: 10,
        border: '2px solid #c8d8ea',
        fontSize: 14,
        boxSizing: 'border-box',
      }}
    />
    {!resultado && (
      <button
        className="med-btn med-btn--primary"
        onClick={onSubmit}
        disabled={!selecionado}
      >
        Confirmar
      </button>
    )}
  </div>
)

const Conclusao = ({ caso, navegar }) => (
  <div className="med-step med-step--center">
    <div className="med-conclusao-icon">✓</div>
    <h3 className="med-conclusao-titulo">Caso concluído!</h3>
    <p className="med-conclusao-sub">{caso.titulo}</p>

    <div className="med-card med-card--outline med-mt-16">
      <p className="med-small">{caso.descricao}</p>
    </div>

    <button className="med-btn med-btn--primary med-mt-16" onClick={() => navegar('estudo')}>
      Voltar ao Modo Estudo
    </button>
  </div>
)

export default function EstudoCaso({ casoId, navegar }) {
  const [caso, setCaso] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selecionado, setSelecionado] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [submetendo, setSubmetendo] = useState(false)
  const [concluido, setConcluido] = useState(false)
  const [introVista, setIntroVista] = useState(false)

  useEffect(() => {
    fetchCaso(casoId)
      .then((data) => {
        const sorted = { ...data, questoes: [...data.questoes].sort((a, b) => a.ordem - b.ordem) }
        setCaso(sorted)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [casoId])

  if (loading) return <div className="med-step med-step--center"><p>Carregando...</p></div>
  if (error) return <div className="med-step med-step--center"><p className="med-feedback med-feedback--error">{error}</p></div>
  if (!caso) return null

  if (!introVista) return (
    <>
      <div className="med-topbar">
        <button className="med-back-btn" onClick={() => navegar('estudo-caso', casoId)} aria-label="Voltar">
          ← Voltar
        </button>
        <span className="med-step-badge">Caso Clínico</span>
      </div>
      <div className="med-content">
        <div className="med-step">
          <h3 className="med-section-title">{caso.titulo}</h3>
          {caso.contexto && (
            <div className="med-card med-card--blue">
              <p className="med-small">{caso.contexto}</p>
            </div>
          )}
          {caso.descricao && (
            <div className="med-card med-card--yellow">
              <p>{caso.descricao}</p>
            </div>
          )}
          <button className="med-btn med-btn--primary" onClick={() => setIntroVista(true)}>
            Iniciar questões
          </button>
        </div>
      </div>
    </>
  )

  const questoes = caso.questoes
  const questao = questoes[questionIndex]
  const isLast = questionIndex === questoes.length - 1

  const handleBack = () => {
    if (questionIndex === 0) {
      navegar('estudo-caso', casoId)
    } else {
      setQuestionIndex((i) => i - 1)
      setSelecionado(null)
      setResultado(null)
    }
  }

  const submitResposta = async (payload) => {
    if (submetendo) return
    setSubmetendo(true)
    try {
      const res = await responderCaso(casoId, questao.id, payload)
      setResultado(res)
    } catch (e) {
      setResultado({ correto: false, mensagem: e.message, resposta_correta: '' })
    } finally {
      setSubmetendo(false)
    }
  }

  const handleMultiplaConfirmar = () => {
    if (selecionado == null) return
    submitResposta({ opcaoId: selecionado })
  }

  const handleBinaria = (val) => {
    setSelecionado(val)
    submitResposta({ resposta: val })
  }

  const handleNumericaConfirmar = () => {
    if (!selecionado) return
    submitResposta({ resposta: selecionado })
  }

  const handleAvancar = () => {
    if (isLast) {
      setConcluido(true)
    } else {
      setQuestionIndex((i) => i + 1)
      setSelecionado(null)
      setResultado(null)
    }
  }

  if (concluido) {
    return (
      <>
        <div className="med-topbar">
          <span />
          <span className="med-step-badge">Concluído</span>
        </div>
        <div className="med-content">
          <Conclusao caso={caso} navegar={navegar} />
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar index={questionIndex} total={questoes.length} onBack={handleBack} />
      <div className="med-content">
        <div className="med-step">
          <p className="med-question">{questao.enunciado}</p>

          {questao.tipo === 'multipla_escolha' && (
            <QuestaoMultipla
              questao={questao}
              selecionado={selecionado}
              resultado={resultado}
              onSelect={setSelecionado}
            />
          )}

          {questao.tipo === 'binaria' && (
            <QuestaoBinaria
              selecionado={selecionado}
              resultado={resultado}
              onSubmit={handleBinaria}
            />
          )}

          {questao.tipo === 'numerica' && (
            <QuestaoNumerica
              selecionado={selecionado}
              resultado={resultado}
              onChange={setSelecionado}
              onSubmit={handleNumericaConfirmar}
            />
          )}

          <Feedback resultado={resultado} />

          {questao.tipo === 'multipla_escolha' && !resultado && (
            <button
              className="med-btn med-btn--primary med-mt-16"
              onClick={handleMultiplaConfirmar}
              disabled={selecionado == null || submetendo}
            >
              Confirmar
            </button>
          )}

          {resultado && (
            <button className="med-btn med-btn--primary med-mt-16" onClick={handleAvancar}>
              {isLast ? 'Concluir' : 'Próxima pergunta'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
