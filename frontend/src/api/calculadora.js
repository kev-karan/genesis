import { apiCall } from './client'

export function fetchMedicamentos() {
  return apiCall('/calculadora/medicamentos/')
}

export function fetchMedicamento(id) {
  return apiCall(`/calculadora/medicamentos/${id}/`)
}

export function calcularDose({ peso_kg, dose_referencia_id, apresentacao_id }) {
  return apiCall('/calculadora/calcular/', {
    method: 'POST',
    body: JSON.stringify({ peso_kg, dose_referencia_id, apresentacao_id }),
  })
}

export function fetchConversoes() {
  return apiCall('/calculadora/conversoes/')
}

export function calcularConversao({ conversao_id, dose, peso }) {
  return apiCall('/calculadora/converter/', {
    method: 'POST',
    body: JSON.stringify({ conversao_id, dose, peso }),
  })
}
