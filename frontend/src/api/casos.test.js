import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fetchCasos, fetchCaso, responderCaso } from './casos'
import * as client from './client'

vi.mock('./client')

describe('Casos API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchCasos', () => {
    it('fetches all casos', async () => {
      const mockData = [
        { id: 1, titulo: 'Caso A', fluxograma: 1, nivel: 'facil' },
        { id: 2, titulo: 'Caso B', fluxograma: 1, nivel: 'medio' },
      ]
      client.apiCall.mockResolvedValue(mockData)

      const result = await fetchCasos()

      expect(client.apiCall).toHaveBeenCalledWith('/casos/')
      expect(result).toEqual(mockData)
    })

    it('injects auth token via apiCall', async () => {
      client.apiCall.mockResolvedValue([])

      await fetchCasos()

      expect(client.apiCall).toHaveBeenCalledTimes(1)
    })

    it('propagates API errors', async () => {
      client.apiCall.mockRejectedValue(new Error('Erro no servidor'))

      await expect(fetchCasos()).rejects.toThrow('Erro no servidor')
    })
  })

  describe('fetchCaso', () => {
    it('fetches caso by id', async () => {
      const mockData = {
        id: 1,
        titulo: 'Caso A',
        contexto: 'Paciente chega ao pronto-socorro...',
        questoes: [
          { id: 10, ordem: 1, tipo: 'binaria', enunciado: 'Paciente apresenta sinais de choque?' },
          { id: 11, ordem: 2, tipo: 'multipla_escolha', enunciado: 'Qual a conduta inicial?', opcoes: [] },
        ],
      }
      client.apiCall.mockResolvedValue(mockData)

      const result = await fetchCaso(1)

      expect(client.apiCall).toHaveBeenCalledWith('/casos/1/')
      expect(result.questoes).toHaveLength(2)
      expect(result.titulo).toBe('Caso A')
    })

    it('throws on 404', async () => {
      client.apiCall.mockRejectedValue(new Error('Não encontrado'))

      await expect(fetchCaso(999)).rejects.toThrow('Não encontrado')
    })
  })

  describe('responderCaso', () => {
    it('sends resposta for binaria/numerica question', async () => {
      client.apiCall.mockResolvedValue({ correto: true, mensagem: 'Correto!', resposta_correta: '' })

      await responderCaso(1, 10, { resposta: 'sim' })

      expect(client.apiCall).toHaveBeenCalledWith(
        '/casos/1/responder/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ questao_id: 10, resposta: 'sim' }),
        })
      )
    })

    it('sends opcaoId for multipla_escolha question', async () => {
      client.apiCall.mockResolvedValue({ correto: true, mensagem: 'Correto!', resposta_correta: '' })

      await responderCaso(1, 10, { opcaoId: 5 })

      const [, options] = client.apiCall.mock.calls[0]
      expect(JSON.parse(options.body)).toEqual({
        questao_id: 10,
        opcao_id: 5,
      })
    })

    it('defaults to empty object when no payload given', async () => {
      client.apiCall.mockResolvedValue({})

      await responderCaso(1, 10)

      const [, options] = client.apiCall.mock.calls[0]
      const body = JSON.parse(options.body)
      expect(body).toEqual({ questao_id: 10 })
    })

    it('throws 401 when unauthenticated', async () => {
      client.apiCall.mockRejectedValue(new Error('Authentication credentials were not provided.'))

      await expect(
        responderCaso(1, 10, { resposta: 'sim' })
      ).rejects.toThrow('Authentication credentials were not provided.')
    })
  })
})
