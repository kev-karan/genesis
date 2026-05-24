import { apiCall } from './client'

export function fetchCasos() {
  return apiCall('/casos/')
}

export function fetchCaso(id) {
  return apiCall(`/casos/${id}/`)
}

export function responderCaso(id, questaoId, resposta) {
  return apiCall(`/casos/${id}/responder/`, {
    method: 'POST',
    body: JSON.stringify({ questao_id: questaoId, resposta }),
  })
}
