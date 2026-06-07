import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fetchMedicamentos, fetchMedicamento, calcularDose } from './calculadora'
import * as client from './client'

vi.mock('./client')

describe('Calculadora API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchMedicamentos', () => {
    it('calls correct endpoint', async () => {
      client.apiCall.mockResolvedValue([])
      await fetchMedicamentos()
      expect(client.apiCall).toHaveBeenCalledWith('/calculadora/medicamentos/')
    })

    it('returns medication list', async () => {
      const mock = [
        { id: 1, nome: 'Paracetamol', principio_ativo: 'Paracetamol', categoria: '' },
        { id: 2, nome: 'Ibuprofeno',  principio_ativo: 'Ibuprofeno',  categoria: '' },
      ]
      client.apiCall.mockResolvedValue(mock)
      const result = await fetchMedicamentos()
      expect(result).toEqual(mock)
    })

    it('injects auth token via apiCall', async () => {
      client.apiCall.mockResolvedValue([])
      await fetchMedicamentos()
      expect(client.apiCall).toHaveBeenCalledTimes(1)
    })

    it('propagates API errors', async () => {
      client.apiCall.mockRejectedValue(new Error('Unauthorized'))
      await expect(fetchMedicamentos()).rejects.toThrow('Unauthorized')
    })
  })

  describe('fetchMedicamento', () => {
    it('calls endpoint with correct id', async () => {
      client.apiCall.mockResolvedValue({})
      await fetchMedicamento(5)
      expect(client.apiCall).toHaveBeenCalledWith('/calculadora/medicamentos/5/')
    })

    it('returns detail with nested doses and apresentacoes', async () => {
      const mock = {
        id: 1,
        nome: 'Paracetamol',
        principio_ativo: 'Paracetamol',
        categoria: '',
        observacoes: '',
        doses_referencia: [
          { id: 1, dose_mg_por_kg: '10.000', dose_maxima_mg: '500.000', intervalo_horas: 6, fonte: 'SBP', observacoes: '' },
        ],
        apresentacoes: [
          { id: 1, nome: 'Suspensão oral', concentracao_mg_por_ml: '100.000', apresentacao: 'ml', gotas_por_ml: '20.00', via_administracao: 'oral' },
        ],
      }
      client.apiCall.mockResolvedValue(mock)
      const result = await fetchMedicamento(1)
      expect(result.doses_referencia).toHaveLength(1)
      expect(result.apresentacoes).toHaveLength(1)
    })

    it('throws on 404', async () => {
      client.apiCall.mockRejectedValue(new Error('Not found'))
      await expect(fetchMedicamento(999)).rejects.toThrow('Not found')
    })
  })

  describe('calcularDose', () => {
    it('calls correct endpoint with POST', async () => {
      client.apiCall.mockResolvedValue({})
      await calcularDose({ peso_kg: 20, dose_referencia_id: 1, apresentacao_id: 1 })
      expect(client.apiCall).toHaveBeenCalledWith(
        '/calculadora/calcular/',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('sends correct body', async () => {
      client.apiCall.mockResolvedValue({})
      await calcularDose({ peso_kg: 20, dose_referencia_id: 3, apresentacao_id: 7 })
      const [, options] = client.apiCall.mock.calls[0]
      expect(JSON.parse(options.body)).toEqual({
        peso_kg: 20,
        dose_referencia_id: 3,
        apresentacao_id: 7,
      })
    })

    it('returns calculation result', async () => {
      const mock = {
        dose_calculada_mg: 200,
        dose_final_mg: 200,
        dose_limitada: false,
        volume: 2.0,
        unidade_volume: 'ml',
        concentracao_usada_mg_por_ml: 100,
      }
      client.apiCall.mockResolvedValue(mock)
      const result = await calcularDose({ peso_kg: 20, dose_referencia_id: 1, apresentacao_id: 1 })
      expect(result.dose_final_mg).toBe(200)
      expect(result.dose_limitada).toBe(false)
      expect(result.volume).toBe(2.0)
    })

    it('throws on 400 (invalid peso)', async () => {
      client.apiCall.mockRejectedValue(new Error('peso_kg inválido.'))
      await expect(
        calcularDose({ peso_kg: -1, dose_referencia_id: 1, apresentacao_id: 1 })
      ).rejects.toThrow('peso_kg inválido.')
    })

    it('throws on 401 (unauthenticated)', async () => {
      client.apiCall.mockRejectedValue(new Error('Authentication credentials were not provided.'))
      await expect(
        calcularDose({ peso_kg: 20, dose_referencia_id: 1, apresentacao_id: 1 })
      ).rejects.toThrow('Authentication credentials were not provided.')
    })
  })
})
