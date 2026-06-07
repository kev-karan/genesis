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
