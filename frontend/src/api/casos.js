import { apiCall } from './client'

export function fetchCasos() {
  return apiCall('/casos/')
}

export function fetchCaso(id) {
  return apiCall(`/casos/${id}/`)
}

export function responderCaso(id, questaoId, { resposta, opcaoId } = {}) {
  const body = { questao_id: questaoId }
  if (opcaoId != null) body.opcao_id = opcaoId
  if (resposta != null) body.resposta = resposta
  return apiCall(`/casos/${id}/responder/`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
